import { useMemo, useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { Modal } from './Modal'
import { particleName } from '../lib/particleNames'

interface ParticlePickerDialogProps {
  ids: string[]
  current?: string
  onSelect: (id: string) => void
  onClose: () => void
}

export function ParticlePickerDialog({
  ids,
  current,
  onSelect,
  onClose
}: ParticlePickerDialogProps) {
  const [query, setQuery] = useState('')
  const entries = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return ids
      .map((id) => ({ full: id, name: particleName(id) }))
      .filter((entry) => {
        if (!normalized) return true
        return (
          entry.full.toLowerCase().includes(normalized) ||
          entry.name.toLowerCase().includes(normalized)
        )
      })
  }, [ids, query])

  return (
    <Modal
      title="选择粒子"
      subtitle={`共 ${ids.length} 种粒子；支持中文名 / ID 搜索。`}
      icon={<Sparkles size={17} />}
      onClose={onClose}
      wide
      footer={
        <>
          <div className="left">当前：{current ? particleName(current) : '未选择'}</div>
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
          placeholder="搜索粒子中文名或 ID"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="mc-grid">
        {entries.length === 0 ? (
          <div className="list-empty">没有匹配项。</div>
        ) : (
          entries.map((entry) => (
            <button
              key={entry.full}
              type="button"
              className={`mc-tile${entry.full === current ? ' active' : ''}`}
              title={entry.full.replace(/^minecraft:/, '')}
              onClick={() => {
                onSelect(entry.full)
                onClose()
              }}
            >
              <span className="particle-glyph">
                <Sparkles size={17} />
              </span>
              <span className="mc-tile-name">{entry.name}</span>
              <span className="mc-tile-id">{entry.full.replace(/^minecraft:/, '')}</span>
            </button>
          ))
        )}
      </div>
    </Modal>
  )
}
