import { error } from './diagnostics'
import { resourceId, snbtString } from './escape'
import { serializeSelector, type Selector } from './selector'
import { isValidResourceLocation, parseNumberUnit } from './units'
import type { BuildResult, Diagnostic } from './types'
import { compareVersions } from './version'

export interface NbtEnchantment {
  id: string
  level: string
}

export interface NbtAttributeModifier {
  attribute: string
  amount: string
  operation: 0 | 1 | 2
  slot: string
  name: string
}

/**
 * Pre-1.16 AttributeName strings are not namespaced resource locations.
 * Verified against the bundled official 1.13.2 server/lang assets; the 1.16
 * registry rename is documented in Mojang's Snapshot 20w14a technical notes.
 */
export const LEGACY_NBT_ATTRIBUTES: readonly { id: string; modernId: string; since: string }[] = [
  { id: 'generic.maxHealth', modernId: 'generic.max_health', since: '1.13' },
  { id: 'generic.followRange', modernId: 'generic.follow_range', since: '1.13' },
  { id: 'generic.knockbackResistance', modernId: 'generic.knockback_resistance', since: '1.13' },
  { id: 'generic.movementSpeed', modernId: 'generic.movement_speed', since: '1.13' },
  { id: 'generic.flyingSpeed', modernId: 'generic.flying_speed', since: '1.13' },
  { id: 'generic.attackDamage', modernId: 'generic.attack_damage', since: '1.13' },
  { id: 'generic.attackKnockback', modernId: 'generic.attack_knockback', since: '1.14' },
  { id: 'generic.attackSpeed', modernId: 'generic.attack_speed', since: '1.13' },
  { id: 'generic.armor', modernId: 'generic.armor', since: '1.13' },
  { id: 'generic.armorToughness', modernId: 'generic.armor_toughness', since: '1.13' },
  { id: 'generic.luck', modernId: 'generic.luck', since: '1.13' },
  { id: 'horse.jumpStrength', modernId: 'horse.jump_strength', since: '1.13' },
  { id: 'zombie.spawnReinforcements', modernId: 'zombie.spawn_reinforcements', since: '1.13' }
]

export function usesLegacyNbtAttributes(gameVersion: string | undefined): boolean {
  return Boolean(gameVersion && compareVersions(gameVersion, '1.13') >= 0
    && compareVersions(gameVersion, '1.16') < 0)
}

/** Resolve known vanilla aliases only; never strip a custom namespace. */
export function legacyNbtAttributeId(value: string, gameVersion: string): string | null {
  if (!usesLegacyNbtAttributes(gameVersion)) return null
  const id = value.trim().replace(/^minecraft:/, '')
  return LEGACY_NBT_ATTRIBUTES.find((entry) => compareVersions(gameVersion, entry.since) >= 0
    && (entry.id === id || entry.modernId === id))?.id ?? null
}

export interface NbtPotionEffect {
  id: string
  duration: string
  amplifier: string
}

export interface NbtGiveOptions {
  target: Selector
  item: string
  count: string
  name: string
  lore: string
  enchantments: NbtEnchantment[]
  unbreakable: boolean
  damage?: string
  tags?: string[]
  attributes?: NbtAttributeModifier[]
  potion?: string
  potionColor?: string
  potionEffects?: NbtPotionEffect[]
  canDestroy?: string[]
  canPlaceOn?: string[]
  spawnerEntity?: string
  spawnerDelay?: string
  spawnerMinSpawnDelay?: string
  spawnerMaxSpawnDelay?: string
  spawnerSpawnCount?: string
  spawnerMaxNearbyEntities?: string
  spawnerRequiredPlayerRange?: string
  spawnerSpawnRange?: string
}

