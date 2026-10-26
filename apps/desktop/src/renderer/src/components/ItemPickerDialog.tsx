import { useMemo, useState } from 'react'
import { Package, Search } from 'lucide-react'
import { getApi } from '../lib/api'
import { mcId, mcName } from '../lib/mcAssets'
import { Modal } from './Modal'
import { McIcon } from './McIcon'
import { useAppStore } from '../store'

const LIMIT = 320

export function ItemPickerDialog() {
  const state = useAppStore()
  const [query, setQuery] = useState('')
  const [manual, setManual] = useState('')
  const allItems = state.pack?.registries.item ?? []

  const items = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const list = normalized
      ? allItems.filter((id) => {
          const full = mcId(id)
          return (
            id.toLowerCase().includes(normalized) ||
            mcName('items', full).toLowerCase().includes(normalized)
          )
        })
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
      subtitle={`当前版本共 ${allItems.length} 个物品；支持中文名 / ID 搜索，也可以手动输入模组物品。`}
      icon={<Package size={17} />}
      onClose={() => state.setDialog('itemPicker', false)}
      wide
      footer={
        <>
          <div className="left">已选择：{mcName('items', state.give.item.id)}</div>
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
          placeholder="搜索中文名或 ID，例如 钻石剑、diamond、glass"
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

      <div className="mc-grid">
        {items.length === 0 ? (
          <div className="list-empty">没有匹配的物品，试试手动输入完整 ID。</div>
        ) : (
          items.map((id) => {
            const full = mcId(id)
            const active = full === state.give.item.id || id === state.give.item.id
            return (
              <button
                key={id}
                type="button"
                className={`mc-tile${active ? ' active' : ''}`}
                onClick={() => choose(full)}
              >
                <McIcon category="items" id={full} size={30} />
                <span className="mc-tile-name">{mcName('items', full)}</span>
                <span className="mc-tile-id">{id}</span>
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
