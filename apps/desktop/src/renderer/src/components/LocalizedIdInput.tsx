import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import './LocalizedIdInput.css'

export interface LocalizedIdOption {
  value: string
  label: string
}

export interface LocalizedIdInputProps {
  id: string
  value: string
  options: LocalizedIdOption[]
  onChange: (value: string) => void
  label: string
  describedBy?: string
  placeholder?: string
  disabled?: boolean
  allowCustom?: boolean
  validateCustomValue?: (value: string) => boolean
}

const MAX_VISIBLE_OPTIONS = 80
const VIEWPORT_GAP = 8
const INPUT_GAP = 5
const RESOURCE_ID = /^(?:[a-z0-9_.-]+:)?[a-z0-9_./-]+$/

/** A localized display never changes the resource ID stored in the command model. */
export function LocalizedIdInput({
  id,
  value,
  options,
  onChange,
  label,
  describedBy,
  placeholder = '搜索中文名称或输入资源 ID',
  disabled = false,
  allowCustom = true,
  validateCustomValue = (value) => RESOURCE_ID.test(value)
}: LocalizedIdInputProps) {
  const uniqueId = useId()
  const listboxId = `${uniqueId}-options`
  const inputRef = useRef<HTMLInputElement>(null)
  const controlRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [dirty, setDirty] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [announcement, setAnnouncement] = useState('')
  const [popupStyle, setPopupStyle] = useState<CSSProperties | null>(null)

  const availableOptions = useMemo(() => {
    const seen = new Set<string>()
    return options.filter((option) => {
      if (seen.has(option.value)) return false
      seen.add(option.value)
      return true
    })
  }, [options])
  const selectedOption = availableOptions.find((option) => option.value === value)
  const displayValue = value ? (selectedOption?.label || `自定义${label}`) : ''
  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return availableOptions
    return availableOptions.filter((option) => option.value.toLocaleLowerCase().includes(normalized)
      || option.label.toLocaleLowerCase().includes(normalized))
  }, [availableOptions, query])
  const visibleOptions = filteredOptions.slice(0, MAX_VISIBLE_OPTIONS)
  const activeOption = visibleOptions[activeIndex]

  useEffect(() => {
    setDraft(displayValue)
    setDirty(false)
    setQuery('')
    setOpen(false)
    setActiveIndex(-1)
  }, [value, displayValue])

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  useLayoutEffect(() => {
    if (!open) {
      setPopupStyle(null)
      return
    }
    let frame = 0
    const measure = (): void => {
      const input = inputRef.current
      if (!input) return
      const rect = input.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      if (rect.bottom < 0 || rect.top > viewportHeight || rect.right < 0 || rect.left > viewportWidth) {
        setOpen(false)
        return
      }
      const width = Math.max(0, Math.min(Math.max(rect.width, 280), viewportWidth - VIEWPORT_GAP * 2))
      const left = Math.max(VIEWPORT_GAP, Math.min(rect.left, viewportWidth - width - VIEWPORT_GAP))
      const below = Math.max(0, viewportHeight - rect.bottom - INPUT_GAP - VIEWPORT_GAP)
      const above = Math.max(0, rect.top - INPUT_GAP - VIEWPORT_GAP)
      const useBelow = below >= 160 || below >= above
      setPopupStyle({
        position: 'fixed',
        left,
        width,
        maxHeight: Math.min(360, useBelow ? below : above),
        ...(useBelow ? { top: rect.bottom + INPUT_GAP } : { bottom: viewportHeight - rect.top + INPUT_GAP })
      })
    }
    const scheduleMeasure = (event?: Event): void => {
      if (event?.target instanceof Node && popupRef.current?.contains(event.target)) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('resize', scheduleMeasure)
    window.addEventListener('scroll', scheduleMeasure, true)
    const observer = new ResizeObserver(() => scheduleMeasure())
    if (inputRef.current) observer.observe(inputRef.current)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
      window.removeEventListener('scroll', scheduleMeasure, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const outsideClick = (event: PointerEvent): void => {
      if (!(event.target instanceof Node) || controlRef.current?.contains(event.target)
        || popupRef.current?.contains(event.target)) return
      inputRef.current?.blur()
      setOpen(false)
    }
    document.addEventListener('pointerdown', outsideClick, true)
    return () => document.removeEventListener('pointerdown', outsideClick, true)
  }, [open])

  useEffect(() => {
    if (open && activeOption) {
      document.getElementById(`${listboxId}-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
    }
  }, [open, activeIndex, activeOption?.value, listboxId])

  const restoreDisplay = (): void => {
    setDraft(displayValue)
    setDirty(false)
    setQuery('')
    setActiveIndex(-1)
  }

  const openList = (edge?: 'first' | 'last'): void => {
    if (disabled) return
    setQuery('')
    setDraft(displayValue)
    setDirty(false)
    setAnnouncement('')
    const firstPage = availableOptions.slice(0, MAX_VISIBLE_OPTIONS)
    const currentIndex = firstPage.findIndex((option) => option.value === value)
    setActiveIndex(edge === 'first' ? 0 : edge === 'last' ? firstPage.length - 1 : currentIndex)
    setOpen(true)
  }

  const commitValue = (nextValue: string): void => {
    if (nextValue !== value) onChange(nextValue)
    setDraft(nextValue ? (availableOptions.find((option) => option.value === nextValue)?.label || `自定义${label}`) : '')
    setDirty(false)
    setQuery('')
    setActiveIndex(-1)
    setOpen(false)
    setAnnouncement(nextValue ? `已选择${label}。` : `已清空${label}。`)
  }

  const finishEditing = (): void => {
    if (dirty) {
      const nextValue = draft.trim()
      const exactOption = availableOptions.find((option) => option.value === nextValue)
      if (!nextValue || exactOption || (allowCustom && validateCustomValue(nextValue))) {
        commitValue(exactOption?.value ?? nextValue)
        return
      }
      setAnnouncement(`请从列表选择${label}，或输入有效的资源 ID。已保留原设置。`)
    }
    restoreDisplay()
    setOpen(false)
  }

  const selectOption = (option: LocalizedIdOption): void => {
    inputRef.current?.focus({ preventScroll: true })
    commitValue(option.value)
  }

  return (
    <div ref={controlRef} className="localized-id-control">
      <input ref={inputRef} id={id} className="input localized-id-input" role="combobox"
        aria-label={label} aria-describedby={describedBy} aria-autocomplete="list"
        aria-expanded={open} aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open && activeOption ? `${listboxId}-${activeIndex}` : undefined}
        autoComplete="off" autoCorrect="off" spellCheck={false} disabled={disabled}
        placeholder={placeholder} value={dirty ? draft : displayValue} data-value={value} title={value ? `${displayValue} · ${value}` : label}
        onFocus={(event) => { openList(); event.currentTarget.select() }}
        onClick={() => { if (!open) openList() }}
        onChange={(event) => {
          setDraft(event.target.value)
          setQuery(event.target.value)
          setDirty(true)
          setActiveIndex(-1)
          setAnnouncement('')
          setOpen(true)
        }}
        onBlur={(event) => {
          if (event.relatedTarget instanceof Node && popupRef.current?.contains(event.relatedTarget)) return
          finishEditing()
        }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            if (!open) {
              openList(event.key === 'ArrowDown' ? 'first' : 'last')
            } else if (visibleOptions.length > 0) {
              const direction = event.key === 'ArrowDown' ? 1 : -1
              setActiveIndex((current) => current < 0 ? (direction > 0 ? 0 : visibleOptions.length - 1)
                : Math.max(0, Math.min(visibleOptions.length - 1, current + direction)))
            }
          } else if (event.key === 'Enter') {
            event.preventDefault()
            if (open && activeOption) selectOption(activeOption)
            else if (dirty) finishEditing()
            else openList()
          } else if (event.key === 'Escape' && open) {
            event.preventDefault()
            event.stopPropagation()
            restoreDisplay()
            setOpen(false)
          } else if (event.key === 'Tab') {
            setOpen(false)
          }
        }} />
      <ChevronDown size={14} className={`localized-id-chevron${open ? ' open' : ''}`} aria-hidden="true" />
      <span className="localized-id-announcement" role="status" aria-live="polite">{announcement}</span>
      {open && popupStyle ? createPortal(
        <div ref={popupRef} className="localized-id-popup" style={popupStyle}>
          {value ? <div className="localized-id-current">
            <span>当前：{displayValue}</span>
            <code>{value}</code>
          </div> : null}
          <div id={listboxId} className="localized-id-options" role="listbox" aria-label={`${label}选项`}>
            {visibleOptions.map((option, index) => (
              <button key={option.value} id={`${listboxId}-${index}`} type="button" role="option" tabIndex={-1}
                aria-selected={option.value === value} data-value={option.value}
                className={`localized-id-option${activeIndex === index ? ' is-active' : ''}${option.value === value ? ' is-selected' : ''}`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => { if (activeIndex !== index) setActiveIndex(index) }}
                onClick={() => selectOption(option)}>
                <span className="localized-id-option-text"><span className="localized-id-option-label">{option.label}</span><code>{option.value}</code></span>
                {option.value === value ? <Check size={14} aria-hidden="true" /> : null}
              </button>
            ))}
            {visibleOptions.length === 0 ? <div className="localized-id-empty">
              没有匹配的{label}。{allowCustom && validateCustomValue(query.trim())
                ? '可按 Enter 使用当前资源 ID。' : '请尝试其他中文名称或资源 ID。'}
            </div> : null}
          </div>
          <div className="localized-id-popup-hint" role="status">
            {filteredOptions.length > MAX_VISIBLE_OPTIONS
              ? `找到 ${filteredOptions.length} 项，先显示前 ${MAX_VISIBLE_OPTIONS} 项；继续输入可缩小范围。`
              : `${filteredOptions.length} 项；↑↓ 选择，Enter 确认。`}
          </div>
        </div>,
        document.body
      ) : null}
    </div>
  )
}