export function createDefaultNbtGiveOptions(): NbtGiveOptions {
  return {
    target: { base: '@s' },
    item: 'minecraft:diamond_sword',
    count: '1',
    name: '',
    lore: '',
    enchantments: [],
    unbreakable: false,
    damage: '',
    tags: [],
    attributes: [],
    potion: '',
    potionColor: '',
    potionEffects: [],
    canDestroy: [],
    canPlaceOn: [],
    spawnerEntity: '',
    spawnerDelay: '',
    spawnerMinSpawnDelay: '',
    spawnerMaxSpawnDelay: '',
    spawnerSpawnCount: '',
    spawnerMaxNearbyEntities: '',
    spawnerRequiredPlayerRange: '',
    spawnerSpawnRange: ''
  }
}

function textJson(value: string): string {
  return JSON.stringify({ text: value })
}

function parseInteger(
  value: string,
  min: number,
  max: number,
  code: string,
  label: string,
  field: string,
  diagnostics: Diagnostic[]
): number | null {
  const parsed = parseNumberUnit(value, { min, max, integer: true })
  if (!parsed) {
    diagnostics.push(error(code, `${label}必须是 ${min}–${max} 的整数`, field))
    return null
  }
  return parsed.value
}

function validResource(value: string, field: string, diagnostics: Diagnostic[], allowTag = false): string | null {
  const candidate = value.trim()
  const id = resourceId(candidate)
  if (!isValidResourceLocation(allowTag && candidate.startsWith('#') ? candidate.slice(1) : candidate)) {
    diagnostics.push(error(`nbt.${field}`, `${field} ID 不合法：${value}`, field))
    return null
  }
  return id
}

function hashModifierUuid(value: string): number[] {
  let first = 0x811c9dc5
  let second = 0x9e3779b9
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    first = Math.imul(first ^ code, 0x01000193)
    second = Math.imul(second ^ code, 0x85ebca6b)
  }
  return [first | 0, second | 0, Math.imul(first ^ second, 0xc2b2ae35) | 0, Math.imul(second ^ first, 0x27d4eb2f) | 0]
}

function serializeAttributes(
  entries: NbtAttributeModifier[],
  gameVersion: string,
  diagnostics: Diagnostic[]
): string | null {
  if (entries.length > 64) diagnostics.push(error('nbt.attributes.count', '属性修饰器最多 64 项', 'attributes'))
  const serialized = entries.slice(0, 64).flatMap((entry, index) => {
    const legacyVersion = usesLegacyNbtAttributes(gameVersion)
    const legacyId = legacyNbtAttributeId(entry.attribute, gameVersion)
    const explicitlyNamespaced = entry.attribute.trim().includes(':')
    const attribute = legacyId ?? (legacyVersion && !explicitlyNamespaced
      ? null
      : validResource(entry.attribute, 'attribute.id', diagnostics))
    if (legacyVersion && !legacyId && !explicitlyNamespaced) {
      diagnostics.push(error('nbt.attribute.id', `当前版本不支持该旧版属性：${entry.attribute}`, 'attribute.id'))
    }
    const amount = parseNumberUnit(entry.amount, {})
    if (!amount) diagnostics.push(error('nbt.attribute.amount', `属性修饰值必须是有限数字：${entry.attribute}`, 'attributes'))
    if (!Number.isInteger(entry.operation) || entry.operation < 0 || entry.operation > 2) {
      diagnostics.push(error('nbt.attribute.operation', '属性运算必须是 0、1 或 2', 'attributes'))
    }
    const name = entry.name.trim()
    if (!name) diagnostics.push(error('nbt.attribute.name', '属性修饰器名称不能为空', 'attributes'))
    const slot = entry.slot.trim()
    if (!['mainhand', 'offhand', 'head', 'chest', 'legs', 'feet'].includes(slot)) {
      diagnostics.push(error('nbt.attribute.slot', `装备槽位不合法：${entry.slot}`, 'attributes'))
    }
    if (!attribute || !amount || !name || !['mainhand', 'offhand', 'head', 'chest', 'legs', 'feet'].includes(slot) ||
      !Number.isInteger(entry.operation) || entry.operation < 0 || entry.operation > 2) return []
    const uuid = hashModifierUuid(`${attribute}|${name}|${index}`)
    const uuidTag = compareVersions(gameVersion, '1.16') >= 0
      ? `UUID:[I;${uuid.join(',')}]`
      : `UUIDMost:${BigInt.asIntN(64, (BigInt(uuid[0]) << 32n) | BigInt(uuid[1] >>> 0))}L,UUIDLeast:${BigInt.asIntN(64, (BigInt(uuid[2]) << 32n) | BigInt(uuid[3] >>> 0))}L`
    return [`{AttributeName:${snbtString(attribute)},Name:${snbtString(name)},Amount:${amount.text}d,Operation:${entry.operation},Slot:${snbtString(slot)},${uuidTag}}`]
  })
  return serialized.length ? `AttributeModifiers:[${serialized.join(',')}]` : null
}

