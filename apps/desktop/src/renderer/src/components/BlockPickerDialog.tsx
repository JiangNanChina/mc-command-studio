import { useMemo, useState } from 'react'
import { Boxes, Search } from 'lucide-react'
import { getApi } from '../lib/api'
import { Modal } from './Modal'
import { useAppStore } from '../store'

const LIMIT = 160

export function BlockPickerDialog({ onClose }: { onClose: () => void }) {
  const state = useAppStore()
  const [query, setQuery] = useState('')
  const [manual, setManual] = useState('')
  const allBlocks = state.pack?.registries.block ?? []

  const blocks = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const list = normalized
      ? allBlocks.filter((id) => id.toLowerCase().includes(normalized))
      : allBlocks
    return list.slice(0, LIMIT)
  }, [allBlocks, query])

  const choose = (id: string): void => {
    const normalized = id.includes(':') ? id : `minecraft:${id}`
    const key = normalized.replace(/^minecraft:/, '')
    const definition = state.pack?.blocks[key]
    const defaults = definition?.[1] ?? {}
    state.selectBlock({ id: normalized, states: { ...defaults }, nbt: '' })
    onClose()
  }

  return (
    <Modal
      title="选择方块"
      subtitle={`当前版本共 ${allBlocks.length} 个方块；选择后会带出默认方块状态。`}
      icon={<Boxes size={17} />}
      onClose={onClose}
      wide
      footer={
        <>
          <div className="left">当前：{state.setblock.block.id}</div>
          <button type="button" className="btn" onClick={onClose}>
            取消
          </button>
        </>
      }
    >
      <div className="picker-toolbar">
        <input
          className="input"
          autoFocus
          placeholder="搜索方块 ID，例如 stone、stairs、command_block"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          type="button"
          className="btn"
          onClick={() => {
            void getApi()
              .clipboard.write(state.setblock.block.id)
              .then(() => state.showToast('已复制方块 ID', 'success'))
              .catch(() => state.showToast('复制失败', 'error'))
          }}
        >
          <Search size={14} />
          复制当前 ID
        </button>
      </div>

      <div className="field" style={{ marginBottom: 10 }}>
        <label className="field-label" htmlFor="manual-block">
          手动输入（支持非原版命名空间）
        </label>
        <div className="row">
          <input
            id="manual-block"
            className="input"
            placeholder="例如 mypack:ruby_block"
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
        {blocks.length === 0 ? (
          <div className="list-empty">没有匹配的方块，试试手动输入完整 ID。</div>
        ) : (
          blocks.map((id) => {
            const full = id.includes(':') ? id : `minecraft:${id}`
            const active = full === state.setblock.block.id
            const props = state.pack?.blocks[id]?.[0] ?? {}
            const propCount = Object.keys(props).length
            return (
              <button
                key={id}
                type="button"
                className={`item-row${active ? ' active' : ''}`}
                onClick={() => choose(full)}
              >
                <span>{full}</span>
                <span className="short">{propCount > 0 ? `${propCount} 个属性` : '无状态'}</span>
              </button>
            )
          })
        )}
      </div>

      {allBlocks.length > LIMIT ? (
        <div className="hint" style={{ marginTop: 8 }}>
          只显示前 {LIMIT} 条结果，缩小搜索范围可看到更多。
        </div>
      ) : null}
    </Modal>
  )
}
