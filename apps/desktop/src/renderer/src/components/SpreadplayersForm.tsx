import { Shuffle, Users } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('spreadplayers')

export function SpreadplayersForm() {
  const state = useAppStore()
  const options = state.spreadplayers

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 玩家 / spreadplayers</div>
          <div className="hero">
            <div className="hero-icon">
              <Shuffle size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '随机分散'}
                <span className="hero-id">spreadplayers</span>
              </h1>
              <p className="hero-sub">把玩家或实体随机分散到指定中心与范围。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Users size={15} />
            中心与范围
          </div>
        </div>
        <div className="card-body">
          <div className="grid-2">
            <div className="field">
              <label className="field-label" htmlFor="spread-center-x">
                中心 X
              </label>
              <input
                id="spread-center-x"
                className="input"
                value={options.centerX}
                onChange={(event) => state.updateSpreadplayers({ centerX: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="spread-center-z">
                中心 Z
              </label>
              <input
                id="spread-center-z"
                className="input"
                value={options.centerZ}
                onChange={(event) => state.updateSpreadplayers({ centerZ: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="spread-distance">
                分散距离
              </label>
              <input
                id="spread-distance"
                className="input"
                value={options.spreadDistance}
                onChange={(event) =>
                  state.updateSpreadplayers({ spreadDistance: event.target.value })
                }
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="spread-range">
                最大范围
              </label>
              <input
                id="spread-range"
                className="input"
                value={options.maxRange}
                onChange={(event) => state.updateSpreadplayers({ maxRange: event.target.value })}
              />
            </div>
          </div>
          <label className="checkline" style={{ marginTop: 12 }}>
            <input
              type="checkbox"
              checked={options.underEnabled}
              onChange={(event) =>
                state.updateSpreadplayers({ underEnabled: event.target.checked })
              }
            />
            限制最高 Y 坐标（under）
          </label>
          {options.underEnabled ? (
            <div className="field" style={{ marginTop: 10 }}>
              <label className="field-label" htmlFor="spread-height">
                最高 Y
              </label>
              <input
                id="spread-height"
                className="input"
                value={options.maxHeight}
                onChange={(event) =>
                  state.updateSpreadplayers({ maxHeight: event.target.value })
                }
              />
            </div>
          ) : null}
          <label className="checkline" style={{ marginTop: 12 }}>
            <input
              type="checkbox"
              checked={options.respectTeams}
              onChange={(event) =>
                state.updateSpreadplayers({ respectTeams: event.target.checked })
              }
            />
            同队玩家尽量分散在一起
          </label>
          <div style={{ marginTop: 12 }}>
            <SelectorField
              value={options.targets}
              label="目标"
              onChange={(targets) => state.updateSpreadplayers({ targets })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
