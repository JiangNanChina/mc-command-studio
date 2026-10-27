import { useEffect, useState } from 'react'
import { Boxes, Layers, Maximize2 } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import type { FillMode } from '@mcstudio/core'
import { mcName } from '../lib/mcAssets'
import { hasLiteral } from '../lib/versionFeatures'
import { BlockPickerDialog } from './BlockPickerDialog'
import { McIcon } from './McIcon'
import { PositionInput } from './PositionInput'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('fill')

const MODES: { value: FillMode; label: string }[] = [
  { value: 'replace', label: 'replace（替换）' },
  { value: 'destroy', label: 'destroy（破坏）' },
  { value: 'hollow', label: 'hollow（空心）' },
  { value: 'keep', label: 'keep（只填空气）' },
  { value: 'outline', label: 'outline（只填外框）' },
  { value: 'strict', label: 'strict（严格）' }
]

const QUICK_BLOCKS = ['minecraft:stone', 'minecraft:oak_planks', 'minecraft:glass', 'minecraft:dirt', 'minecraft:air']

export function FillForm() {
  const state = useAppStore()
  const fill = state.fill
  const [pickerOpen, setPickerOpen] = useState(false)
  const supportsStrict = hasLiteral(state.pack, 'fill', 'strict')
  const modes = MODES.filter((mode) => mode.value !== 'strict' || supportsStrict)

  useEffect(() => {
    if (!supportsStrict && fill.mode === 'strict') {
      state.updateFill({ mode: 'replace' })
    }
  }, [fill.mode, supportsStrict, state])

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / fill</div>
          <div className="hero">
            <div className="hero-icon">
              <Boxes size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '填充区域'}
                <span className="hero-id">fill</span>
              </h1>
              <p className="hero-sub">
                {meta?.description ?? '用同一种方块填充一个长方体区域，适合快速搭建。'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Maximize2 size={15} />
            区域
          </div>
        </div>
        <div className="card-body">
          <PositionInput
            label="起点（相对/绝对坐标）"
            value={fill.from}
            onChange={(from) => state.updateFill({ from })}
          />
          <div style={{ height: 12 }} />
          <PositionInput
            label="终点"
            value={fill.to}
            onChange={(to) => state.updateFill({ to })}
          />
          <div className="hint" style={{ marginTop: 8 }}>
            起点和终点会组成最小/最大角的长方体，顺序不影响结果。
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Layers size={15} />
            方块
          </div>
          <button type="button" className="btn btn-sm" onClick={() => setPickerOpen(true)}>
            选择方块
          </button>
        </div>
        <div className="card-body">
          <div className="item-select">
            <McIcon category="blocks" id={fill.block} size={38} />
            <div className="item-main">
              <div className="item-name">{mcName('blocks', fill.block)}</div>
              <div className="item-sub">{fill.block}</div>
            </div>
          </div>
          <div className="row wrap" style={{ marginTop: 10 }}>
            {QUICK_BLOCKS.map((id) => (
              <button
                key={id}
                type="button"
                className={`chip${fill.block === id ? ' active' : ''}`}
                onClick={() => state.updateFill({ block: id })}
              >
                <McIcon category="blocks" id={id} size={16} />
                {mcName('blocks', id)}
              </button>
            ))}
          </div>
          <div className="hint" style={{ marginTop: 8 }}>
            选择方块后可手动追加方块状态，例如{' '}
            <code className="code-inline">minecraft:oak_log[axis=y]</code>。
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Boxes size={15} />
            填充模式
          </div>
        </div>
        <div className="card-body">
          <div className="grid-2">
            <div className="field">
              <label className="field-label" htmlFor="fill-mode">
                模式
              </label>
              <select
                id="fill-mode"
                className="select"
                value={fill.mode}
                onChange={(event) => state.updateFill({ mode: event.target.value as FillMode })}
              >
                {modes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>
            {fill.mode === 'replace' ? (
              <div className="field">
                <label className="field-label" htmlFor="fill-filter">
                  过滤方块（可选）
                </label>
                <input
                  id="fill-filter"
                  className="input"
                  value={fill.filter}
                  placeholder="只替换指定方块，例如 minecraft:dirt"
                  onChange={(event) => state.updateFill({ filter: event.target.value })}
                />
              </div>
            ) : null}
          </div>
          <div className="hint" style={{ marginTop: 8 }}>
            <code className="code-inline">replace</code> 可带过滤方块；其他模式会忽略过滤条件。
            <code className="code-inline">keep</code> 只填充空气，
            <code className="code-inline">outline</code> 只填充外框。
          </div>
        </div>
      </div>

      {pickerOpen ? (
        <BlockPickerDialog
          currentId={fill.block}
          onSelect={(block) => state.updateFill({ block: block.id })}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  )
}
