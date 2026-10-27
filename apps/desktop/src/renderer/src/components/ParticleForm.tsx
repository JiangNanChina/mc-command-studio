import { useEffect, useMemo, useState } from 'react'
import {
  Eye,
  MapPin,
  Sparkles
} from 'lucide-react'
import {
  defaultRawOptions,
  inferredParticleMode,
  type ParticleOptionMode
} from '@mcstudio/core'
import { COMMAND_MAP } from '@mcstudio/content'
import { mcId, mcName } from '../lib/mcAssets'
import { particleName } from '../lib/particleNames'
import { BlockPickerDialog } from './BlockPickerDialog'
import { ItemPickerDialog } from './ItemPickerDialog'
import { McIcon } from './McIcon'
import { ParticlePickerDialog } from './ParticlePickerDialog'
import { PositionInput } from './PositionInput'
import { SelectorField } from './SelectorField'
import { isLegacyNbtPack } from '../lib/versionFeatures'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('particle')

const OPTION_MODES: { value: ParticleOptionMode; label: string }[] = [
  { value: 'auto', label: '自动（按粒子类型）' },
  { value: 'none', label: '无参数' },
  { value: 'block', label: '方块参数' },
  { value: 'dust', label: '红石尘颜色 + 大小' },
  { value: 'dust_transition', label: '渐变颜色 + 大小' },
  { value: 'item', label: '物品参数' },
  { value: 'color', label: '药水颜色 + 强度' },
  { value: 'rgba', label: 'RGBA 颜色' },
  { value: 'raw', label: '原始 SNBT' }
]

