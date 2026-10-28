import { BrowserWindow, dialog, type WebContents } from 'electron'
import log from 'electron-log/main'
import type { BeforeCloseRequest, CloseReason } from '../shared/types'
import { flushStorage } from './storage'

interface PendingShutdown {
  request: BeforeCloseRequest
  window: BrowserWindow
  action: () => void
  timer: ReturnType<typeof setTimeout>
  completing: boolean
  forcePromptOpen: boolean
}

const readyWindows = new WeakSet<BrowserWindow>()
const allowedWindows = new WeakSet<BrowserWindow>()
const unresponsiveWindows = new WeakSet<BrowserWindow>()
let pending: PendingShutdown | null = null
let nextRequestId = 1

function allowShutdown(window: BrowserWindow, action: () => void): void {
  allowedWindows.add(window)
  // Let the IPC acknowledgement reach the renderer before destroying its frame.
  setImmediate(action)
}

export function setCloseHandlerReady(sender: WebContents, ready: boolean): void {
  const window = BrowserWindow.fromWebContents(sender)
  if (!window) return
  if (ready) readyWindows.add(window)
  else readyWindows.delete(window)
}

export function registerCloseWindow(window: BrowserWindow): void {
  window.on('unresponsive', () => {
    unresponsiveWindows.add(window)
    if (pending?.window === window) {
      void handleUnresponsiveRenderer(pending.request.requestId)
        .catch((error) => log.error('close confirmation failed', error))
    }
  })
  window.on('responsive', () => unresponsiveWindows.delete(window))
  window.on('close', (event) => {
    if (allowedWindows.has(window)) return
    event.preventDefault()
    requestShutdown('close', () => window.close(), window)
  })
  window.on('closed', () => {
    readyWindows.delete(window)
    if (pending?.window === window) {
      clearTimeout(pending.timer)
      pending = null
    }
  })
}

export function requestShutdown(
  reason: CloseReason,
  action: () => void,
  window = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
): void {
  if (pending) return
  if (!window || window.isDestroyed()) {
    void flushStorage().then(action).catch((error) => log.error('shutdown failed', error))
    return
  }
  if (!readyWindows.has(window)) {
    // Before the renderer mounts there is no editable document to save.
    void flushStorage().then(() => allowShutdown(window, action))
      .catch((error) => log.error('shutdown failed', error))
    return
  }

  const request: BeforeCloseRequest = { requestId: nextRequestId++, reason }
  const timer = setTimeout(() => {
    void handleUnresponsiveRenderer(request.requestId)
      .catch((error) => log.error('close confirmation failed', error))
  }, 15_000)
  pending = { request, window, action, timer, completing: false, forcePromptOpen: false }
  window.webContents.send('app:before-close', request)
}

async function handleUnresponsiveRenderer(requestId: number): Promise<void> {
  const request = pending
  if (!request || request.request.requestId !== requestId || request.completing || request.forcePromptOpen) return
  // A save dialog may legitimately remain open; only offer force-close if the
  // renderer has stopped responding rather than timing out a user's decision.
  if (!request.window.webContents.isCrashed() && !request.window.webContents.isDestroyed() &&
    !unresponsiveWindows.has(request.window)) {
    return
  }
  request.forcePromptOpen = true
  const result = await dialog.showMessageBox(request.window, {
    type: 'warning',
    title: '窗口未响应',
    message: '无法完成退出前的保存。',
    detail: '可以保留窗口，或关闭并在下次启动时尝试恢复已自动保存的内容。',
    buttons: ['保留窗口', '仍然关闭'],
    defaultId: 0,
    cancelId: 0,
    noLink: true
  })
  if (pending !== request) return
  if (result.response === 1) {
    await completeClose(request.window.webContents, requestId, true)
  } else {
    pending = null
  }
}

export async function completeClose(sender: WebContents, requestId: number, allow: boolean): Promise<void> {
  const request = pending
  if (!request || request.request.requestId !== requestId || request.window.webContents !== sender) return
  if (request.completing) return
  clearTimeout(request.timer)
  if (!allow) {
    pending = null
    return
  }
  request.completing = true
  try {
    await flushStorage()
    pending = null
    allowShutdown(request.window, request.action)
  } catch (error) {
    pending = null
    throw error
  }
}
