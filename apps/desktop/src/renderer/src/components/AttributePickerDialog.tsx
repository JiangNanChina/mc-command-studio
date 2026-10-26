import { useMemo, useState } from 'react'
import { Activity, Search } from 'lucide-react'
import { Modal } from './Modal'
import attributesJson from '../data/attributes.json'

export interface AttributeInfo {
  id: string
  name: string
}

const ATTRIBUTES = attributesJson as AttributeInfo[]

export function attributeName(id: string): string {
  return ATTRIBUTES.find((item) => item.id === id)?.name ?? id
}

export function AttributePickerDialog({
  current,
  onSelect,
  onClose
}: {
  current?: string
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const entries = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return ATTRIBUTES.filter((item) => {
      if (!normalized) return true
      return item.id.includes(normalized) || item.name.toLowerCase().includes(normalized)
    })
  }, [query])

  return (
    <Modal
      title="选择属性"
      subtitle={`共 ${ATTRIBUTES.length} 个 26.3 实体属性；支持中文名 / ID 搜索。`}
      icon={<Activity size={17} />}
      onClose={onClose}
      wide
      footer={
        <>
          <div className="left">当前：{current ? attributeName(current) : '未选择'}</div>
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
          placeholder="搜索属性中文名或 ID"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="attribute-grid">
        {entries.length === 0 ? (
          <div className="list-empty">没有匹配项。</div>
        ) : (
          entries.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`attribute-tile${item.id === current ? ' active' : ''}`}
              onClick={() => {
                onSelect(item.id)
                onClose()
              }}
            >
              <span className="attribute-tile-name">{item.name}</span>
              <span className="attribute-tile-id">{item.id}</span>
            </button>
          ))
        )}
      </div>
    </Modal>
  )
}
