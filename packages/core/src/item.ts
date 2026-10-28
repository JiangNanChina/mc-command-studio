import { error, warn } from './diagnostics'
import { containsControlCharacters, resourceId, snbtKey, snbtString } from './escape'
import { isBalancedCompound } from './position'
import { serializeSelector, warnIfEntityTarget, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'
import { getVersionCapabilities } from './versionCapabilities'

export const RARITIES = ['common', 'uncommon', 'rare', 'epic'] as const
export type Rarity = (typeof RARITIES)[number]

export const TEXT_COLORS = [
  'black',
  'dark_blue',
  'dark_green',
  'dark_aqua',
  'dark_red',
  'dark_purple',
  'gold',
  'gray',
  'dark_gray',
  'blue',
  'green',
  'aqua',
  'red',
  'light_purple',
  'yellow',
  'white'
] as const

export type TextColor = (typeof TEXT_COLORS)[number]

export interface TextLine {
  text: string
  color?: TextColor | ''
  italic: boolean
}

export interface EnchantmentEntry {
  id: string
  level: number
}

export type AttributeModifierOperation = 'add_value' | 'add_multiplied_base' | 'add_multiplied_total'

export interface AttributeModifierEntry {
  id: string
  type: string
  amount: number
  operation: AttributeModifierOperation
  slot: string
}

export interface PotionEffectEntry {
  id: string
  duration: number
  amplifier: number
  ambient: boolean
  showParticles: boolean
  showIcon: boolean
}

export type ItemComponent =
  | { kind: 'custom_name'; text: string; color?: TextColor | ''; italic: boolean }
  | { kind: 'item_name'; text: string; color?: TextColor | ''; italic: boolean }
  | { kind: 'lore'; lines: TextLine[] }
  | { kind: 'enchantments'; entries: EnchantmentEntry[] }
  | { kind: 'unbreakable' }
  | { kind: 'max_stack_size'; value: number }
  | { kind: 'max_damage'; value: number }
  | { kind: 'damage'; value: number }
  | { kind: 'rarity'; value: Rarity }
  | { kind: 'enchantment_glint_override'; value: boolean }
  | { kind: 'custom_model_data'; raw: string }
  | { kind: 'custom_data'; raw: string }
  | { kind: 'attribute_modifiers'; entries: AttributeModifierEntry[] }
  | { kind: 'potion_contents'; potion: string; customColor?: number | null; effects: PotionEffectEntry[] }
  | { kind: 'can_break' | 'can_place_on'; blocks: string[] }
  | { kind: 'entity_data'; raw: string }
  | { kind: 'item_tags'; tags: string[] }
  | {
      kind: 'block_entity_data'
      entity: string
      delay: number
      minSpawnDelay: number
      maxSpawnDelay: number
      spawnCount: number
      maxNearbyEntities: number
      requiredPlayerRange: number
      spawnRange: number
    }
  | { kind: 'raw'; id: string; value: string }

export interface ItemStack {
  id: string
  components: ItemComponent[]
}

export interface GiveOptions {
  target: Selector
  item: ItemStack
  count: number
}

const COLOR_HEX = /^#[0-9a-fA-F]{6}$/

function isColor(value: string | undefined): boolean {
  if (!value) return true
  return (TEXT_COLORS as readonly string[]).includes(value) || COLOR_HEX.test(value)
}

/** 文本组件的 SNBT 形式：{text:"…",color:"gold",italic:false} */
export function serializeTextComponent(
  line: TextLine,
  diagnostics?: Diagnostic[],
  gameVersion?: string
): string {
  const parts: string[] = [`text:${snbtString(line.text)}`]
  const json: Record<string, string | boolean> = { text: line.text }
  if (line.color) {
    if (!isColor(line.color)) {
      diagnostics?.push(error('item.color', `颜色 ${line.color} 不是有效颜色`, 'color'))
    } else {
      parts.push(`color:${snbtString(line.color)}`)
      json.color = line.color
    }
  }
  parts.push(`italic:${line.italic ? 'true' : 'false'}`)
  json.italic = line.italic
  if (getVersionCapabilities(gameVersion).textComponents === 'json-string') {
    return snbtString(JSON.stringify(json))
  }
  return `{${parts.join(',')}}`
}

function serializeEnchantmentMap(entries: EnchantmentEntry[], diagnostics: Diagnostic[]): string {
  const seen = new Set<string>()
  const parts: string[] = []
  for (const entry of entries) {
    const id = resourceId(entry.id.trim())
    if (!id || id === 'minecraft:') {
      diagnostics.push(error('item.enchantment.id', '附魔 ID 不能为空', 'enchantments'))
      continue
    }
    if (seen.has(id)) {
      diagnostics.push(error('item.enchantment.duplicate', `附魔 ${id} 重复`, 'enchantments'))
      continue
    }
    seen.add(id)
    if (!Number.isInteger(entry.level) || entry.level < 1 || entry.level > 255) {
      diagnostics.push(
        error('item.enchantment.level', `附魔 ${id} 的等级必须是 1–255 的整数`, 'enchantments')
      )
      continue
    }
    parts.push(`${snbtKey(id)}:${entry.level}`)
  }
  return `{${parts.join(',')}}`
}

const RESOURCE_ID = /^#?[a-z0-9_.-]+:[a-z0-9_./-]+$/
const ATTRIBUTE_OPERATIONS: readonly string[] = [
  'add_value',
  'add_multiplied_base',
  'add_multiplied_total'
]
const ATTRIBUTE_SLOTS = new Set([
  'any', 'hand', 'mainhand', 'offhand', 'armor', 'feet', 'legs', 'chest', 'head', 'body', 'saddle'
])

function normalizedResourceId(
  value: string,
  field: string,
  diagnostics: Diagnostic[],
  allowTag = false
): string | null {
  const normalized = resourceId(value.trim())
  const validPattern = allowTag ? RESOURCE_ID : /^[a-z0-9_.-]+:[a-z0-9_./-]+$/
  if (!validPattern.test(normalized)) {
    diagnostics.push(error(`item.${field}.id`, `${field} ID “${value}” 格式不正确`, field))
    return null
  }
  return normalized
}

function formatDecimal(value: number): string {
  const text = String(value)
  return Number.isInteger(value) ? `${text}.0` : text
}

function normalizeAttributeType(
  value: string,
  diagnostics: Diagnostic[],
  format: 'generic' | 'bare'
): string | null {
  const type = normalizedResourceId(value, 'attribute_modifiers', diagnostics)
  if (!type) return null
  const [namespace, path] = type.split(':', 2)
  if (format === 'bare' && path.startsWith('generic.')) return `${namespace}:${path.slice('generic.'.length)}`
  if (format === 'generic' && !path.startsWith('generic.') && GENERIC_ATTRIBUTE_IDS.has(path)) {
    return `${namespace}:generic.${path}`
  }
  return type
}

const GENERIC_ATTRIBUTE_IDS = new Set([
  'armor', 'armor_toughness', 'attack_damage', 'attack_knockback', 'attack_speed',
  'burning_time', 'explosion_knockback_resistance', 'fall_damage_multiplier',
  'flying_speed', 'follow_range', 'gravity', 'jump_strength',
  'knockback_resistance', 'luck', 'max_absorption', 'max_health', 'movement_speed',
  'movement_efficiency', 'oxygen_bonus', 'safe_fall_distance', 'scale', 'step_height',
  'water_movement_efficiency'
])

function legacyModifierUuid(id: string): string {
  const words: number[] = []
  for (let lane = 0; lane < 4; lane += 1) {
    let hash = (0x811c9dc5 ^ Math.imul(lane + 1, 0x9e3779b9)) >>> 0
    const input = `${id}#${lane}`
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index)
      hash = Math.imul(hash, 0x01000193) >>> 0
    }
    words.push(hash | 0)
  }
  return `[I;${words.join(',')}]`
}

