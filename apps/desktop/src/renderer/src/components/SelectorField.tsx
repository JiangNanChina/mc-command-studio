import { useState } from 'react'
import { Crosshair } from 'lucide-react'
import { serializeSelector, type Selector } from '@mcstudio/core'
import { SelectorDialog } from './SelectorDialog'

interface SelectorFieldProps {
  value: Selector
  onChange: (selector: Selector) => void
  label?: string
}

export function SelectorField({ value, onChange, label = '目标选择器' }: SelectorFieldProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="selector-card">
        <div style={{ minWidth: 0 }}>
          <div className="field-label">{label}</div>
          <div className="selector-preview">{serializeSelector(value).text}</div>
        </div>
        <button type="button" className="btn btn-sm" onClick={() => setOpen(true)}>
          <Crosshair size={13} />
          编辑选择器
        </button>
      </div>
      {open ? (
        <SelectorDialog
          value={value}
          onApply={(selector) => {
            onChange(selector)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}