export function ParticleForm() {
  const state = useAppStore()
  const particle = state.particle
  const [pickerOpen, setPickerOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [itemOpen, setItemOpen] = useState(false)
  const legacy = isLegacyNbtPack(state.pack)
  const optionModes = legacy
    ? OPTION_MODES.filter((item) => item.value !== 'raw')
    : OPTION_MODES

  useEffect(() => {
    if (legacy && particle.optionMode === 'raw') {
      state.updateParticle({ optionMode: 'auto' })
    }
  }, [legacy, particle.optionMode, state])

  const ids = useMemo(() => {
    const list = state.pack?.registries.particle_type ?? []
    return list.map((id) => mcId(id))
  }, [state.pack])

  const mode: Exclude<ParticleOptionMode, 'auto'> =
    particle.optionMode === 'auto'
      ? inferredParticleMode(particle.particle)
      : particle.optionMode

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / particle</div>
          <div className="hero">
            <div className="hero-icon">
              <Sparkles size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '粒子效果'}
                <span className="hero-id">particle</span>
              </h1>
              <p className="hero-sub">
                可视化选择粒子类型与参数，设置位置、扩散、速度、数量和可见玩家。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Sparkles size={15} />
            粒子类型
          </div>
          <div className="card-hint">{ids.length} 种粒子</div>
        </div>
        <div className="card-body">
          <div className="item-select">
            <span className="particle-glyph big">
              <Sparkles size={22} />
            </span>
            <div className="item-main">
              <div className="item-name">{particleName(particle.particle)}</div>
              <div className="item-sub">{particle.particle}</div>
            </div>
            <button type="button" className="btn" onClick={() => setPickerOpen(true)}>
              选择粒子
            </button>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label" htmlFor="particle-mode">
              参数类型
            </label>
            <select
              id="particle-mode"
              className="select"
              value={particle.optionMode}
              onChange={(event) =>
                state.updateParticle({
                  optionMode: event.target.value as ParticleOptionMode
                })
              }
            >
              {optionModes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <div className="hint">
              当前使用：{mode === 'none' ? '无参数' : OPTION_MODES.find((item) => item.value === mode)?.label}
              {legacy ? '；1.20.4 使用旧参数语法' : ''}
            </div>
          </div>

          {mode === 'block' ? (
            <div className="item-select" style={{ marginTop: 12 }}>
              <McIcon category="blocks" id={particle.block} size={34} />
              <div className="item-main">
                <div className="item-name">{mcName('blocks', particle.block)}</div>
                <div className="item-sub">{particle.block}</div>
              </div>
              <button type="button" className="btn btn-sm" onClick={() => setBlockOpen(true)}>
                选择方块
              </button>
            </div>
          ) : null}

          {mode === 'dust' || mode === 'dust_transition' ? (
            <div className="grid-2" style={{ marginTop: 12 }}>
              <div className="field">
                <label className="field-label" htmlFor="particle-color">
                  {mode === 'dust' ? '颜色' : '起始颜色'}
                </label>
                <input
                  id="particle-color"
                  type="color"
                  className="color-input"
                  value={mode === 'dust' ? particle.dustColor : particle.fromColor}
                  onChange={(event) =>
                    state.updateParticle(
                      mode === 'dust'
                        ? { dustColor: event.target.value }
                        : { fromColor: event.target.value }
                    )
                  }
                />
              </div>
              {mode === 'dust_transition' ? (
                <div className="field">
                  <label className="field-label" htmlFor="particle-to-color">
                    结束颜色
                  </label>
                  <input
                    id="particle-to-color"
                    type="color"
                    className="color-input"
                    value={particle.toColor}
                    onChange={(event) => state.updateParticle({ toColor: event.target.value })}
                  />
                </div>
              ) : (
                <div className="field">
                  <label className="field-label" htmlFor="particle-scale">
                    大小 scale
                  </label>
                  <input
                    id="particle-scale"
                    className="input"
                    value={particle.scale}
                    onChange={(event) => state.updateParticle({ scale: event.target.value })}
                  />
                </div>
              )}
              {mode === 'dust_transition' ? (
                <div className="field">
                  <label className="field-label" htmlFor="particle-scale">
                    大小 scale
                  </label>
                  <input
                    id="particle-scale"
                    className="input"
                    value={particle.scale}
                    onChange={(event) => state.updateParticle({ scale: event.target.value })}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {mode === 'item' ? (
            <div className="item-select" style={{ marginTop: 12 }}>
              <McIcon category="items" id={particle.item} size={34} />
              <div className="item-main">
                <div className="item-name">{mcName('items', particle.item)}</div>
                <div className="item-sub">{particle.item}</div>
              </div>
              <button type="button" className="btn btn-sm" onClick={() => setItemOpen(true)}>
                选择物品
              </button>
            </div>
          ) : null}

          {mode === 'color' || mode === 'rgba' ? (
            <div className="grid-2" style={{ marginTop: 12 }}>
              <div className="field">
                <label className="field-label" htmlFor="particle-effect-color">
                  颜色
                </label>
                <input
                  id="particle-effect-color"
                  type="color"
                  className="color-input"
                  value={particle.effectColor}
                  onChange={(event) =>
                    state.updateParticle({ effectColor: event.target.value })
                  }
                />
              </div>
              {mode === 'rgba' ? (
                <div className="field">
                  <label className="field-label" htmlFor="particle-alpha">
                    Alpha 0–1
                  </label>
                  <input
                    id="particle-alpha"
                    className="input"
                    value={particle.alpha}
                    onChange={(event) => state.updateParticle({ alpha: event.target.value })}
                  />
                </div>
              ) : (
                <div className="field">
                  <label className="field-label" htmlFor="particle-power">
                    power
                  </label>
                  <input
                    id="particle-power"
                    className="input"
                    value={particle.power}
                    onChange={(event) => state.updateParticle({ power: event.target.value })}
                  />
                </div>
              )}
            </div>
          ) : null}

          {mode === 'raw' ? (
            <div className="field" style={{ marginTop: 12 }}>
              <label className="field-label" htmlFor="particle-raw">
                原始 SNBT 参数
              </label>
              <textarea
                id="particle-raw"
                className="textarea particle-raw"
                value={particle.rawOptions}
                spellCheck={false}
                onChange={(event) => state.updateParticle({ rawOptions: event.target.value })}
              />
              <div className="hint">
                例如 trail：{'{target:[0,0,0],color:16777215,duration:20}'}。会自动拼接在粒子 ID 后面。
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <MapPin size={15} />
            位置与扩散
          </div>
        </div>
        <div className="card-body">
          <PositionInput
            label="粒子位置"
            value={particle.position}
            onChange={(position) => state.updateParticle({ position })}
          />
          <div className="grid-3" style={{ marginTop: 12 }}>
            {(
              [
                ['deltaX', 'ΔX'],
                ['deltaY', 'ΔY'],
                ['deltaZ', 'ΔZ']
              ] as const
            ).map(([key, label]) => (
              <div className="field" key={key}>
                <label className="field-label" htmlFor={`particle-${key}`}>
                  {label}
                </label>
                <input
                  id={`particle-${key}`}
                  className="input"
                  value={particle[key]}
                  onChange={(event) => state.updateParticle({ [key]: event.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="field">
              <label className="field-label" htmlFor="particle-speed">
                速度 speed
              </label>
              <input
                id="particle-speed"
                className="input"
                value={particle.speed}
                onChange={(event) => state.updateParticle({ speed: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="particle-count">
                数量 count
              </label>
              <input
                id="particle-count"
                className="input"
                value={particle.count}
                onChange={(event) => state.updateParticle({ count: event.target.value })}
              />
            </div>
          </div>
          <label className="checkline" style={{ marginTop: 12 }}>
            <input
              type="checkbox"
              checked={particle.force}
              onChange={(event) => state.updateParticle({ force: event.target.checked })}
            />
            force：512 格内可见，且不受“最少粒子”设置影响
          </label>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Eye size={15} />
            可见玩家
          </div>
          <label className="checkline">
            <input
              type="checkbox"
              checked={particle.viewersEnabled}
              onChange={(event) =>
                state.updateParticle({ viewersEnabled: event.target.checked })
              }
            />
            限制玩家
          </label>
        </div>
        {particle.viewersEnabled ? (
          <div className="card-body">
            <SelectorField
              value={particle.viewers}
              label="能看到粒子的玩家"
              onChange={(viewers) => state.updateParticle({ viewers })}
            />
          </div>
        ) : (
          <div className="card-body">
            <div className="hint">不限制时使用 normal/force 的默认可见范围。</div>
          </div>
        )}
      </div>

      {pickerOpen ? (
        <ParticlePickerDialog
          ids={ids}
          current={particle.particle}
          onSelect={(id) =>
            state.updateParticle({
              particle: id,
              optionMode: 'auto',
              rawOptions: defaultRawOptions(id)
            })
          }
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
      {blockOpen ? (
        <BlockPickerDialog
          currentId={particle.block}
          onSelect={(block) => state.updateParticle({ block: block.id })}
          onClose={() => setBlockOpen(false)}
        />
      ) : null}
      {itemOpen ? (
        <ItemPickerDialog
          currentId={particle.item}
          onSelect={(item) => state.updateParticle({ item })}
          onClose={() => setItemOpen(false)}
        />
      ) : null}
    </div>
  )
}