function serializeAttributeModifiers(
  entries: AttributeModifierEntry[],
  diagnostics: Diagnostic[],
  format: 'legacy' | 'wrapped' | 'list',
  typeFormat: 'generic' | 'bare'
): string | null {
  if (entries.length === 0) {
    diagnostics.push(warn('item.attribute_modifiers.empty', '属性修饰器列表为空，已忽略', 'attribute_modifiers'))
    return null
  }
  const modifiers: string[] = []
  const seenIds = new Set<string>()
  for (const entry of entries) {
    const id = normalizedResourceId(entry.id, 'attribute_modifiers', diagnostics)
    const type = normalizeAttributeType(entry.type, diagnostics, typeFormat)
    let valid = id !== null && type !== null
    if (!Number.isFinite(entry.amount)) {
      diagnostics.push(error('item.attribute_modifiers.amount', '属性修饰值必须是有限数字', 'attribute_modifiers'))
      valid = false
    }
    if (!ATTRIBUTE_OPERATIONS.includes(entry.operation)) {
      diagnostics.push(error('item.attribute_modifiers.operation', '属性运算必须是 add_value/add_multiplied_base/add_multiplied_total', 'attribute_modifiers'))
      valid = false
    }
    if (!ATTRIBUTE_SLOTS.has(entry.slot)) {
      diagnostics.push(error('item.attribute_modifiers.slot', `装备槽位 ${entry.slot} 不合法`, 'attribute_modifiers'))
      valid = false
    }
    if (id && seenIds.has(id)) {
      diagnostics.push(error('item.attribute_modifiers.duplicate', `属性修饰器 ID ${id} 重复`, 'attribute_modifiers'))
      valid = false
    }
    if (!valid || !id || !type) continue
    seenIds.add(id)
    if (format === 'legacy') {
      modifiers.push(
        `{type:${snbtString(type)},amount:${formatDecimal(entry.amount)},name:${snbtString(id)},operation:${snbtString(entry.operation)},slot:${snbtString(entry.slot)},uuid:${legacyModifierUuid(id)}}`
      )
    } else {
      modifiers.push(
        `{id:${snbtString(id)},type:${snbtString(type)},amount:${formatDecimal(entry.amount)},operation:${snbtString(entry.operation)},slot:${snbtString(entry.slot)}}`
      )
    }
  }
  if (modifiers.length === 0) return null
  return format === 'list'
    ? `[${modifiers.join(',')}]`
    : `{modifiers:[${modifiers.join(',')}],show_in_tooltip:true}`
}

