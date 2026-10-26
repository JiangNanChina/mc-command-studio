import { History, X } from 'lucide-react'
import { useAppStore } from '../store'

export function AutosaveBanner() {
  const available = useAppStore((state) => state.autosaveAvailable)
  const restore = useAppStore((state) => state.restoreAutosave)
  const dismiss = useAppStore((state) => state.dismissAutosave)

  if (!available) return null

  return (
    <div className="banner autosave">
      <div className="banner-icon" style={{ background: 'var(--warn-soft)', color: 'var(--warn)' }}>
        <History size={15} />
      </div>
      <div className="banner-text">
        <div className="banner-title">检测到自动保存的编辑内容</div>
        <div className="banner-sub">可能是上次异常退出留下的；恢复后会作为未保存项目打开。</div>
      </div>
      <div className="banner-actions">
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => void dismiss()}>
          <X size={13} />
          忽略
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => void restore()}>
          恢复内容
        </button>
      </div>
    </div>
  )
}
