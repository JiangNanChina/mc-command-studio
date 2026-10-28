import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { IpcMainInvokeEvent, WebContents } from 'electron'

const mocks = vi.hoisted(() => ({ packaged: true, knownWindow: true, handle: vi.fn() }))
vi.mock('electron', () => ({
  app: { get isPackaged() { return mocks.packaged } },
  BrowserWindow: { fromWebContents: () => mocks.knownWindow ? {} : null },
  ipcMain: { handle: mocks.handle }
}))
import { handleTrusted, isTrustedRendererUrl, isTrustedSender } from './trustedIpc'

const originalDevUrl = process.env.ELECTRON_RENDERER_URL
beforeEach(() => {
  mocks.packaged = true
  mocks.knownWindow = true
  mocks.handle.mockClear()
  delete process.env.ELECTRON_RENDERER_URL
})
afterEach(() => {
  if (originalDevUrl === undefined) delete process.env.ELECTRON_RENDERER_URL
  else process.env.ELECTRON_RENDERER_URL = originalDevUrl
})

function event(url = 'app://bundle/index.html'): IpcMainInvokeEvent {
  const frame = { url }
  return { senderFrame: frame, sender: { mainFrame: frame } as WebContents } as IpcMainInvokeEvent
}

describe('trusted IPC boundary', () => {
  it('accepts only the packaged renderer entry point', () => {
    expect(isTrustedRendererUrl('app://bundle/index.html')).toBe(true)
    expect(isTrustedRendererUrl('app://bundle/index.html#settings')).toBe(true)
    for (const url of [
      'app://other/index.html', 'app://bundle/other.html', 'app://bundle:9/index.html',
      'app://user@bundle/index.html', 'https://example.com', 'file:///index.html', 'invalid'
    ]) expect(isTrustedRendererUrl(url)).toBe(false)
  })

  it('compares development origins exactly and ignores the override in production', () => {
    process.env.ELECTRON_RENDERER_URL = 'http://localhost:5173/'
    expect(isTrustedRendererUrl('http://localhost:5173/')).toBe(false)
    mocks.packaged = false
    expect(isTrustedRendererUrl('http://localhost:5173/')).toBe(true)
    expect(isTrustedRendererUrl('http://localhost:5173.evil.test/')).toBe(false)
    expect(isTrustedRendererUrl('http://localhost:5174/')).toBe(false)
    expect(isTrustedRendererUrl('http://localhost:5173@evil.test/')).toBe(false)
  })

  it('rejects subframes and detached windows even with a valid URL', () => {
    const trusted = event()
    expect(isTrustedSender(trusted)).toBe(true)
    expect(isTrustedSender({ ...trusted, senderFrame: { url: 'app://bundle/index.html' } } as IpcMainInvokeEvent)).toBe(false)
    mocks.knownWindow = false
    expect(isTrustedSender(trusted)).toBe(false)
  })

  it('does not run a handler for an untrusted caller', async () => {
    const handler = vi.fn(async (_event: IpcMainInvokeEvent, name: string) => `Hello ${name}`)
    handleTrusted('example', handler)
    const invoke = mocks.handle.mock.calls[0][1]
    expect(() => invoke(event('https://example.com'), 'World')).toThrow('已拒绝不可信窗口的请求')
    expect(handler).not.toHaveBeenCalled()
    await expect(invoke(event(), 'World')).resolves.toBe('Hello World')
  })
})