function serializeItemTags(tags: string[], diagnostics: Diagnostic[]): string | null {
  if (tags.length === 0) {
    diagnostics.push(warn('item.item_tags.empty', '物品标签列表为空，已忽略', 'item_tags'))
    return null
  }
  const seen = new Set<string>()
  const values: string[] = []
  for (const tagValue of tags) {
    const tag = tagValue.trim()
    if (!tag) {
      diagnostics.push(error('item.item_tags.empty_value', '物品标签不能为空或只包含空白', 'item_tags'))
      continue
    }
    if (/[\u0000-\u001f\u007f]/.test(tag)) {
      diagnostics.push(error('item.item_tags.control', '物品标签不能包含控制字符', 'item_tags'))
      continue
    }
    if (seen.has(tag)) {
      diagnostics.push(error('item.item_tags.duplicate', `物品标签 ${tag} 重复`, 'item_tags'))
      continue
    }
    seen.add(tag)
    values.push(snbtString(tag))
  }
  return values.length > 0 ? `{Tags:[${values.join(',')}]}` : null
}

function serializePotionContents(
  component: Extract<ItemComponent, { kind: 'potion_contents' }>,
  diagnostics: Diagnostic[]
): string | null {
  const fields: string[] = []
  if (component.potion.trim()) {
    const potion = normalizedResourceId(component.potion, 'potion_contents', diagnostics)
    if (potion) fields.push(`potion:${snbtString(potion)}`)
  }
  if (component.customColor !== undefined && component.customColor !== null) {
    if (!Number.isInteger(component.customColor) || component.customColor < 0 || component.customColor > 0xffffff) {
      diagnostics.push(error('item.potion_contents.color', '自定义药水颜色必须是 0–16777215 的整数', 'potion_contents'))
    } else {
      fields.push(`custom_color:${component.customColor}`)
    }
  }
  const effects: string[] = []
  for (const effect of component.effects) {
    const id = normalizedResourceId(effect.id, 'potion_contents', diagnostics)
    let valid = id !== null
    if (!Number.isInteger(effect.duration) || effect.duration < 0 || effect.duration > 2147483647) {
      diagnostics.push(error('item.potion_contents.duration', '效果时长必须是 0–2147483647 的整数 tick', 'potion_contents'))
      valid = false
    }
    if (!Number.isInteger(effect.amplifier) || effect.amplifier < 0 || effect.amplifier > 255) {
      diagnostics.push(error('item.potion_contents.amplifier', '效果等级必须是 0–255 的整数', 'potion_contents'))
      valid = false
    }
    if (!valid || !id) continue
    effects.push(
      `{id:${snbtString(id)},duration:${effect.duration},amplifier:${effect.amplifier},ambient:${effect.ambient ? '1b' : '0b'},show_particles:${effect.showParticles ? '1b' : '0b'},show_icon:${effect.showIcon ? '1b' : '0b'}}`
    )
  }
  if (effects.length > 0) fields.push(`custom_effects:[${effects.join(',')}]`)
  if (fields.length === 0) {
    diagnostics.push(warn('item.potion_contents.empty', '药水内容为空，已忽略', 'potion_contents'))
    return null
  }
  return `{${fields.join(',')}}`
}

