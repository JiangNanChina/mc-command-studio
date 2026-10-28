import { useShallow } from 'zustand/react/shallow'
import { useState } from 'react'
import { Package, Plus, Sparkles, Trash2 } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import { createDefaultNbtGiveOptions } from '@mcstudio/core'
import { ItemPickerDialog } from './ItemPickerDialog'
import { McIcon } from './McIcon'
import { SelectorField } from './SelectorField'
import { mcName } from '../lib/mcAssets'
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
  const [itemOpen, setItemOpen] = useState(false)
  const enchantIds = (state.pack?.registries.enchantment ?? []).map(
    (id) => `minecraft:${id}`
  )
  const suggestions = Array.from(new Set([...enchantIds, ...COMMON_ENCHANTS]))

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
                1.20.4 NBT 引擎：生成 display、Lore、Enchantments、Unbreakable 等旧版 NBT 物品。
              </p>
            </div>
          </div>
        </div>
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

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Sparkles size={15} />
            名称与 Lore
          </div>
        </div>
        <div className="card-body">
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
      </div>

      <div className="card">
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
                <div className="loot-entry" key={index}>
                  <label className="loot-entry-field" style={{ flex: 1, width: 'auto' }}>
                    <span>附魔 ID</span>
                    <input
                      id={`nbt-enchant-id-${index}`}
                      className="input"
                      list="nbt-enchant-suggestions"
                      value={entry.id}
                      spellCheck={false}
                      onChange={(event) =>
                        state.updateNbtGive({
                          enchantments: options.enchantments.map((item, i) =>
                            i === index ? { ...item, id: event.target.value } : item
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
              ))}
            </div>
          )}
          <datalist id="nbt-enchant-suggestions">
            {suggestions.map((id) => (
              <option key={id} value={id} />
            ))}
          </datalist>
        </div>
      </div>

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
