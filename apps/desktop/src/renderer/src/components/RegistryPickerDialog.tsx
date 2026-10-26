import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Modal } from './Modal'
import { McIcon } from './McIcon'
import { mcId, mcName, type McCategory } from '../lib/mcAssets'

interface RegistryPickerDialogProps {
  title: string
  category: McCategory
  ids: string[]
  current?: string
  limit?: number
  onSelect: (id: string) => void
  onClose: () => void
}

export function RegistryPickerDialog({
  title,
  category,
  ids,
  current,
  limit = 400,
  onSelect,
  onClose
}: RegistryPickerDialogProps) {
  const [query, setQuery] = useState('')

  const entries = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return ids
      .map((id) => {
        const full = mcId(id)
        return { full, name: mcName(category, full) }
      })
      .filter((entry) => {
        if (!normalized) return true
        return (
          entry.full.toLowerCase().includes(normalized) ||
          entry.name.toLowerCase().includes(normalized)
        )
      })
  }, [category, ids, query])

  const visible = entries.slice(0, limit)

  return (
    <Modal
      title={title}
      subtitle={`共 ${ids.length} 项；支持中文名和 ID 搜索。`}
      icon={<Search size={17} />}
      onClose={onClose}
      wide
      footer={
        <>
          <div className="left">当前：{current ? mcName(category, current) : '未选择'}</div>
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
          placeholder="搜索中文名或 ID"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="mc-grid">
        {visible.length === 0 ? (
          <div className="list-empty">没有匹配项。</div>
        ) : (
          visible.map((entry) => (
            <button
              key={entry.full}
              type="button"
              className={`mc-tile${entry.full === current ? ' active' : ''}`}
              onClick={() => {
                onSelect(entry.full)
                onClose()
              }}
            >
              <McIcon category={category} id={entry.full} size={30} />
              <span className="mc-tile-name">{entry.name}</span>
              <span className="mc-tile-id">{entry.full.replace(/^minecraft:/, '')}</span>
            </button>
          ))
        )}
      </div>
      {entries.length > limit ? (
        <div className="hint" style={{ marginTop: 8 }}>
          共 {entries.length} 项，只显示前 {limit} 项；输入中文名或 ID 缩小范围。
        </div>
      ) : null}
    </Modal>
  )
}
