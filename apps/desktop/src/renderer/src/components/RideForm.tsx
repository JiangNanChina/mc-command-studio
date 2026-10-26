import { ArrowUpFromLine, CircleDot } from 'lucide-react'
import { type RideAction } from '@mcstudio/core'
import { COMMAND_MAP } from '@mcstudio/content'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('ride')

export function RideForm() {
  const state = useAppStore()
  const options = state.ride

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 实体 / ride</div>
          <div className="hero">
            <div className="hero-icon">
              <CircleDot size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '骑乘'}
                <span className="hero-id">ride</span>
              </h1>
              <p className="hero-sub">让实体骑上另一个实体，或强制下坐骑。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <ArrowUpFromLine size={15} />
            骑乘操作
          </div>
        </div>
        <div className="card-body">
          <SelectorField
            value={options.target}
            label="骑乘者（单个实体）"
            onChange={(target) => state.updateRide({ target })}
          />
          <div className="row" style={{ marginTop: 12 }}>
            {(['mount', 'dismount'] as RideAction[]).map((action) => (
              <button
                key={action}
                type="button"
                className={`btn${options.action === action ? ' btn-primary' : ''}`}
                onClick={() => state.updateRide({ action })}
              >
                {action === 'mount' ? '骑上坐骑' : '下坐骑'}
              </button>
            ))}
          </div>
          {options.action === 'mount' ? (
            <div style={{ marginTop: 12 }}>
              <SelectorField
                value={options.vehicle}
                label="坐骑（单个实体）"
                onChange={(vehicle) => state.updateRide({ vehicle })}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
