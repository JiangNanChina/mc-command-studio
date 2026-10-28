import { useShallow } from 'zustand/react/shallow'
import { Compass, RotateCw } from 'lucide-react'
import { type FacingAnchor, type RotateMode } from '@mcstudio/core'
import { COMMAND_MAP } from '@mcstudio/content'
import { PositionInput } from './PositionInput'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('rotate')

export function RotateForm() {
  const state = useAppStore(useShallow((state) => ({
    rotate: state.rotate,
    updateRotate: state.updateRotate
  })))
  const options = state.rotate

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 实体 / rotate</div>
          <div className="hero">
            <div className="hero-icon">
              <RotateCw size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '旋转实体'}
                <span className="hero-id">rotate</span>
              </h1>
              <p className="hero-sub">设置实体的偏航/俯仰，或让它朝向坐标、实体。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Compass size={15} />
            目标与方式
          </div>
        </div>
        <div className="card-body">
          <SelectorField
            value={options.target}
            label="目标（单个实体）"
            onChange={(target) => state.updateRotate({ target })}
          />
          <div className="row" style={{ flexWrap: 'wrap', marginTop: 12 }}>
            {(
              [
                ['rotation', '偏航/俯仰'],
                ['facingLocation', '朝向坐标'],
                ['facingEntity', '朝向实体']
              ] as [RotateMode, string][]
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                className={`btn btn-sm${options.mode === mode ? ' btn-primary' : ''}`}
                onClick={() => state.updateRotate({ mode })}
              >
                {label}
              </button>
            ))}
          </div>

          {options.mode === 'rotation' ? (
            <div className="grid-2" style={{ marginTop: 12 }}>
              <div className="field">
                <label className="field-label" htmlFor="rotate-yaw">
                  偏航角 yaw
                </label>
                <input
                  id="rotate-yaw"
                  className="input"
                  value={options.yaw}
                  onChange={(event) => state.updateRotate({ yaw: event.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="rotate-pitch">
                  俯仰角 pitch
                </label>
                <input
                  id="rotate-pitch"
                  className="input"
                  value={options.pitch}
                  onChange={(event) => state.updateRotate({ pitch: event.target.value })}
                />
              </div>
            </div>
          ) : null}

          {options.mode === 'facingLocation' ? (
            <div style={{ marginTop: 12 }}>
              <PositionInput
                label="朝向坐标"
                value={options.position}
                onChange={(position) => state.updateRotate({ position })}
              />
            </div>
          ) : null}

          {options.mode === 'facingEntity' ? (
            <>
              <div style={{ marginTop: 12 }}>
                <SelectorField
                  value={options.facingTarget}
                  label="朝向实体"
                  onChange={(facingTarget) => state.updateRotate({ facingTarget })}
                />
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="rotate-anchor">
                  朝向锚点
                </label>
                <select
                  id="rotate-anchor"
                  className="select"
                  value={options.anchor}
                  onChange={(event) =>
                    state.updateRotate({ anchor: event.target.value as FacingAnchor })
                  }
                >
                  <option value="eyes">眼睛 eyes</option>
                  <option value="feet">脚部 feet</option>
                </select>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
