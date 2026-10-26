import { Dices, Hash } from 'lucide-react'
import { type RandomMode } from '@mcstudio/core'
import { COMMAND_MAP } from '@mcstudio/content'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('random')

export function RandomForm() {
  const state = useAppStore()
  const options = state.random

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 数据包 / random</div>
          <div className="hero">
            <div className="hero-icon">
              <Dices size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '随机数'}
                <span className="hero-id">random</span>
              </h1>
              <p className="hero-sub">生成随机数，返回值可被函数或命令方块读取。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Hash size={15} />
            随机范围
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            {(['value', 'roll'] as RandomMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`btn${options.mode === mode ? ' btn-primary' : ''}`}
                onClick={() => state.updateRandom({ mode })}
              >
                {mode === 'value' ? '返回值 value' : '掷骰 roll'}
              </button>
            ))}
          </div>
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="field">
              <label className="field-label" htmlFor="random-range">
                范围
              </label>
              <input
                id="random-range"
                className="input"
                value={options.range}
                onChange={(event) => state.updateRandom({ range: event.target.value })}
              />
              <div className="hint">例如 1..6、1..、..100。</div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="random-sequence">
                序列（可选）
              </label>
              <input
                id="random-sequence"
                className="input"
                value={options.sequence}
                spellCheck={false}
                placeholder="mcstudio:dice"
                onChange={(event) => state.updateRandom({ sequence: event.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
