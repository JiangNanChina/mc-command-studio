import { error, warn } from './diagnostics'
import { resourceId } from './escape'
import {
  RARITIES,
  createDefaultGiveOptions,
  type EnchantmentEntry,
  type GiveOptions,
  type ItemComponent,
  type ItemStack,
  type Rarity,
  type TextLine
} from './item'
import type { Selector, SelectorScore } from './selector'
import type { Diagnostic } from './types'

export interface ParseGiveResult {
  ok: boolean
  options: GiveOptions
  diagnostics: Diagnostic[]
}

function splitTopLevel(input: string, delimiter: ',' | ' '): string[] {
  const parts: string[] = []
  let current = ''
  let depth = 0
  let quote = ''
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    if (quote) {
      current += char
      if (char === '\\') {
        current += input[i + 1] ?? ''
        i += 1
      } else if (char === quote) {
        quote = ''
      }
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      current += char
    } else if (char === '[' || char === '{') {
      depth += 1
      current += char
    } else if (char === ']' || char === '}') {
      depth -= 1
      current += char
    } else if (char === delimiter && depth === 0) {
      if (current.trim()) parts.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function unquote(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length < 2) return trimmed
  const quote = trimmed[0]
  if ((quote !== '"' && quote !== "'") || trimmed[trimmed.length - 1] !== quote) return trimmed
  const inner = trimmed.slice(1, -1)
  let result = ''
  for (let i = 0; i < inner.length; i += 1) {
    const char = inner[i]
    if (char !== '\\') {
      result += char
      continue
    }
    const next = inner[i + 1]
    i += 1
    switch (next) {
      case 'n':
        result += '\n'
        break
      case 't':
        result += '\t'
        break
      case 'r':
        result += '\r'
        break
      default:
        result += next ?? ''
    }
  }
  return result
}

function topLevelIndex(input: string, target: '=' | ':'): number {
  let depth = 0
  let quote = ''
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    if (quote) {
      if (char === '\\') i += 1
      else if (char === quote) quote = ''
      continue
    }
    if (char === '"' || char === "'") quote = char
    else if (char === '[' || char === '{') depth += 1
    else if (char === ']' || char === '}') depth -= 1
    else if (char === target && depth === 0) return i
  }
  return -1
}

function topLevelLastIndex(input: string, target: ':'): number {
  let depth = 0
  let quote = ''
  let found = -1
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    if (quote) {
      if (char === '\\') i += 1
      else if (char === quote) quote = ''
      continue
    }
    if (char === '"' || char === "'") quote = char
    else if (char === '[' || char === '{') depth += 1
    else if (char === ']' || char === '}') depth -= 1
    else if (char === target && depth === 0) found = i
  }
  return found
}

