import {
  BrowserWindow,
  app,
  clipboard,
  dialog,
  ipcMain,
  shell
} from 'electron'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import JSZip from 'jszip'
import { z } from 'zod'
import type {
  AppInfo,
  AutosaveResult,
  DatapackExportResult,
  LoadPackResult,
  OpenProjectResult,
  PackSummary,
  SaveProjectResult,
  UpdateState,
  UserSettings
} from '../shared/types'
import { buildDatapackFiles } from '../shared/datapack'
import { listPacks, loadPack, packsDir } from './packs'
import { completeClose, requestShutdown, setCloseHandlerReady } from './lifecycle'
import { handleTrusted, isTrustedSender } from './trustedIpc'
import {
  addRecentProject,
  clearAutosave,
  logsPath,
  projectNameFromPath,
  readAutosave,
  readProjectFile,
  readSettings,
  updateSettings,
  writeAutosave,
  writeProjectFile
} from './storage'
import {
  applySettings,
  checkForUpdates,
  clearSkippedVersion,
  downloadUpdate,
  getUpdateState,
  installUpdate,
  skipVersion,
  updateFeedDescription
} from './updater'

const pathSchema = z.string().min(1).max(4096)
const contentSchema = z.string().max(24 * 1024 * 1024)
const saveSchema = z.object({
  content: contentSchema,
  path: pathSchema.nullable().optional(),
  suggestedName: z.string().max(120).optional()
})
const datapackSchema = z
  .object({
    namespace: z.string().min(1).max(64),
    description: z.string().max(200),
    packFormat: z.number().int().positive(),
    functions: z
      .array(
        z.object({
          name: z.string().min(1).max(128),
          commands: z.string().max(500_000)
        })
      )
      .min(1)
      .max(64),
    loadFunction: z.string().max(128),
    tickFunction: z.string().max(128),
    files: z
      .array(
        z.object({
          type: z.enum(['advancement', 'predicate', 'loot_table']),
          name: z.string().min(1).max(128),
          content: z.string().max(500_000)
        })
      )
      .max(128)
      .optional()
  })
  .strict()

const settingsPatchSchema = z
  .object({
    theme: z.enum(['dark', 'light']).optional(),
    autoUpdate: z.boolean().optional(),
    updateChannel: z.enum(['stable', 'beta']).optional(),
    skippedVersion: z.string().nullable().optional(),
    lastSeenVersion: z.string().max(64).nullable().optional(),
    recentProjects: z
      .array(
        z.object({
          name: z.string().max(200),
          path: z.string().max(4096),
          openedAt: z.string()
        })
      )
      .max(20)
      .optional(),
    lastPackId: z.string().nullable().optional()
  })
  .strict()

function focusedWindow(): BrowserWindow | null {
  return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0] ?? null
}

function appInfo(): AppInfo {
  return {
    name: 'MC 指令工坊',
    version: app.getVersion(),
    electron: process.versions.electron ?? '',
    chrome: process.versions.chrome ?? '',
    node: process.versions.node ?? '',
    platform: `${process.platform} ${process.arch}`,
    isPackaged: app.isPackaged,
    isPortable: Boolean(process.env.PORTABLE_EXECUTABLE_DIR),
    userData: app.getPath('userData'),
    logsPath: logsPath(),
    packDir: packsDir(),
    updateFeed: updateFeedDescription()
  }
}

async function exportDiagnostics(): Promise<string | null> {
  const opts = {
    title: '导出诊断信息',
    defaultPath: join(app.getPath('documents'), `mcstudio-diagnostics-${Date.now()}.txt`),
    filters: [{ name: '文本文件', extensions: ['txt'] }]
  }
  const window = focusedWindow()
  const result = window
    ? await dialog.showSaveDialog(window, opts)
    : await dialog.showSaveDialog(opts)
  if (result.canceled || !result.filePath) return null

  const [settings, packs] = await Promise.all([readSettings(), listPacks()])
  let logTail = ''
  try {
    const raw = await readFile(join(logsPath(), 'main.log'), 'utf8')
    logTail = raw.split(/\r?\n/).slice(-200).join('\n')
  } catch {
    logTail = '（暂无日志文件）'
  }
  const safeSettings = {
    ...settings,
    recentProjects: settings.recentProjects.map((item) => ({ ...item, path: basename(item.path) }))
  }
  const lines = [
    'MC 指令工坊 诊断信息',
    `时间：${new Date().toISOString()}`,
    '',
    JSON.stringify(appInfo(), null, 2),
    '',
    `数据包目录：${packsDir()}`,
    `数据包：${packs.map((pack) => `${pack.id} (${pack.type})`).join(', ') || '无'}`,
    '',
    '设置：',
    JSON.stringify(safeSettings, null, 2),
    '',
    '最近日志（最后 200 行）：',
    logTail
  ]
  await writeFile(result.filePath, lines.join('\n'), 'utf8')
  return result.filePath
}

