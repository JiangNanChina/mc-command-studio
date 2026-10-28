import { useShallow } from 'zustand/react/shallow'
import { useMemo, useState } from 'react'
import { Sparkles, Star, Wand2 } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import { mcId, mcName } from '../lib/mcAssets'
import { McIcon } from './McIcon'
import { RegistryPickerDialog } from './RegistryPickerDialog'
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
  const state = useAppStore(useShallow((state) => ({
    enchant: state.enchant,
    pack: state.pack,
    updateEnchant: state.updateEnchant
  })))
  const enchant = state.enchant
  const [pickerOpen, setPickerOpen] = useState(false)
  const enchantments = useMemo(() => {
    const list = state.pack?.registries.enchantment ?? []
    return list.map((id) => mcId(id))
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
          <div className="item-select">
            <McIcon category="enchantments" id={enchant.enchantment} size={38} />
            <div className="item-main">
              <div className="item-name">{mcName('enchantments', enchant.enchantment)}</div>
              <div className="item-sub">{enchant.enchantment}</div>
            </div>
            <button type="button" className="btn" onClick={() => setPickerOpen(true)}>
              选择附魔
            </button>
          </div>

          <div className="row wrap" style={{ marginTop: 10 }}>
            {QUICK_ENCHANTS.map((id) => (
              <button
                key={id}
                type="button"
                className={`chip${enchant.enchantment === id ? ' active' : ''}`}
                onClick={() => state.updateEnchant({ enchantment: id })}
              >
                <McIcon category="enchantments" id={id} size={16} />
                {mcName('enchantments', id)}
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

      {pickerOpen ? (
        <RegistryPickerDialog
          title="选择附魔"
          category="enchantments"
          ids={enchantments}
          current={enchant.enchantment}
          onSelect={(id) => state.updateEnchant({ enchantment: id })}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  )
}
