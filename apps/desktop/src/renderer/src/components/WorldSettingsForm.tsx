import { useEffect } from 'react'
import { MapPin, MapPinned, ToggleLeft } from 'lucide-react'
import type { ForceloadAction } from '@mcstudio/core'
import { hasCommandPath } from '../lib/versionFeatures'
import { PositionInput } from './PositionInput'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const TABS = [
  { id: 'spawnpoint', label: '玩家出生点', icon: MapPin },
  { id: 'setworldspawn', label: '世界出生点', icon: MapPinned },
  { id: 'forceload', label: '强制加载', icon: ToggleLeft }
] as const

const FORCELOAD_ACTIONS: { value: ForceloadAction; label: string }[] = [
  { value: 'add', label: '添加' },
  { value: 'remove', label: '移除' },
  { value: 'remove-all', label: '移除全部' },
  { value: 'query', label: '查询' }
]

export function WorldSettingsForm() {
  const state = useAppStore()
  const active =
    state.activeCommandId === 'setworldspawn' || state.activeCommandId === 'forceload'
      ? state.activeCommandId
      : 'spawnpoint'
  const spawn = state.spawnpoint
  const worldSpawn = state.worldSpawn
  const forceload = state.forceload
  const supportsSpawnAngle =
    hasCommandPath(state.pack, 'spawnpoint', 'targets', 'pos', 'angle') ||
    hasCommandPath(state.pack, 'spawnpoint', 'targets', 'pos', 'rotation')
  const supportsWorldAngle =
    hasCommandPath(state.pack, 'setworldspawn', 'pos', 'angle') ||
    hasCommandPath(state.pack, 'setworldspawn', 'pos', 'rotation')

  useEffect(() => {
    if (!supportsSpawnAngle && spawn.angleEnabled) {
      state.updateSpawnpoint({ angleEnabled: false })
    }
  }, [spawn.angleEnabled, supportsSpawnAngle, state])

  useEffect(() => {
    if (!supportsWorldAngle && worldSpawn.angleEnabled) {
      state.updateWorldSpawn({ angleEnabled: false })
    }
  }, [worldSpawn.angleEnabled, supportsWorldAngle, state])

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 世界 / {active}</div>
          <div className="hero">
            <div className="hero-icon">
              <MapPinned size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                出生点与加载
                <span className="hero-id">spawnpoint · setworldspawn · forceload</span>
              </h1>
              <p className="hero-sub">
                设置玩家或世界出生点，以及强制加载区块，三个命令共用页面。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="world-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              id={`spawn-tab-${tab.id}`}
              type="button"
              className={`world-tab${active === tab.id ? ' active' : ''}`}
              onClick={() => state.selectCommand(tab.id)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {active === 'spawnpoint' ? (
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <MapPin size={15} />
              玩家出生点
            </div>
          </div>
          <div className="card-body">
            <SelectorField
              value={spawn.target}
              label="玩家目标"
              onChange={(target) => state.updateSpawnpoint({ target })}
            />
            <div style={{ marginTop: 12 }}>
              <PositionInput
                label="出生点坐标"
                value={spawn.position}
                onChange={(position) => state.updateSpawnpoint({ position })}
              />
            </div>
            {supportsSpawnAngle ? (
              <>
                <label className="checkline" style={{ marginTop: 12 }}>
                  <input
                    type="checkbox"
                    checked={spawn.angleEnabled}
                    onChange={(event) =>
                      state.updateSpawnpoint({ angleEnabled: event.target.checked })
                    }
                  />
                  指定重生朝向
                </label>
                {spawn.angleEnabled ? (
                  <div className="grid-2" style={{ marginTop: 10 }}>
                    <div className="field">
                      <label className="field-label" htmlFor="spawn-yaw">
                        yaw（水平角度）
                      </label>
                      <input
                        id="spawn-yaw"
                        className="input"
                        value={spawn.yaw}
                        onChange={(event) => state.updateSpawnpoint({ yaw: event.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="spawn-pitch">
                        pitch（俯仰）
                      </label>
                      <input
                        id="spawn-pitch"
                        className="input"
                        value={spawn.pitch}
                        onChange={(event) => state.updateSpawnpoint({ pitch: event.target.value })}
                      />
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {active === 'setworldspawn' ? (
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <MapPinned size={15} />
              世界出生点
            </div>
          </div>
          <div className="card-body">
            <PositionInput
              label="世界出生点坐标"
              value={worldSpawn.position}
              onChange={(position) => state.updateWorldSpawn({ position })}
            />
            {supportsWorldAngle ? (
              <>
                <label className="checkline" style={{ marginTop: 12 }}>
                  <input
                    type="checkbox"
                    checked={worldSpawn.angleEnabled}
                    onChange={(event) =>
                      state.updateWorldSpawn({ angleEnabled: event.target.checked })
                    }
                  />
                  指定出生朝向
                </label>
                {worldSpawn.angleEnabled ? (
                  <div className="grid-2" style={{ marginTop: 10 }}>
                    <div className="field">
                      <label className="field-label" htmlFor="worldspawn-yaw">
                        yaw
                      </label>
                      <input
                        id="worldspawn-yaw"
                        className="input"
                        value={worldSpawn.yaw}
                        onChange={(event) =>
                          state.updateWorldSpawn({ yaw: event.target.value })
                        }
                      />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="worldspawn-pitch">
                        pitch
                      </label>
                      <input
                        id="worldspawn-pitch"
                        className="input"
                        value={worldSpawn.pitch}
                        onChange={(event) =>
                          state.updateWorldSpawn({ pitch: event.target.value })
                        }
                      />
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
            <div className="hint" style={{ marginTop: 8 }}>
              影响所有玩家的初始出生位置；不指定朝向时保持默认。
            </div>
          </div>
        </div>
      ) : null}

      {active === 'forceload' ? (
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <ToggleLeft size={15} />
              强制加载区块
            </div>
          </div>
          <div className="card-body">
            <div className="row" style={{ flexWrap: 'wrap' }}>
              {FORCELOAD_ACTIONS.map((action) => (
                <button
                  key={action.value}
                  type="button"
                  className={`btn btn-sm${forceload.action === action.value ? ' btn-primary' : ''}`}
                  onClick={() => state.updateForceload({ action: action.value })}
                >
                  {action.label}
                </button>
              ))}
            </div>

            {forceload.action !== 'remove-all' ? (
              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="forceload-from-x">
                    起始 X
                  </label>
                  <input
                    id="forceload-from-x"
                    className="input"
                    value={forceload.fromX}
                    onChange={(event) =>
                      state.updateForceload({ fromX: event.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="forceload-from-z">
                    起始 Z
                  </label>
                  <input
                    id="forceload-from-z"
                    className="input"
                    value={forceload.fromZ}
                    onChange={(event) =>
                      state.updateForceload({ fromZ: event.target.value })
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="hint" style={{ marginTop: 12 }}>
                将移除所有强制加载的区块。
              </div>
            )}

            {forceload.action === 'add' || forceload.action === 'remove' ? (
              <>
                <label className="checkline" style={{ marginTop: 12 }}>
                  <input
                    type="checkbox"
                    checked={forceload.toEnabled}
                    onChange={(event) =>
                      state.updateForceload({ toEnabled: event.target.checked })
                    }
                  />
                  指定结束坐标（矩形区域）
                </label>
                {forceload.toEnabled ? (
                  <div className="grid-2" style={{ marginTop: 10 }}>
                    <div className="field">
                      <label className="field-label" htmlFor="forceload-to-x">
                        结束 X
                      </label>
                      <input
                        id="forceload-to-x"
                        className="input"
                        value={forceload.toX}
                        onChange={(event) =>
                          state.updateForceload({ toX: event.target.value })
                        }
                      />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="forceload-to-z">
                        结束 Z
                      </label>
                      <input
                        id="forceload-to-z"
                        className="input"
                        value={forceload.toZ}
                        onChange={(event) =>
                          state.updateForceload({ toZ: event.target.value })
                        }
                      />
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}

            <div className="hint" style={{ marginTop: 8 }}>
              坐标必须是整数区块坐标；加载区域会随世界保存。
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
