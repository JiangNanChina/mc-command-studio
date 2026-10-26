import { useMemo } from 'react'
import { Copy, Layers, Move3d } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import type { CloneMode, CloneMove } from '@mcstudio/core'
import { PositionInput } from './PositionInput'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('clone')

const MODES: { value: CloneMode; label: string }[] = [
  { value: 'replace', label: 'replace（覆盖目标区域）' },
  { value: 'masked', label: 'masked（只复制非空气）' },
  { value: 'filtered', label: 'filtered（只复制过滤方块）' }
]

const MOVES: { value: CloneMove; label: string }[] = [
  { value: 'normal', label: 'normal（保留源区域）' },
  { value: 'force', label: 'force（强制覆盖）' },
  { value: 'move', label: 'move（复制后清空源区域）' }
]

export function CloneForm() {
  const state = useAppStore()
  const clone = state.clone
  const blocks = useMemo(() => {
    const list = state.pack?.registries.block ?? []
    return list.map((id) => (id.includes(':') ? id : `minecraft:${id}`))
  }, [state.pack])

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / clone</div>
          <div className="hero">
            <div className="hero-icon">
              <Copy size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '复制区域'}
                <span className="hero-id">clone</span>
              </h1>
              <p className="hero-sub">
                {meta?.description ?? '把一个区域的方块复制到另一个位置，可选择覆盖、过滤或移动。'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Layers size={15} />
            源区域
          </div>
        </div>
        <div className="card-body">
          <PositionInput
            label="起点"
            value={clone.begin}
            onChange={(begin) => state.updateClone({ begin })}
          />
          <div style={{ height: 12 }} />
          <PositionInput label="终点" value={clone.end} onChange={(end) => state.updateClone({ end })} />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Move3d size={15} />
            目标位置
          </div>
        </div>
        <div className="card-body">
          <PositionInput
            label="目标起点（源区域最小角会移动到这里）"
            value={clone.destination}
            onChange={(destination) => state.updateClone({ destination })}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Copy size={15} />
            复制选项
          </div>
        </div>
        <div className="card-body">
          <div className="grid-2">
            <div className="field">
              <label className="field-label" htmlFor="clone-mode">
                复制模式
              </label>
              <select
                id="clone-mode"
                className="select"
                value={clone.mode}
                onChange={(event) => state.updateClone({ mode: event.target.value as CloneMode })}
              >
                {MODES.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="clone-move">
                移动方式
              </label>
              <select
                id="clone-move"
                className="select"
                value={clone.move}
                onChange={(event) => state.updateClone({ move: event.target.value as CloneMove })}
              >
                {MOVES.map((move) => (
                  <option key={move.value} value={move.value}>
                    {move.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {clone.mode === 'filtered' ? (
            <div className="field" style={{ marginTop: 10 }}>
              <label className="field-label" htmlFor="clone-filter">
                过滤方块
              </label>
              <input
                id="clone-filter"
                className="input"
                list="clone-filter-options"
                value={clone.filter}
                placeholder="minecraft:stone"
                onChange={(event) => state.updateClone({ filter: event.target.value })}
              />
              <datalist id="clone-filter-options">
                {blocks.map((id) => (
                  <option key={id} value={id} />
                ))}
              </datalist>
            </div>
          ) : null}

          <div className="hint" style={{ marginTop: 10 }}>
            <code className="code-inline">move</code> 会清空源区域；目标区域与源区域重叠时建议使用{' '}
            <code className="code-inline">force</code>。
          </div>
        </div>
      </div>
    </div>
  )
}
