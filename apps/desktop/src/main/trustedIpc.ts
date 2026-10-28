import { app, BrowserWindow, ipcMain, type IpcMainEvent, type IpcMainInvokeEvent } from 'electron'

export function isTrustedRendererUrl(value: string): boolean {
  try {
    const url = new URL(value)
    if (url.username || url.password) return false
    if (url.protocol === 'app:' && url.hostname === 'bundle' && !url.port) {
      return url.pathname === '/index.html'
    }
    const devUrl = !app.isPackaged && process.env.ELECTRON_RENDERER_URL
    if (!devUrl) return false
    const expected = new URL(devUrl)
    return ['http:', 'https:'].includes(url.protocol) && url.origin === expected.origin
  } catch {
    return false
  }
}

export function isTrustedSender(event: Pick<IpcMainInvokeEvent | IpcMainEvent, 'sender' | 'senderFrame'>): boolean {
  const frame = event.senderFrame
  return Boolean(
    frame &&
    frame === event.sender.mainFrame &&
    BrowserWindow.fromWebContents(event.sender) &&
    isTrustedRendererUrl(frame.url)
  )
}

export function handleTrusted<Args extends unknown[], Result>(
  channel: string,
  handler: (event: IpcMainInvokeEvent, ...args: Args) => Result
): void {
  ipcMain.handle(channel, (event, ...args: Args) => {
    if (!isTrustedSender(event)) throw new Error('已拒绝不可信窗口的请求')
    return handler(event, ...args)
  })
}