function serializeBlockPredicates(
  blocks: string[],
  diagnostics: Diagnostic[],
  kind: 'can_break' | 'can_place_on',
  format: 'wrapped' | 'list'
): string | null {
  if (blocks.length === 0) {
    diagnostics.push(warn(`item.${kind}.empty`, '方块列表为空，已忽略', kind))
    return null
  }
  const predicates: string[] = []
  for (const block of blocks) {
    const id = normalizedResourceId(block, kind, diagnostics, true)
    if (id) predicates.push(`{blocks:${snbtString(id)}}`)
  }
  if (predicates.length === 0) return null
  return format === 'list'
    ? `[${predicates.join(',')}]`
    : `{predicates:[${predicates.join(',')}],show_in_tooltip:true}`
}

function serializeEntityData(rawValue: string, diagnostics: Diagnostic[]): string | null {
  const raw = rawValue.trim()
  if (!raw) {
    diagnostics.push(error('item.entity_data', 'entity_data 不能为空', 'entity_data'))
    return null
  }
  if (containsControlCharacters(raw) || !isBalancedCompound(raw)) {
    diagnostics.push(error('item.entity_data', 'entity_data 必须是完整、单行的 {…} 复合标签', 'entity_data'))
    return null
  }
  return raw
}

function serializeSpawnerData(
  component: Extract<ItemComponent, { kind: 'block_entity_data' }>,
  diagnostics: Diagnostic[]
): string | null {
  const entity = normalizedResourceId(component.entity, 'block_entity_data', diagnostics)
  const numericFields: [keyof typeof component, string, number, number][] = [
    ['delay', 'Delay', -1, 32767],
    ['minSpawnDelay', 'MinSpawnDelay', 0, 32767],
    ['maxSpawnDelay', 'MaxSpawnDelay', 0, 32767],
    ['spawnCount', 'SpawnCount', 0, 32767],
    ['maxNearbyEntities', 'MaxNearbyEntities', 0, 32767],
    ['requiredPlayerRange', 'RequiredPlayerRange', 0, 32767],
    ['spawnRange', 'SpawnRange', 0, 32767]
  ]
  const values = new Map<string, number>()
  for (const [key, label, min, max] of numericFields) {
    const value = component[key]
    if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
      diagnostics.push(error(`item.block_entity_data.${key}`, `${label} 必须是 ${min}–${max} 的整数`, 'block_entity_data'))
    } else {
      values.set(label, value)
    }
  }
  const minDelay = values.get('MinSpawnDelay')
  const maxDelay = values.get('MaxSpawnDelay')
  if (minDelay !== undefined && maxDelay !== undefined && minDelay > maxDelay) {
    diagnostics.push(error('item.block_entity_data.delay_range', 'MinSpawnDelay 不能大于 MaxSpawnDelay', 'block_entity_data'))
  }
  if (!entity || values.size !== numericFields.length || (minDelay !== undefined && maxDelay !== undefined && minDelay > maxDelay)) {
    return null
  }
  const numeric = numericFields.map(([, label]) => `${label}:${values.get(label)}s`)
  return `{id:${snbtString('minecraft:mob_spawner')},${numeric.join(',')},SpawnData:{entity:{id:${snbtString(entity)}}}}`
}

