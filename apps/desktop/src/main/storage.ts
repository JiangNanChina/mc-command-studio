import { app } from 'electron'
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { DEFAULT_SETTINGS, type RecentProject, type UserSettings } from '../shared/types'

const MAX_PROJECT_BYTES = 24 * 1024 * 1024

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

async function readJson<T>(path: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as T
  } catch {
    return null
  }
}

export async function writeJsonAtomic(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  const temp = `${path}.${process.pid}.tmp`
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temp, path)
}

export async function readSettings(): Promise<UserSettings> {
  const stored = await readJson<Partial<UserSettings>>(settingsPath())
  if (!stored) return { ...DEFAULT_SETTINGS }
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    recentProjects: Array.isArray(stored.recentProjects) ? stored.recentProjects : []
  }
}

export async function updateSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  const current = await readSettings()
  const next: UserSettings = {
    ...current,
    ...patch,
    recentProjects: patch.recentProjects ?? current.recentProjects
  }
  await writeJsonAtomic(settingsPath(), next)
  return next
}

export async function addRecentProject(path: string, name: string): Promise<void> {
  const settings = await readSettings()
  const entry: RecentProject = { path, name, openedAt: new Date().toISOString() }
  const recent = settings.recentProjects.filter((item) => item.path !== path)
  recent.unshift(entry)
  await updateSettings({ recentProjects: recent.slice(0, 10) })
}

export async function readProjectFile(path: string): Promise<{ content: string; name: string }> {
  const info = await stat(path)
  if (info.size > MAX_PROJECT_BYTES) {
    throw new Error('项目文件超过 24 MB，已拒绝打开。')
  }
  const content = await readFile(path, 'utf8')
  const parsed = JSON.parse(content) as { name?: string }
  const name = typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name : projectNameFromPath(path)
  return { content, name }
}

export function projectNameFromPath(path: string): string {
  const base = path.split(/[\\/]/).pop() ?? '未命名项目'
  return base.replace(/\.mcstudio$/i, '')
}

export async function writeProjectFile(path: string, content: string): Promise<void> {
  if (Buffer.byteLength(content, 'utf8') > MAX_PROJECT_BYTES) {
    throw new Error('项目文件超过 24 MB，已拒绝保存。')
  }
  JSON.parse(content)
  const target = path.toLowerCase().endsWith('.mcstudio') ? path : `${path}.mcstudio`
  await writeFile(target, content, 'utf8')
}

export async function writeAutosave(content: string): Promise<void> {
  await ensureUserData()
  await writeFile(autosavePath(), content, 'utf8')
  await writeJsonAtomic(autosaveMetaPath(), { savedAt: new Date().toISOString() })
}

export async function readAutosave(): Promise<{ content: string; savedAt: string } | null> {
  const content = await readJson<unknown>(autosavePath())
  const meta = await readJson<{ savedAt?: string }>(autosaveMetaPath())
  if (!content) return null
  return {
    content: JSON.stringify(content),
    savedAt: meta?.savedAt ?? new Date().toISOString()
  }
}

export async function clearAutosave(): Promise<void> {
  try {
    await writeFile(autosavePath(), '', 'utf8')
    await writeFile(autosaveMetaPath(), '{}', 'utf8')
  } catch {
    // 忽略清理失败
  }
}

export function logsPath(): string {
  return join(app.getPath('userData'), 'logs')
}
