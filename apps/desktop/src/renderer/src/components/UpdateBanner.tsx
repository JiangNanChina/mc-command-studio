import { useEffect, useState } from 'react'
import { AlertTriangle, Download, Rocket, Sparkles, X } from 'lucide-react'
import { RELEASES_URL } from './AboutDialog'
import { getApi } from '../lib/api'
import { useAppStore } from '../store'

export function UpdateBanner() {
  const update = useAppStore((state) => state.update)
  const checkForUpdates = useAppStore((state) => state.checkForUpdates)
  const downloadUpdate = useAppStore((state) => state.downloadUpdate)
  const installUpdate = useAppStore((state) => state.installUpdate)
  const skipUpdate = useAppStore((state) => state.skipUpdate)
  const settings = useAppStore((state) => state.settings)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    setHidden(false)
  }, [update.status, update.version])

  const visible =
    !hidden &&
    (update.status === 'available' ||
      update.status === 'downloading' ||
      update.status === 'downloaded' ||
      (update.status === 'error' && update.manual))

  if (!visible) return null

  const openManual = (): void => {
    void getApi().app.openExternal(RELEASES_URL)
  }

  if (update.status === 'downloading') {
    return (
      <div className="banner update">
        <div className="banner-icon">
          <Download size={15} />
        </div>
        <div className="banner-text">
          <div className="banner-title">正在下载 v{update.version}…</div>
          <div className="banner-sub">下载完成后会提示重启安装，不会丢失当前项目。</div>
        </div>
        <div className="progress-track">
          <div className="progress-bar" style={{ width: `${Math.round(update.percent ?? 0)}%` }} />
        </div>
        <span className="hint">{Math.round(update.percent ?? 0)}%</span>
        <div className="banner-actions">
          <button type="button" className="icon-btn" onClick={() => setHidden(true)} aria-label="收起">
            <X size={15} />
          </button>
        </div>
      </div>
    )
  }

  if (update.status === 'downloaded') {
    return (
      <div className="banner update">
        <div className="banner-icon">
          <Rocket size={15} />
        </div>
        <div className="banner-text">
          <div className="banner-title">v{update.version} 已下载完成</div>
          <div className="banner-sub">重启应用后自动安装。项目文件会保留。</div>
        </div>
        <div className="banner-actions">
          <button type="button" className="btn btn-sm" onClick={() => setHidden(true)}>
            稍后
          </button>
          <button type="button" className="btn btn-sm btn-primary" onClick={() => void installUpdate()}>
            重启并安装
          </button>
        </div>
      </div>
    )
  }

  if (update.status === 'error') {
    return (
      <div className="banner update" style={{ background: 'var(--danger-soft)' }}>
        <div className="banner-icon" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
          <AlertTriangle size={15} />
        </div>
        <div className="banner-text">
          <div className="banner-title">检查更新失败</div>
          <div className="banner-sub">{update.error ?? '请稍后重试，或手动下载新版。'}</div>
        </div>
        <div className="banner-actions">
          <button type="button" className="btn btn-sm" onClick={() => setHidden(true)}>
            忽略
          </button>
          <button type="button" className="btn btn-sm" onClick={() => void checkForUpdates(true)}>
            重试
          </button>
          <button type="button" className="btn btn-sm" onClick={openManual}>
            手动下载
          </button>
        </div>
      </div>
    )
  }

  const skipped = settings.skippedVersion === update.version
  return (
    <div className="banner update">
      <div className="banner-icon">
        <Sparkles size={15} />
      </div>
      <div className="banner-text">
        <div className="banner-title">
          发现新版本 v{update.version}
          {skipped ? '（已跳过）' : ''}
        </div>
        <div className="banner-sub">
          {update.notes?.split('\n').find((line) => line.trim()) ?? '包含命令数据与体验更新。'}
        </div>
      </div>
      <div className="banner-actions">
        <button type="button" className="btn btn-sm" onClick={() => setHidden(true)}>
          稍后
        </button>
        {update.version && !skipped ? (
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => update.version && void skipUpdate(update.version)}
          >
            跳过此版本
          </button>
        ) : null}
        <button type="button" className="btn btn-sm" onClick={openManual}>
          手动下载
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => void downloadUpdate()}>
          下载更新
        </button>
      </div>
    </div>
  )
}
