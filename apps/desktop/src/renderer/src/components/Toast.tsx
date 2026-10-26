import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useAppStore } from '../store'

export function Toast() {
  const toast = useAppStore((state) => state.toast)
  const hideToast = useAppStore((state) => state.hideToast)

  if (!toast) return null

  const Icon = toast.kind === 'error' ? AlertTriangle : toast.kind === 'success' ? CheckCircle2 : Info

  return (
    <div className={`toast ${toast.kind}`} role="status">
      <Icon size={16} />
      <div style={{ flex: 1 }}>{toast.message}</div>
      <button type="button" className="toast-close" onClick={hideToast} aria-label="关闭提示">
        <X size={14} />
      </button>
    </div>
  )
}