export function registerIpc(): void {
  handleTrusted('app:info', () => appInfo())
  handleTrusted('app:open-external', async (_event, url: unknown) => {
    const parsed = z.string().url().max(2048).safeParse(url)
    if (!parsed.success) throw new Error('链接不合法')
    if (!/^https?:\/\//i.test(parsed.data)) throw new Error('只允许打开 http/https 链接')
    await shell.openExternal(parsed.data)
  })
  handleTrusted('app:export-diagnostics', () => exportDiagnostics())
  handleTrusted('app:show-item', async (_event, path: unknown) => {
    const parsed = pathSchema.safeParse(path)
    if (!parsed.success) return
    shell.showItemInFolder(parsed.data)
  })
  handleTrusted('app:relaunch', () => {
    requestShutdown('relaunch', () => {
      app.relaunch()
      app.quit()
    })
  })
  ipcMain.on('app:close-handler-ready', (event, ready: unknown) => {
    if (!isTrustedSender(event) || typeof ready !== 'boolean') return
    setCloseHandlerReady(event.sender, ready)
  })
  handleTrusted('app:complete-close', async (event, payload: unknown) => {
    const result = z.object({ requestId: z.number().int().positive(), allow: z.boolean() }).safeParse(payload)
    if (!result.success || event.senderFrame !== event.sender.mainFrame) return
    await completeClose(event.sender, result.data.requestId, result.data.allow)
  })

  handleTrusted('packs:list', (): Promise<PackSummary[]> => listPacks())
  handleTrusted('packs:load', (_event, id: unknown): Promise<LoadPackResult> => {
    const parsed = z.string().min(1).max(64).safeParse(id)
    if (!parsed.success) {
      return Promise.resolve({ ok: false, error: '数据包 ID 不合法' })
    }
    return loadPack(parsed.data)
  })

  handleTrusted('settings:get', () => readSettings())
  handleTrusted('settings:update', async (_event, patch: unknown): Promise<UserSettings> => {
    const parsed = settingsPatchSchema.safeParse(patch)
    if (!parsed.success) throw new Error('设置格式不正确')
    const next = await updateSettings(parsed.data)
    applySettings(next)
    return next
  })

  handleTrusted('project:open', async (): Promise<OpenProjectResult | null> => {
    const opts = {
      title: '打开项目',
      properties: ['openFile' as const],
      filters: [{ name: 'MC 指令工坊项目', extensions: ['mcstudio'] }]
    }
    const window = focusedWindow()
    const result = window
      ? await dialog.showOpenDialog(window, opts)
      : await dialog.showOpenDialog(opts)
    if (result.canceled || result.filePaths.length === 0) return null
    const path = result.filePaths[0]
    const project = await readProjectFile(path)
    await addRecentProject(path, project.name)
    return { path, name: project.name, content: project.content }
  })

  handleTrusted('project:open-path', async (_event, path: unknown): Promise<OpenProjectResult | null> => {
    const parsed = pathSchema.safeParse(path)
    if (!parsed.success) throw new Error('路径不合法')
    const project = await readProjectFile(parsed.data)
    await addRecentProject(parsed.data, project.name)
    return { path: parsed.data, name: project.name, content: project.content }
  })

  handleTrusted('project:save', async (_event, payload: unknown): Promise<SaveProjectResult> => {
    const parsed = saveSchema.safeParse(payload)
    if (!parsed.success) throw new Error('项目内容无效或超过大小限制')
    let path = parsed.data.path ?? null
    if (!path) {
      const fallbackName = (() => {
        try {
          const data = JSON.parse(parsed.data.content) as { name?: string }
          return data.name?.trim() || '未命名项目'
        } catch {
          return '未命名项目'
        }
      })()
      const opts = {
        title: '保存项目',
        defaultPath: join(app.getPath('documents'), `${fallbackName}.mcstudio`),
        filters: [{ name: 'MC 指令工坊项目', extensions: ['mcstudio'] }]
      }
      const window = focusedWindow()
      const result = window
        ? await dialog.showSaveDialog(window, opts)
        : await dialog.showSaveDialog(opts)
      if (result.canceled || !result.filePath) return null
      path = result.filePath
    }
    path = await writeProjectFile(path, parsed.data.content)
    const name = projectNameFromPath(path)
    await addRecentProject(path, name)
    return { path, name }
  })

  handleTrusted('project:save-as', async (_event, payload: unknown): Promise<SaveProjectResult> => {
    const parsed = saveSchema.safeParse(payload)
    if (!parsed.success) throw new Error('项目内容无效或超过大小限制')
    const fallbackName = (parsed.data.suggestedName?.trim() || '未命名项目').replace(
      /[<>:"/\\|?*\u0000-\u001f]/g,
      '_'
    )
    const opts = {
      title: '另存为',
      defaultPath: join(app.getPath('documents'), `${fallbackName}.mcstudio`),
      filters: [{ name: 'MC 指令工坊项目', extensions: ['mcstudio'] }]
    }
    const window = focusedWindow()
    const result = window
      ? await dialog.showSaveDialog(window, opts)
      : await dialog.showSaveDialog(opts)
    if (result.canceled || !result.filePath) return null
    const path = await writeProjectFile(result.filePath, parsed.data.content)
    const name = projectNameFromPath(path)
    await addRecentProject(path, name)
    return { path, name }
  })

  handleTrusted('project:autosave', async (_event, content: unknown): Promise<void> => {
    const parsed = contentSchema.safeParse(content)
    if (!parsed.success) throw new Error('自动保存内容无效或超过大小限制')
    await writeAutosave(parsed.data)
  })

  handleTrusted('project:get-autosave', async (): Promise<AutosaveResult | null> => {
    return readAutosave()
  })

  handleTrusted('project:clear-autosave', () => clearAutosave())

  handleTrusted('clipboard:write', (_event, text: unknown) => {
    const parsed = z.string().max(100_000).safeParse(text)
    if (!parsed.success) throw new Error('复制内容无效')
    clipboard.writeText(parsed.data)
  })

  handleTrusted('datapack:export', async (_event, payload: unknown): Promise<DatapackExportResult | null> => {
    const parsed = datapackSchema.safeParse(payload)
    if (!parsed.success) throw new Error('数据包参数不正确')
    const { files, functionIds } = buildDatapackFiles(parsed.data)

    const opts = {
      title: '导出数据包',
      defaultPath: join(app.getPath('documents'), `${parsed.data.namespace}-datapack.zip`),
      filters: [{ name: 'Minecraft 数据包', extensions: ['zip'] }]
    }
    let filePath: string
    if (process.env.MCSTUDIO_TEST_SAVE_DIR) {
      await mkdir(process.env.MCSTUDIO_TEST_SAVE_DIR, { recursive: true })
      filePath = join(
        process.env.MCSTUDIO_TEST_SAVE_DIR,
        `${parsed.data.namespace}-datapack.zip`
      )
    } else {
      const window = focusedWindow()
      const result = window
        ? await dialog.showSaveDialog(window, opts)
        : await dialog.showSaveDialog(opts)
      if (result.canceled || !result.filePath) return null
      filePath = result.filePath
    }

    const zip = new JSZip()
    for (const file of files) zip.file(file.path, file.content)
    const buffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })
    await writeFile(filePath, buffer)
    return {
      path: filePath,
      files: files.map((file) => file.path),
      functionIds
    }
  })

  handleTrusted('updater:get-state', (): UpdateState => getUpdateState())
  handleTrusted('updater:check', (_event, manual: unknown) => {
    return checkForUpdates(Boolean(manual))
  })
  handleTrusted('updater:download', () => downloadUpdate())
  handleTrusted('updater:install', () => installUpdate())
  handleTrusted('updater:skip', async (_event, version: unknown) => {
    const parsed = z.string().min(1).max(64).safeParse(version)
    if (!parsed.success) throw new Error('版本号不合法')
    return skipVersion(parsed.data)
  })
  handleTrusted('updater:clear-skip', () => clearSkippedVersion())
}
