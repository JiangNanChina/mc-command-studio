import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BrowserWindow, WebContents } from 'electron'
import type { BeforeCloseRequest } from '../shared/types'

const mocks = vi.hoisted(() => ({
  windows: [] as BrowserWindow[],
  flushStorage: vi.fn(async (): Promise<void> => undefined),
  showMessageBox: vi.fn(async () => ({ response: 0 }))
}))
vi.mock('electron', () => ({
  BrowserWindow: {
    getFocusedWindow: () => mocks.windows[0] ?? null,
    getAllWindows: () => mocks.windows,
    fromWebContents: (sender: WebContents) => mocks.windows.find((window) => window.webContents === sender)
  },
  dialog: { showMessageBox: mocks.showMessageBox }
}))
vi.mock('electron-log/main', () => ({ default: { error: vi.fn() } }))
vi.mock('./storage', () => ({ flushStorage: mocks.flushStorage }))

let lifecycle: typeof import('./lifecycle')

function createWindow(): BrowserWindow {
  const listeners = new Map<string, (...args: unknown[]) => void>()
  let destroyed = false
  const window = {
    on: (name: string, callback: (...args: unknown[]) => void) => listeners.set(name, callback),
    isDestroyed: () => destroyed,
    webContents: {
      send: vi.fn(), isCrashed: () => false, isDestroyed: () => false
    },
    close: vi.fn(() => {
      let prevented = false
      listeners.get('close')?.({ preventDefault: () => { prevented = true } })
      if (!prevented) {
        destroyed = true
        listeners.get('closed')?.()
      }
    })
  } as unknown as BrowserWindow
  mocks.windows.push(window)
  lifecycle.registerCloseWindow(window)
  return window
}

function closeRequest(window: BrowserWindow): BeforeCloseRequest {
  return vi.mocked(window.webContents.send).mock.calls.at(-1)?.[1] as BeforeCloseRequest
}

beforeEach(async () => {
  vi.useFakeTimers()
  vi.resetModules()
  mocks.windows = []
  mocks.flushStorage.mockReset().mockResolvedValue(undefined)
  lifecycle = await import('./lifecycle')
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('shutdown save handshake', () => {
  it('keeps a ready window open until its renderer confirms and storage has flushed', async () => {
    const window = createWindow()
    lifecycle.setCloseHandlerReady(window.webContents, true)
    window.close()
    const request = closeRequest(window)
    expect(request.reason).toBe('close')
    expect(window.isDestroyed()).toBe(false)

    let finishFlush!: () => void
    mocks.flushStorage.mockImplementation(() => new Promise<void>((resolve) => { finishFlush = resolve }))
    const completed = lifecycle.completeClose(window.webContents, request.requestId, true)
    expect(window.isDestroyed()).toBe(false)
    finishFlush()
    await completed
    await vi.runOnlyPendingTimersAsync()
    expect(window.isDestroyed()).toBe(true)
  })

  it('cancels closing and lets the user retry without losing the window', async () => {
    const window = createWindow()
    lifecycle.setCloseHandlerReady(window.webContents, true)
    window.close()
    const first = closeRequest(window)
    await lifecycle.completeClose(window.webContents, first.requestId, false)
    expect(window.isDestroyed()).toBe(false)
    window.close()
    const second = closeRequest(window)
    expect(second.requestId).not.toBe(first.requestId)
    await lifecycle.completeClose(window.webContents, second.requestId, true)
    await vi.runOnlyPendingTimersAsync()
    expect(window.isDestroyed()).toBe(true)
  })

  it('rejects acknowledgements from another frame or for an old request', async () => {
    const window = createWindow()
    lifecycle.setCloseHandlerReady(window.webContents, true)
    window.close()
    const request = closeRequest(window)
    await lifecycle.completeClose({} as WebContents, request.requestId, true)
    await lifecycle.completeClose(window.webContents, request.requestId + 1, true)
    expect(mocks.flushStorage).not.toHaveBeenCalled()
    expect(window.isDestroyed()).toBe(false)
    await lifecycle.completeClose(window.webContents, request.requestId, false)
  })

  it.each(['relaunch', 'update'] as const)('guards %s actions with the same handshake', async (reason) => {
    const window = createWindow()
    lifecycle.setCloseHandlerReady(window.webContents, true)
    const action = vi.fn()
    lifecycle.requestShutdown(reason, action)
    const request = closeRequest(window)
    expect(request.reason).toBe(reason)
    expect(action).not.toHaveBeenCalled()
    await lifecycle.completeClose(window.webContents, request.requestId, true)
    await vi.runOnlyPendingTimersAsync()
    expect(action).toHaveBeenCalledOnce()
  })

  it('does not time out an open save or confirmation dialog', async () => {
    const window = createWindow()
    lifecycle.setCloseHandlerReady(window.webContents, true)
    window.close()
    await vi.advanceTimersByTimeAsync(30_000)
    expect(window.isDestroyed()).toBe(false)
    expect(mocks.showMessageBox).not.toHaveBeenCalled()
    await lifecycle.completeClose(window.webContents, closeRequest(window).requestId, false)
  })

  it('allows closing during initial boot after waiting for writes', async () => {
    const window = createWindow()
    window.close()
    await vi.runOnlyPendingTimersAsync()
    expect(mocks.flushStorage).toHaveBeenCalledOnce()
    expect(window.isDestroyed()).toBe(true)
  })
})
