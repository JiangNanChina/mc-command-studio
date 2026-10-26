import { app, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { autoUpdater, type UpdateInfo } from 'electron-updater'
import type { UpdateState, UserSettings } from '../shared/types'
import { readSettings, updateSettings } from './storage'

let state: UpdateState = { status: 'idle' }
let mainWindow: BrowserWindow | null = null
let initialized = false
let manualCheck = false
let checkTimer: NodeJS.Timeout | null = null
let intervalTimer: NodeJS.Timeout | null = null
let currentSettings: UserSettings | null = null

function releaseNotes(info: UpdateInfo): string {
  const notes = info.releaseNotes
  if (!notes) return ''
  if (typeof notes === 'string') return notes
  return notes.map((entry) => `${entry.version}\n${entry.note}`).join('\n\n')
}

function emit(): void {
  const targets = mainWindow ? [mainWindow] : BrowserWindow.getAllWindows()
  for (const window of targets) {
    if (!window.isDestroyed()) {
      window.webContents.send('updater:event', state)
    }
  }
}

function setState(next: UpdateState): void {
  state = next
  emit()
}

export function updateFeedDescription(): string {
  return process.env.MCSTUDIO_UPDATE_URL ?? 'GitHub Releases（app-update.yml）'
}

export function initUpdater(window: BrowserWindow, settings: UserSettings): void {
  mainWindow = window
  currentSettings = settings

  log.initialize()
  autoUpdater.logger = log
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.allowDowngrade = false
  autoUpdater.disableWebInstaller = true

  if (!app.isPackaged) {
    state = { status: 'disabled', error: '开发模式不检查更新' }
    return
  }

  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    state = {
      status: 'disabled',
      error: '便携版不支持自动更新，请手动下载新版'
    }
    return
  }

  if (process.env.MCSTUDIO_UPDATE_URL) {
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: process.env.MCSTUDIO_UPDATE_URL
    })
  }

  autoUpdater.on('checking-for-update', () => {
    setState({ ...state, status: 'checking', manual: manualCheck, error: undefined })
  })

  autoUpdater.on('update-available', (info) => {
    if (!manualCheck && currentSettings?.skippedVersion === info.version) {
      setState({
        status: 'idle',
        version: info.version,
        skipped: true,
        channel: currentSettings.updateChannel
      })
      return
    }
    setState({
      status: 'available',
      version: info.version,
      notes: releaseNotes(info),
      manual: manualCheck,
      channel: currentSettings?.updateChannel ?? 'stable',
      error: undefined
    })
  })

  autoUpdater.on('update-not-available', () => {
    setState({
      status: 'not-available',
      manual: manualCheck,
      channel: currentSettings?.updateChannel ?? 'stable'
    })
    setTimeout(() => {
      if (state.status === 'not-available') {
        setState({ status: 'idle', channel: currentSettings?.updateChannel ?? 'stable' })
      }
    }, 5000)
  })

  autoUpdater.on('download-progress', (progress) => {
    setState({
      ...state,
      status: 'downloading',
      percent: Math.max(0, Math.min(100, progress.percent)),
      error: undefined
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    setState({
      ...state,
      status: 'downloaded',
      version: info.version,
      percent: 100,
      manual: manualCheck
    })
  })

  autoUpdater.on('error', (error) => {
    log.error('updater error', error)
    setState({
      ...state,
      status: 'error',
      error: error?.message ?? String(error),
      manual: manualCheck
    })
  })

  initialized = true
  applySettings(settings)
}

export function applySettings(settings: UserSettings): void {
  currentSettings = settings
  if (!initialized) return

  if (checkTimer) {
    clearTimeout(checkTimer)
    checkTimer = null
  }
  if (intervalTimer) {
    clearInterval(intervalTimer)
    intervalTimer = null
  }

  autoUpdater.allowPrerelease = settings.updateChannel === 'beta'
  autoUpdater.channel = settings.updateChannel === 'beta' ? 'beta' : 'latest'

  if (!settings.autoUpdate) return

  checkTimer = setTimeout(() => {
    void checkForUpdates(false)
  }, 10_000)
  intervalTimer = setInterval(
    () => {
      void checkForUpdates(false)
    },
    6 * 60 * 60 * 1000
  )
}

export function getUpdateState(): UpdateState {
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    return { status: 'disabled', error: '便携版不支持自动更新，请手动下载新版' }
  }
  if (!app.isPackaged && state.status !== 'disabled') {
    return { status: 'disabled', error: '开发模式不检查更新' }
  }
  return state
}

export async function checkForUpdates(manual = false): Promise<UpdateState> {
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    state = { status: 'disabled', error: '便携版不支持自动更新，请手动下载新版' }
    emit()
    return state
  }
  if (!app.isPackaged) {
    state = { status: 'disabled', error: '开发模式不检查更新' }
    emit()
    return state
  }
  if (!initialized) {
    return state
  }
  if (state.status === 'checking' || state.status === 'downloading') {
    return state
  }

  manualCheck = manual
  setState({
    status: 'checking',
    manual,
    channel: currentSettings?.updateChannel ?? 'stable'
  })

  try {
    await autoUpdater.checkForUpdates()
  } catch (error) {
    setState({
      status: 'error',
      error: (error as Error).message,
      manual
    })
  }
  return state
}

export async function downloadUpdate(): Promise<UpdateState> {
  if (!app.isPackaged) return state
  if (state.status !== 'available' && state.status !== 'downloading') {
    return state
  }
  setState({ ...state, status: 'downloading', percent: state.percent ?? 0 })
  try {
    await autoUpdater.downloadUpdate()
  } catch (error) {
    setState({ ...state, status: 'error', error: (error as Error).message })
  }
  return state
}

export function installUpdate(): void {
  if (!app.isPackaged) return
  if (state.status !== 'downloaded') return
  autoUpdater.quitAndInstall(false, true)
}

export async function skipVersion(version: string): Promise<UpdateState> {
  const settings = await readSettings()
  await updateSettings({ skippedVersion: version })
  currentSettings = { ...settings, skippedVersion: version }
  setState({ status: 'idle', version, skipped: true })
  return state
}

export async function clearSkippedVersion(): Promise<void> {
  const settings = await readSettings()
  currentSettings = { ...settings, skippedVersion: null }
  await updateSettings({ skippedVersion: null })
}