const POTION_EFFECTS: Record<string, { id: number; since: string }> = {
  speed: { id: 1, since: '1.13' }, slowness: { id: 2, since: '1.13' }, haste: { id: 3, since: '1.13' },
  mining_fatigue: { id: 4, since: '1.13' }, strength: { id: 5, since: '1.13' },
  instant_health: { id: 6, since: '1.13' }, instant_damage: { id: 7, since: '1.13' },
  jump_boost: { id: 8, since: '1.13' }, nausea: { id: 9, since: '1.13' }, regeneration: { id: 10, since: '1.13' },
  resistance: { id: 11, since: '1.13' }, fire_resistance: { id: 12, since: '1.13' },
  water_breathing: { id: 13, since: '1.13' }, invisibility: { id: 14, since: '1.13' },
  blindness: { id: 15, since: '1.13' }, night_vision: { id: 16, since: '1.13' },
  hunger: { id: 17, since: '1.13' }, weakness: { id: 18, since: '1.13' }, poison: { id: 19, since: '1.13' },
  wither: { id: 20, since: '1.13' }, health_boost: { id: 21, since: '1.13' }, absorption: { id: 22, since: '1.13' },
  saturation: { id: 23, since: '1.13' }, glowing: { id: 24, since: '1.13' }, levitation: { id: 25, since: '1.13' },
  luck: { id: 26, since: '1.13' }, unluck: { id: 27, since: '1.13' }, slow_falling: { id: 28, since: '1.13' },
  conduit_power: { id: 29, since: '1.13' }, dolphins_grace: { id: 30, since: '1.13' },
  bad_omen: { id: 31, since: '1.14' }, hero_of_the_village: { id: 32, since: '1.14' }, darkness: { id: 33, since: '1.19' }
}

function serializePotionEffects(entries: NbtPotionEffect[], gameVersion: string, diagnostics: Diagnostic[]): string | null {
  if (entries.length > 32) diagnostics.push(error('nbt.potion_effects.count', '药水效果最多 32 项', 'potionEffects'))
  // Java 1.20.2 renamed effect fields and replaced numeric IDs with resource IDs.
  const usesResourceIds = compareVersions(gameVersion, '1.20.2') >= 0
  const serialized = entries.slice(0, 32).flatMap((entry) => {
    const idText = entry.id.trim().replace(/^minecraft:/, '')
    const effectEntry = Object.entries(POTION_EFFECTS).find(([id, effect]) => /^\d+$/.test(idText)
      ? effect.id === Number(idText)
      : id === idText)
    if (!effectEntry || compareVersions(gameVersion, effectEntry[1].since) < 0) {
      diagnostics.push(error('nbt.potion_effect.id', `药水效果 ID 不合法或此版本不支持：${entry.id}`, 'potionEffects'))
      return []
    }
    const [id, effect] = effectEntry
    const duration = parseInteger(entry.duration, 1, 2147483647, 'nbt.potion_effect.duration', '效果时长', 'potionEffects', diagnostics)
    const amplifier = parseInteger(entry.amplifier, 0, 255, 'nbt.potion_effect.amplifier', '效果等级', 'potionEffects', diagnostics)
    if (duration === null || amplifier === null) return []
    return [usesResourceIds
      ? `{id:${snbtString(resourceId(id))},amplifier:${amplifier},duration:${duration}}`
      : `{Id:${effect.id}b,Amplifier:${amplifier}b,Duration:${duration}}`]
  })
  return serialized.length ? `${usesResourceIds ? 'custom_potion_effects' : 'CustomPotionEffects'}:[${serialized.join(',')}]` : null
}

