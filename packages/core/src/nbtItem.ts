import { error } from './diagnostics'
import { resourceId, snbtString } from './escape'
import { serializeSelector, type Selector } from './selector'
import { isValidResourceLocation, parseNumberUnit } from './units'
import type { BuildResult, Diagnostic } from './types'

export interface NbtEnchantment {
  id: string
  level: string
}

export interface NbtGiveOptions {
  target: Selector
  item: string
  count: string
  name: string
  lore: string
  enchantments: NbtEnchantment[]
  unbreakable: boolean
}

export function createDefaultNbtGiveOptions(): NbtGiveOptions {
  return {
    target: { base: '@s' },
    item: 'minecraft:diamond_sword',
    count: '1',
    name: '',
    lore: '',
    enchantments: [],
    unbreakable: false
  }
}

function textJson(value: string): string {
  return JSON.stringify({ text: value })
}

export function buildNbtGiveCommand(options: NbtGiveOptions): BuildResult {
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

  const nbt = parts.length > 0 ? `{${parts.join(',')}}` : ''
  return {
    text: `give ${target.text} ${item}${nbt} ${count?.value ?? 1}`,
    diagnostics
  }
}
