import { useShallow } from 'zustand/react/shallow'
import { useEffect, useMemo, useState } from 'react'
import { Boxes, Braces, MapPin, Settings2 } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import { shortId, type SetblockMode } from '@mcstudio/core'
import { BlockPickerDialog } from './BlockPickerDialog'
import { McIcon } from './McIcon'
import { mcName } from '../lib/mcAssets'
import { hasLiteral } from '../lib/versionFeatures'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('setblock')

const MODES: { value: SetblockMode; label: string; hint: string }[] = [
  { value: 'replace', label: '替换（默认）', hint: '直接替换目标方块' },
  { value: 'destroy', label: '破坏', hint: '像玩家破坏一样掉落原方块' },
  { value: 'keep', label: '保留', hint: '目标位置已有方块时不替换' },
  { value: 'strict', label: '严格', hint: '26.x 的严格放置语义' }
]

export function SetblockForm() {
  const state = useAppStore(useShallow((state) => ({
    setblock: state.setblock,
    pack: state.pack,
    updateSetblock: state.updateSetblock,
    selectBlock: state.selectBlock,
    updateSetblockPosition: state.updateSetblockPosition,
    setBlockState: state.setBlockState,
    setBlockNbt: state.setBlockNbt,
    setBlockMode: state.setBlockMode
  })))
  const options = state.setblock
  const [pickerOpen, setPickerOpen] = useState(false)
  const supportsStrict = hasLiteral(state.pack, 'setblock', 'strict')
  const modes = MODES.filter((mode) => mode.value !== 'strict' || supportsStrict)
  useEffect(() => {
    if (!supportsStrict && options.mode === 'strict') {
      state.updateSetblock({ mode: 'replace' })
    }
  }, [options.mode, supportsStrict, state])
  const blockId = shortId(options.block.id)
  const definition = state.pack?.blocks[blockId]
  const properties = useMemo(() => {
    const source = definition?.[0] ?? {}
    return Object.entries(source).map(([key, values]) => ({
      key,
      values: Array.isArray(values) ? values : [values]
    }))
  }, [definition])

  const resetDefaults = (): void => {
    const defaults = definition?.[1] ?? {}
    state.selectBlock({
      id: options.block.id,
      states: { ...defaults },
      nbt: options.block.nbt
    })
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / setblock</div>
          <div className="hero">
            <div className="hero-icon">
              <Boxes size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '放置方块'}
                <span className="hero-id">setblock</span>
              </h1>
              <p className="hero-sub">
                {meta?.description ?? '把指定坐标的方块替换为另一种方块，支持方块状态与方块实体 NBT。'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <MapPin size={15} />
            坐标
          </div>
          <div className="card-hint">支持绝对、相对与局部坐标</div>
        </div>
        <div className="card-body">
          <div className="grid-3">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <div className="field" key={axis}>
                <label className="field-label" htmlFor={`setblock-${axis}`}>
                  {axis.toUpperCase()}
                </label>
                <input
                  id={`setblock-${axis}`}
                  className="input"
                  value={options.position[axis]}
                  placeholder="~"
                  onChange={(event) => state.updateSetblockPosition({ [axis]: event.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Boxes size={15} />
            方块
          </div>
          <button type="button" className="btn btn-sm" onClick={() => setPickerOpen(true)}>
            选择方块
          </button>
        </div>
        <div className="card-body">
          <div className="item-select">
            <McIcon category="blocks" id={options.block.id} size={38} />
            <div className="item-main">
              <div className="item-name">{mcName('blocks', options.block.id)}</div>
              <div className="item-sub">
                <span className="id">{options.block.id}</span>
                {' · '}
                {properties.length > 0 ? `${properties.length} 个方块属性` : '无方块属性'}
              </div>
            </div>
            <span className="badge">{blockId}</span>
          </div>

          {properties.length > 0 ? (
            <>
              <div className="section-label" style={{ marginTop: 14 }}>
                方块状态
              </div>
              <div className="grid-2">
                {properties.map((property) => {
                  const current = options.block.states[property.key] ?? ''
                  const values = property.values.includes(current)
                    ? property.values
                    : [current, ...property.values]
                  return (
                    <div className="field" key={property.key}>
                      <label className="field-label" htmlFor={`state-${property.key}`}>
                        {property.key}
                      </label>
                      <select
                        id={`state-${property.key}`}
                        className="select"
                        value={current}
                        onChange={(event) => state.setBlockState(property.key, event.target.value)}
                      >
                        {current === '' ? <option value="">默认</option> : null}
                        {values.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
              <button type="button" className="btn btn-sm" style={{ marginTop: 10 }} onClick={resetDefaults}>
                <Settings2 size={13} />
                恢复默认状态
              </button>
            </>
          ) : (
            <div className="hint" style={{ marginTop: 10 }}>
              这个方块没有可编辑的状态属性。
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Braces size={15} />
            方块实体 NBT
          </div>
          <div className="card-hint">可选，例如箱子、命令方块</div>
        </div>
        <div className="card-body">
          <textarea
            className="textarea"
            placeholder='例如 {Items:[{Slot:0b,id:"minecraft:diamond",count:1}]}'
            value={options.block.nbt}
            onChange={(event) => state.setBlockNbt(event.target.value)}
          />
          <div className="hint" style={{ marginTop: 6 }}>
            NBT 会紧跟在方块状态之后，例如 <code className="code-inline">chest[facing=north]{'{Items:[]}'}</code>。
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Settings2 size={15} />
            放置模式
          </div>
        </div>
        <div className="card-body">
          <div className="grid-2">
            {modes.map((mode) => (
              <label key={mode.value} className="checkline" style={{ whiteSpace: 'normal' }}>
                <input
                  type="radio"
                  name="setblock-mode"
                  checked={options.mode === mode.value}
                  onChange={() => state.setBlockMode(mode.value)}
                />
                <span>
                  <strong>{mode.label}</strong>
                  <span className="hint" style={{ display: 'block' }}>
                    {mode.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <div className="hint" style={{ marginTop: 8 }}>
            replace 是默认值，会在命令中省略。
          </div>
        </div>
      </div>

      {pickerOpen ? <BlockPickerDialog onClose={() => setPickerOpen(false)} /> : null}
    </div>
  )
}
