import { useMemo, useState } from 'react'
import { Package, Search } from 'lucide-react'
import { getApi } from '../lib/api'
import { Modal } from './Modal'
import { useAppStore } from '../store'

const LIMIT = 160

export function ItemPickerDialog() {
  const state = useAppStore()
  const [query, setQuery] = useState('')
  const [manual, setManual] = useState('')
  const allItems = state.pack?.registries.item ?? []

  const items = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const list = normalized
      ? allItems.filter((id) => id.toLowerCase().includes(normalized))
      : allItems
    return list.slice(0, LIMIT)
  }, [allItems, query])

  const choose = (id: string): void => {
    state.setItemId(id)
    state.setDialog('itemPicker', false)
  }

  return (
    <Modal
      title="选择物品"
      subtitle={`当前版本共 ${allItems.length} 个物品；支持搜索 ID，也可以手动输入资源包/模组物品。`}
      icon={<Package size={17} />}
      onClose={() => state.setDialog('itemPicker', false)}
      wide
      footer={
        <>
          <div className="left">已选择：{state.give.item.id}</div>
          <button type="button" className="btn" onClick={() => state.setDialog('itemPicker', false)}>
            取消
          </button>
        </>
      }
    >
      <div className="picker-toolbar">
        <input
          className="input"
          autoFocus
          placeholder="搜索物品 ID，例如 diamond、sword、glass"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          type="button"
          className="btn"
          onClick={() => {
            void getApi()
              .clipboard.write(state.give.item.id)
              .then(() => state.showToast('已复制物品 ID', 'success'))
              .catch(() => undefined)
          }}
        >
          <Search size={14} />
          复制当前 ID
        </button>
      </div>

      <div className="field" style={{ marginBottom: 10 }}>
        <label className="field-label" htmlFor="manual-item">
          手动输入（支持非原版命名空间）
        </label>
        <div className="row">
          <input
            id="manual-item"
            className="input"
            placeholder="例如 mypack:ruby"
            value={manual}
            onChange={(event) => setManual(event.target.value)}
          />
          <button
            type="button"
            className="btn"
            disabled={!manual.trim()}
            onClick={() => choose(manual.trim())}
          >
            使用
          </button>
        </div>
      </div>

      <div className="item-list">
        {items.length === 0 ? (
          <div className="list-empty">没有匹配的物品，试试手动输入完整 ID。</div>
        ) : (
          items.map((id) => {
            const full = id.includes(':') ? id : `minecraft:${id}`
            const active = full === state.give.item.id || id === state.give.item.id
            return (
              <button
                key={id}
                type="button"
                className={`item-row${active ? ' active' : ''}`}
                onClick={() => choose(full)}
              >
                <span>{full}</span>
                <span className="short">{id.split('_').join(' ')}</span>
              </button>
            )
          })
        )}
      </div>

      {allItems.length > LIMIT ? (
        <div className="hint" style={{ marginTop: 8 }}>
          只显示前 {LIMIT} 条结果，缩小搜索范围可看到更多。
        </div>
      ) : null}
    </Modal>
  )
}
