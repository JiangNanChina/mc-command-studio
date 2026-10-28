import { useShallow } from 'zustand/react/shallow'
import { HeartPulse, Swords } from 'lucide-react'
import { type DamageSource } from '@mcstudio/core'
import { COMMAND_MAP } from '@mcstudio/content'
import { PositionInput } from './PositionInput'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('damage')

export function DamageForm() {
  const state = useAppStore(useShallow((state) => ({
    damage: state.damage,
    pack: state.pack,
    updateDamage: state.updateDamage
  })))
  const options = state.damage
  const damageTypes = (state.pack?.registries.damage_type ?? []).map(
    (id) => `minecraft:${id}`
  )

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 实体 / damage</div>
          <div className="hero">
            <div className="hero-icon">
              <HeartPulse size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '造成伤害'}
                <span className="hero-id">damage</span>
              </h1>
              <p className="hero-sub">对单个实体造成指定数值与类型的伤害。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Swords size={15} />
            伤害
          </div>
        </div>
        <div className="card-body">
          <SelectorField
            value={options.target}
            label="目标（单个实体）"
            onChange={(target) => state.updateDamage({ target })}
          />
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="field">
              <label className="field-label" htmlFor="damage-amount">
                伤害值
              </label>
              <input
                id="damage-amount"
                className="input"
                value={options.amount}
                onChange={(event) => state.updateDamage({ amount: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="damage-type">
                伤害类型
              </label>
              <input
                id="damage-type"
                className="input"
                list="damage-type-suggestions"
                value={options.damageType}
                spellCheck={false}
                onChange={(event) =>
                  state.updateDamage({ damageType: event.target.value })
                }
              />
              <datalist id="damage-type-suggestions">
                {damageTypes.map((id) => (
                  <option key={id} value={id} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label" htmlFor="damage-source">
              来源
            </label>
            <select
              id="damage-source"
              className="select"
              value={options.source}
              onChange={(event) =>
                state.updateDamage({ source: event.target.value as DamageSource })
              }
            >
              <option value="none">不指定来源</option>
              <option value="at">指定位置 at</option>
              <option value="by">指定实体 by</option>
            </select>
          </div>
          {options.source === 'at' ? (
            <div style={{ marginTop: 12 }}>
              <PositionInput
                label="伤害来源坐标"
                value={options.position}
                onChange={(position) => state.updateDamage({ position })}
              />
            </div>
          ) : null}
          {options.source === 'by' ? (
            <div style={{ marginTop: 12 }}>
              <SelectorField
                value={options.sourceEntity}
                label="造成伤害的实体"
                onChange={(sourceEntity) => state.updateDamage({ sourceEntity })}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
