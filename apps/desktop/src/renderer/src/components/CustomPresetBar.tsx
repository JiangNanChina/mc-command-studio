import { useEffect, useState } from 'react'
import { Save, Trash2 } from 'lucide-react'
import {
  addPreset,
  loadPresets,
  removePreset,
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

  useEffect(() => {
    setPresets(loadPresets(storageKey))
  }, [storageKey])

  const save = () => {
    if (!name.trim() || !value.trim()) return
    setPresets(addPreset(storageKey, { name, value }))
    setName('')
  }

  return (
    <div className="row" style={{ gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
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
        defaultValue=""
        onChange={(event) => {
          const preset = presets.find((item) => item.name === event.target.value)
          if (preset) onApply(preset.value)
          event.target.value = ''
        }}
      >
        <option value="">自定义 {label}…</option>
        {presets.map((preset) => (
          <option key={preset.name} value={preset.name}>
            {preset.name}
          </option>
        ))}
      </select>
      {presets.length > 0 ? (
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setPresets(removePreset(storageKey, presets[0].name))}
          title="删除最近保存的预设"
        >
          <Trash2 size={13} />
        </button>
      ) : null}
    </div>
  )
}
