import { useShallow } from 'zustand/react/shallow'
import { Clock, Pause, Play } from 'lucide-react'
import { type TickAction } from '@mcstudio/core'
import { COMMAND_MAP } from '@mcstudio/content'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('tick')

const ACTIONS: { value: TickAction; label: string }[] = [
  { value: 'freeze', label: '冻结' },
  { value: 'unfreeze', label: '解冻' },
  { value: 'sprint', label: '加速运行' },
  { value: 'sprintStop', label: '停止加速' },
  { value: 'rate', label: '设置速率' },
  { value: 'step', label: '单步执行' },
  { value: 'stepStop', label: '停止单步' }
]

export function TickForm() {
  const state = useAppStore(useShallow((state) => ({
    tick: state.tick,
    updateTick: state.updateTick
  })))
  const options = state.tick

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 世界 / tick</div>
          <div className="hero">
            <div className="hero-icon">
              <Clock size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '游戏刻控制'}
                <span className="hero-id">tick</span>
              </h1>
              <p className="hero-sub">冻结、加速、调速或单步执行游戏刻，便于调试。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Pause size={15} />
            操作
          </div>
        </div>
        <div className="card-body">
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {ACTIONS.map((action) => (
              <button
                key={action.value}
                type="button"
                className={`btn btn-sm${options.action === action.value ? ' btn-primary' : ''}`}
                onClick={() => state.updateTick({ action: action.value })}
              >
                {action.label}
              </button>
            ))}
          </div>
          {options.action === 'rate' ? (
            <div className="field" style={{ marginTop: 12 }}>
              <label className="field-label" htmlFor="tick-rate">
                每秒游戏刻（1–10000）
              </label>
              <input
                id="tick-rate"
                className="input"
                value={options.rate}
                onChange={(event) => state.updateTick({ rate: event.target.value })}
              />
            </div>
          ) : null}
          {options.action === 'step' ? (
            <div className="field" style={{ marginTop: 12 }}>
              <label className="field-label" htmlFor="tick-step">
                单步刻数（1–10000）
              </label>
              <input
                id="tick-step"
                className="input"
                value={options.time}
                onChange={(event) => state.updateTick({ time: event.target.value })}
              />
            </div>
          ) : null}
          <div className="hint" style={{ marginTop: 10 }}>
            <Play size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            tick 控制只影响当前世界，退出世界后恢复。
          </div>
        </div>
      </div>
    </div>
  )
}
