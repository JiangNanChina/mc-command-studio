import { useMemo } from 'react'
import { Sparkles, Star, Wand2 } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('enchant')

const QUICK_ENCHANTS = [
  'minecraft:sharpness',
  'minecraft:protection',
  'minecraft:unbreaking',
  'minecraft:efficiency',
  'minecraft:fortune',
  'minecraft:mending'
]

export function EnchantForm() {
  const state = useAppStore()
  const enchant = state.enchant
  const enchantments = useMemo(() => {
    const list = state.pack?.registries.enchantment ?? []
    return list.map((id) => (id.includes(':') ? id : `minecraft:${id}`))
  }, [state.pack])

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / enchant</div>
          <div className="hero">
            <div className="hero-icon">
              <Wand2 size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '附魔'}
                <span className="hero-id">enchant</span>
              </h1>
              <p className="hero-sub">
                {meta?.description ?? '给目标主手物品添加附魔，等级 1–255。'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Star size={15} />
            目标
          </div>
          <div className="card-hint">{enchantments.length} 个附魔</div>
        </div>
        <div className="card-body">
          <SelectorField
            value={enchant.target}
            onChange={(target) => state.updateEnchant({ target })}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Sparkles size={15} />
            附魔与等级
          </div>
        </div>
        <div className="card-body">
          <div className="field">
            <label className="field-label" htmlFor="enchant-id">
              附魔 ID
            </label>
            <input
              id="enchant-id"
              className="input"
              list="enchant-options"
              value={enchant.enchantment}
              spellCheck={false}
              onChange={(event) => state.updateEnchant({ enchantment: event.target.value })}
            />
            <datalist id="enchant-options">
              {enchantments.map((id) => (
                <option key={id} value={id} />
              ))}
            </datalist>
            <div className="hint">来自当前 26.3 的 enchantment 注册表；支持手动输入模组 ID。</div>
          </div>

          <div className="row wrap" style={{ marginTop: 10 }}>
            {QUICK_ENCHANTS.map((id) => (
              <button
                key={id}
                type="button"
                className={`chip${enchant.enchantment === id ? ' active' : ''}`}
                onClick={() => state.updateEnchant({ enchantment: id })}
              >
                {id.replace('minecraft:', '')}
              </button>
            ))}
          </div>

          <div className="field" style={{ marginTop: 14, maxWidth: 220 }}>
            <label className="field-label" htmlFor="enchant-level">
              等级
            </label>
            <input
              id="enchant-level"
              className="input"
              value={enchant.level}
              onChange={(event) => state.updateEnchant({ level: event.target.value })}
            />
            <div className="hint">1–255；超过原版上限仍可写入，但客户端可能显示异常。</div>
          </div>
        </div>
      </div>
    </div>
  )
}
