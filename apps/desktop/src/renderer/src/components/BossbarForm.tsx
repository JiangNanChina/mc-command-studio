import { useShallow } from 'zustand/react/shallow'
import { Gauge, Monitor, Plus, Trash2, Users } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import {
  BOSSBAR_COLORS,
  BOSSBAR_STYLES,
  type BossbarColor,
  type BossbarField,
  type BossbarStyle
} from '@mcstudio/core'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('bossbar')

export function BossbarForm() {
  const state = useAppStore(useShallow((state) => ({
    bossbar: state.bossbar,
    updateBossbar: state.updateBossbar
  })))
  const bossbar = state.bossbar
  const max = Math.max(1, Number(bossbar.max) || 1)
  const value = Math.max(0, Math.min(max, Number(bossbar.value) || 0))
  const color = BOSSBAR_COLORS.find((item) => item.value === bossbar.color) ?? BOSSBAR_COLORS[4]
  const style = BOSSBAR_STYLES.find((item) => item.value === bossbar.style) ?? BOSSBAR_STYLES[0]

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / bossbar</div>
          <div className="hero">
            <div className="hero-icon">
              <Gauge size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? 'BOSS 栏'}
                <span className="hero-id">bossbar</span>
              </h1>
              <p className="hero-sub">
                可视化创建或更新 BOSS 栏：颜色、样式、最大值、当前值、可见性和玩家列表。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Monitor size={15} />
            操作
          </div>
          <div className="row">
            <button
              type="button"
              className={`btn btn-sm${bossbar.action === 'create' ? ' btn-primary' : ''}`}
              onClick={() => state.updateBossbar({ action: 'create' })}
            >
              <Plus size={13} />
              创建并配置
            </button>
            <button
              type="button"
              className={`btn btn-sm${bossbar.action === 'update' ? ' btn-primary' : ''}`}
              onClick={() => state.updateBossbar({ action: 'update' })}
            >
              更新现有
            </button>
            <button
              type="button"
              className={`btn btn-sm${bossbar.action === 'remove' ? ' btn-primary' : ''}`}
              onClick={() => state.updateBossbar({ action: 'remove' })}
            >
              <Trash2 size={13} />
              移除
            </button>
            <button
              type="button"
              className={`btn btn-sm${bossbar.action === 'get' ? ' btn-primary' : ''}`}
              onClick={() => state.updateBossbar({ action: 'get' })}
            >
              查询字段
            </button>
            <button
              type="button"
              className={`btn btn-sm${bossbar.action === 'list' ? ' btn-primary' : ''}`}
              onClick={() => state.updateBossbar({ action: 'list' })}
            >
              列出全部
            </button>
          </div>
        </div>
        <div className="card-body">
          {bossbar.action === 'list' ? (
            <div className="hint">列出当前世界中所有已加载的 BOSS 栏 ID。</div>
          ) : (
            <div className="field">
              <label className="field-label" htmlFor="bossbar-id">
                BOSS 栏 ID
              </label>
              <input
                id="bossbar-id"
                className="input"
                value={bossbar.id}
                spellCheck={false}
                placeholder="mcstudio:boss"
                onChange={(event) => state.updateBossbar({ id: event.target.value })}
              />
              <div className="hint">
                格式 namespace:path；创建要求 ID 尚不存在，查询/更新要求已存在。
              </div>
            </div>
          )}
        </div>
      </div>

      {bossbar.action === 'get' ? (
        <div className="card">
          <div className="card-head">
            <div className="card-title">查询字段</div>
          </div>
          <div className="card-body">
            <div className="field">
              <label className="field-label" htmlFor="bossbar-field">
                字段
              </label>
              <select
                id="bossbar-field"
                className="select"
                value={bossbar.field}
                onChange={(event) =>
                  state.updateBossbar({ field: event.target.value as BossbarField })
                }
              >
                <option value="max">最大值 max</option>
                <option value="value">当前值 value</option>
                <option value="visible">可见性 visible</option>
                <option value="players">玩家列表 players</option>
              </select>
            </div>
          </div>
        </div>
      ) : null}

      {bossbar.action === 'create' || bossbar.action === 'update' ? (
        <>
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Gauge size={15} />
                外观
              </div>
            </div>
            <div className="card-body">
              <div className="field">
                <label className="field-label" htmlFor="bossbar-name">
                  显示名称
                </label>
                <input
                  id="bossbar-name"
                  className="input"
                  value={bossbar.name}
                  onChange={(event) => state.updateBossbar({ name: event.target.value })}
                />
              </div>
              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="bossbar-color">
                    颜色
                  </label>
                  <select
                    id="bossbar-color"
                    className="select"
                    value={bossbar.color}
                    onChange={(event) =>
                      state.updateBossbar({ color: event.target.value as BossbarColor })
                    }
                  >
                    {BOSSBAR_COLORS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="bossbar-style">
                    样式
                  </label>
                  <select
                    id="bossbar-style"
                    className="select"
                    value={bossbar.style}
                    onChange={(event) =>
                      state.updateBossbar({ style: event.target.value as BossbarStyle })
                    }
                  >
                    {BOSSBAR_STYLES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="bossbar-max">
                    最大值
                  </label>
                  <input
                    id="bossbar-max"
                    className="input"
                    value={bossbar.max}
                    onChange={(event) => state.updateBossbar({ max: event.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="bossbar-value">
                    当前值
                  </label>
                  <input
                    id="bossbar-value"
                    className="input"
                    value={bossbar.value}
                    onChange={(event) => state.updateBossbar({ value: event.target.value })}
                  />
                </div>
              </div>

              <label className="checkline" style={{ marginTop: 12 }}>
                <input
                  type="checkbox"
                  checked={bossbar.visible}
                  onChange={(event) => state.updateBossbar({ visible: event.target.checked })}
                />
                对玩家可见
              </label>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Users size={15} />
                玩家列表
              </div>
              <label className="checkline">
                <input
                  type="checkbox"
                  checked={bossbar.playersEnabled}
                  onChange={(event) =>
                    state.updateBossbar({ playersEnabled: event.target.checked })
                  }
                />
                限制玩家
              </label>
            </div>
            {bossbar.playersEnabled ? (
              <div className="card-body">
                <SelectorField
                  value={bossbar.players}
                  label="看到 BOSS 栏的玩家"
                  onChange={(players) => state.updateBossbar({ players })}
                />
              </div>
            ) : (
              <div className="card-body">
                <div className="hint">不限制时会自动对所有玩家显示。</div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">预览</div>
              <div className="card-hint">
                {value} / {max} · {style.label}
              </div>
            </div>
            <div className="card-body">
              <div className="bossbar-name">{bossbar.name || 'BOSS'}</div>
              <div className="bossbar-track">
                <div
                  className={`bossbar-fill${style.notches > 0 ? ' notched' : ''}`}
                  style={{
                    width: `${(value / max) * 100}%`,
                    background: color.hex,
                    ['--segments' as string]: style.notches || 1
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ) : bossbar.action === 'remove' ? (
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <Trash2 size={15} />
              移除确认
            </div>
          </div>
          <div className="card-body">
            <div className="hint">
              将生成 <code className="code-inline">bossbar remove {bossbar.id}</code>
              ，不影响其他 BOSS 栏。
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
