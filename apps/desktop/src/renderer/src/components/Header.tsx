import {
  FolderOpen,
  Moon,
  Save,
  Settings,
  Sun,
  RotateCcw,
  FilePlus2,
  Sparkles
} from 'lucide-react'
import { useAppStore } from '../store'

export function Header() {
  const state = useAppStore()
  const loading = !state.booted

  return (
    <header className="header">
      <div className="brand">
        <div className="brand-mark">&gt;_</div>
        <div>
          <div className="brand-name">MC 指令工坊</div>
          <div className="brand-sub">Minecraft Java 命令编辑器</div>
        </div>
      </div>

      <div className="project-box">
        <input
          className="project-name-input"
          value={state.projectName}
          spellCheck={false}
          aria-label="项目名称"
          onChange={(event) => state.setProjectName(event.target.value)}
        />
        {state.dirty ? <span className="dirty-dot" title="有未保存的修改" /> : null}
      </div>

      <div className="header-actions">
        <div className="pack-pill" title="当前数据包">
          <span className="dot" />
          {state.pack ? `${state.pack.manifest.gameVersion} · ${state.pack.manifest.counts.roots} 命令` : '数据包加载中'}
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => state.newProject()} disabled={loading}>
          <FilePlus2 size={15} />
          新建
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => state.openProject()} disabled={loading}>
          <FolderOpen size={15} />
          打开
        </button>
        <button type="button" className="btn" onClick={() => state.saveProject()} disabled={loading}>
          <Save size={15} />
          保存
        </button>
        <button
          type="button"
          className="icon-btn"
          title={state.settings.theme === 'dark' ? '切换浅色主题' : '切换深色主题'}
          onClick={() => state.setTheme(state.settings.theme === 'dark' ? 'light' : 'dark')}
        >
          {state.settings.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          type="button"
          className="icon-btn"
          title="检查更新"
          onClick={() => state.checkForUpdates(true)}
        >
          {state.update.status === 'checking' ? <RotateCcw size={17} className="spin" /> : <Sparkles size={17} />}
        </button>
        <button
          type="button"
          className="icon-btn"
          title="设置 (Ctrl+,)"
          onClick={() => state.setDialog('settings', true)}
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  )
}
