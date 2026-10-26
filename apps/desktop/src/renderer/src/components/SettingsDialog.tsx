import {
  Database,
  FileText,
  FolderOpen,
  Info,
  MonitorDown,
  Palette,
  RefreshCw,
  Settings
} from 'lucide-react'
import { getApi } from '../lib/api'
import { Modal } from './Modal'
import { useAppStore } from '../store'

function updateStatusText(status: string, version?: string, percent?: number): string {
  switch (status) {
    case 'disabled':
      return '开发模式不检查更新（安装版生效）'
    case 'checking':
      return '正在检查更新…'
    case 'not-available':
      return '已是最新版本'
    case 'available':
      return `发现新版本 ${version ?? ''}`
    case 'downloading':
      return `正在下载 ${Math.round(percent ?? 0)}%`
    case 'downloaded':
      return `新版本 ${version ?? ''} 已就绪，重启后安装`
    case 'error':
      return '检查更新失败'
    default:
      return '尚未检查'
  }
}

export function SettingsDialog() {
  const state = useAppStore()
  const settings = state.settings
  const appInfo = state.appInfo
  const update = state.update

  const exportDiagnostics = async (): Promise<void> => {
    try {
      const path = await getApi().app.exportDiagnostics()
      if (path) state.showToast(`诊断信息已导出：${path}`, 'success')
    } catch (error) {
      state.showToast(`导出失败：${error instanceof Error ? error.message : String(error)}`, 'error')
    }
  }

  return (
    <Modal
      title="设置"
      subtitle="所有设置保存在本机，不需要登录。"
      icon={<Settings size={17} />}
      onClose={() => state.setDialog('settings', false)}
      wide
      footer={
        <>
          <div className="left">MC 指令工坊 v{appInfo?.version ?? '0.1.0'}</div>
          <button
            type="button"
            className="btn"
            onClick={() => {
              state.setDialog('settings', false)
              state.setDialog('about', true)
            }}
          >
            <Info size={14} />
            关于
          </button>
          <button type="button" className="btn btn-primary" onClick={() => state.setDialog('settings', false)}>
            完成
          </button>
        </>
      }
    >
      <div className="settings-section">
        <h3>
          <Palette size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          外观
        </h3>
        <p>主题会立即切换，并保存在本机。</p>
        <div className="row">
          <button
            type="button"
            className={`btn${settings.theme === 'dark' ? ' btn-primary' : ''}`}
            onClick={() => void state.setTheme('dark')}
          >
            深色
          </button>
          <button
            type="button"
            className={`btn${settings.theme === 'light' ? ' btn-primary' : ''}`}
            onClick={() => void state.setTheme('light')}
          >
            浅色
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>
          <MonitorDown size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          软件更新
        </h3>
        <p>安装版会在启动后自动检查更新；便携版请手动下载新版。</p>
        <div className="setting-row">
          <div>
            <div className="setting-label">自动检查更新</div>
            <div className="setting-desc">启动 10 秒后检查，此后每 6 小时一次。</div>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.autoUpdate}
              onChange={(event) => void state.updateSettings({ autoUpdate: event.target.checked })}
            />
            <span className="switch-track" />
          </label>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">更新渠道</div>
            <div className="setting-desc">测试渠道可能包含尚未稳定的版本。</div>
          </div>
          <select
            className="select"
            style={{ width: 140 }}
            value={settings.updateChannel}
            onChange={(event) =>
              void state.updateSettings({
                updateChannel: event.target.value as 'stable' | 'beta'
              })
            }
          >
            <option value="stable">稳定版</option>
            <option value="beta">测试版</option>
          </select>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">当前状态</div>
            <div className="setting-desc">
              {update.status === 'disabled'
                ? update.error ?? '当前不检查更新'
                : `${updateStatusText(update.status, update.version, update.percent)}${
                    update.error ? `：${update.error}` : ''
                  }`}
            </div>
            <div className="settings-meta" style={{ marginTop: 4 }}>
              {appInfo?.updateFeed}
            </div>
          </div>
          <div className="row">
            <button
              type="button"
              className="btn"
              onClick={() => void state.checkForUpdates(true)}
              disabled={update.status === 'checking' || update.status === 'downloading'}
            >
              <RefreshCw size={14} />
              检查更新
            </button>
            {update.status === 'downloaded' ? (
              <button type="button" className="btn btn-primary" onClick={() => void state.installUpdate()}>
                重启安装
              </button>
            ) : null}
          </div>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">更新公告</div>
            <div className="setting-desc">查看每个版本新增、改进、修复与已知问题。</div>
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => {
              state.setDialog('settings', false)
              state.openAnnouncement()
            }}
          >
            查看公告
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>
          <Database size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          数据包
        </h3>
        <p>命令树、注册表与物品组件默认值来自官方数据生成器。</p>
        <div className="setting-row">
          <div>
            <div className="setting-label">
              {state.pack ? `${state.pack.manifest.gameVersion} 数据包` : '未加载'}
            </div>
            <div className="setting-desc">
              {state.pack
                ? `${state.pack.manifest.counts.roots} 根命令 · ${state.pack.manifest.counts.items} 物品 · ${state.pack.manifest.counts.parsers} 参数类型 · pack_format ${state.pack.manifest.packFormat}`
                : '请运行 pnpm data:build 生成数据包'}
            </div>
            <div className="settings-meta" style={{ marginTop: 4 }}>
              {appInfo?.packDir}
            </div>
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => appInfo && void getApi().app.showItemInFolder(appInfo.packDir)}
          >
            <FolderOpen size={14} />
            打开目录
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>
          <FolderOpen size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          最近项目
        </h3>
        {settings.recentProjects.length === 0 ? (
          <p>还没有打开过项目。</p>
        ) : (
          <div className="recent-list">
            {settings.recentProjects.slice(0, 6).map((project) => (
              <button
                key={project.path}
                type="button"
                className="recent-row"
                onClick={() => {
                  state.setDialog('settings', false)
                  void state.openProjectPath(project.path)
                }}
              >
                <span>{project.name}</span>
                <span className="recent-path">{project.path}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>
          <FileText size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          诊断
        </h3>
        <p>导出程序版本、数据包、设置与最近日志，便于反馈问题（不会包含项目内容）。</p>
        <div className="row">
          <button type="button" className="btn" onClick={() => void exportDiagnostics()}>
            <FileText size={14} />
            导出诊断信息
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => appInfo && void getApi().app.showItemInFolder(appInfo.logsPath)}
          >
            打开日志目录
          </button>
        </div>
        <div className="settings-meta" style={{ marginTop: 8 }}>
          {appInfo ? `Electron ${appInfo.electron} · Chromium ${appInfo.chrome} · ${appInfo.platform}` : ''}
        </div>
      </div>
    </Modal>
  )
}