function parseTextLine(value: string): TextLine | null {
  const trimmed = value.trim()
  if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
    const decoded = unquote(trimmed)
    // Before 1.21.5, item text components contain JSON encoded inside an SNBT string.
    if (decoded.startsWith('{')) return parseTextLine(decoded)
    if (decoded.startsWith('[')) return null
    return { text: decoded, color: '', italic: false }
  }
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null
  const fields = new Map<string, string>()
  for (const field of splitTopLevel(trimmed.slice(1, -1), ',')) {
    const separator = topLevelIndex(field, ':')
    if (separator < 0) return null
    const key = unquote(field.slice(0, separator))
    // Preserve complex text components as raw instead of dropping styles or children.
    if (!['text', 'color', 'italic'].includes(key) || fields.has(key)) return null
    fields.set(key, field.slice(separator + 1).trim())
  }
  const text = fields.get('text')
  if (!text || !/^("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')$/s.test(text)) return null
  const italic = fields.get('italic')
  if (italic !== undefined && !['true', 'false', '1b', '0b'].includes(italic)) return null
  return {
    text: unquote(text),
    color: (unquote(fields.get('color') ?? '') as TextLine['color']),
    italic: italic === 'true' || italic === '1b'
  }
}

function parseLore(value: string): TextLine[] | null {
  const trimmed = value.trim()
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return null
  const inner = trimmed.slice(1, -1).trim()
  if (!inner) return []
  const lines: TextLine[] = []
  for (const part of splitTopLevel(inner, ',')) {
    const line = parseTextLine(part)
    if (!line) return null
    lines.push(line)
  }
  return lines
}

function parseEnchantments(value: string): EnchantmentEntry[] | null {
  const trimmed = value.trim()
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null
  const inner = trimmed.slice(1, -1).trim()
  if (!inner) return []
  const parts = splitTopLevel(inner, ',')
  const wrapper = topLevelIndex(parts[0], ':')
  if (wrapper >= 0 && unquote(parts[0].slice(0, wrapper)) === 'levels') {
    // A show_in_tooltip override cannot be represented by the simple form.
    return parts.length === 1 ? parseEnchantments(parts[0].slice(wrapper + 1)) : null
  }
  const entries: EnchantmentEntry[] = []
  for (const part of parts) {
    const index = topLevelLastIndex(part, ':')
    if (index < 0) return null
    const id = unquote(part.slice(0, index).trim())
    const level = Number(part.slice(index + 1).trim())
    if (!id || !Number.isInteger(level)) return null
    entries.push({ id: id.includes(':') ? id : `minecraft:${id}`, level })
  }
  return entries
}

function parseScores(value: string): Record<string, SelectorScore> | null {
  const trimmed = value.trim()
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null
  const inner = trimmed.slice(1, -1).trim()
  if (!inner) return {}
  const scores: Record<string, SelectorScore> = {}
  for (const part of splitTopLevel(inner, ',')) {
    const index = topLevelIndex(part, '=')
    if (index < 0) return null
    const objective = part.slice(0, index).trim()
    const range = part.slice(index + 1).trim()
    if (!objective) return null
    if (range.includes('..')) {
      const [min, max] = range.split('..')
      scores[objective] = {
        min: min === '' ? null : Number(min),
        max: max === '' ? null : Number(max)
      }
    } else {
      const exact = Number(range)
      scores[objective] = { min: exact, max: exact }
    }
  }
  return scores
}

function parseSelectorToken(token: string, diagnostics: Diagnostic[]): Selector | null {
  const match = token.match(/^@([praesn])(?:\[(.*)\])?$/s)
  if (!match) {
    diagnostics.push(error('parse.selector', `目标选择器格式不正确：${token}`, 'target'))
    return null
  }
  const base = `@${match[1]}` as Selector['base']
  const selector: Selector = { base }
  if (!match[2]) return selector

  for (const part of splitTopLevel(match[2], ',')) {
    const index = topLevelIndex(part, '=')
    if (index < 0) {
      diagnostics.push(warn('parse.selector.arg', `无法识别的选择器参数：${part}`, 'target'))
      continue
    }
    const key = part.slice(0, index).trim()
    const raw = part.slice(index + 1).trim()
    switch (key) {
      case 'name':
        selector.name = unquote(raw)
        break
      case 'type':
        selector.type = unquote(raw)
        break
      case 'tag':
        selector.tag = unquote(raw)
        break
      case 'distance':
        selector.distance = raw
        break
      case 'level':
        selector.level = raw
        break
      case 'gamemode':
        selector.gamemode = raw as Selector['gamemode']
        break
      case 'limit':
        selector.limit = Number(raw)
        break
      case 'sort':
        selector.sort = raw as Selector['sort']
        break
      case 'x':
      case 'y':
      case 'z':
      case 'dx':
      case 'dy':
      case 'dz':
        selector[key] = raw
        break
      case 'team':
        selector.team = unquote(raw)
        break
      case 'nbt':
        selector.nbt = raw
        break
      case 'scores': {
        const scores = parseScores(raw)
        if (scores) selector.scores = scores
        else diagnostics.push(warn('parse.selector.scores', 'scores 解析失败，已忽略', 'target'))
        break
      }
      default:
        diagnostics.push(warn('parse.selector.unknown', `暂不支持的选择器参数：${key}`, 'target'))
    }
  }
  return selector
}

function parseItemToken(token: string, diagnostics: Diagnostic[]): ItemStack | null {
  const start = token.indexOf('[')
  const id = (start >= 0 ? token.slice(0, start) : token).trim()
  if (!id) {
    diagnostics.push(error('parse.item', '物品 ID 为空', 'item'))
    return null
  }
  if (start < 0) return { id: resourceId(id), components: [] }
  if (!token.trim().endsWith(']')) {
    diagnostics.push(error('parse.item', '物品组件括号不完整', 'item'))
    return null
  }
  const inner = token.slice(start + 1, token.lastIndexOf(']')).trim()
  const components: ItemComponent[] = []
  if (inner) {
    for (const part of splitTopLevel(inner, ',')) {
      const index = topLevelIndex(part, '=')
      if (index < 0) {
        diagnostics.push(warn('parse.item.component', `无法识别的组件：${part}`, 'components'))
        continue
      }
      const rawKey = part.slice(0, index).trim()
      const key = rawKey.replace(/^minecraft:/, '')
      const value = part.slice(index + 1).trim()
      switch (key) {
        case 'custom_name':
        case 'item_name': {
          const line = parseTextLine(value)
          if (line) {
            components.push({
              kind: key,
              text: line.text,
              color: line.color,
              italic: line.italic
            })
          } else {
            components.push({ kind: 'raw', id: key, value })
          }
          break
        }
        case 'lore': {
          const lines = parseLore(value)
          if (lines) components.push({ kind: 'lore', lines })
          else components.push({ kind: 'raw', id: key, value })
          break
        }
        case 'enchantments': {
          const entries = parseEnchantments(value)
          if (entries) components.push({ kind: 'enchantments', entries })
          else components.push({ kind: 'raw', id: key, value })
          break
        }
        case 'unbreakable':
          components.push({ kind: 'unbreakable' })
          break
        case 'max_stack_size':
        case 'max_damage':
        case 'damage': {
          const parsed = Number(value)
          if (Number.isInteger(parsed)) {
            components.push({ kind: key, value: parsed } as ItemComponent)
          } else {
            components.push({ kind: 'raw', id: key, value })
          }
          break
        }
        case 'rarity': {
          const rarity = unquote(value) as Rarity
          if ((RARITIES as readonly string[]).includes(rarity)) {
            components.push({ kind: 'rarity', value: rarity })
          } else {
            components.push({ kind: 'raw', id: key, value })
          }
          break
        }
        case 'enchantment_glint_override':
          components.push({ kind: 'enchantment_glint_override', value: value === 'true' })
          break
        case 'custom_model_data':
        case 'custom_data':
          components.push({ kind: key, raw: value })
          break
        default:
          components.push({ kind: 'raw', id: rawKey, value })
      }
    }
  }
  return { id: resourceId(id), components }
}

/** 解析 /give 命令，尽量还原为表单；无法识别的内容保留为 raw 组件。 */
export function parseGiveCommand(input: string): ParseGiveResult {
  const diagnostics: Diagnostic[] = []
  const defaults = createDefaultGiveOptions()
  const cleaned = input.trim().replace(/^\//, '')
  const tokens = splitTopLevel(cleaned, ' ')

  if (tokens[0] !== 'give') {
    diagnostics.push(error('parse.give', '目前只支持导入 /give 命令', 'command'))
    return { ok: false, options: defaults, diagnostics }
  }
  if (tokens.length < 3) {
    diagnostics.push(error('parse.give.usage', '用法：/give <目标> <物品> [数量]', 'command'))
    return { ok: false, options: defaults, diagnostics }
  }
  if (tokens.length > 4) {
    diagnostics.push(warn('parse.give.extra', '命令包含多余参数，已忽略多余部分', 'command'))
  }

  const target = parseSelectorToken(tokens[1], diagnostics) ?? defaults.target
  const item = parseItemToken(tokens[2], diagnostics)
  if (!item) {
    return { ok: false, options: { ...defaults, target }, diagnostics }
  }

  let count = 1
  if (tokens[3]) {
    const parsed = Number(tokens[3])
    if (Number.isInteger(parsed) && parsed > 0) count = parsed
    else diagnostics.push(error('parse.give.count', '数量必须是大于 0 的整数', 'count'))
  }

  return {
    ok: !diagnostics.some((diagnostic) => diagnostic.severity === 'error'),
    options: { target, item, count },
    diagnostics
  }
}