function serializeSpawner(options: NbtGiveOptions, gameVersion: string, diagnostics: Diagnostic[]): string | null {
  const fields: string[] = []
  const entityText = options.spawnerEntity?.trim() ?? ''
  if (entityText) {
    const entity = validResource(entityText, 'spawner.entity', diagnostics)
    if (entity) {
      // Java 1.18 moved the previous SpawnData contents into SpawnData.entity.
      const spawnData = compareVersions(gameVersion, '1.18') >= 0
        ? `{entity:{id:${snbtString(entity)}}}`
        : `{id:${snbtString(entity)}}`
      fields.push(`SpawnData:${spawnData}`)
    }
  }
  const numericFields: [keyof NbtGiveOptions, string, number, number][] = [
    ['spawnerDelay', 'Delay', -1, 32767],
    ['spawnerMinSpawnDelay', 'MinSpawnDelay', 1, 32767],
    ['spawnerMaxSpawnDelay', 'MaxSpawnDelay', 1, 32767],
    ['spawnerSpawnCount', 'SpawnCount', 1, 32767],
    ['spawnerMaxNearbyEntities', 'MaxNearbyEntities', 1, 32767],
    ['spawnerRequiredPlayerRange', 'RequiredPlayerRange', 0, 32767],
    ['spawnerSpawnRange', 'SpawnRange', 0, 32767]
  ]
  const parsedValues = new Map<string, number>()
  for (const [key, tag, min, max] of numericFields) {
    const raw = options[key]
    if (typeof raw !== 'string' || !raw.trim()) continue
    const value = parseInteger(raw, min, max, 'nbt.spawner.value', `${tag} 数值`, key, diagnostics)
    if (value !== null) {
      parsedValues.set(tag, value)
      fields.push(`${tag}:${value}s`)
    }
  }
  const minDelay = parsedValues.get('MinSpawnDelay')
  const maxDelay = parsedValues.get('MaxSpawnDelay')
  if (minDelay !== undefined && maxDelay !== undefined && minDelay > maxDelay) {
    diagnostics.push(error('nbt.spawner.delay_range', '最小生成间隔不能大于最大生成间隔', 'spawnerMinSpawnDelay'))
  }
  return fields.length ? `BlockEntityTag:{${fields.join(',')}}` : null
}

