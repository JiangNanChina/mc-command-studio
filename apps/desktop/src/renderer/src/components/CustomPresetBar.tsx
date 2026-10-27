import { useEffect, useRef, useState } from 'react'
import { Download, Save, Settings2, Trash2, Upload } from 'lucide-react'
import {
  addPreset,
  exportPresets,
  importPresets,
  loadPresets,
  removePreset,
  renamePreset,
  type CustomPreset
} from '../lib/customPresets'

interface Props {
  storageKey: string
  value: string
  label: string
  onApply: (value: string) => void
}

export function CustomPresetBar({ storageKey, value, label, onApply }: Props) {
  const [presets, setPresets] = useState<CustomPreset[]>([])
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('')
  const [rename, setRename] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPresets(loadPresets(storageKey))
    setSelected('')
    setRename('')
    const reload = () => setPresets(loadPresets(storageKey))
    window.addEventListener('mcstudio:presets-changed', reload)
    return () => window.removeEventListener('mcstudio:presets-changed', reload)
  }, [storageKey])

  const save = () => {
    if (!name.trim() || !value.trim()) return
    setPresets(addPreset(storageKey, { name, value }))
    setName('')
  }

  const apply = (target: string) => {
    const preset = presets.find((item) => item.name === target)
    if (preset) onApply(preset.value)
  }

  const download = () => {
    const blob = new Blob([exportPresets(storageKey)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `mcstudio-${storageKey.replace(/[:/]/g, '-')}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const upload = async (file: File | undefined) => {
    if (!file) return
    const source = await file.text()
    try {
      const value = JSON.parse(source)
      if (Array.isArray(value)) {
        const names = value
          .map((item) => (item && typeof item.name === 'string' ? item.name : ''))
          .filter(Boolean)
        const conflicts = names.filter((name) =>
          presets.some((preset) => preset.name === name)
        )
        if (
          conflicts.length > 0 &&
          !window.confirm(
            `有 ${conflicts.length} 个同名预设：${conflicts.slice(0, 5).join('、')}${conflicts.length > 5 ? '…' : ''}\n继续导入将覆盖同名预设。`
          )
        ) {
          return
        }
      }
      setPresets(importPresets(storageKey, source))
    } catch {
      window.alert('预设文件不是有效的 JSON')
    }
  }

  return (
    <div style={{ marginBottom: 8 }}>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <input
          className="input"
          style={{ maxWidth: 180 }}
          placeholder={`${label}名称`}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="button" className="btn btn-sm" onClick={save}>
          <Save size={13} />
          保存预设
        </button>
        <select
          className="select"
          style={{ maxWidth: 220 }}
          value={selected}
          onChange={(event) => {
            setSelected(event.target.value)
            apply(event.target.value)
          }}
        >
          <option value="">自定义 {label}…</option>
          {presets.map((preset) => (
            <option key={preset.name} value={preset.name}>
              {preset.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setOpen((value) => !value)}
          title="管理自定义预设"
        >
          <Settings2 size={13} />
          管理
        </button>
      </div>

      {open ? (
        <div className="card" style={{ marginTop: 8 }}>
          <div className="card-body">
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <select
                className="select"
                style={{ maxWidth: 220 }}
                value={selected}
                onChange={(event) => {
                  setSelected(event.target.value)
                  setRename(event.target.value)
                }}
              >
                <option value="">选择预设…</option>
                {presets.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>
              <input
                className="input"
                style={{ maxWidth: 180 }}
                placeholder="新名称"
                value={rename}
                onChange={(event) => setRename(event.target.value)}
              />
              <button
                type="button"
                className="btn btn-sm"
                disabled={!selected || !rename.trim()}
                onClick={() => setPresets(renamePreset(storageKey, selected, rename))}
              >
                重命名
              </button>
              <button
                type="button"
                className="btn btn-sm"
                disabled={!selected}
                onClick={() => {
                  setPresets(removePreset(storageKey, selected))
                  setSelected('')
                  setRename('')
                }}
              >
                <Trash2 size={13} />
                删除
              </button>
            </div>
            <div className="row" style={{ gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-sm" onClick={download}>
                <Download size={13} />
                导出 JSON
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => inputRef.current?.click()}
              >
                <Upload size={13} />
                导入 JSON
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(event) => void upload(event.target.files?.[0])}
              />
              <span className="hint">共 {presets.length} 条，最多 30 条。</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
