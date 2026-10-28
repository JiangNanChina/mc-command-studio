import { Plus, Trash2, X } from 'lucide-react'
import { LocalizedIdInput } from './LocalizedIdInput'
import {
  equipmentSlotLabel, itemFieldOptions, withItemFieldValue, MODERN_ATTRIBUTE_SUGGESTIONS, MODERN_POTION_SUGGESTIONS
} from '../lib/itemFieldLabels'
import {
  RARITIES,
  TEXT_COLORS,
  getVersionCapabilities,
  itemComponentLabel,
  type EnchantmentEntry,
  type AttributeModifierEntry,
  type ItemComponent,
  type PotionEffectEntry,
  type TextLine
} from '@mcstudio/core'

const COLOR_LABELS: Record<string, string> = {
  black: '黑色',
  dark_blue: '深蓝',
  dark_green: '深绿',
  dark_aqua: '深青',
  dark_red: '深红',
  dark_purple: '深紫',
  gold: '金色',
  gray: '灰色',
  dark_gray: '深灰',
  blue: '蓝色',
  green: '绿色',
  aqua: '青色',
  red: '红色',
  light_purple: '淡紫',
  yellow: '黄色',
  white: '白色'
}

interface ComponentsEditorProps {
  components: ItemComponent[]
  enchantments: string[]
  entities?: string[]
  attributes?: string[]
  potions?: string[]
  effects?: string[]
  gameVersion?: string
  onReplace: (index: number, component: ItemComponent) => void
  onRemove: (index: number) => void
}

function ColorSelect({
  value,
  onChange,
  label
}: {
  value: string | undefined
  onChange: (value: string) => void
  label: string
}) {
  return (
    <select className="select" value={value ?? ''} aria-label={label} onChange={(event) => onChange(event.target.value)}>
      <option value="">默认颜色</option>
      {TEXT_COLORS.map((color) => (
        <option key={color} value={color}>
          {COLOR_LABELS[color] ?? color}
        </option>
      ))}
    </select>
  )
}

