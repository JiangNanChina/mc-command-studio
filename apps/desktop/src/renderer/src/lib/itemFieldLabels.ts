import attributes from '../data/attributes.json'
import { LEGACY_NBT_ATTRIBUTES, compareVersions, usesLegacyNbtAttributes } from '@mcstudio/core'
import { mcId, mcName } from './mcAssets'

export type ItemFieldKind = 'attribute' | 'enchantment' | 'potion' | 'effect' | 'entity'

const FIELD_LABELS: Record<ItemFieldKind, string> = {
  attribute: '属性', enchantment: '附魔', potion: '药水', effect: '状态效果', entity: '实体'
}

const ATTRIBUTE_NAMES: Record<string, string> = Object.fromEntries(
  attributes.map(({ id, name }) => [id.replace(/^minecraft:/, ''), name])
)
ATTRIBUTE_NAMES.name_tag_distance = '名称标签显示距离'

const POTION_NAMES: Record<string, string> = {
  empty: '空药水', water: '水瓶', mundane: '平凡的药水', awkward: '粗制的药水', thick: '浓稠的药水',
  night_vision: '夜视药水', invisibility: '隐身药水', leaping: '跳跃药水', fire_resistance: '抗火药水',
  swiftness: '迅捷药水', slowness: '迟缓药水', water_breathing: '水肺药水', healing: '治疗药水',
  harming: '伤害药水', poison: '剧毒药水', regeneration: '再生药水', strength: '力量药水',
  weakness: '虚弱药水', slow_falling: '缓降药水', turtle_master: '神龟药水', luck: '幸运药水',
  wind_charged: '蓄风药水', weaving: '盘丝药水', oozing: '渗浆药水', infested: '寄生药水'
}

const SLOT_NAMES: Record<string, string> = {
  any: '任意槽位', mainhand: '主手', offhand: '副手', head: '头部', chest: '胸部',
  legs: '腿部', feet: '脚部', body: '躯体（动物护甲）', saddle: '鞍'
}

export const MODERN_ATTRIBUTE_SUGGESTIONS = [
  'attack_damage', 'attack_speed', 'armor', 'armor_toughness', 'knockback_resistance',
  'movement_speed', 'luck', 'max_health', 'follow_range', 'flying_speed', 'jump_strength',
  'scale', 'block_interaction_range', 'entity_interaction_range'
]

export const MODERN_POTION_SUGGESTIONS = [
  'water', 'mundane', 'awkward', 'thick', 'night_vision', 'long_night_vision', 'invisibility',
  'leaping', 'fire_resistance', 'swiftness', 'slowness', 'water_breathing', 'healing', 'harming',
  'poison', 'regeneration', 'strength', 'weakness', 'slow_falling', 'turtle_master',
  'wind_charged', 'weaving', 'oozing', 'infested'
]

/** Resolve display text only; the value sent to the command serializer is never changed. */
export function itemFieldName(kind: ItemFieldKind, value: string): string {
  const id = value.trim()
  if (!id) return `尚未选择${FIELD_LABELS[kind]}`
  if (id.includes(':') && !id.startsWith('minecraft:')) return `自定义${FIELD_LABELS[kind]}：${id}`
  const short = id.replace(/^minecraft:/, '')
  let name: string | undefined
  if (kind === 'attribute') {
    // Both old camelCase IDs and namespaced generic/player/horse IDs are still editable.
    const key = short.replace(/^(generic|player|horse|zombie)\./, '')
      .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    name = ATTRIBUTE_NAMES[key]
  } else if (kind === 'potion') {
    const variant = short.startsWith('long_') ? '延长' : short.startsWith('strong_') ? '增强' : ''
    const base = short.replace(/^(long|strong)_/, '')
    const baseName = POTION_NAMES[base]
    name = baseName ? `${baseName}${variant ? `（${variant}）` : ''}` : undefined
  } else {
    const category = kind === 'effect' ? 'effects' : kind === 'entity' ? 'entities' : 'enchantments'
    const candidate = mcName(category, id)
    name = /[\u3400-\u9fff]/.test(candidate) ? candidate : undefined
  }
  return name ?? `未收录的${FIELD_LABELS[kind]}：${id}`
}

export function itemFieldOptions(kind: ItemFieldKind, values: readonly string[]): { value: string; label: string }[] {
  return values.map((id) => ({ value: mcId(id), label: itemFieldOptionLabel(kind, id) }))
}

export function nbtAttributeOptions(values: readonly string[], gameVersion?: string): { value: string; label: string }[] {
  if (!usesLegacyNbtAttributes(gameVersion)) return itemFieldOptions('attribute', values)
  return LEGACY_NBT_ATTRIBUTES
    .filter((entry) => compareVersions(gameVersion!, entry.since) >= 0)
    .map(({ id }) => ({ value: id, label: itemFieldOptionLabel('attribute', id) }))
}

function itemFieldOptionLabel(kind: ItemFieldKind, value: string): string {
  // The selector renders the ID on its own secondary line, so keep its main label Chinese.
  return itemFieldName(kind, value).replace(/^(自定义[^：]+|未收录的[^：]+)：.+$/, '$1')
}

/** Keep loaded legacy or custom IDs visible even when absent from the current registry. */
export function withItemFieldValue(
  kind: ItemFieldKind,
  options: { value: string; label: string }[],
  value: string
): { value: string; label: string }[] {
  if (!value || options.some((option) => option.value === value)) return options
  return [...options, { value, label: itemFieldOptionLabel(kind, value) }]
}

export function equipmentSlotLabel(slot: string): string {
  return SLOT_NAMES[slot] ?? `自定义槽位：${slot}`
}
