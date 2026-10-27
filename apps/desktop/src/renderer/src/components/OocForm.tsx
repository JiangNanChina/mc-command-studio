import { useMemo, useState } from 'react'
import { Copy, TerminalSquare } from 'lucide-react'
import {
  OOC_MODES,
  buildOocCommand,
  createDefaultOocOptions,
  type OocMode
} from '@mcstudio/core'
import { useAppStore } from '../store'

export function OocForm() {
  const state = useAppStore()
  const [options, setOptions] = useState(createDefaultOocOptions)
  const result = useMemo(() => buildOocCommand(options), [options])
  const [copied, setCopied] = useState(false)

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
