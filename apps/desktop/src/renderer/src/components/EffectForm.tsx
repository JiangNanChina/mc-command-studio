import { useMemo } from 'react'
import { Clock, FlaskConical, Sparkles, Users } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('effect')

const QUICK_EFFECTS = [
  'minecraft:speed',
  'minecraft:slowness',
  'minecraft:strength',
  'minecraft:regeneration',
  'minecraft:night_vision'
]

export function EffectForm() {
  const state = useAppStore()
  const effect = state.effect
  const effects = useMemo(() => {
    const list = state.pack?.registries.mob_effect ?? []
    return list.map((id) => (id.includes(':') ? id : `minecraft:${id}`))
  }, [state.pack])

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / effect</div>
          <div className="hero">
            <div className="hero-icon">
              <FlaskConical size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '状态效果'}
                <span className="hero-id">effect</span>
              </h1>
              <p className="hero-sub">
                {meta?.description ?? '给予或移除状态效果，可控制时长、等级与粒子。'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Users size={15} />
            目标
          </div>
          <div className="row">
            <button
              type="button"
              className={`btn btn-sm${effect.action === 'give' ? ' btn-primary' : ''}`}
              onClick={() => state.updateEffect({ action: 'give' })}
            >
              给予
            </button>
            <button
              type="button"
              className={`btn btn-sm${effect.action === 'clear' ? ' btn-primary' : ''}`}
              onClick={() => state.updateEffect({ action: 'clear' })}
            >
              移除
            </button>
          </div>
        </div>
        <div className="card-body">
          <SelectorField
            value={effect.target}
            onChange={(target) => state.updateEffect({ target })}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Sparkles size={15} />
            状态效果
          </div>
          <div className="card-hint">{effects.length} 个效果</div>
        </div>
        <div className="card-body">
          <div className="field">
            <label className="field-label" htmlFor="effect-id">
              效果 ID
            </label>
            <input
              id="effect-id"
              className="input"
              list="effect-options"
              value={effect.effect}
              spellCheck={false}
              placeholder={effect.action === 'clear' ? '留空移除全部效果' : 'minecraft:speed'}
              onChange={(event) => state.updateEffect({ effect: event.target.value })}
            />
            <datalist id="effect-options">
              {effects.map((id) => (
                <option key={id} value={id} />
              ))}
            </datalist>
            <div className="hint">
              {effect.action === 'clear'
                ? '留空时移除目标身上的全部效果。'
                : '来自当前 26.3 的 mob_effect 注册表。'}
            </div>
          </div>
          <div className="row wrap" style={{ marginTop: 10 }}>
            {QUICK_EFFECTS.map((id) => (
              <button
                key={id}
                type="button"
                className={`chip${effect.effect === id ? ' active' : ''}`}
                onClick={() => state.updateEffect({ effect: id })}
              >
                {id.replace('minecraft:', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {effect.action === 'give' ? (
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <Clock size={15} />
              时长与等级
            </div>
          </div>
          <div className="card-body">
            <div className="grid-2">
              <div className="field">
                <label className="field-label" htmlFor="effect-duration">
                  持续秒数
                </label>
                <input
                  id="effect-duration"
                  className="input"
                  value={effect.duration}
                  onChange={(event) => state.updateEffect({ duration: event.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="effect-amplifier">
                  等级（0 = I）
                </label>
                <input
                  id="effect-amplifier"
                  className="input"
                  value={effect.amplifier}
                  onChange={(event) => state.updateEffect({ amplifier: event.target.value })}
                />
              </div>
            </div>
            <label className="checkline" style={{ marginTop: 12 }}>
              <input
                type="checkbox"
                checked={effect.hideParticles}
                onChange={(event) => state.updateEffect({ hideParticles: event.target.checked })}
              />
              隐藏粒子
            </label>
            <div className="hint" style={{ marginTop: 8 }}>
              等级 0 对应游戏内的 I 级，等级 1 对应 II 级。
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <FlaskConical size={15} />
              移除模式
            </div>
          </div>
          <div className="card-body">
            <div className="hint">
              指定效果 ID 只移除该效果；留空则移除目标身上的全部状态效果。
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
