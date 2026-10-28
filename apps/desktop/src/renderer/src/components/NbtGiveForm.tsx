import { useShallow } from 'zustand/react/shallow'
import { useState } from 'react'
import { Package, Plus, Sparkles, Trash2, Save, SlidersHorizontal, Pickaxe, FlaskConical } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import { createDefaultNbtGiveOptions, isValidResourceLocation, legacyNbtAttributeId, usesLegacyNbtAttributes } from '@mcstudio/core'
import { ItemPickerDialog } from './ItemPickerDialog'
import { McIcon } from './McIcon'
import { LocalizedIdInput } from './LocalizedIdInput'
import { equipmentSlotLabel, itemFieldOptions, nbtAttributeOptions, withItemFieldValue } from '../lib/itemFieldLabels'
import { SelectorField } from './SelectorField'
import { mcName } from '../lib/mcAssets'
import { CustomPresetBar } from './CustomPresetBar'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('give')

const COMMON_ENCHANTS = [
  'minecraft:sharpness',
  'minecraft:smite',
  'minecraft:unbreaking',
  'minecraft:mending',
  'minecraft:protection',
  'minecraft:fire_aspect',
  'minecraft:looting',
  'minecraft:efficiency'
]

const NBT_PRESETS: { label: string; patch: Partial<ReturnType<typeof createDefaultNbtGiveOptions>> }[] = [
  {
    label: '锋利钻石剑',
    patch: {
      item: 'minecraft:diamond_sword',
      name: '锋利之剑',
      enchantments: [{ id: 'minecraft:sharpness', level: '5' }],
      unbreakable: true
    }
  },
  {
    label: '无限弓',
    patch: {
      item: 'minecraft:bow',
      name: '无限之弓',
      enchantments: [{ id: 'minecraft:infinity', level: '1' }],
      unbreakable: true
    }
  },
  {
    label: '无法破坏鞘翅',
    patch: {
      item: 'minecraft:elytra',
      name: '永久鞘翅',
      unbreakable: true
    }
  },
  {
    label: '命名金苹果',
    patch: {
      item: 'minecraft:golden_apple',
      name: '黄金苹果',
      count: '16'
    }
  }
]