/** 序列化一个物品（含组件），不校验物品是否存在于当前版本注册表。 */
export function serializeItemStack(item: ItemStack, gameVersion?: string): BuildResult {
  const diagnostics: Diagnostic[] = []
  const capabilities = getVersionCapabilities(gameVersion)
  if (!capabilities.itemComponents && item.components.length > 0) {
    diagnostics.push(error('item.components.version', '该版本使用物品 NBT，请使用 NBT 物品编辑器', 'components'))
  }
  const rawId = item.id.trim()
  if (!rawId) {
    diagnostics.push(error('item.id', '物品 ID 不能为空', 'item'))
    return { text: 'minecraft:air', diagnostics }
  }
  if (rawId.startsWith('#')) {
    diagnostics.push(error('item.id', 'give 的物品不能是标签（#）', 'item'))
  }
  const id = resourceId(rawId)
  if (!/^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(id)) {
    diagnostics.push(error('item.id', `物品 ID “${id}” 格式不正确`, 'item'))
  }

  const seen = new Set<string>()
  const parts: string[] = []

  for (const component of item.components) {
    const duplicateKey = component.kind === 'raw'
      ? `component:${resourceId(component.id.trim())}`
      : `component:${component.kind === 'item_tags' ? 'minecraft:custom_data' : `minecraft:${component.kind}`}`
    if (seen.has(duplicateKey)) {
      diagnostics.push(
        error('item.component.duplicate', `组件 ${duplicateKey} 重复，只保留第一个`, 'components')
      )
      continue
    }
    seen.add(duplicateKey)

    switch (component.kind) {
      case 'custom_name':
      case 'item_name': {
        if (!component.text.trim()) {
          diagnostics.push(error(`item.${component.kind}`, '名称不能为空', component.kind))
          continue
        }
        const text = serializeTextComponent(
          { text: component.text, color: component.color, italic: component.italic },
          diagnostics,
          gameVersion
        )
        parts.push(`${component.kind}=${text}`)
        break
      }
      case 'lore': {
        if (component.lines.length === 0) {
          parts.push('lore=[]')
          break
        }
        const lines = component.lines
          .filter((line) => line.text.trim().length > 0)
          .map((line) => serializeTextComponent(line, diagnostics, gameVersion))
        parts.push(`lore=[${lines.join(',')}]`)
        break
      }
      case 'enchantments': {
        if (component.entries.length === 0) {
          diagnostics.push(warn('item.enchantments.empty', '附魔列表为空，已忽略', 'enchantments'))
          continue
        }
        const levels = serializeEnchantmentMap(component.entries, diagnostics)
        parts.push(`enchantments=${capabilities.enchantments === 'levels' ? `{levels:${levels}}` : levels}`)
        break
      }
      case 'unbreakable': {
        parts.push('unbreakable={}')
        break
      }
      case 'max_stack_size': {
        if (!Number.isInteger(component.value) || component.value < 1 || component.value > 99) {
          diagnostics.push(
            error('item.max_stack_size', '最大堆叠数必须是 1–99 的整数', 'max_stack_size')
          )
          continue
        }
        parts.push(`max_stack_size=${component.value}`)
        break
      }
      case 'max_damage': {
        if (!Number.isInteger(component.value) || component.value < 1) {
          diagnostics.push(error('item.max_damage', '最大耐久必须是大于 0 的整数', 'max_damage'))
          continue
        }
        parts.push(`max_damage=${component.value}`)
        break
      }
      case 'damage': {
        if (!Number.isInteger(component.value) || component.value < 0) {
          diagnostics.push(error('item.damage', '已消耗耐久必须是大于等于 0 的整数', 'damage'))
          continue
        }
        parts.push(`damage=${component.value}`)
        break
      }
      case 'rarity': {
        if (!(RARITIES as readonly string[]).includes(component.value)) {
          diagnostics.push(error('item.rarity', '稀有度必须是 common/uncommon/rare/epic', 'rarity'))
          continue
        }
        parts.push(`rarity=${component.value}`)
        break
      }
      case 'enchantment_glint_override': {
        parts.push(`enchantment_glint_override=${component.value ? 'true' : 'false'}`)
        break
      }
      case 'custom_data': {
        const raw = component.raw.trim()
        if (!raw) {
          diagnostics.push(error('item.custom_data', 'custom_data 不能为空', 'custom_data'))
          continue
        }
        if (!isBalancedCompound(raw)) {
          diagnostics.push(error('item.custom_data', 'custom_data 必须是完整的 {…}', 'custom_data'))
          continue
        }
        parts.push(`custom_data=${raw}`)
        break
      }
      case 'attribute_modifiers': {
        const value = serializeAttributeModifiers(
          component.entries,
          diagnostics,
          capabilities.attributeModifiers,
          capabilities.attributeTypeFormat
        )
        if (value !== null) parts.push(`attribute_modifiers=${value}`)
        break
      }
      case 'potion_contents': {
        const value = serializePotionContents(component, diagnostics)
        if (value !== null) parts.push(`potion_contents=${value}`)
        break
      }
      case 'can_break':
      case 'can_place_on': {
        const value = serializeBlockPredicates(component.blocks, diagnostics, component.kind, capabilities.blockPredicates)
        if (value !== null) parts.push(`${component.kind}=${value}`)
        break
      }
      case 'entity_data': {
        const value = serializeEntityData(component.raw, diagnostics)
        if (value !== null) parts.push(`entity_data=${value}`)
        break
      }
      case 'item_tags': {
        const value = serializeItemTags(component.tags, diagnostics)
        if (value !== null) parts.push(`custom_data=${value}`)
        break
      }
      case 'block_entity_data': {
        const value = serializeSpawnerData(component, diagnostics)
        if (value !== null) parts.push(`block_entity_data=${value}`)
        break
      }
      case 'raw': {
        const id = resourceId(component.id.trim())
        const value = component.value.trim()
        if (!id || id === 'minecraft:') {
          diagnostics.push(error('item.raw.id', '自定义组件 ID 不能为空', 'raw'))
          continue
        }
        if (!value) {
          diagnostics.push(error('item.raw.value', `组件 ${id} 的值不能为空`, 'raw'))
          continue
        }
        parts.push(`${snbtKey(id)}=${value}`)
        break
      }
      case 'custom_model_data': {
        const raw = component.raw.trim()
        if (!raw) {
          diagnostics.push(
            error('item.custom_model_data', '自定义模型数据不能为空', 'custom_model_data')
          )
          continue
        }
        if (capabilities.customModelData === 'integer') {
          const value = Number(raw)
          if (!/^-?\d+$/.test(raw) || !Number.isSafeInteger(value) || value < -2147483648 || value > 2147483647) {
            diagnostics.push(error('item.custom_model_data', '1.21.4 以前的自定义模型数据必须是 32 位整数', 'custom_model_data'))
          }
        } else if (!isBalancedCompound(raw)) {
          diagnostics.push(error('item.custom_model_data', '此版本的自定义模型数据必须是 {floats:[…],flags:[…],strings:[…],colors:[…]} 复合标签', 'custom_model_data'))
        }
        parts.push(`custom_model_data=${raw}`)
        break
      }
    }
  }

  const componentText = parts.length > 0 ? `[${parts.join(',')}]` : ''
  return { text: `${id}${componentText}`, diagnostics }
}

