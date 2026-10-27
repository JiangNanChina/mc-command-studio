import { useMemo, useState } from 'react'
import { Copy, TerminalSquare } from 'lucide-react'
import {
  LEGACY_DIRECTIONS,
  OOC_MODES,
  buildOocCommand,
  createDefaultOocOptions,
  offsetCoordinate,
  type LegacyDirection,
  type OocLayoutAxis,
  type OocMode,
  type OocSecondaryAxis
} from '@mcstudio/core'
import { useAppStore } from '../store'
import { CustomPresetBar } from './CustomPresetBar'
import { OocLayoutPreview } from './OocLayoutPreview'

const LAYOUT_PRESETS = [
  {
    label: 'Y 直线',
    patch: { layoutAxis: 'y' as const, secondaryAxis: 'none' as const, layerStep: '1', secondaryStep: '1', rowSize: '2' }
  },
  {
    label: 'X 直线',
    patch: { layoutAxis: 'x' as const, secondaryAxis: 'none' as const, layerStep: '1', secondaryStep: '1', rowSize: '2' }
  },
  {
    label: 'XY 平面',
    patch: { layoutAxis: 'x' as const, secondaryAxis: 'y' as const, layerStep: '1', secondaryStep: '1', rowSize: '8' }
  },
  {
    label: '3×3 紧凑',
    patch: { layoutAxis: 'x' as const, secondaryAxis: 'y' as const, layerStep: '1', secondaryStep: '1', rowSize: '3' }
  },
  {
    label: 'Z 阶梯',
    patch: { layoutAxis: 'z' as const, secondaryAxis: 'y' as const, layerStep: '1', secondaryStep: '1', rowSize: '4' }
  }
]

