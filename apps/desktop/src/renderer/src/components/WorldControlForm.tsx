import { useShallow } from 'zustand/react/shallow'
import { CloudSun, Clock3, Globe2, Shield, Skull } from 'lucide-react'
import {
  DIFFICULTIES,
  TIME_PRESETS,
  WEATHER_TYPES,
  type TimeAction,
  type TimePreset,
  type TimeQuery
} from '@mcstudio/core'
import { useAppStore } from '../store'

const TABS = [
  { id: 'time', label: '时间', icon: Clock3 },
  { id: 'weather', label: '天气', icon: CloudSun },
  { id: 'difficulty', label: '难度', icon: Shield }
] as const

const DIFFICULTY_DESC: Record<string, string> = {
  peaceful: '不生成敌对生物，饥饿与生命自动恢复。',
  easy: '敌对生物较弱，饥饿不会致死。',
  normal: '标准伤害与饥饿机制。',
  hard: '敌对生物更强，饥饿可以致死。'
}

export function WorldControlForm() {
  const state = useAppStore(useShallow((state) => ({
    activeCommandId: state.activeCommandId,
    world: state.world,
    selectCommand: state.selectCommand,
    updateTime: state.updateTime,
    updateWeather: state.updateWeather,
    updateDifficulty: state.updateDifficulty
  })))
  const active =
    state.activeCommandId === 'weather' || state.activeCommandId === 'difficulty'
      ? state.activeCommandId
      : 'time'
  const time = state.world.time
  const weather = state.world.weather
  const difficulty = state.world.difficulty

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 世界 / {active}</div>
          <div className="hero">
            <div className="hero-icon">
              <Globe2 size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                世界控制
                <span className="hero-id">time · weather · difficulty</span>
              </h1>
              <p className="hero-sub">
                一个页面管理世界时间、天气和难度，点击标签切换要生成的命令。
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
              id={`world-tab-${tab.id}`}
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

      {active === 'time' ? (
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <Clock3 size={15} />
              时间
            </div>
            <div className="row">
              {(['set', 'add', 'query'] as TimeAction[]).map((action) => (
                <button
                  key={action}
                  type="button"
                  className={`btn btn-sm${time.action === action ? ' btn-primary' : ''}`}
                  onClick={() => state.updateTime({ action })}
                >
                  {action === 'set' ? '设置' : action === 'add' ? '推进' : '查询'}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body">
            {time.action === 'query' ? (
              <div className="field">
                <label className="field-label" htmlFor="time-query">
                  查询内容
                </label>
                <select
                  id="time-query"
                  className="select"
                  value={time.query}
                  onChange={(event) =>
                    state.updateTime({ query: event.target.value as TimeQuery })
                  }
                >
                  <option value="day">当前天数（day）</option>
                  <option value="daytime">当天时间（daytime）</option>
                  <option value="gametime">世界总时间（gametime）</option>
                </select>
              </div>
            ) : (
              <>
                <div className="field">
                  <span className="field-label">时间点</span>
                  <div className="world-option-grid">
                    {TIME_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        className={`world-option${time.preset === preset.value ? ' active' : ''}`}
                        onClick={() => state.updateTime({ preset: preset.value as TimePreset })}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                {time.preset === 'custom' ? (
                  <div className="field" style={{ marginTop: 12 }}>
                    <label className="field-label" htmlFor="time-custom">
                      自定义 tick
                    </label>
                    <input
                      id="time-custom"
                      className="input"
                      value={time.customTicks}
                      onChange={(event) =>
                        state.updateTime({ customTicks: event.target.value })
                      }
                    />
                    <div className="hint">20 tick = 1 秒；一天 24000 tick。</div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}

      {active === 'weather' ? (
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <CloudSun size={15} />
              天气
            </div>
          </div>
          <div className="card-body">
            <div className="world-option-grid">
              {WEATHER_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`world-option tall${weather.type === type.value ? ' active' : ''}`}
                  onClick={() => state.updateWeather({ type: type.value })}
                >
                  {type.value === 'clear' ? '☀' : type.value === 'rain' ? '🌧' : '⛈'}
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
            <label className="checkline" style={{ marginTop: 14 }}>
              <input
                type="checkbox"
                checked={weather.durationEnabled}
                onChange={(event) =>
                  state.updateWeather({ durationEnabled: event.target.checked })
                }
              />
              指定持续时间
            </label>
            {weather.durationEnabled ? (
              <div className="field" style={{ marginTop: 10 }}>
                <label className="field-label" htmlFor="weather-seconds">
                  持续时间（秒）
                </label>
                <input
                  id="weather-seconds"
                  className="input"
                  value={weather.seconds}
                  onChange={(event) => state.updateWeather({ seconds: event.target.value })}
                />
                <div className="hint">不填持续时间时，天气会持续到下一次切换。</div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {active === 'difficulty' ? (
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <Skull size={15} />
              难度
            </div>
            <div className="card-hint">影响生物伤害、饥饿与生成</div>
          </div>
          <div className="card-body">
            <div className="world-option-grid">
              {DIFFICULTIES.map((level) => (
                <button
                  key={level.value}
                  id={`difficulty-${level.value}`}
                  type="button"
                  className={`world-option tall${difficulty.level === level.value ? ' active' : ''}`}
                  onClick={() => state.updateDifficulty({ level: level.value })}
                >
                  <span>{level.label}</span>
                  <span className="world-option-desc">{DIFFICULTY_DESC[level.value]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
