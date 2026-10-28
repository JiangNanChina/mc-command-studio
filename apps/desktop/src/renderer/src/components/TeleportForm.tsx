import { useShallow } from 'zustand/react/shallow'
import { Compass, MapPin, Navigation, Users } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import type { TeleportDestination } from '@mcstudio/core'
import { PositionInput } from './PositionInput'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('tp')

export function TeleportForm() {
  const state = useAppStore(useShallow((state) => ({
    teleport: state.teleport,
    updateTeleport: state.updateTeleport
  })))
  const tp = state.teleport
  const positionMode = tp.destination.mode === 'position'

  const setDestination = (mode: 'position' | 'entity'): void => {
    if ((mode === 'position') === positionMode) return
    const destination: TeleportDestination =
      mode === 'position'
        ? {
            mode: 'position',
            position:
              tp.destination.mode === 'position'
                ? tp.destination.position
                : { x: '~', y: '~', z: '~' }
          }
        : {
            mode: 'entity',
            target: tp.destination.mode === 'entity' ? tp.destination.target : { base: '@s' }
          }
    state.updateTeleport({ destination })
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / tp</div>
          <div className="hero">
            <div className="hero-icon">
              <Navigation size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '传送'}
                <span className="hero-id">tp</span>
              </h1>
              <p className="hero-sub">
                {meta?.description ?? '把实体传送到坐标或另一个实体身边，可指定朝向。'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Users size={15} />
            传送谁
          </div>
        </div>
        <div className="card-body">
          <SelectorField
            value={tp.target}
            onChange={(target) => state.updateTeleport({ target })}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <MapPin size={15} />
            传送到哪里
          </div>
          <div className="row">
            <button
              type="button"
              className={`btn btn-sm${positionMode ? ' btn-primary' : ''}`}
              onClick={() => setDestination('position')}
            >
              坐标
            </button>
            <button
              type="button"
              className={`btn btn-sm${!positionMode ? ' btn-primary' : ''}`}
              onClick={() => setDestination('entity')}
            >
              实体
            </button>
          </div>
        </div>
        <div className="card-body">
          {tp.destination.mode === 'position' ? (
            <>
              <PositionInput
                value={tp.destination.position}
                onChange={(position) =>
                  state.updateTeleport({ destination: { mode: 'position', position } })
                }
              />
              <label className="checkline" style={{ marginTop: 12 }}>
                <input
                  type="checkbox"
                  checked={tp.rotate}
                  onChange={(event) => state.updateTeleport({ rotate: event.target.checked })}
                />
                同时设置朝向
              </label>
              {tp.rotate ? (
                <div className="grid-2" style={{ marginTop: 10 }}>
                  <div className="field">
                    <label className="field-label" htmlFor="tp-yaw">
                      偏航 Yaw
                    </label>
                    <input
                      id="tp-yaw"
                      className="input"
                      value={tp.yaw}
                      onChange={(event) => state.updateTeleport({ yaw: event.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="tp-pitch">
                      俯仰 Pitch
                    </label>
                    <input
                      id="tp-pitch"
                      className="input"
                      value={tp.pitch}
                      onChange={(event) => state.updateTeleport({ pitch: event.target.value })}
                    />
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <SelectorField
                value={tp.destination.target}
                label="目标实体"
                onChange={(target) =>
                  state.updateTeleport({ destination: { mode: 'entity', target } })
                }
              />
              <div className="hint" style={{ marginTop: 8 }}>
                传送到实体时不能同时设置朝向；需要朝向请改用坐标模式。
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Compass size={15} />
            语法提示
          </div>
        </div>
        <div className="card-body">
          <div className="hint">
            坐标支持 <code className="code-inline">~</code> 相对坐标和{' '}
            <code className="code-inline">^</code> 局部坐标；朝向为 yaw pitch，例如{' '}
            <code className="code-inline">90 0</code> 表示面向东。
          </div>
        </div>
      </div>
    </div>
  )
}
