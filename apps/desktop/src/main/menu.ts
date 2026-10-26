import { BrowserWindow, Menu, app, shell } from 'electron'
import type { MenuAction } from '../shared/types'
import { checkForUpdates } from './updater'
import { logsPath } from './storage'

function send(action: MenuAction, payload?: string): void {
  const window = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
  if (window && !window.isDestroyed()) {
    window.webContents.send('menu:action', action, payload)
  }
}

export function buildMenu(): void {
  const isDev = !app.isPackaged
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        { label: '新建项目', accelerator: 'CmdOrCtrl+N', click: () => send('new-project') },
        { label: '打开项目…', accelerator: 'CmdOrCtrl+O', click: () => send('open-project') },
        { type: 'separator' },
        { label: '保存', accelerator: 'CmdOrCtrl+S', click: () => send('save-project') },
        {
          label: '另存为…',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => send('save-project-as')
        },
        { type: 'separator' },
        { label: '设置', accelerator: 'CmdOrCtrl+,', click: () => send('settings') },
        { type: 'separator' },
        { label: '退出', role: 'quit' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', role: 'undo' },
        { label: '重做', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', role: 'cut' },
        { label: '复制', role: 'copy' },
        { label: '粘贴', role: 'paste' },
        { label: '全选', role: 'selectAll' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { label: '切换主题', accelerator: 'CmdOrCtrl+T', click: () => send('toggle-theme') },
        { type: 'separator' },
        { label: '放大', role: 'zoomIn' },
        { label: '缩小', role: 'zoomOut' },
        { label: '重置缩放', role: 'resetZoom' },
        { type: 'separator' },
        { label: '重新加载', role: 'reload' },
        ...(isDev
          ? [{ label: '开发者工具', role: 'toggleDevTools' as const }]
          : [])
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '检查更新…',
          click: () => {
            void checkForUpdates(true)
            send('check-update')
          }
        },
        {
          label: '打开发布页',
          click: () => {
            void shell.openExternal(
              process.env.MCSTUDIO_RELEASES_URL ??
                'https://github.com/JiangNanChina/mc-command-studio/releases'
            )
          }
        },
        {
          label: '打开日志目录',
          click: () => {
            void shell.openPath(logsPath())
          }
        },
        { type: 'separator' },
        { label: '关于 MC 指令工坊', click: () => send('about') }
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
