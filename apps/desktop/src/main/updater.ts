import { app, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { autoUpdater, type UpdateInfo } from 'electron-updater'
import type { UpdateState, UserSettings } from '../shared/types'
import { readSettings, updateSettings } from './storage'
import { isNewerVersion } from './version'
import { requestShutdown } from './lifecycle'
import {
  GITHUB_OWNER,
  GITHUB_REPO,
  decideFeedResult,
  describeUpdateFeeds,
  resolveUpdateFeeds,
  type FeedAttempt,
  type UpdateFeed
} from './updateFeeds'

let state: UpdateState = { status: 'idle' }
let mainWindow: BrowserWindow | null = null
let initialized = false
let manualCheck = false
let checkTimer: NodeJS.Timeout | null = null
let intervalTimer: NodeJS.Timeout | null = null
let currentSettings: UserSettings | null = null
/** 轮询多个更新源时屏蔽事件回调，避免状态在源之间来回跳。 */
let probing = false
/** 镜像一旦失败（含域名被黑洞），本次运行内不再重试，避免每 6 小时都卡到超时。 */
let mirrorDown = false

function currentChannel(): 'stable' | 'beta' | 'test' {
  if (app.getVersion().includes('-test')) return 'test'
  return currentSettings?.updateChannel === 'beta' ? 'beta' : 'stable'
}

function releaseNotes(info: UpdateInfo): string {
  const notes = info.releaseNotes
  if (!notes) return ''
  if (typeof notes === 'string') return notes
  return notes.map((entry) => `${entry.version}\n${entry.note}`).join('\n\n')
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
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

/** 当前生效的更新源顺序：国内镜像优先，GitHub 兜底。 */
function updateFeeds(): UpdateFeed[] {
  return resolveUpdateFeeds({
    version: app.getVersion(),
    overrideUrl: process.env.MCSTUDIO_UPDATE_URL,
    mirrorUrl: process.env.MCSTUDIO_UPDATE_MIRROR
  })
}

export function updateFeedDescription(): string {
  return describeUpdateFeeds(updateFeeds())
}

function applyFeed(feed: UpdateFeed): void {
  if (feed.kind === 'bundled') {
    // 使用打包进 app-update.yml 的源（本地测试版）
    return
  }
  if (feed.kind === 'github') {
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO
    })
    return
  }
  if (!feed.url) return
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: feed.url,
    // OSS 只支持单段 Range，多段请求会让差异更新失败后退回全量下载。
    useMultipleRangeRequest: false
  })
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
    // 检查阶段由 checkForUpdates 汇总各源错误，这里只处理下载/安装阶段的异常。
    if (probing) return
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

  const testChannel = app.getVersion().includes('-test')
  autoUpdater.allowPrerelease = testChannel || settings.updateChannel === 'beta'
  autoUpdater.channel = testChannel
    ? 'test'
    : settings.updateChannel === 'beta'
      ? 'beta'
      : 'latest'

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

function scheduleIdleReset(): void {
  setTimeout(() => {
    if (state.status === 'not-available') {
      setState({ status: 'idle', channel: currentChannel() })
    }
  }, 5000)
}

async function probeFeed(feed: UpdateFeed): Promise<FeedAttempt & { info?: UpdateInfo }> {
  applyFeed(feed)
  const result = await autoUpdater.checkForUpdates()
  if (!result) {
    return { feed, ok: false, error: '更新器未就绪' }
  }
  const info = result.updateInfo
  // electron-updater 在设置 channel 时会打开 allowDowngrade，
  // 这里统一改成"只认比当前版本更新的版本"，镜像落后时才能继续问下一个源。
  return {
    feed,
    ok: true,
    isUpdateAvailable: result.isUpdateAvailable && isNewerVersion(info.version, app.getVersion()),
    version: info.version,
    info
  }
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
    channel: currentChannel()
  })

  const feeds = updateFeeds()
  const attempts: Array<FeedAttempt & { info?: UpdateInfo }> = []

  probing = true
  try {
    for (const feed of feeds) {
      if (feed.kind === 'mirror' && mirrorDown) {
        log.info('国内镜像本次运行已失败，直接使用 GitHub')
        attempts.push({ feed, ok: false, error: '本次运行内已跳过（此前连接失败）' })
        continue
      }
      try {
        const attempt = await probeFeed(feed)
        attempts.push(attempt)
        if (attempt.isUpdateAvailable) break
      } catch (error) {
        const message = errorMessage(error)
        if (feed.kind === 'mirror') mirrorDown = true
        log.warn(`更新源 ${feed.label} 检查失败：${message}`)
        attempts.push({ feed, ok: false, error: message })
      }
    }
  } finally {
    probing = false
  }

  const decision = decideFeedResult(attempts)
  const chosen = decision.chosen

  if (!chosen) {
    setState({
      status: 'error',
      error: `检查更新失败：${decision.errors.join('；') || '没有可用的更新源'}`,
      manual,
      channel: currentChannel()
    })
    return state
  }

  // 让后续 downloadUpdate 复用选中的那个源
  try {
    applyFeed(chosen.feed)
  } catch (error) {
    log.warn(`切换更新源 ${chosen.feed.label} 失败：${errorMessage(error)}`)
  }

  const version = chosen.version
  const source = chosen.feed.kind

  if (!version || !isNewerVersion(version, app.getVersion())) {
    setState({ status: 'not-available', manual, channel: currentChannel(), source })
    scheduleIdleReset()
    return state
  }

  if (!manual && currentSettings?.skippedVersion === version) {
    setState({ status: 'idle', version, skipped: true, channel: currentChannel(), source })
    return state
  }

  const probed = attempts.find((attempt) => attempt.feed.kind === chosen.feed.kind)
  setState({
    status: 'available',
    version,
    notes: probed?.info ? releaseNotes(probed.info) : '',
    manual,
    channel: currentChannel(),
    source
  })
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
  // 静默安装，避免更新时弹出 NSIS 向导阻塞无人值守的升级。
  requestShutdown('update', () => autoUpdater.quitAndInstall(true, true))
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
  await updateSettings({ skippedVersion: null })
  currentSettings = { ...settings, skippedVersion: null }
}
