import { useMemo, useState } from 'react'
import { Search, Settings2 } from 'lucide-react'
import { Modal } from './Modal'

export interface GameruleRule {
  id: string
  name: string
  description: string
  type: 'boolean' | 'integer'
  min?: number
  max?: number
}

interface GamerulePickerDialogProps {
  rules: GameruleRule[]
  current?: string
  onSelect: (rule: GameruleRule) => void
  onClose: () => void
}

export function GamerulePickerDialog({
  rules,
  current,
  onSelect,
  onClose
}: GamerulePickerDialogProps) {
  const [query, setQuery] = useState('')
  const entries = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return rules.filter((rule) => {
      if (!normalized) return true
      return (
        rule.id.includes(normalized) ||
        rule.name.toLowerCase().includes(normalized) ||
        rule.description.toLowerCase().includes(normalized)
      )
    })
  }, [query, rules])

  return (
    <Modal
      title="选择游戏规则"
      subtitle={`共 ${rules.length} 条规则；支持中文名 / ID / 说明搜索。`}
      icon={<Settings2 size={17} />}
      onClose={onClose}
      wide
      footer={
        <>
          <div className="left">
            当前：{rules.find((rule) => rule.id === current)?.name ?? current}
          </div>
          <button type="button" className="btn" onClick={onClose}>
            关闭
          </button>
        </>
      }
    >
      <div className="picker-toolbar">
        <input
          className="input"
          autoFocus
          placeholder="搜索游戏规则中文名或 ID"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="gamerule-grid">
        {entries.length === 0 ? (
          <div className="list-empty">没有匹配项。</div>
        ) : (
          entries.map((rule) => (
            <button
              key={rule.id}
              type="button"
              className={`gamerule-tile${rule.id === current ? ' active' : ''}`}
              onClick={() => {
                onSelect(rule)
                onClose()
              }}
            >
              <span className="gamerule-tile-name">{rule.name}</span>
              <span className="gamerule-tile-id">{rule.id}</span>
              <span className={`gamerule-type ${rule.type}`}>
                {rule.type === 'boolean' ? '开关' : '整数'}
              </span>
            </button>
          ))
        )}
      </div>
    </Modal>
  )
}
