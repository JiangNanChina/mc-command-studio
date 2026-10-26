import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  wide?: boolean
  narrow?: boolean
}

export function Modal({ title, subtitle, icon, children, footer, onClose, wide, narrow }: ModalProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !event.isComposing) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className={`modal${wide ? ' wide' : ''}${narrow ? ' narrow' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <div>
            <div className="modal-title">
              {icon}
              {title}
            </div>
            {subtitle ? <div className="modal-sub">{subtitle}</div> : null}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="关闭">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  )
}