export function OocForm() {
  const state = useAppStore()
  const [options, setOptions] = useState(createDefaultOocOptions)
  const result = useMemo(() => buildOocCommand(options), [options])
  const [copied, setCopied] = useState(false)
  const commandCount = options.commands
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean).length
  const rows =
    options.secondaryAxis === 'none'
      ? commandCount
      : Math.ceil(commandCount / Math.max(1, Number(options.rowSize) || 1))
  const columns =
    options.secondaryAxis === 'none'
      ? 1
      : Math.max(1, Math.min(Number(options.rowSize) || 1, commandCount))
  const primaryExtent =
    (options.secondaryAxis === 'none' ? Math.max(0, commandCount - 1) : Math.max(0, rows - 1)) *
    (Number(options.layerStep) || 0)
  const secondaryExtent = Math.max(0, columns - 1) * (Number(options.secondaryStep) || 0)
  const rangeText = (['x', 'y', 'z'] as const)
    .map((axis) => {
      const extent =
        (options.layoutAxis === axis ? primaryExtent : 0) +
        (options.secondaryAxis === axis ? secondaryExtent : 0)
      if (!extent) return null
      return `${axis.toUpperCase()} ${options[axis]}..${offsetCoordinate(options[axis], extent)}`
    })
    .filter(Boolean)
    .join(' · ')

  const update = (patch: Partial<typeof options>) => {
    setOptions((current) => ({ ...current, ...patch }))
    setCopied(false)
  }

  const copy = async () => {
    if (!result.text) return
    await navigator.clipboard.writeText(result.text)
    setCopied(true)
    state.showToast('OOC 命令已复制', 'success')
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 工具 / OOC</div>
          <div className="hero">
            <div className="hero-icon">
              <TerminalSquare size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                OOC 生成器
                <span className="hero-id">1.12.2</span>
              </h1>
              <p className="hero-sub">
                把多条命令压成一条掉落沙/命令方块矿车/命令方块 NBT，用于 1.12.2 一键命令。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">输出方式</div>
        </div>
        <div className="card-body">
          <div className="field">
            <label className="field-label" htmlFor="ooc-mode">
              模式
            </label>
            <select
              id="ooc-mode"
              className="select"
              value={options.mode}
              onChange={(event) => update({ mode: event.target.value as OocMode })}
            >
              {OOC_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
            <div className="hint">
              {OOC_MODES.find((mode) => mode.value === options.mode)?.hint}
            </div>
          </div>

          <div className="grid-3" style={{ marginTop: 12 }}>
            {(['x', 'y', 'z'] as const).map((axis) => (
              <div className="field" key={axis}>
                <label className="field-label" htmlFor={`ooc-${axis}`}>
                  {axis.toUpperCase()}
                </label>
                <input
                  id={`ooc-${axis}`}
                  className="input"
                  value={options[axis]}
                  onChange={(event) => update({ [axis]: event.target.value })}
                />
              </div>
            ))}
          </div>

          <div className="row" style={{ marginTop: 8, gap: 8 }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => update({ x: '~', y: '~', z: '~' })}
            >
              使用 ~ ~ ~
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => update({ x: '~', y: '~1', z: '~' })}
            >
              使用 ~ ~1 ~
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => update({ x: '0', y: '64', z: '0' })}
            >
              使用 0 64 0
            </button>
          </div>

          {options.mode === 'command-block' ? (
            <div className="field" style={{ marginTop: 12 }}>
              <label className="field-label" htmlFor="ooc-facing">
                方向
              </label>
              <select
                id="ooc-facing"
                className="select"
                value={options.facing}
                onChange={(event) =>
                  update({ facing: event.target.value as LegacyDirection })
                }
              >
                {LEGACY_DIRECTIONS.map((direction) => (
                  <option key={direction.value} value={direction.value}>
                    {direction.label}（meta {direction.meta}）
                  </option>
                ))}
              </select>
              <div className="hint">方向写入 1.12 命令方块的 metadata；条件模式额外 +8。</div>
            </div>
          ) : null}

          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label" htmlFor="ooc-layer-step">
              层间距 / 延迟
            </label>
            <input
              id="ooc-layer-step"
              className="input"
              value={options.layerStep}
              onChange={(event) => update({ layerStep: event.target.value })}
            />
            <div className="hint">
              命令方块模式按所选轴每层偏移；掉落沙模式按该值递增每层 Time。
            </div>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label" htmlFor="ooc-layout-axis">
              排布轴
            </label>
            <select
              id="ooc-layout-axis"
              className="select"
              value={options.layoutAxis}
              onChange={(event) =>
                update({ layoutAxis: event.target.value as OocLayoutAxis })
              }
            >
              <option value="x">X 轴</option>
              <option value="y">Y 轴</option>
              <option value="z">Z 轴</option>
            </select>
          </div>

          <div className="row" style={{ marginTop: 8, gap: 8, flexWrap: 'wrap' }}>
            {LAYOUT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="btn btn-sm"
                onClick={() => update(preset.patch)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 8 }}>
            <CustomPresetBar
              storageKey="ooc:layout"
              label="布局"
              value={JSON.stringify({
                layoutAxis: options.layoutAxis,
                secondaryAxis: options.secondaryAxis,
                layerStep: options.layerStep,
                secondaryStep: options.secondaryStep,
                rowSize: options.rowSize
              })}
              onApply={(value) => {
                try {
                  const next = JSON.parse(value)
                  update({
                    layoutAxis: next.layoutAxis,
                    secondaryAxis: next.secondaryAxis,
                    layerStep: next.layerStep,
                    secondaryStep: next.secondaryStep,
                    rowSize: next.rowSize
                  })
                } catch {
                  state.showToast('布局预设格式无效', 'error')
                }
              }}
            />
          </div>

          <div className="grid-3" style={{ marginTop: 12 }}>
            <div className="field">
              <label className="field-label" htmlFor="ooc-secondary-axis">
                第二轴
              </label>
              <select
                id="ooc-secondary-axis"
                className="select"
                value={options.secondaryAxis}
                onChange={(event) =>
                  update({ secondaryAxis: event.target.value as OocSecondaryAxis })
                }
              >
                <option value="none">不启用</option>
                <option value="x">X 轴</option>
                <option value="y">Y 轴</option>
                <option value="z">Z 轴</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="ooc-row-size">
                每行层数
              </label>
              <input
                id="ooc-row-size"
                className="input"
                value={options.rowSize}
                onChange={(event) => update({ rowSize: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="ooc-secondary-step">
                第二轴间距
              </label>
              <input
                id="ooc-secondary-step"
                className="input"
                value={options.secondaryStep}
                onChange={(event) => update({ secondaryStep: event.target.value })}
              />
            </div>
          </div>

          <div className="hint" id="ooc-layout-preview" style={{ marginTop: 8 }}>
            {options.mode === 'command-block'
              ? `预计 ${commandCount} 个命令方块 · ${rows} 行 × ${options.secondaryAxis === 'none' ? 1 : Math.max(1, Number(options.rowSize) || 1)} 列 · ${options.layoutAxis.toUpperCase()}${options.secondaryAxis === 'none' ? '' : ` + ${options.secondaryAxis.toUpperCase()}`}`
              : `预计 ${commandCount} 层掉落沙链`}
          </div>
          <OocLayoutPreview
            count={commandCount}
            rowSize={Math.max(1, Number(options.rowSize) || 1)}
            secondary={options.secondaryAxis !== 'none'}
            primaryAxis={options.layoutAxis}
            secondaryAxis={options.secondaryAxis}
            primaryStep={Number(options.layerStep) || 0}
            secondaryStep={Number(options.secondaryStep) || 0}
            baseX={options.x}
            baseY={options.y}
            baseZ={options.z}
          />
          {options.mode === 'command-block' && rangeText ? (
            <div className="hint" id="ooc-coordinate-range" style={{ marginTop: 4 }}>
              坐标范围：{rangeText}
            </div>
          ) : null}

          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label" htmlFor="ooc-commands">
              命令（每行一条）
            </label>
            <textarea
              id="ooc-commands"
              className="textarea"
              rows={7}
              placeholder="say 第一条&#10;give @p minecraft:diamond 1"
              value={options.commands}
              onChange={(event) => update({ commands: event.target.value })}
            />
          </div>

          <div className="checks" style={{ marginTop: 10 }}>
            <label className="checkline">
              <input
                type="checkbox"
                checked={options.auto}
                onChange={(event) => update({ auto: event.target.checked })}
              />
              保持开启
            </label>
            <label className="checkline">
              <input
                type="checkbox"
                checked={options.conditional}
                onChange={(event) => update({ conditional: event.target.checked })}
              />
              条件命令方块
            </label>
            <label className="checkline">
              <input
                type="checkbox"
                checked={options.trackOutput}
                onChange={(event) => update({ trackOutput: event.target.checked })}
              />
              记录输出
            </label>
          </div>

          {result.diagnostics.length > 0 ? (
            <div className="diagnostics" style={{ marginTop: 12 }}>
              {result.diagnostics.map((item, index) => (
                <div key={`${item.code}-${index}`} className={`diagnostic ${item.severity}`}>
                  {item.message}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">生成命令</div>
          <button type="button" className="btn btn-sm" onClick={() => void copy()}>
            <Copy size={13} />
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <div className="card-body">
          {result.text ? (
            <pre id="ooc-output" className="output-code" style={{ whiteSpace: 'pre-wrap' }}>
              {result.text}
            </pre>
          ) : (
            <div className="hint">填写命令后生成。</div>
          )}
        </div>
      </div>
    </div>
  )
}
