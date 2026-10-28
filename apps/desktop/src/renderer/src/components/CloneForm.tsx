import { useShallow } from 'zustand/react/shallow'
import { useState } from 'react'
import { Copy, Layers, Move3d } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import type { CloneMode, CloneMove } from '@mcstudio/core'
import { mcName } from '../lib/mcAssets'
import { BlockPickerDialog } from './BlockPickerDialog'
import { McIcon } from './McIcon'
import { PositionInput } from './PositionInput'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('clone')

const MODES: { value: CloneMode; label: string }[] = [
  { value: 'replace', label: '覆盖目标区域（replace）' },
  { value: 'masked', label: '只复制非空气（masked）' },
  { value: 'filtered', label: '只复制匹配方块（filtered）' }
]

const MOVES: { value: CloneMove; label: string }[] = [
  { value: 'normal', label: '保留源区域（normal）' },
  { value: 'force', label: '强制复制（force）' },
  { value: 'move', label: '复制后清空源区域（move）' }
]

export function CloneForm() {
  const state = useAppStore(useShallow((state) => ({
    clone: state.clone,
    updateClone: state.updateClone
  })))
  const clone = state.clone
  const [pickerOpen, setPickerOpen] = useState(false)

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
              <label className="field-label">过滤方块</label>
              <div className="item-select">
                <McIcon category="blocks" id={clone.filter} size={34} />
                <div className="item-main">
                  <div className="item-name">
                    {clone.filter ? mcName('blocks', clone.filter) : '未选择过滤方块'}
                  </div>
                  <div className="item-sub">{clone.filter || 'filtered 模式必须选择'}</div>
                </div>
                <button type="button" className="btn btn-sm" onClick={() => setPickerOpen(true)}>
                  选择方块
                </button>
              </div>
            </div>
          ) : null}

          <div className="hint" style={{ marginTop: 10 }}>
            <code className="code-inline">move</code> 会清空源区域；目标区域与源区域重叠时建议使用{' '}
            <code className="code-inline">force</code>。
          </div>
        </div>
      </div>

      {pickerOpen ? (
        <BlockPickerDialog
          currentId={clone.filter}
          onSelect={(block) => state.updateClone({ filter: block.id })}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  )
}
