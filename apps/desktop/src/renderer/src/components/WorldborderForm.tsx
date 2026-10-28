import { useShallow } from 'zustand/react/shallow'
import { Scan, SquareDashed } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import {
  WORLDBORDER_ACTIONS,
  type WorldborderAction
} from '@mcstudio/core'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('worldborder')

export function WorldborderForm() {
  const state = useAppStore(useShallow((state) => ({
    worldborder: state.worldborder,
    updateWorldborder: state.updateWorldborder
  })))
  const worldborder = state.worldborder
  const action = worldborder.action
  const isSize = action === 'set' || action === 'add'
  const isDamage = action === 'damage-amount' || action === 'damage-buffer'
  const isWarning = action === 'warning-distance' || action === 'warning-time'

  const setAction = (next: WorldborderAction): void => {
    const defaults: Partial<typeof worldborder> =
      next === 'damage-amount'
        ? { value: '0.2' }
        : next === 'damage-buffer'
          ? { value: '5' }
          : next === 'warning-distance'
            ? { value: '5' }
            : next === 'warning-time'
              ? { value: '15s' }
              : {}
    state.updateWorldborder({ action: next, ...defaults })
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 世界 / worldborder</div>
          <div className="hero">
            <div className="hero-icon">
              <Scan size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '世界边界'}
                <span className="hero-id">worldborder</span>
              </h1>
              <p className="hero-sub">
                设置边界尺寸、中心、伤害和警告，或查询当前边界大小。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <SquareDashed size={15} />
            操作
          </div>
          <div className="card-hint">{WORLDBORDER_ACTIONS.find((item) => item.value === action)?.label}</div>
        </div>
        <div className="card-body">
          <div className="worldborder-actions">
            {WORLDBORDER_ACTIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`btn btn-sm${action === item.value ? ' btn-primary' : ''}`}
                onClick={() => setAction(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {isSize ? (
            <div className="grid-2" style={{ marginTop: 12 }}>
              <div className="field">
                <label className="field-label" htmlFor="worldborder-distance">
                  边界尺寸（格）
                </label>
                <input
                  id="worldborder-distance"
                  className="input"
                  value={worldborder.distance}
                  onChange={(event) =>
                    state.updateWorldborder({ distance: event.target.value })
                  }
                />
                <div className="hint">范围 -59,999,968 – 59,999,968；正数扩展，负数收缩。</div>
              </div>
              <div className="field">
                <label className="checkline">
                  <input
                    type="checkbox"
                    checked={worldborder.timeEnabled}
                    onChange={(event) =>
                      state.updateWorldborder({ timeEnabled: event.target.checked })
                    }
                  />
                  指定过渡时间
                </label>
                {worldborder.timeEnabled ? (
                  <input
                    id="worldborder-time"
                    className="input"
                    style={{ marginTop: 8 }}
                    value={worldborder.time}
                    onChange={(event) =>
                      state.updateWorldborder({ time: event.target.value })
                    }
                  />
                ) : null}
              </div>
            </div>
          ) : null}

          {action === 'center' ? (
            <div className="grid-2" style={{ marginTop: 12 }}>
              <div className="field">
                <label className="field-label" htmlFor="worldborder-x">
                  中心 X
                </label>
                <input
                  id="worldborder-x"
                  className="input"
                  value={worldborder.x}
                  onChange={(event) => state.updateWorldborder({ x: event.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="worldborder-z">
                  中心 Z
                </label>
                <input
                  id="worldborder-z"
                  className="input"
                  value={worldborder.z}
                  onChange={(event) => state.updateWorldborder({ z: event.target.value })}
                />
              </div>
            </div>
          ) : null}

          {isDamage ? (
            <div className="field" style={{ marginTop: 12 }}>
              <label className="field-label" htmlFor="worldborder-value">
                {action === 'damage-amount' ? '每格伤害' : '伤害缓冲距离（格）'}
              </label>
              <input
                id="worldborder-value"
                className="input"
                value={worldborder.value}
                onChange={(event) => state.updateWorldborder({ value: event.target.value })}
              />
              <div className="hint">
                {action === 'damage-amount'
                  ? '边界外每格造成的伤害，0 表示关闭。'
                  : '边界外的安全缓冲距离，超过后才开始受伤。'}
              </div>
            </div>
          ) : null}

          {isWarning ? (
            <div className="field" style={{ marginTop: 12 }}>
              <label className="field-label" htmlFor="worldborder-value">
                {action === 'warning-distance' ? '警告距离（格）' : '警告时间（如 15s）'}
              </label>
              <input
                id="worldborder-value"
                className="input"
                value={worldborder.value}
                onChange={(event) => state.updateWorldborder({ value: event.target.value })}
              />
              <div className="hint">
                {action === 'warning-distance'
                  ? '玩家距离边界多近时显示红色警告。'
                  : '边界收缩到玩家身边前多久开始警告，支持 10、10s、10t、10d。'}
              </div>
            </div>
          ) : null}

          {action === 'get' ? (
            <div className="hint" style={{ marginTop: 12 }}>
              查询当前世界边界的直径；不会修改边界。
            </div>
          ) : null}

          <div className="worldborder-preview" style={{ marginTop: 14 }}>
            <div className="worldborder-box">
              <span className="worldborder-dot" />
              <span className="worldborder-label">
                {action === 'get' ? '世界边界' : `${worldborder.distance} 格`}
              </span>
            </div>
            <div className="hint">
              中心 {worldborder.x}, {worldborder.z}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
