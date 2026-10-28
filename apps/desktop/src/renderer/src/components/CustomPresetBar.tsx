import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Download, Save, Settings2, Trash2, Upload } from 'lucide-react'
import { loadPresets, savePresets, type CustomPreset } from '../lib/customPresets'
import { Modal } from './Modal'
import './CustomPresetBar.css'

interface Props {
  storageKey: string
  value: string
  label: string
  onApply: (value: string) => void
}

interface Feedback {
  kind: 'success' | 'error'
  message: string
}

const MAX_PRESETS = 30

export function CustomPresetBar({ storageKey, value, label, onApply }: Props) {
  const [presets, setPresets] = useState<CustomPreset[]>([])
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('')
  const [rename, setRename] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [importing, setImporting] = useState(false)
  const id = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const managerRef = useRef<HTMLDivElement>(null)
  const manageButtonRef = useRef<HTMLButtonElement>(null)
  const closeManager = useCallback(() => setOpen(false), [])
  const selectedPreset = presets.find((preset) => preset.name === selected)

  useEffect(() => {
    const reload = (): void => {
      const next = loadPresets(storageKey)
      setPresets(next)
      setSelected((current) => next.some((preset) => preset.name === current) ? current : '')
    }
    reload()
    setName('')
    setSelected('')
    setRename('')
    setFeedback(null)
    setOpen(false)
    window.addEventListener('mcstudio:presets-changed', reload)
    window.addEventListener('storage', reload)
    return () => {
      window.removeEventListener('mcstudio:presets-changed', reload)
      window.removeEventListener('storage', reload)
    }
  }, [storageKey])

  useEffect(() => setRename(selected), [selected])

  useEffect(() => {
    if (!open) return
    const modal = managerRef.current?.closest<HTMLElement>('[role="dialog"]')
    if (!modal) return
    const previous = document.activeElement as HTMLElement | null
    modal.querySelector<HTMLSelectElement>('[data-preset-manager-select]')?.focus()
    const focusable = (): HTMLElement[] => [...modal.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'
    )].filter((element) => !element.hidden && element.getClientRects().length > 0)
    const trapFocus = (event: KeyboardEvent): void => {
      if (event.key !== 'Tab') return
      const elements = focusable()
      const first = elements[0]
      const last = elements.at(-1)
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    modal.addEventListener('keydown', trapFocus)
    return () => {
      modal.removeEventListener('keydown', trapFocus)
      if (previous?.isConnected) previous.focus()
      else manageButtonRef.current?.focus()
    }
  }, [open])

  const showError = (message: string): void => setFeedback({ kind: 'error', message })

  const persist = (next: CustomPreset[], nextSelected: string, message: string): void => {
    const saved = next.slice(0, MAX_PRESETS)
    savePresets(storageKey, saved)
    setPresets(saved)
    const nextName = saved.some((preset) => preset.name === nextSelected) ? nextSelected : ''
    setSelected(nextName)
    setRename(nextName)
    setFeedback({ kind: 'success', message })
    window.dispatchEvent(new CustomEvent('mcstudio:presets-changed'))
  }

  const save = (): void => {
    const nextName = name.trim()
    if (!nextName) {
      showError(`请先填写${label}名称。`)
      nameRef.current?.focus()
      return
    }
    if (!value.trim()) {
      showError(`当前没有可保存的${label}内容，请先完成设置。`)
      return
    }
    const current = loadPresets(storageKey)
    if (current.some((preset) => preset.name === nextName)
      && !window.confirm(`已存在“${nextName}”。是否用当前设置覆盖这个${label}？`)) return
    try {
      persist([{ name: nextName, value }, ...current.filter((preset) => preset.name !== nextName)],
        nextName, `已保存“${nextName}”。`)
      setName('')
    } catch {
      showError(`保存失败，本地存储可能已满或不可用。请导出已有${label}后重试。`)
    }
  }

  const apply = (target: string): void => {
    setSelected(target)
    setRename(target)
    const preset = presets.find((item) => item.name === target)
    if (!preset) return
    try {
      onApply(preset.value)
      setFeedback({ kind: 'success', message: `已载入“${preset.name}”。` })
    } catch {
      showError(`无法载入“${preset.name}”，请检查${label}内容后重试。`)
    }
  }

  const renameSelected = (): void => {
    const nextName = rename.trim()
    if (!selected || !nextName) return
    const current = loadPresets(storageKey)
    const original = current.find((preset) => preset.name === selected)
    if (!original) {
      showError(`选中的${label}已不存在，请重新选择。`)
      return
    }
    if (nextName === selected) return
    if (current.some((preset) => preset.name === nextName)
      && !window.confirm(`已存在“${nextName}”。重命名将覆盖同名${label}，是否继续？`)) return
    try {
      const next = current.filter((preset) => preset.name !== nextName)
        .map((preset) => preset.name === selected ? { ...preset, name: nextName } : preset)
      persist(next, nextName, `已重命名为“${nextName}”。`)
    } catch {
      showError('重命名失败，本地存储不可用。请稍后重试。')
    }
  }

  const deleteSelected = (): void => {
    if (!selected) return
    try {
      persist(loadPresets(storageKey).filter((preset) => preset.name !== selected), '', `已删除“${selected}”。`)
    } catch {
      showError('删除失败，本地存储不可用。请稍后重试。')
    }
  }

  const download = (): void => {
    try {
      const blob = new Blob([JSON.stringify(loadPresets(storageKey), null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `mcstudio-${storageKey.replace(/[:/]/g, '-')}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      setFeedback({ kind: 'success', message: `${label}已导出为 JSON。` })
    } catch {
      showError('导出失败，请稍后重试。')
    }
  }

  const upload = async (file: File | undefined): Promise<void> => {
    if (!file) return
    setImporting(true)
    try {
      const source: unknown = JSON.parse(await file.text())
      if (!Array.isArray(source) || source.length === 0) {
        showError('文件中没有可导入的方案，请选择导出的 JSON 数组文件。')
        return
      }
      const invalidIndex = source.findIndex((item) => !item || typeof item !== 'object'
        || typeof item.name !== 'string' || !item.name.trim()
        || typeof item.value !== 'string' || !item.value.trim())
      if (invalidIndex >= 0) {
        showError(`第 ${invalidIndex + 1} 条方案格式无效，每条方案需要非空的 name 和 value 字符串。`)
        return
      }
      const imported = source as CustomPreset[]
      const current = loadPresets(storageKey)
      const conflicts = [...new Set(imported.map((preset) => preset.name))]
        .filter((presetName) => current.some((preset) => preset.name === presetName))
      if (conflicts.length > 0 && !window.confirm(
        `有 ${conflicts.length} 个同名${label}：${conflicts.slice(0, 5).join('、')}${conflicts.length > 5 ? '…' : ''}\n继续导入将覆盖同名${label}。`
      )) return
      // Preserve the existing JSON format and first-imported-name-wins merge order.
      const unique = new Map<string, CustomPreset>()
      for (const preset of [...imported, ...current]) {
        if (!unique.has(preset.name)) unique.set(preset.name, preset)
      }
      const next = [...unique.values()].slice(0, MAX_PRESETS)
      const importedCount = new Set(imported
        .filter((preset) => next.some((saved) => saved.name === preset.name))
        .map((preset) => preset.name)).size
      const limitNote = unique.size > MAX_PRESETS ? ` 最多保留 ${MAX_PRESETS} 条，超出部分未保留。` : ''
      persist(next, selected, `已导入 ${importedCount} 条${label}。${limitNote}`)
    } catch (error) {
      showError(error instanceof SyntaxError
        ? '文件不是有效的 JSON，请选择导出的方案文件。'
        : '导入失败，文件无法读取或本地存储不可用。请检查文件后重试。')
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const feedbackMessage = feedback ? (
    <div className={`custom-preset-feedback ${feedback.kind}`} role={feedback.kind === 'error' ? 'alert' : 'status'}>
      {feedback.message}
    </div>
  ) : null

  return (
    <div className="custom-preset-bar" data-preset-key={storageKey}>
      <div className="custom-preset-toolbar">
        <input ref={nameRef} className="input custom-preset-name" aria-label={`${label}名称`}
          placeholder={`${label}名称`} value={name} onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault()
              save()
            }
          }} />
        <button type="button" className="btn btn-sm custom-preset-save" onClick={save} aria-label={`保存${label}`}>
          <Save size={13} aria-hidden="true" />保存
        </button>
        <select className="select custom-preset-select" aria-label={`选择${label}`} value={selected}
          onChange={(event) => apply(event.target.value)}>
          <option value="">选择{label}…</option>
          {presets.map((preset) => <option key={preset.name} value={preset.name}>{preset.name}</option>)}
        </select>
        <button ref={manageButtonRef} type="button" className="btn btn-sm custom-preset-manage"
          aria-label={`管理${label}`} aria-haspopup="dialog" aria-expanded={open}
          onClick={() => { setFeedback(null); setOpen(true) }}>
          <Settings2 size={13} aria-hidden="true" />管理
        </button>
      </div>
      {!open ? feedbackMessage : null}

      {open ? createPortal(
        <Modal title={`管理${label}`} subtitle="选择方案后可载入、重命名或删除，也可导入和导出 JSON。"
          icon={<Settings2 size={17} />} onClose={closeManager} narrow
          footer={<>
            <span className="left">共 {presets.length} 条，最多 {MAX_PRESETS} 条</span>
            <button type="button" className="btn" onClick={closeManager}>完成</button>
          </>}>
          <div className="custom-preset-manager" ref={managerRef}>
            <div className="custom-preset-manager-field">
              <label className="field-label" htmlFor={`${id}-manager-select`}>已保存的{label}</label>
              <div className="custom-preset-manager-row">
                <select id={`${id}-manager-select`} className="select" data-preset-manager-select
                  aria-label={`管理的${label}`} value={selected}
                  onChange={(event) => { setSelected(event.target.value); setFeedback(null) }}>
                  <option value="">{presets.length === 0 ? '还没有保存的方案' : `选择${label}…`}</option>
                  {presets.map((preset) => <option key={preset.name} value={preset.name}>{preset.name}</option>)}
                </select>
                <button type="button" className="btn" disabled={!selectedPreset} onClick={() => apply(selected)}>载入方案</button>
              </div>
            </div>
            <div className="custom-preset-manager-field">
              <label className="field-label" htmlFor={`${id}-rename`}>新名称</label>
              <input id={`${id}-rename`} className="input" aria-label={`新的${label}名称`}
                placeholder={`新的${label}名称`} disabled={!selectedPreset} value={rename}
                onChange={(event) => setRename(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                    event.preventDefault()
                    renameSelected()
                  }
                }} />
            </div>
            <div className="custom-preset-manager-actions" role="group" aria-label="方案编辑操作">
              <button type="button" className="btn" disabled={!selectedPreset || !rename.trim() || rename.trim() === selected}
                onClick={renameSelected}>重命名</button>
              <button type="button" className="btn btn-danger" disabled={!selectedPreset} onClick={deleteSelected}>
                <Trash2 size={14} aria-hidden="true" />删除方案
              </button>
            </div>
            <div className="custom-preset-transfer">
              <div className="custom-preset-transfer-actions" role="group" aria-label="方案文件操作">
                <button type="button" className="btn" disabled={presets.length === 0} onClick={download}>
                  <Download size={14} aria-hidden="true" />导出 JSON
                </button>
                <button type="button" className="btn" disabled={importing} onClick={() => fileRef.current?.click()}>
                  <Upload size={14} aria-hidden="true" />{importing ? '正在导入…' : '导入 JSON'}
                </button>
              </div>
              <p className="hint">方案保存在本机。导出 JSON 可备份设置，或在其他设备导入使用。</p>
              <input ref={fileRef} type="file" accept="application/json,.json" hidden aria-label={`导入${label}文件`}
                onChange={(event) => void upload(event.target.files?.[0])} />
            </div>
            {feedbackMessage}
          </div>
        </Modal>,
        document.body
      ) : null}
    </div>
  )
}