export function NbtGiveForm() {
  const state = useAppStore(useShallow((state) => ({
    nbtGive: state.nbtGive,
    pack: state.pack,
    updateNbtGive: state.updateNbtGive
  })))
  const options = state.nbtGive
  const gameVersion = state.pack?.manifest.gameVersion
  const legacyAttributes = usesLegacyNbtAttributes(gameVersion)
  const validateAttribute = legacyAttributes
    ? (value: string): boolean => legacyNbtAttributeId(value, gameVersion!) !== null
      || (value.includes(':') && isValidResourceLocation(value))
    : undefined
  const defaultAttribute = legacyNbtAttributeId('minecraft:generic.attack_damage', gameVersion ?? '')
    ?? 'minecraft:generic.attack_damage'
  const [itemOpen, setItemOpen] = useState(false)
  const [section, setSection] = useState<'basic' | 'attributes' | 'enchantments' | 'advanced' | 'special'>('basic')
  const enchantIds = (state.pack?.registries.enchantment ?? []).map(
    (id) => id.includes(':') ? id : `minecraft:${id}`
  )
  const suggestions = Array.from(new Set([...enchantIds, ...COMMON_ENCHANTS]))
  const enchantmentOptions = itemFieldOptions('enchantment', suggestions)
  const attributeOptions = nbtAttributeOptions(state.pack?.registries.attribute ?? [], gameVersion)
  const potionOptions = itemFieldOptions('potion', state.pack?.registries.potion ?? [])
  const effectOptions = itemFieldOptions('effect', state.pack?.registries.mob_effect ?? [])
  const entityOptions = itemFieldOptions('entity', state.pack?.registries.entity_type ?? [])
  const applySavedPlan = (value: string): void => {
    try {
      const plan: unknown = JSON.parse(value)
      if (!plan || typeof plan !== 'object' || typeof (plan as { item?: unknown }).item !== 'string') throw new Error()
      state.updateNbtGive(plan as Parameters<typeof state.updateNbtGive>[0])
    } catch {
      window.alert('物品方案格式无效，无法载入')
    }
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 玩家 / give（NBT 模式）</div>
          <div className="hero">
            <div className="hero-icon">
              <Package size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '给予物品'}
                <span className="hero-id">give · NBT</span>
              </h1>
              <p className="hero-sub">
                {state.pack?.manifest.gameVersion ?? '旧版'} NBT 格式：生成带名称、耐久、标签、属性、附魔与特殊数据的物品。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="give-preset-toolbar">
        <div className="card-title"><Save size={15} />物品方案</div>
        <CustomPresetBar storageKey="give:legacy" label="物品方案"
          value={JSON.stringify(options)} onApply={applySavedPlan} />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Package size={15} />
            物品
          </div>
        </div>
        <div className="card-body">
          <SelectorField
            value={options.target}
            label="目标"
            onChange={(target) => state.updateNbtGive({ target })}
          />
          <button
            type="button"
            className="item-select"
            style={{ marginTop: 12 }}
            onClick={() => setItemOpen(true)}
          >
            <McIcon category="items" id={options.item} size={34} />
            <span className="item-main">
              <span className="item-name">{mcName('items', options.item)}</span>
              <span className="item-sub">{options.item}</span>
            </span>
            <span className="btn btn-sm">选择物品</span>
          </button>
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="field">
              <label className="field-label" htmlFor="nbt-give-count">
                数量（1–99）
              </label>
              <input
                id="nbt-give-count"
                className="input"
                value={options.count}
                onChange={(event) => state.updateNbtGive({ count: event.target.value })}
              />
            </div>
            <label className="checkline" style={{ alignSelf: 'end', marginBottom: 6 }}>
              <input
                type="checkbox"
                checked={options.unbreakable}
                onChange={(event) =>
                  state.updateNbtGive({ unbreakable: event.target.checked })
                }
              />
              无法破坏（Unbreakable）
            </label>
          </div>
          <div className="row" style={{ marginTop: 12, flexWrap: 'wrap' }}>
            {NBT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="btn btn-sm"
                onClick={() => state.updateNbtGive(preset.patch)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="give-component-tabs" role="tablist" aria-label="物品设置类别">
        {([
          ['basic', '基础', Package], ['attributes', '属性', SlidersHorizontal],
          ['enchantments', '附魔', Sparkles], ['advanced', '进阶', Pickaxe], ['special', '特殊物品', FlaskConical]
        ] as const).map(([id, label, Icon]) => (
          <button key={id} type="button" role="tab" aria-selected={section === id}
            className={`give-component-tab${section === id ? ' active' : ''}`} onClick={() => setSection(id)}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {section === 'basic' ? <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Sparkles size={15} />
            名称与 Lore
          </div>
        </div>
        <div className="card-body">
          <div className="grid-2">
            <div className="field"><label className="field-label" htmlFor="nbt-give-damage">已损耗耐久</label><input id="nbt-give-damage" className="input" type="number" min={0} value={options.damage ?? ''} placeholder="0" onChange={(event) => state.updateNbtGive({ damage: event.target.value })} /></div>
            <div className="field"><label className="field-label" htmlFor="nbt-give-tags">物品标签</label><textarea id="nbt-give-tags" className="textarea" rows={2} value={(options.tags ?? []).join('\n')} placeholder="每行一个，例如 mcstudio:reward" onChange={(event) => state.updateNbtGive({ tags: event.target.value.split('\n').map((tag) => tag.trim()).filter(Boolean) })} /></div>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="nbt-give-name">
              自定义名称
            </label>
            <input
              id="nbt-give-name"
              className="input"
              value={options.name}
              placeholder="留空则不生成 display.Name"
              onChange={(event) => state.updateNbtGive({ name: event.target.value })}
            />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label" htmlFor="nbt-give-lore">
              Lore（每行一条）
            </label>
            <textarea
              id="nbt-give-lore"
              className="textarea particle-raw"
              value={options.lore}
              placeholder="第一行&#10;第二行"
              onChange={(event) => state.updateNbtGive({ lore: event.target.value })}
            />
          </div>
        </div>
      </div> : null}

      {section === 'enchantments' ? <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Sparkles size={15} />
            附魔
            <span className="badge">{options.enchantments.length}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            disabled={options.enchantments.length >= 16}
            onClick={() =>
              state.updateNbtGive({
                enchantments: [
                  ...options.enchantments,
                  { id: 'minecraft:sharpness', level: '1' }
                ]
              })
            }
          >
            <Plus size={13} />
            添加附魔
          </button>
        </div>
        <div className="card-body">
          {options.enchantments.length === 0 ? (
            <div className="hint">没有附魔；添加后可设置 ID 与等级。</div>
          ) : (
            <div className="loot-entry-list">
              {options.enchantments.map((entry, index) => (
                <div key={index}>
                <div className="loot-entry">
                  <label className="loot-entry-field" style={{ flex: 1, width: 'auto' }}>
                    <span>附魔</span>
                    <LocalizedIdInput
                      id={`nbt-enchant-id-${index}`}
                      label="附魔 ID"
                      options={withItemFieldValue('enchantment', enchantmentOptions, entry.id)}
                      value={entry.id}
                      onChange={(value) =>
                        state.updateNbtGive({
                          enchantments: options.enchantments.map((item, i) =>
                            i === index ? { ...item, id: value } : item
                          )
                        })
                      }
                    />
                  </label>
                  <label className="loot-entry-field">
                    <span>等级</span>
                    <input
                      id={`nbt-enchant-level-${index}`}
                      className="input"
                      value={entry.level}
                      onChange={(event) =>
                        state.updateNbtGive({
                          enchantments: options.enchantments.map((item, i) =>
                            i === index ? { ...item, level: event.target.value } : item
                          )
                        })
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="删除附魔"
                    onClick={() =>
                      state.updateNbtGive({
                        enchantments: options.enchantments.filter((_, i) => i !== index)
                      })
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div> : null}

      {section === 'attributes' ? <div className="card">
        <div className="card-head"><div className="card-title"><SlidersHorizontal size={15} />属性修饰器</div>
          <button type="button" className="btn btn-sm" onClick={() => state.updateNbtGive({ attributes: [...(options.attributes ?? []), { attribute: defaultAttribute, amount: '2', operation: 0, slot: 'mainhand', name: `mcstudio:modifier_${(options.attributes ?? []).length + 1}` }] })}><Plus size={13} />添加属性</button>
        </div>
        <div className="card-body">
          {(options.attributes ?? []).map((entry, index) => <div className="attribute-entry" key={index}>
            <div className="grid-2">
              <label className="field"><span className="field-label">属性</span><LocalizedIdInput id={`nbt-attribute-type-${index}`} label="属性 ID" options={withItemFieldValue('attribute', attributeOptions, entry.attribute)} describedBy="nbt-attribute-modifier-help" value={entry.attribute} validateCustomValue={validateAttribute} placeholder="选择或搜索属性" onChange={(value) => state.updateNbtGive({ attributes: (options.attributes ?? []).map((item, i) => i === index ? { ...item, attribute: value } : item) })} /></label>
              <label className="field"><span className="field-label">修饰器名称</span><input id={`nbt-attribute-modifier-name-${index}`} className="input" aria-label="修饰器名称" aria-describedby="nbt-attribute-modifier-help" value={entry.name} onChange={(event) => state.updateNbtGive({ attributes: (options.attributes ?? []).map((item, i) => i === index ? { ...item, name: event.target.value } : item) })} /></label>
              <label className="field"><span className="field-label">数值</span><input className="input" type="number" step="any" value={entry.amount} onChange={(event) => state.updateNbtGive({ attributes: (options.attributes ?? []).map((item, i) => i === index ? { ...item, amount: event.target.value } : item) })} /></label>
              <label className="field"><span className="field-label">运算</span><select className="select" value={entry.operation} onChange={(event) => state.updateNbtGive({ attributes: (options.attributes ?? []).map((item, i) => i === index ? { ...item, operation: Number(event.target.value) as 0 | 1 | 2 } : item) })}><option value={0}>加法</option><option value={1}>基础值乘法</option><option value={2}>总值乘法</option></select></label>
              <label className="field"><span className="field-label">装备槽位</span><select id={`nbt-attribute-slot-${index}`} className="select" aria-label="装备槽位" value={entry.slot} onChange={(event) => state.updateNbtGive({ attributes: (options.attributes ?? []).map((item, i) => i === index ? { ...item, slot: event.target.value } : item) })}>{['mainhand', 'offhand', 'head', 'chest', 'legs', 'feet'].map((slot) => <option key={slot} value={slot}>{equipmentSlotLabel(slot)}</option>)}</select></label>
            </div>
            <button type="button" className="btn btn-sm btn-ghost" style={{ marginTop: 6 }} onClick={() => state.updateNbtGive({ attributes: (options.attributes ?? []).filter((_, i) => i !== index) })}><Trash2 size={13} />移除</button>
          </div>)}
          {(options.attributes ?? []).length === 0 ? <div className="hint">设置攻击力、护甲、移动速度等物品属性。</div> : null}
          <div id="nbt-attribute-modifier-help" className="hint" style={{ marginTop: 8 }}>属性 ID 决定修改攻击伤害、护甲等哪项属性。修饰器名称用于区分条目，可填“攻击加成”等文字；旧版实际唯一标识 UUID 由程序根据属性、名称和条目顺序生成。建议为各条目使用便于辨认的名称，名称相同也不代表 UUID 相同。</div>
        </div>
      </div> : null}

      {section === 'advanced' ? <div className="card">
        <div className="card-head"><div className="card-title"><Pickaxe size={15} />冒险模式限制</div></div>
        <div className="card-body">
          <div className="grid-2">
            <label className="field"><span className="field-label">可破坏方块（每行一个）</span><textarea className="textarea" rows={4} value={(options.canDestroy ?? []).join('\n')} placeholder={'minecraft:stone\n#minecraft:logs'} onChange={(event) => state.updateNbtGive({ canDestroy: event.target.value.split('\n').map((id) => id.trim()).filter(Boolean) })} /></label>
            <label className="field"><span className="field-label">可放置方块（每行一个）</span><textarea className="textarea" rows={4} value={(options.canPlaceOn ?? []).join('\n')} placeholder={'minecraft:dirt\nminecraft:grass_block'} onChange={(event) => state.updateNbtGive({ canPlaceOn: event.target.value.split('\n').map((id) => id.trim()).filter(Boolean) })} /></label>
          </div>
          <div className="hint">适用于冒险模式物品；可填写方块 ID 或 #方块标签。</div>
        </div>
      </div> : null}

      {section === 'special' ? <div className="card">
        <div className="card-head"><div className="card-title"><FlaskConical size={15} />药水</div></div>
        <div className="card-body">
          <div className="grid-2">
            <label className="field"><span className="field-label">药水</span><LocalizedIdInput id="nbt-potion-id" label="药水 ID" options={withItemFieldValue('potion', potionOptions, options.potion ?? '')} value={options.potion ?? ''} placeholder="选择或搜索药水" onChange={(value) => state.updateNbtGive({ potion: value })} /></label>
            <label className="field"><span className="field-label">自定义颜色（#RRGGBB）</span><input className="input" type="color" value={/^#[0-9a-fA-F]{6}$/.test(options.potionColor ?? '') ? options.potionColor! : '#ffffff'} onChange={(event) => state.updateNbtGive({ potionColor: event.target.value })} /></label>
          </div>
          <div className="field-label" style={{ marginTop: 12 }}>自定义状态效果</div>
          {(options.potionEffects ?? []).map((effect, index) => <div className="potion-effect-row" key={index}><div className="grid-3">
            <label className="field"><span className="field-label">效果</span><LocalizedIdInput id={`nbt-potion-effect-id-${index}`} label="状态效果 ID" options={withItemFieldValue('effect', effectOptions, effect.id)} value={effect.id} placeholder="选择或搜索状态效果" onChange={(value) => state.updateNbtGive({ potionEffects: (options.potionEffects ?? []).map((item, i) => i === index ? { ...item, id: value } : item) })} /></label>
            <label className="field"><span className="field-label">时长（tick）</span><input className="input" type="number" min={1} value={effect.duration} onChange={(event) => state.updateNbtGive({ potionEffects: (options.potionEffects ?? []).map((item, i) => i === index ? { ...item, duration: event.target.value } : item) })} /></label>
            <label className="field"><span className="field-label">等级（0 起）</span><input className="input" type="number" min={0} max={255} value={effect.amplifier} onChange={(event) => state.updateNbtGive({ potionEffects: (options.potionEffects ?? []).map((item, i) => i === index ? { ...item, amplifier: event.target.value } : item) })} /></label>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => state.updateNbtGive({ potionEffects: (options.potionEffects ?? []).filter((_, i) => i !== index) })}><Trash2 size={13} />移除效果</button>
          </div></div>)}
          <button type="button" className="add-row" onClick={() => state.updateNbtGive({ potionEffects: [...(options.potionEffects ?? []), { id: 'minecraft:speed', duration: '200', amplifier: '0' }] })}><Plus size={13} />添加效果</button>
        </div>
        <div className="card-head"><div className="card-title"><Package size={15} />刷怪笼 / 刷怪蛋</div></div>
        <div className="card-body">
          <div className="grid-2">
            <label className="field"><span className="field-label">生成实体</span><LocalizedIdInput id="nbt-spawner-entity" label="生成实体 ID" options={withItemFieldValue('entity', entityOptions, options.spawnerEntity ?? '')} value={options.spawnerEntity ?? ''} placeholder="选择或搜索实体" onChange={(value) => state.updateNbtGive({ spawnerEntity: value })} /></label>
            {([
              ['spawnerDelay', '当前延迟（tick）'], ['spawnerMinSpawnDelay', '最短间隔（tick）'], ['spawnerMaxSpawnDelay', '最长间隔（tick）'], ['spawnerSpawnCount', '每次数量（个）'], ['spawnerMaxNearbyEntities', '附近实体上限（个）'], ['spawnerRequiredPlayerRange', '玩家激活距离（格）'], ['spawnerSpawnRange', '生成范围（格）']
            ] as const).map(([key, label]) => <label className="field" key={key}><span className="field-label">{label}</span><input className="input" type="number" min={key === 'spawnerDelay' ? -1 : 0} value={options[key] ?? ''} onChange={(event) => state.updateNbtGive({ [key]: event.target.value })} /></label>)}
          </div>
          <div className="hint" style={{ marginTop: 8 }}>当前延迟为 -1 时由游戏重新计算；目标版本会自动选择对应的刷怪笼实体数据格式。</div>
        </div>
      </div> : null}

      {itemOpen ? (
        <ItemPickerDialog
          currentId={options.item}
          onSelect={(item) => state.updateNbtGive({ item })}
          onClose={() => setItemOpen(false)}
        />
      ) : null}
    </div>
  )
}