export function ComponentsEditor({ components, enchantments, entities = [], attributes, potions, effects = [], gameVersion, onReplace, onRemove }: ComponentsEditorProps) {
  const enchantmentOptions = itemFieldOptions('enchantment', enchantments)
  const attributeOptions = itemFieldOptions('attribute', [...new Set([...MODERN_ATTRIBUTE_SUGGESTIONS, ...(attributes ?? [])])])
  const potionOptions = itemFieldOptions('potion', [...new Set([...MODERN_POTION_SUGGESTIONS, ...(potions ?? [])])])
  const effectOptions = itemFieldOptions('effect', effects)
  const entityOptions = itemFieldOptions('entity', entities)
  const integerModelData = getVersionCapabilities(gameVersion).customModelData === 'integer'

  return (
    <div>
      {components.length === 0 ? (
        <div className="component-empty">
          还没有添加组件。可以从上方“添加组件”选择一个；不添加组件也能生成普通的 give 命令。
        </div>
      ) : null}

      {components.map((component, index) => {
        if (component.kind === 'custom_name' || component.kind === 'item_name') {
          return (
            <div className="component-card" key={component.kind}>
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">{component.kind}</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <div className="field">
                  <label className="field-label" htmlFor={`component-${component.kind}-text`}>
                    名称
                  </label>
                  <input
                    id={`component-${component.kind}-text`}
                    className="input"
                    placeholder="例如 Excalibur"
                    value={component.text}
                    onChange={(event) => onReplace(index, { ...component, text: event.target.value })}
                  />
                </div>
                <div className="grid-3" style={{ marginTop: 10 }}>
                  <ColorSelect
                    value={component.color}
                    label="名称颜色"
                    onChange={(color) => onReplace(index, { ...component, color: color as TextLine['color'] })}
                  />
                  <label className="checkline">
                    <input
                      type="checkbox"
                      checked={component.italic}
                      onChange={(event) => onReplace(index, { ...component, italic: event.target.checked })}
                    />
                    斜体
                  </label>
                </div>
              </div>
            </div>
          )
        }

        if (component.kind === 'lore') {
          const updateLine = (lineIndex: number, patch: Partial<TextLine>): void => {
            const lines = component.lines.map((line, i) => (i === lineIndex ? { ...line, ...patch } : line))
            onReplace(index, { ...component, lines })
          }
          return (
            <div className="component-card" key="lore">
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">lore</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                {component.lines.map((line, lineIndex) => (
                  <div className="lore-line" key={lineIndex}>
                    <input
                      className="input"
                      placeholder={`第 ${lineIndex + 1} 行描述`}
                      value={line.text}
                      onChange={(event) => updateLine(lineIndex, { text: event.target.value })}
                    />
                    <ColorSelect
                      value={line.color}
                      label={`第 ${lineIndex + 1} 行颜色`}
                      onChange={(color) => updateLine(lineIndex, { color: color as TextLine['color'] })}
                    />
                    <label className="checkline">
                      <input
                        type="checkbox"
                        checked={line.italic}
                        onChange={(event) => updateLine(lineIndex, { italic: event.target.checked })}
                      />
                      斜体
                    </label>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="删除这一行"
                      onClick={() => {
                        if (component.lines.length <= 1) return
                        onReplace(index, { ...component, lines: component.lines.filter((_, i) => i !== lineIndex) })
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-row"
                  onClick={() =>
                    onReplace(index, {
                      ...component,
                      lines: [...component.lines, { text: '', color: '', italic: false }]
                    })
                  }
                >
                  <Plus size={13} />
                  添加一行
                </button>
              </div>
            </div>
          )
        }

        if (component.kind === 'enchantments') {
          const updateEntry = (entryIndex: number, patch: Partial<EnchantmentEntry>): void => {
            const entries = component.entries.map((entry, i) =>
              i === entryIndex ? { ...entry, ...patch } : entry
            )
            onReplace(index, { ...component, entries })
          }
          return (
            <div className="component-card" key="enchantments">
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">enchantments</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                {component.entries.map((entry, entryIndex) => (
                  <div key={entryIndex} style={{ marginTop: entryIndex ? 10 : 0 }}>
                  <div className="enchant-row">
                    <LocalizedIdInput
                      id={`enchantment-id-${index}-${entryIndex}`}
                      label="附魔 ID"
                      options={withItemFieldValue('enchantment', enchantmentOptions, entry.id)}
                      value={entry.id}
                      onChange={(value) => updateEntry(entryIndex, { id: value })}
                    />
                    <input
                      className="input"
                      type="number"
                      aria-label="附魔等级"
                      min={1}
                      max={255}
                      value={entry.level}
                      onChange={(event) =>
                        updateEntry(entryIndex, { level: Math.max(1, Number(event.target.value) || 1) })
                      }
                    />
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="删除附魔"
                      onClick={() =>
                        onReplace(index, {
                          ...component,
                          entries: component.entries.filter((_, i) => i !== entryIndex)
                        })
                      }
                    >
                      <X size={14} />
                    </button>
                  </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-row"
                  onClick={() =>
                    onReplace(index, {
                      ...component,
                      entries: [...component.entries, { id: 'minecraft:sharpness', level: 1 }]
                    })
                  }
                >
                  <Plus size={13} />
                  添加附魔
                </button>
                <div className="hint" style={{ marginTop: 8 }}>
                  选择中文名称对应的附魔，或直接输入自定义 ID；命令格式按当前游戏版本自动生成。
                </div>
              </div>
            </div>
          )
        }

        if (component.kind === 'attribute_modifiers') {
          const updateEntry = (entryIndex: number, patch: Partial<AttributeModifierEntry>): void => {
            onReplace(index, {
              ...component,
              entries: component.entries.map((entry, i) => i === entryIndex ? { ...entry, ...patch } : entry)
            })
          }
          return (
            <div className="component-card" key="attribute_modifiers">
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">attribute_modifiers</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除属性设置"><Trash2 size={14} /></button>
              </div>
              <div className="component-body">
                {component.entries.map((entry, entryIndex) => (
                  <div className="attribute-entry" key={entryIndex}>
                    <div className="grid-2">
                      <div className="field">
                        <label className="field-label" htmlFor={`attribute-id-${index}-${entryIndex}`}>修饰器 ID</label>
                        <input id={`attribute-id-${index}-${entryIndex}`} className="input" value={entry.id} aria-label="修饰器 ID" aria-describedby={`attribute-id-help-${index}`}
                          placeholder="mcstudio:power" onChange={(event) => updateEntry(entryIndex, { id: event.target.value })} />
                      </div>
                      <div className="field">
                        <label className="field-label" htmlFor={`attribute-type-${index}-${entryIndex}`}>属性</label>
                        <LocalizedIdInput id={`attribute-type-${index}-${entryIndex}`} label="属性 ID"
                          options={withItemFieldValue('attribute', attributeOptions, entry.type)} value={entry.type} placeholder="选择或搜索属性"
                          describedBy={`attribute-id-help-${index}`}
                          onChange={(value) => updateEntry(entryIndex, { type: value })} />
                      </div>
                    </div>
                    <div className="grid-3" style={{ marginTop: 8 }}>
                      <div className="field">
                        <label className="field-label" htmlFor={`attribute-amount-${index}-${entryIndex}`}>数值</label>
                        <input id={`attribute-amount-${index}-${entryIndex}`} className="input" type="number" step="any"
                          value={entry.amount} onChange={(event) => updateEntry(entryIndex, { amount: Number(event.target.value) })} />
                      </div>
                      <div className="field">
                        <label className="field-label" htmlFor={`attribute-operation-${index}-${entryIndex}`}>运算</label>
                        <select id={`attribute-operation-${index}-${entryIndex}`} className="select" value={entry.operation}
                          onChange={(event) => updateEntry(entryIndex, { operation: event.target.value as AttributeModifierEntry['operation'] })}>
                          <option value="add_value">加法</option><option value="add_multiplied_base">基础值乘法</option><option value="add_multiplied_total">总值乘法</option>
                        </select>
                      </div>
                      <div className="field">
                        <label className="field-label" htmlFor={`attribute-slot-${index}-${entryIndex}`}>装备槽位</label>
                        <select id={`attribute-slot-${index}-${entryIndex}`} className="select" value={entry.slot}
                          onChange={(event) => updateEntry(entryIndex, { slot: event.target.value })}>
                          {['any', 'mainhand', 'offhand', 'head', 'chest', 'legs', 'feet', 'body', 'saddle'].map((slot) => <option key={slot} value={slot}>{equipmentSlotLabel(slot)}</option>)}
                        </select>
                      </div>
                    </div>
                    <button type="button" className="btn btn-sm btn-ghost" style={{ marginTop: 6 }}
                      onClick={() => onReplace(index, { ...component, entries: component.entries.filter((_, i) => i !== entryIndex) })}>
                      <X size={13} />移除这一项
                    </button>
                  </div>
                ))}
                <button type="button" className="add-row" onClick={() => onReplace(index, { ...component, entries: [...component.entries, { id: `mcstudio:modifier_${component.entries.length + 1}`, type: 'minecraft:attack_damage', amount: 1, operation: 'add_value', slot: 'mainhand' }] })}>
                  <Plus size={13} />添加属性修饰器
                </button>
                <div id={`attribute-id-help-${index}`} className="hint" style={{ marginTop: 7 }}>
                  修饰器 ID 标识这一条修改；属性 ID 决定修改攻击伤害、护甲等哪项属性。同一个物品内每条修饰器请使用不同 ID，重复 ID 会产生冲突。
                  格式为小写“命名空间:路径”，例如 mcstudio:attack_bonus；可用小写字母、数字、_、.、-，路径还可用 /。程序会按版本生成对应格式。
                </div>
              </div>
            </div>
          )
        }

        if (component.kind === 'potion_contents') {
          const updateEffect = (effectIndex: number, patch: Partial<PotionEffectEntry>): void => {
            onReplace(index, { ...component, effects: component.effects.map((effect, i) => i === effectIndex ? { ...effect, ...patch } : effect) })
          }
          const hexColor = component.customColor === null || component.customColor === undefined
            ? '#ffffff'
            : `#${component.customColor.toString(16).padStart(6, '0').slice(-6)}`
          return (
            <div className="component-card" key="potion_contents">
              <div className="component-head"><span className="component-title">药水效果</span><span className="component-id">potion_contents</span><span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除药水设置"><Trash2 size={14} /></button></div>
              <div className="component-body">
                <div className="grid-2">
                  <div className="field"><label className="field-label" htmlFor={`potion-id-${index}`}>基础药水</label>
                    <LocalizedIdInput id={`potion-id-${index}`} value={component.potion} label="基础药水 ID"
                      options={withItemFieldValue('potion', potionOptions, component.potion)} placeholder="选择或搜索药水"
                      onChange={(value) => onReplace(index, { ...component, potion: value })} />
                  </div>
                  <div className="field"><label className="field-label" htmlFor={`potion-color-${index}`}>自定义颜色（可选）</label>
                    <div className="row wrap"><input id={`potion-color-${index}`} type="color" value={hexColor} aria-label="药水颜色"
                      onChange={(event) => onReplace(index, { ...component, customColor: Number.parseInt(event.target.value.slice(1), 16) })} />
                      <button type="button" className="btn btn-sm" disabled={component.customColor == null} onClick={() => onReplace(index, { ...component, customColor: null })}>清除颜色</button></div>
                  </div>
                </div>
                <div className="field-label" style={{ marginTop: 12 }}>自定义效果</div>
                {component.effects.map((effect, effectIndex) => (
                  <div className="potion-effect-row" key={effectIndex}>
                    <div className="grid-3">
                      <div className="field"><label className="field-label" htmlFor={`potion-effect-id-${index}-${effectIndex}`}>状态效果</label><LocalizedIdInput id={`potion-effect-id-${index}-${effectIndex}`} label="状态效果 ID" options={withItemFieldValue('effect', effectOptions, effect.id)} value={effect.id} placeholder="选择或搜索状态效果" onChange={(value) => updateEffect(effectIndex, { id: value })} /></div>
                      <div className="field"><label className="field-label" htmlFor={`potion-effect-duration-${index}-${effectIndex}`}>时长（tick）</label><input id={`potion-effect-duration-${index}-${effectIndex}`} className="input" type="number" min={0} value={effect.duration} onChange={(event) => updateEffect(effectIndex, { duration: Number(event.target.value) })} /></div>
                      <div className="field"><label className="field-label" htmlFor={`potion-effect-amplifier-${index}-${effectIndex}`}>等级（0 起）</label><input id={`potion-effect-amplifier-${index}-${effectIndex}`} className="input" type="number" min={0} max={255} value={effect.amplifier} onChange={(event) => updateEffect(effectIndex, { amplifier: Number(event.target.value) })} /></div>
                    </div>
                    <div className="row wrap" style={{ marginTop: 8 }}>
                      {([['ambient', '环境效果'], ['showParticles', '显示粒子'], ['showIcon', '显示图标']] as const).map(([key, label]) => <label className="checkline" key={key}><input type="checkbox" checked={effect[key]} onChange={(event) => updateEffect(effectIndex, { [key]: event.target.checked })} />{label}</label>)}
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => onReplace(index, { ...component, effects: component.effects.filter((_, i) => i !== effectIndex) })}><X size={13} />移除</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="add-row" onClick={() => onReplace(index, { ...component, effects: [...component.effects, { id: 'minecraft:speed', duration: 1200, amplifier: 0, ambient: false, showParticles: true, showIcon: true }] })}><Plus size={13} />添加药水效果</button>
              </div>
            </div>
          )
        }

        if (component.kind === 'can_break' || component.kind === 'can_place_on') {
          return (
            <div className="component-card" key={component.kind}>
              <div className="component-head"><span className="component-title">{itemComponentLabel(component.kind)}</span><span className="component-id">{component.kind}</span><span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除限制"><Trash2 size={14} /></button></div>
              <div className="component-body"><label className="field-label" htmlFor={`block-predicate-${component.kind}-${index}`}>方块 ID（每行一个，支持 #标签）</label>
                <textarea id={`block-predicate-${component.kind}-${index}`} className="textarea" rows={3} spellCheck={false} placeholder={'minecraft:stone\n#minecraft:logs'} value={component.blocks.join('\n')}
                  onChange={(event) => onReplace(index, { ...component, blocks: event.target.value.split(/[\n,]/).map((value) => value.trim()).filter(Boolean) })} />
                <div className="hint">{component.kind === 'can_break' ? '冒险模式下允许破坏的方块。' : '冒险模式下允许放置方块的表面。'} 1.21.5 前后会自动选择对应版本的格式。</div>
              </div>
            </div>
          )
        }

        if (component.kind === 'entity_data') {
          return (
            <div className="component-card" key="entity_data"><div className="component-head"><span className="component-title">生成实体数据</span><span className="component-id">entity_data</span><span style={{ flex: 1 }} /><button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除实体设置"><Trash2 size={14} /></button></div>
                <div className="component-body"><label className="field-label" htmlFor={`entity-data-${index}`}>实体 SNBT</label><textarea id={`entity-data-${index}`} className="textarea" rows={3} spellCheck={false} value={component.raw} placeholder={'{id:"minecraft:zombie",Health:40.0f}'} onChange={(event) => onReplace(index, { ...component, raw: event.target.value })} /><div className="hint">用于自定义刷怪蛋等物品，例如修改实体生命值或名称。</div></div>
            </div>
          )
        }

        if (component.kind === 'block_entity_data') {
          const updateSpawner = (patch: Partial<typeof component>): void => onReplace(index, { ...component, ...patch })
          const spawnerFields = [
            ['delay', '当前延迟（tick）'], ['minSpawnDelay', '最短延迟（tick）'], ['maxSpawnDelay', '最长延迟（tick）'],
            ['spawnCount', '每次生成数（个）'], ['maxNearbyEntities', '附近上限（个）'], ['requiredPlayerRange', '激活距离（格）'], ['spawnRange', '生成范围（格）']
          ] as const
          return (
            <div className="component-card" key="block_entity_data"><div className="component-head"><span className="component-title">刷怪笼</span><span className="component-id">block_entity_data</span><span style={{ flex: 1 }} /><button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除刷怪笼设置"><Trash2 size={14} /></button></div>
              <div className="component-body"><div className="grid-2"><div className="field"><label className="field-label" htmlFor={`spawner-entity-${index}`}>生成实体</label><LocalizedIdInput id={`spawner-entity-${index}`} label="生成实体 ID" options={withItemFieldValue('entity', entityOptions, component.entity)} value={component.entity} placeholder="选择或搜索实体" onChange={(value) => updateSpawner({ entity: value })} /></div><div className="field"><label className="field-label" htmlFor={`spawner-delay-${index}`}>初始延迟（tick）</label><input id={`spawner-delay-${index}`} className="input" type="number" min={-1} value={component.delay} onChange={(event) => updateSpawner({ delay: Number(event.target.value) })} /></div></div>
                <div className="grid-2" style={{ marginTop: 10 }}>{spawnerFields.slice(1).map(([key, label]) => <div className="field" key={key}><label className="field-label" htmlFor={`spawner-${key}-${index}`}>{label}</label><input id={`spawner-${key}-${index}`} className="input" type="number" min={0} value={component[key]} onChange={(event) => updateSpawner({ [key]: Number(event.target.value) })} /></div>)}</div>
                <div className="hint" style={{ marginTop: 8 }}>延迟 -1 表示由游戏重新计算；可通过物品编辑器给出刷怪笼物品，并设置实体、数量与范围。</div>
              </div>
            </div>
          )
        }

        if (component.kind === 'unbreakable') {
          return (
            <div className="component-card" key="unbreakable">
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">unbreakable</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <div className="hint">已启用：物品不会损失耐久，并隐藏耐久条。生成值为 unbreakable={'{}'}。</div>
              </div>
            </div>
          )
        }

        if (component.kind === 'max_stack_size') {
          return (
            <div className="component-card" key="max_stack_size">
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">max_stack_size</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <div className="field">
                  <label className="field-label" htmlFor="max-stack-size">
                    最大堆叠（1–99）
                  </label>
                  <input
                    id="max-stack-size"
                    className="input"
                    type="number"
                    min={1}
                    max={99}
                    value={component.value}
                    onChange={(event) =>
                      onReplace(index, {
                        ...component,
                        value: Math.max(1, Math.min(99, Number(event.target.value) || 1))
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )
        }

        if (component.kind === 'max_damage' || component.kind === 'damage') {
          const minimum = component.kind === 'max_damage' ? 1 : 0
          return (
            <div className="component-card" key={component.kind}>
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">{component.kind}</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <div className="field">
                  <label className="field-label" htmlFor={`component-${component.kind}`}>
                    {component.kind === 'max_damage' ? '最大耐久值' : '已消耗耐久值'}
                  </label>
                  <input
                    id={`component-${component.kind}`}
                    className="input"
                    type="number"
                    min={minimum}
                    value={component.value}
                    onChange={(event) =>
                      onReplace(index, {
                        ...component,
                        value: Math.max(minimum, Math.floor(Number(event.target.value) || minimum))
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )
        }

        if (component.kind === 'rarity') {
          return (
            <div className="component-card" key="rarity">
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">rarity</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <div className="field">
                  <label className="field-label" htmlFor="component-rarity">
                    稀有度
                  </label>
                  <select
                    id="component-rarity"
                    className="select"
                    value={component.value}
                    onChange={(event) =>
                      onReplace(index, { ...component, value: event.target.value as typeof component.value })
                    }
                  >
                    {RARITIES.map((rarity) => (
                      <option key={rarity} value={rarity}>
                        {{ common: '普通', uncommon: '罕见', rare: '稀有', epic: '史诗' }[rarity]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )
        }

        if (component.kind === 'enchantment_glint_override') {
          return (
            <div className="component-card" key="enchantment_glint_override">
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">enchantment_glint_override</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <label className="checkline">
                  <input
                    type="checkbox"
                    checked={component.value}
                    onChange={(event) => onReplace(index, { ...component, value: event.target.checked })}
                  />
                  强制附魔光效
                </label>
              </div>
            </div>
          )
        }

        if (component.kind === 'custom_data') {
          return (
            <div className="component-card" key="custom_data">
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">custom_data</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <textarea
                  className="textarea"
                  placeholder="例如 {my_pack:{level:3}}"
                  value={component.raw}
                  onChange={(event) => onReplace(index, { ...component, raw: event.target.value })}
                />
                <div className="hint">必须是一个完整的 SNBT 复合标签 {'{…}'}。</div>
              </div>
            </div>
          )
        }

        if (component.kind === 'item_tags') {
          return (
            <div className="component-card" key="item_tags">
              <div className="component-head"><span className="component-title">物品标签</span><span className="component-id">Tags</span><span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除物品标签"><Trash2 size={14} /></button>
              </div>
              <div className="component-body">
                <label className="field-label" htmlFor={`item-tags-${index}`}>标签（每行一个）</label>
                <textarea id={`item-tags-${index}`} className="textarea" rows={3} spellCheck={false}
                  placeholder={'mcstudio:reward\nmy_pack:quest_item'} value={component.tags.join('\n')}
                  onChange={(event) => onReplace(index, {
                    ...component,
                    tags: event.target.value.split('\n').map((tag) => tag.trim()).filter(Boolean)
                  })} />
                <div className="hint">物品标签会写入 custom_data，可在命令中按标签匹配。</div>
              </div>
            </div>
          )
        }

        if (component.kind === 'raw') {
          return (
            <div className="component-card" key={`raw-${index}`}>
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">{component.id || 'raw'}</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <div className="grid-2">
                  <div className="field">
                    <label className="field-label" htmlFor={`raw-id-${index}`}>
                      组件 ID
                    </label>
                    <input
                      id={`raw-id-${index}`}
                      className="input"
                      placeholder="minecraft:tooltip_display"
                      value={component.id}
                      onChange={(event) => onReplace(index, { ...component, id: event.target.value })}
                    />
                  </div>
                </div>
                <div className="field" style={{ marginTop: 10 }}>
                  <label className="field-label" htmlFor={`raw-value-${index}`}>
                    SNBT 值
                  </label>
                  <textarea
                    id={`raw-value-${index}`}
                    className="textarea"
                    placeholder='例如 {hidden_components:["minecraft:enchantments"]}'
                    value={component.value}
                    onChange={(event) => onReplace(index, { ...component, value: event.target.value })}
                  />
                </div>
              </div>
            </div>
          )
        }

        if (component.kind !== 'custom_model_data') return null

        return (
          <div className="component-card" key="custom_model_data">
            <div className="component-head">
              <span className="component-title">{itemComponentLabel(component.kind)}</span>
              <span className="component-id">custom_model_data</span>
              <span style={{ flex: 1 }} />
              <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="component-body">
              <div className="field">
                <label className="field-label" htmlFor="custom-model-data">
                  {integerModelData ? '整数模型编号' : 'SNBT 值'}
                </label>
                <textarea
                  id="custom-model-data"
                  className="textarea"
                  placeholder={integerModelData ? '例如 123' : '例如 {strings:["my_pack:model"]}'}
                  value={component.raw}
                  onChange={(event) => onReplace(index, { ...component, raw: event.target.value })}
                />
                <div className="hint">
                  {integerModelData
                    ? '当前版本使用整数模型编号，例如 123。'
                    : '当前版本使用复合值，例如 {strings:["my_pack:model"]}。'}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