export function buildNbtGiveCommand(options: NbtGiveOptions, gameVersion = '1.20.4'): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)

  const item = resourceId(options.item.trim())
  if (!isValidResourceLocation(options.item)) {
    diagnostics.push(error('nbt.item', '物品 ID 不合法', 'item'))
  }
  const count = parseNumberUnit(options.count, { min: 1, max: 99, integer: true })
  if (!count) {
    diagnostics.push(error('nbt.count', '数量必须是 1–99 的整数', 'count'))
  }

  const parts: string[] = []
  if (options.name.trim()) {
    parts.push(`display:{Name:${snbtString(textJson(options.name.trim()))}}`)
  }
  const loreLines = options.lore
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  if (loreLines.length > 0) {
    if (loreLines.length > 32) {
      diagnostics.push(error('nbt.lore', 'Lore 最多 32 行', 'lore'))
    }
    const lore = loreLines.map((line) => snbtString(textJson(line))).join(',')
    const display = options.name.trim()
      ? `display:{Name:${snbtString(textJson(options.name.trim()))},Lore:[${lore}]}`
      : `display:{Lore:[${lore}]}`
    // 名称已存在时只保留一条 display 复合标签
    if (parts.length > 0) parts.pop()
    parts.push(display)
  }

  if (options.enchantments.length > 0) {
    if (options.enchantments.length > 16) {
      diagnostics.push(error('nbt.enchants', '附魔最多 16 项', 'enchantments'))
    }
    const entries = options.enchantments.map((entry) => {
      const id = resourceId(entry.id.trim())
      if (!isValidResourceLocation(entry.id)) {
        diagnostics.push(error('nbt.enchant.id', `附魔 ID 不合法：${entry.id}`, 'enchantments'))
      }
      const level = parseNumberUnit(entry.level, { min: 1, max: 255, integer: true })
      if (!level) {
        diagnostics.push(error('nbt.enchant.level', `附魔等级必须是 1–255：${entry.id}`, 'enchantments'))
      }
      return `{id:${snbtString(id)},lvl:${level?.value ?? 1}}`
    })
    parts.push(`Enchantments:[${entries.join(',')}]`)
  }
  if (options.unbreakable) parts.push('Unbreakable:1b')

  if (options.damage?.trim()) {
    const damage = parseInteger(options.damage, 0, 32767, 'nbt.damage', '耐久损伤', 'damage', diagnostics)
    if (damage !== null) parts.push(`Damage:${damage}`)
  }
  const tags = options.tags ?? []
  if (tags.length > 128) diagnostics.push(error('nbt.tags.count', '物品标签最多 128 项', 'tags'))
  const validTags = tags.slice(0, 128).flatMap((tag) => {
    if (!tag.trim() || /[\r\n\u0000-\u001f]/.test(tag)) {
      diagnostics.push(error('nbt.tag.value', '物品标签不能为空或包含控制字符', 'tags'))
      return []
    }
    return [snbtString(tag)]
  })
  if (validTags.length) parts.push(`Tags:[${validTags.join(',')}]`)

  const attributes = options.attributes ?? []
  if (attributes.length) {
    const serialized = serializeAttributes(attributes, gameVersion, diagnostics)
    if (serialized) parts.push(serialized)
  }

  if (options.potion?.trim()) {
    const potion = validResource(options.potion, 'potion', diagnostics)
    if (potion) parts.push(`Potion:${snbtString(potion)}`)
  }
  if (options.potionColor?.trim()) {
    const rawColor = options.potionColor.trim()
    const color = /^#[0-9a-fA-F]{6}$/.test(rawColor) ? Number.parseInt(rawColor.slice(1), 16) : Number(rawColor)
    if (!Number.isInteger(color) || color < 0 || color > 0xffffff) {
      diagnostics.push(error('nbt.potion_color', '药水颜色必须是 0–16777215 的整数或 #RRGGBB', 'potionColor'))
    } else {
      parts.push(`CustomPotionColor:${color}`)
    }
  }
  const potionEffects = options.potionEffects ?? []
  if (potionEffects.length) {
    const serialized = serializePotionEffects(potionEffects, gameVersion, diagnostics)
    if (serialized) parts.push(serialized)
  }

  const serializeBlockList = (values: string[], field: 'canDestroy' | 'canPlaceOn', tag: 'CanDestroy' | 'CanPlaceOn'): void => {
    if (values.length > 128) diagnostics.push(error(`nbt.${field}.count`, `${tag} 最多 128 项`, field))
    const ids = values.slice(0, 128).flatMap((value) => {
      const id = validResource(value, field, diagnostics, true)
      return id ? [snbtString(id)] : []
    })
    if (ids.length) parts.push(`${tag}:[${ids.join(',')}]`)
  }
  serializeBlockList(options.canDestroy ?? [], 'canDestroy', 'CanDestroy')
  serializeBlockList(options.canPlaceOn ?? [], 'canPlaceOn', 'CanPlaceOn')

  const spawner = serializeSpawner(options, gameVersion, diagnostics)
  if (spawner) parts.push(spawner)

  const nbt = parts.length > 0 ? `{${parts.join(',')}}` : ''
  return {
    text: `give ${target.text} ${item}${nbt} ${count?.value ?? 1}`,
    diagnostics
  }
}
