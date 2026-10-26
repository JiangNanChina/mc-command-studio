import { error, warn } from './diagnostics'
import { containsControlCharacters, resourceId, snbtKey, snbtString } from './escape'
import { isBalancedCompound } from './position'
import { serializeSelector, warnIfEntityTarget, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

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
export function serializeTextComponent(line: TextLine, diagnostics?: Diagnostic[]): string {
  const parts: string[] = [`text:${snbtString(line.text)}`]
  if (line.color) {
    if (!isColor(line.color)) {
      diagnostics?.push(error('item.color', `颜色 ${line.color} 不是有效颜色`, 'color'))
    } else {
      parts.push(`color:${snbtString(line.color)}`)
    }
  }
  parts.push(`italic:${line.italic ? 'true' : 'false'}`)
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

/** 序列化一个物品（含组件），不校验物品是否存在于当前版本注册表。 */
export function serializeItemStack(item: ItemStack): BuildResult {
  const diagnostics: Diagnostic[] = []
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
    const duplicateKey = component.kind === 'raw' ? `raw:${component.id}` : component.kind
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
          diagnostics
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
          .map((line) => serializeTextComponent(line, diagnostics))
        parts.push(`lore=[${lines.join(',')}]`)
        break
      }
      case 'enchantments': {
        if (component.entries.length === 0) {
          diagnostics.push(warn('item.enchantments.empty', '附魔列表为空，已忽略', 'enchantments'))
          continue
        }
        parts.push(`enchantments=${serializeEnchantmentMap(component.entries, diagnostics)}`)
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
export function buildGiveCommand(options: GiveOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const selector = serializeSelector(options.target)
  diagnostics.push(...selector.diagnostics)
  warnIfEntityTarget(options.target, diagnostics)

  const item = serializeItemStack(options.item)
  diagnostics.push(...item.diagnostics)

  if (!Number.isInteger(options.count) || options.count < 1) {
    diagnostics.push(error('give.count', '数量必须是大于 0 的整数', 'count'))
  } else if (options.count > 99) {
    diagnostics.push(warn('give.count.large', '数量超过 99，可能超过物品最大堆叠', 'count'))
  }

  const countText = options.count !== 1 ? ` ${options.count}` : ''
  const text = `give ${selector.text} ${item.text}${countText}`.replace(/\s+/g, ' ').trim()

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
    case 'raw':
      return '自定义组件'
  }
}
