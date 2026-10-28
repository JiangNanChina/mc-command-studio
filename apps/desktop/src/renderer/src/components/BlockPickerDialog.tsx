import { useShallow } from 'zustand/react/shallow'
import { useMemo, useState } from 'react'
import { Boxes, Search } from 'lucide-react'
import { getApi } from '../lib/api'
import { mcId, mcName } from '../lib/mcAssets'
import { Modal } from './Modal'
import { McIcon } from './McIcon'
import { useAppStore } from '../store'

const LIMIT = 320

interface BlockPickerDialogProps {
  currentId?: string
  onSelect?: (block: { id: string; states: Record<string, string> }) => void
  onClose: () => void
}

export function BlockPickerDialog({ currentId, onSelect, onClose }: BlockPickerDialogProps) {
  const state = useAppStore(useShallow((state) => ({
    pack: state.pack,
    setblock: state.setblock,
    selectBlock: state.selectBlock,
    showToast: state.showToast
  })))
  const [query, setQuery] = useState('')
  const [manual, setManual] = useState('')
  const allBlocks = state.pack?.registries.block ?? []
  const current = currentId ?? state.setblock.block.id

  const blocks = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const list = normalized
      ? allBlocks.filter((id) => {
          const full = mcId(id)
          return (
            id.toLowerCase().includes(normalized) ||
            mcName('blocks', full).toLowerCase().includes(normalized)
          )
        })
      : allBlocks
    return list.slice(0, LIMIT)
  }, [allBlocks, query])

  const choose = (id: string): void => {
    const normalized = mcId(id)
    const key = normalized.replace(/^minecraft:/, '')
    const definition = state.pack?.blocks[key]
    const defaults = definition?.[1] ?? {}
    if (onSelect) onSelect({ id: normalized, states: { ...defaults } })
    else state.selectBlock({ id: normalized, states: { ...defaults }, nbt: '' })
    onClose()
  }

  return (
    <Modal
      title="选择方块"
      subtitle={`当前版本共 ${allBlocks.length} 个方块；支持中文名 / ID 搜索，选择后带出默认方块状态。`}
      icon={<Boxes size={17} />}
      onClose={onClose}
      wide
      footer={
        <>
          <div className="left">当前：{mcName('blocks', current)}</div>
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
          placeholder="搜索中文名或 ID，例如 石头、stairs、command_block"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          type="button"
          className="btn"
          onClick={() => {
            void getApi()
              .clipboard.write(current)
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

      <div className="mc-grid">
        {blocks.length === 0 ? (
          <div className="list-empty">没有匹配的方块，试试手动输入完整 ID。</div>
        ) : (
          blocks.map((id) => {
            const full = mcId(id)
            const active = full === current
            const props = state.pack?.blocks[id]?.[0] ?? {}
            const propCount = Object.keys(props).length
            return (
              <button
                key={id}
                type="button"
                className={`mc-tile${active ? ' active' : ''}`}
                onClick={() => choose(full)}
              >
                <McIcon category="blocks" id={full} size={30} />
                <span className="mc-tile-name">{mcName('blocks', full)}</span>
                <span className="mc-tile-id">
                  {id}
                  {propCount > 0 ? ` · ${propCount} 属性` : ''}
                </span>
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
