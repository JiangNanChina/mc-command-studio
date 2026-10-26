import { useEffect } from 'react'
import { AlertTriangle, Database, FolderOpen, RefreshCw } from 'lucide-react'
import { getApi } from './lib/api'
import { getCurrentOutput } from './lib/commandOutput'
import { useAppStore, type DialogName } from './store'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Welcome } from './components/Welcome'
import { GiveForm } from './components/GiveForm'
import { SummonForm } from './components/SummonForm'
import { SetblockForm } from './components/SetblockForm'
import { GenericBuilder } from './components/GenericBuilder'
import { OutputPanel } from './components/OutputPanel'
import { StatusBar } from './components/StatusBar'
import { SettingsDialog } from './components/SettingsDialog'
import { AboutDialog } from './components/AboutDialog'
import { SelectorDialog } from './components/SelectorDialog'
import { ItemPickerDialog } from './components/ItemPickerDialog'
import { UpdateBanner } from './components/UpdateBanner'
import { AutosaveBanner } from './components/AutosaveBanner'
import { Toast } from './components/Toast'

function LoadingScreen() {
  return (
    <div className="app">
      <div className="empty" style={{ flex: 1 }}>
        <div className="spinner" />
        <h2>正在加载命令树…</h2>
        <p>读取版本数据包、注册表与物品组件，请稍候。</p>
      </div>
    </div>
  )
}

function ErrorPanel() {
  const state = useAppStore()
  const appInfo = state.appInfo

  return (
    <div className="content">
      <div className="card">
        <div className="card-body">
          <div className="empty" style={{ minHeight: 220 }}>
            <div className="empty-icon" style={{ color: 'var(--danger)' }}>
              <AlertTriangle size={20} />
            </div>
            <h2>数据包加载失败</h2>
            <p>{state.bootError}</p>
            <div className="empty-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void state.loadPack(state.activePackId)}
              >
                <RefreshCw size={14} />
                重试加载
              </button>
              {appInfo ? (
                <button
                  type="button"
                  className="btn"
                  onClick={() => void getApi().app.showItemInFolder(appInfo.packDir)}
                >
                  <FolderOpen size={14} />
                  打开数据包目录
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  state.showToast('在项目根目录运行：pnpm data:build，然后重启应用。', 'info')
                }
              >
                <Database size={14} />
                如何生成数据包
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const state = useAppStore()
  const bootError = state.bootError
  const booted = state.booted
  const pack = state.pack
  const dirty = state.dirty
  const give = state.give
  const summon = state.summon
  const setblock = state.setblock
  const generic = state.generic
  const commandBlock = state.commandBlock
  const outputMode = state.outputMode
  const activeCommandId = state.activeCommandId
  const projectName = state.projectName
  const toast = state.toast

  useEffect(() => {
    void useAppStore.getState().boot()
  }, [])

  useEffect(() => {
    const api = window.mcstudio
    if (!api) return
    return api.updater.onEvent((update) => {
      useAppStore.getState().setUpdate(update)
    })
  }, [])

  useEffect(() => {
    const api = window.mcstudio
    if (!api) return
    return api.onMenuAction((action, payload) => {
      const store = useAppStore.getState()
      switch (action) {
        case 'new-project':
          store.newProject()
          break
        case 'open-project':
          void store.openProject()
          break
        case 'open-path':
          if (payload) void store.openProjectPath(payload)
          break
        case 'save-project':
          void store.saveProject()
          break
        case 'save-project-as':
          void store.saveProject(true)
          break
        case 'settings':
          store.setDialog('settings', true)
          break
        case 'about':
          store.setDialog('about', true)
          break
        case 'check-update':
          void store.checkForUpdates(true)
          break
        case 'toggle-theme':
          void store.setTheme(store.settings.theme === 'dark' ? 'light' : 'dark')
          break
      }
    })
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const mod = event.ctrlKey || event.metaKey
      if (mod && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        document.getElementById('command-search')?.focus()
        return
      }
      if (mod && event.key === 'Enter') {
        event.preventDefault()
        const store = useAppStore.getState()
        const output = getCurrentOutput(
          store.pack,
          store.activeCommandId,
          store.give,
          store.summon,
          store.setblock,
          store.generic,
          store.outputMode,
          store.commandBlock
        )
        if (!output.text) return
        void getApi()
          .clipboard.write(output.text)
          .then(() => store.showToast('命令已复制到剪贴板', 'success'))
          .catch(() => store.showToast('复制失败', 'error'))
        return
      }
      if (event.key === 'Escape' && !event.isComposing) {
        const dialogs = useAppStore.getState().dialogs
        for (const [name, open] of Object.entries(dialogs)) {
          if (open) useAppStore.getState().setDialog(name as DialogName, false)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!dirty) return
    const timer = setTimeout(() => {
      void useAppStore.getState().autosave()
    }, 4000)
    return () => clearTimeout(timer)
  }, [dirty, give, summon, setblock, generic, commandBlock, outputMode, activeCommandId, projectName])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => useAppStore.getState().hideToast(), 4500)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    document.title = `${projectName}${dirty ? ' •' : ''} — MC 指令工坊`
  }, [projectName, dirty])

  useEffect(() => {
    document.querySelector('.main')?.scrollTo({ top: 0 })
  }, [activeCommandId])

  if (!booted) return <LoadingScreen />

  const showWelcome = !activeCommandId

  return (
    <div className="app">
      <Header />
      <UpdateBanner />
      <AutosaveBanner />
      <div className="workspace">
        <Sidebar />
        <main className="main">
          {!pack ? (
            bootError ? (
              <ErrorPanel />
            ) : (
              <div className="empty">
                <div className="spinner" />
                <p>数据包加载中…</p>
              </div>
            )
          ) : showWelcome ? (
            <Welcome />
          ) : activeCommandId === 'give' ? (
            <GiveForm />
          ) : activeCommandId === 'summon' ? (
            <SummonForm />
          ) : activeCommandId === 'setblock' ? (
            <SetblockForm />
          ) : (
            <GenericBuilder />
          )}
        </main>
        <OutputPanel />
      </div>
      <StatusBar />

      {state.dialogs.settings ? <SettingsDialog /> : null}
      {state.dialogs.about ? <AboutDialog /> : null}
      {state.dialogs.selector ? <SelectorDialog /> : null}
      {state.dialogs.itemPicker ? <ItemPickerDialog /> : null}
      <Toast />
    </div>
  )
}
