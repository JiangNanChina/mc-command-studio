import {
  BrowserWindow,
  app,
  protocol,
  session,
  shell
} from 'electron'
import log from 'electron-log/main'
import { mkdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'
import type { MenuAction } from '../shared/types'
import { registerIpc } from './ipc'
import { buildMenu } from './menu'
import { readSettings, logsPath } from './storage'
import { initUpdater } from './updater'
import { registerCloseWindow } from './lifecycle'
import { isTrustedRendererUrl } from './trustedIpc'

if (process.env.MCSTUDIO_USER_DATA) {
  const dir = resolve(process.env.MCSTUDIO_USER_DATA)
  mkdirSync(dir, { recursive: true })
  app.setPath('userData', dir)
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
])

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8'
}

let mainWindow: BrowserWindow | null = null
let pendingProjectPath: string | null = null

function projectPathFromArgv(argv: string[]): string | null {
  const candidate = argv.find((arg) => arg.toLowerCase().endsWith('.mcstudio'))
  return candidate ?? null
}

function sendMenuAction(action: MenuAction, payload?: string): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('menu:action', action, payload)
  }
}

function registerAppProtocol(): void {
  const rendererRoot = resolve(__dirname, '../renderer')

  protocol.handle('app', async (request) => {
    try {
      const url = new URL(request.url)
      if (url.hostname !== 'bundle') return new Response('Forbidden', { status: 403 })
      let pathname = decodeURIComponent(url.pathname)
      if (!pathname || pathname === '/') pathname = '/index.html'
      const filePath = normalize(join(rendererRoot, pathname))
      if (!filePath.startsWith(rendererRoot + sep)) {
        return new Response('Forbidden', { status: 403 })
      }
      const buffer = await readFile(filePath)
      const type = MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
      return new Response(buffer, {
        status: 200,
        headers: {
          'content-type': type,
          'cache-control': 'no-cache'
        }
      })
    } catch (error) {
      log.warn('app protocol error', error)
      return new Response('Not found', { status: 404 })
    }
  })
}

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1380,
    height: 880,
    icon: app.isPackaged
      ? join(process.resourcesPath, 'icon.png')
      : join(__dirname, '../../build/icon.png'),
    minWidth: 1080,
    minHeight: 680,
    show: false,
    backgroundColor: '#0b0f14',
    title: 'MC 指令工坊',
    autoHideMenuBar: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
      webSecurity: true
    }
  })

  registerCloseWindow(window)

  window.once('ready-to-show', () => {
    window.show()
  })

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      void shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  window.webContents.on('will-navigate', (event, url) => {
    if (isTrustedRendererUrl(url)) return
    event.preventDefault()
    if (/^https?:\/\//i.test(url)) void shell.openExternal(url)
  })

  window.webContents.on('did-finish-load', () => {
    if (pendingProjectPath) {
      sendMenuAction('open-path', pendingProjectPath)
      pendingProjectPath = null
    }
  })

  const devUrl = !app.isPackaged && process.env.ELECTRON_RENDERER_URL
  if (devUrl) {
    void window.loadURL(devUrl)
  } else {
    void window.loadURL('app://bundle/index.html')
  }

  window.on('closed', () => {
    if (mainWindow === window) mainWindow = null
  })

  return window
}

async function bootstrap(): Promise<void> {
  app.setAppUserModelId('com.mcstudio.app')

  log.transports.file.resolvePathFn = () => join(logsPath(), 'main.log')
  log.transports.file.level = 'info'
  log.transports.console.level = app.isPackaged ? 'warn' : 'info'

  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false)
  })

  registerAppProtocol()
  registerIpc()
  buildMenu()

  pendingProjectPath = projectPathFromArgv(process.argv)
  mainWindow = createWindow()

  const settings = await readSettings()
  initUpdater(mainWindow, settings)
}

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
    const path = projectPathFromArgv(argv)
    if (path) sendMenuAction('open-path', path)
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
    }
  })

  app.whenReady().then(async () => {
    try {
      await bootstrap()
    } catch (error) {
      log.error('bootstrap failed', error)
    }
  })

  process.on('uncaughtException', (error) => {
    log.error('uncaughtException', error)
  })
  process.on('unhandledRejection', (error) => {
    log.error('unhandledRejection', error)
  })
}
