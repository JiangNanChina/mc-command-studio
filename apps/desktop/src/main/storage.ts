import { app } from 'electron'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { z } from 'zod'
import { DEFAULT_SETTINGS, type AutosaveResult, type RecentProject, type UserSettings } from '../shared/types'

const MAX_PROJECT_BYTES = 24 * 1024 * 1024
const writes = new Map<string, Promise<void>>()
const recentProjectSchema = z.object({
  name: z.string().max(200),
  path: z.string().min(1).max(4096),
  openedAt: z.string().datetime()
})
const settingsSchema = z.object({
  theme: z.enum(['dark', 'light']).catch(DEFAULT_SETTINGS.theme),
  autoUpdate: z.boolean().catch(DEFAULT_SETTINGS.autoUpdate),
  updateChannel: z.enum(['stable', 'beta']).catch(DEFAULT_SETTINGS.updateChannel),
  skippedVersion: z.string().max(64).nullable().catch(null),
  lastSeenVersion: z.string().max(64).nullable().catch(null),
  recentProjects: z.array(z.unknown()).catch([]).transform((items) =>
    items.flatMap((item) => {
      const result = recentProjectSchema.safeParse(item)
      return result.success ? [result.data] : []
    }).slice(0, 10)
  ),
  lastPackId: z.string().max(64).nullable().catch(DEFAULT_SETTINGS.lastPackId)
})
const autosaveSchema = z.object({
  autosaveVersion: z.literal(1),
  content: z.string(),
  savedAt: z.string().datetime()
})

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

function autosavePath(): string {
  return join(app.getPath('userData'), 'autosave.json')
}

function autosaveMetaPath(): string {
  return join(app.getPath('userData'), 'autosave-meta.json')
}

export async function ensureUserData(): Promise<void> {
  await mkdir(app.getPath('userData'), { recursive: true })
}

async function readJson(path: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as unknown
  } catch {
    return null
  }
}

// Serialize the complete read/modify/write operation, not only its final rename.
function withFileWrite<T>(path: string, operation: () => Promise<T>): Promise<T> {
  const key = process.platform === 'win32' ? resolve(path).toLowerCase() : resolve(path)
  const previous = writes.get(key) ?? Promise.resolve()
  const result = previous.then(operation)
  const settled = result.then(() => undefined, () => undefined)
  writes.set(key, settled)
  void settled.then(() => {
    if (writes.get(key) === settled) writes.delete(key)
  })
  return result
}

async function replaceFile(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  const temp = `${path}.${process.pid}.${randomUUID()}.tmp`
  try {
    await writeFile(temp, content, { encoding: 'utf8', flag: 'wx', flush: true })
    await rename(temp, path)
  } finally {
    await rm(temp, { force: true }).catch(() => undefined)
  }
}

export function writeJsonAtomic(path: string, value: unknown): Promise<void> {
  const content = `${JSON.stringify(value, null, 2)}\n`
  return withFileWrite(path, () => replaceFile(path, content))
}

export async function flushStorage(): Promise<void> {
  while (writes.size > 0) await Promise.all([...writes.values()])
}

export async function readSettings(): Promise<UserSettings> {
  const stored = await readJson(settingsPath())
  return settingsSchema.parse(stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {})
}

function modifySettings(update: (current: UserSettings) => UserSettings): Promise<UserSettings> {
  const path = settingsPath()
  return withFileWrite(path, async () => {
    const current = await readSettings()
    const next = settingsSchema.parse(update(current))
    await replaceFile(path, `${JSON.stringify(next, null, 2)}\n`)
    return next
  })
}

export function updateSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  return modifySettings((current) => ({ ...current, ...patch }))
}

export async function addRecentProject(path: string, name: string): Promise<void> {
  await modifySettings((current) => {
    const entry: RecentProject = { path, name, openedAt: new Date().toISOString() }
    const recent = current.recentProjects.filter((item) => item.path !== path)
    return { ...current, recentProjects: [entry, ...recent].slice(0, 10) }
  })
}

export async function readProjectFile(path: string): Promise<{ content: string; name: string }> {
  const info = await stat(path)
  if (info.size > MAX_PROJECT_BYTES) throw new Error('项目文件超过 24 MB，已拒绝打开。')
  const content = await readFile(path, 'utf8')
  const parsed: unknown = JSON.parse(content)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('项目文件根节点必须是对象。')
  }
  const nameValue = (parsed as { name?: unknown }).name
  const name = typeof nameValue === 'string' && nameValue.trim() ? nameValue : projectNameFromPath(path)
  return { content, name }
}

export function projectNameFromPath(path: string): string {
  const base = path.split(/[\\/]/).pop() ?? '未命名项目'
  return base.replace(/\.mcstudio$/i, '')
}

function validateProjectContent(content: string): void {
  if (Buffer.byteLength(content, 'utf8') > MAX_PROJECT_BYTES) {
    throw new Error('项目文件超过 24 MB，已拒绝保存。')
  }
  const value: unknown = JSON.parse(content)
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('项目文件根节点必须是对象。')
  }
}

export async function writeProjectFile(path: string, content: string): Promise<string> {
  validateProjectContent(content)
  const target = path.toLowerCase().endsWith('.mcstudio') ? path : `${path}.mcstudio`
  await withFileWrite(target, () => replaceFile(target, content))
  return target
}

export async function writeAutosave(content: string): Promise<void> {
  validateProjectContent(content)
  // Content and timestamp must commit together so a crash cannot mix generations.
  await writeJsonAtomic(autosavePath(), {
    autosaveVersion: 1,
    content,
    savedAt: new Date().toISOString()
  })
}

export async function readAutosave(): Promise<AutosaveResult | null> {
  const stored = await readJson(autosavePath())
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return null
  const current = autosaveSchema.safeParse(stored)
  if (current.success) {
    try {
      validateProjectContent(current.data.content)
      return { content: current.data.content, savedAt: current.data.savedAt }
    } catch {
      return null
    }
  }
  if ('autosaveVersion' in stored) return null
  // Older releases stored the project and timestamp in separate JSON files.
  const meta = await readJson(autosaveMetaPath())
  const savedAt = z.object({ savedAt: z.string().datetime() }).safeParse(meta)
  return {
    content: JSON.stringify(stored),
    savedAt: savedAt.success ? savedAt.data.savedAt : new Date().toISOString()
  }
}

export async function clearAutosave(): Promise<void> {
  await withFileWrite(autosavePath(), async () => {
    await rm(autosavePath(), { force: true })
    await rm(autosaveMetaPath(), { force: true })
  })
}

export function logsPath(): string {
  return join(app.getPath('userData'), 'logs')
}
