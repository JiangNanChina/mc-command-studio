import { contextBridge, ipcRenderer } from 'electron'
import type { BeforeCloseRequest, McStudioApi, MenuAction, UpdateState, UserSettings } from '../shared/types'

const api: McStudioApi = {
  app: {
    info: () => ipcRenderer.invoke('app:info'),
    openExternal: (url) => ipcRenderer.invoke('app:open-external', url),
    exportDiagnostics: () => ipcRenderer.invoke('app:export-diagnostics'),
    showItemInFolder: (path) => ipcRenderer.invoke('app:show-item', path),
    relaunch: () => ipcRenderer.invoke('app:relaunch'),
    onBeforeClose: (callback) => {
      const listener = (_event: Electron.IpcRendererEvent, request: BeforeCloseRequest): void => callback(request)
      ipcRenderer.on('app:before-close', listener)
      ipcRenderer.send('app:close-handler-ready', true)
      return () => {
        ipcRenderer.removeListener('app:before-close', listener)
        ipcRenderer.send('app:close-handler-ready', false)
      }
    },
    completeClose: (requestId, allow) => ipcRenderer.invoke('app:complete-close', { requestId, allow })
  },
  packs: {
    list: () => ipcRenderer.invoke('packs:list'),
    load: (id) => ipcRenderer.invoke('packs:load', id)
  },
  project: {
    open: () => ipcRenderer.invoke('project:open'),
    openPath: (path) => ipcRenderer.invoke('project:open-path', path),
    save: (content, path) => ipcRenderer.invoke('project:save', { content, path }),
    saveAs: (content, suggestedName) =>
      ipcRenderer.invoke('project:save-as', { content, suggestedName }),
    autosave: (content) => ipcRenderer.invoke('project:autosave', content),
    getAutosave: () => ipcRenderer.invoke('project:get-autosave'),
    clearAutosave: () => ipcRenderer.invoke('project:clear-autosave')
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (patch: Partial<UserSettings>) => ipcRenderer.invoke('settings:update', patch)
  },
  clipboard: {
    write: (text) => ipcRenderer.invoke('clipboard:write', text)
  },
  datapack: {
    export: (options) => ipcRenderer.invoke('datapack:export', options)
  },
  updater: {
    getState: () => ipcRenderer.invoke('updater:get-state'),
    check: (manual) => ipcRenderer.invoke('updater:check', manual),
    download: () => ipcRenderer.invoke('updater:download'),
    install: () => ipcRenderer.invoke('updater:install'),
    skip: (version) => ipcRenderer.invoke('updater:skip', version),
    onEvent: (callback) => {
      const listener = (_event: Electron.IpcRendererEvent, state: UpdateState): void => callback(state)
      ipcRenderer.on('updater:event', listener)
      return () => ipcRenderer.removeListener('updater:event', listener)
    }
  },
  onMenuAction: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, action: MenuAction, payload?: string): void =>
      callback(action, payload)
    ipcRenderer.on('menu:action', listener)
    return () => ipcRenderer.removeListener('menu:action', listener)
  }
}

contextBridge.exposeInMainWorld('mcstudio', api)