export function createDefaultItem(): ItemStack {
  return { id: 'minecraft:diamond_sword', components: [] }
}

export function createDefaultGiveOptions(): GiveOptions {
  return {
    target: { base: '@s' },
    item: createDefaultItem(),
    count: 1
  }
}

/** 生成完整的 /give 命令。 */
export function buildGiveCommand(options: GiveOptions, gameVersion?: string): BuildResult {
  const diagnostics: Diagnostic[] = []
  const selector = serializeSelector(options.target)
  diagnostics.push(...selector.diagnostics)
  warnIfEntityTarget(options.target, diagnostics)

  const item = serializeItemStack(options.item, gameVersion)
  diagnostics.push(...item.diagnostics)

  if (!Number.isInteger(options.count) || options.count < 1) {
    diagnostics.push(error('give.count', '数量必须是大于 0 的整数', 'count'))
  } else if (options.count > 99) {
    diagnostics.push(warn('give.count.large', '数量超过 99，可能超过物品最大堆叠', 'count'))
  }

  const countText = options.count !== 1 ? ` ${options.count}` : ''
  const text = `give ${selector.text} ${item.text}${countText}`

  if (text.length > 32500) {
    diagnostics.push(error('give.length', '命令超过命令方块 32,500 字符上限', 'command'))
  }
  if (containsControlCharacters(text)) {
    diagnostics.push(warn('give.control', '命令中包含不可见控制字符，可能导致解析失败'))
  }

  return { text, diagnostics }
}

export function itemComponentLabel(kind: ItemComponent['kind']): string {
  switch (kind) {
    case 'custom_name':
      return '自定义名称'
    case 'item_name':
      return '物品默认名称'
    case 'lore':
      return '描述文本'
    case 'enchantments':
      return '附魔'
    case 'unbreakable':
      return '无法破坏'
    case 'max_stack_size':
      return '最大堆叠'
    case 'max_damage':
      return '最大耐久'
    case 'damage':
      return '已消耗耐久'
    case 'rarity':
      return '稀有度'
    case 'enchantment_glint_override':
      return '附魔光效'
    case 'custom_model_data':
      return '自定义模型数据'
    case 'custom_data':
      return '自定义数据'
    case 'attribute_modifiers':
      return '属性修饰器'
    case 'potion_contents':
      return '药水内容'
    case 'can_break':
      return '可破坏方块'
    case 'can_place_on':
      return '可放置方块'
    case 'entity_data':
      return '实体数据'
    case 'item_tags':
      return '物品标签'
    case 'block_entity_data':
      return '方块实体数据'
    case 'raw':
      return '自定义组件'
  }
}
