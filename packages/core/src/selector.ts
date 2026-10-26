import { error, warn } from './diagnostics'
import { resourceId, selectorValue } from './escape'
import type { BuildResult, Diagnostic } from './types'

export type SelectorBase = '@p' | '@r' | '@a' | '@e' | '@s' | '@n'

export type SortOrder = 'nearest' | 'furthest' | 'random' | 'arbitrary'

export interface SelectorScore {
  min?: number | null
  max?: number | null
}

export interface Selector {
  base: SelectorBase
  name?: string
  type?: string
  tag?: string
  distance?: string
  level?: string
  gamemode?: 'survival' | 'creative' | 'adventure' | 'spectator'
  limit?: number | null
  sort?: SortOrder
  x?: string
  y?: string
  z?: string
  dx?: string
  dy?: string
  dz?: string
  scores?: Record<string, SelectorScore>
  nbt?: string
  team?: string
}

export const SELECTOR_BASES: { value: SelectorBase; label: string; hint: string }[] = [
  { value: '@s', label: '@s 自己', hint: '执行者自己（命令方块中通常无效）' },
  { value: '@p', label: '@p 最近玩家', hint: '最近的玩家' },
  { value: '@a', label: '@a 所有玩家', hint: '所有玩家，包含已死亡玩家' },
  { value: '@r', label: '@r 随机玩家', hint: '随机一名玩家' },
  { value: '@n', label: '@n 最近实体', hint: '距离最近的实体' },
  { value: '@e', label: '@e 所有实体', hint: '所有实体，可能包含非玩家' }
]

export function createDefaultSelector(): Selector {
  return { base: '@s' }
}

export function selectorHasFilters(selector: Selector): boolean {
  return Boolean(
    selector.name ||
      selector.type ||
      selector.tag ||
      selector.distance ||
      selector.level ||
      selector.gamemode ||
      (selector.limit !== null && selector.limit !== undefined) ||
      selector.sort ||
      selector.x ||
      selector.y ||
      selector.z ||
      selector.dx ||
      selector.dy ||
      selector.dz ||
      (selector.scores && Object.keys(selector.scores).length > 0) ||
      selector.nbt ||
      selector.team
  )
}

const COORDINATE = /^[~^]?-?\d*(?:\.\d+)?$/
const RANGE = /^(?:-?\d+(?:\.\d+)?)?\.\.(?:-?\d+(?:\.\d+)?)?$|^-?\d+(?:\.\d+)?$/
const INTEGER = /^-?\d+$/

function qualified(id: string): string {
  const normalized = resourceId(id)
  return normalized
}

function scoreValue(score: SelectorScore): string {
  const min = score.min ?? null
  const max = score.max ?? null
  if (min === null && max === null) return ''
  if (min !== null && max !== null) return `${min}..${max}`
  if (min !== null) return `${min}..`
  return `..${max}`
}

function isBalancedCompound(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return false
  let depth = 0
  let quoted = false
  let quoteChar = ''
  for (let i = 0; i < trimmed.length; i += 1) {
    const char = trimmed[i]
    if (quoted) {
      if (char === '\\') {
        i += 1
      } else if (char === quoteChar) {
        quoted = false
      }
      continue
    }
    if (char === '"' || char === "'") {
      quoted = true
      quoteChar = char
    } else if (char === '{' || char === '[') {
      depth += 1
    } else if (char === '}' || char === ']') {
      depth -= 1
      if (depth < 0) return false
    }
  }
  return depth === 0
}

/** 序列化目标选择器，返回文本与校验信息。 */
export function serializeSelector(selector: Selector): BuildResult {
  const diagnostics: Diagnostic[] = []

  if (!selector.base) {
    diagnostics.push(error('selector.base', '选择器类型不能为空'))
    return { text: '@s', diagnostics }
  }

  const args: string[] = []

  if (selector.name && selector.name.trim()) {
    args.push(`name=${selectorValue(selector.name.trim())}`)
  }

  if (selector.type && selector.type.trim()) {
    const type = qualified(selector.type.trim())
    if (!/^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(type)) {
      diagnostics.push(error('selector.type', '实体类型必须是合法的资源 ID', 'type'))
    }
    args.push(`type=${type}`)
  }

  if (selector.tag && selector.tag.trim()) {
    args.push(`tag=${selectorValue(selector.tag.trim())}`)
  }

  if (selector.distance && selector.distance.trim()) {
    if (!RANGE.test(selector.distance.trim())) {
      diagnostics.push(error('selector.distance', '距离必须是数字或 a..b 范围', 'distance'))
    }
    args.push(`distance=${selector.distance.trim()}`)
  }

  if (selector.level && selector.level.trim()) {
    if (!RANGE.test(selector.level.trim())) {
      diagnostics.push(error('selector.level', '等级必须是数字或 a..b 范围', 'level'))
    }
    args.push(`level=${selector.level.trim()}`)
  }

  if (selector.gamemode) {
    args.push(`gamemode=${selector.gamemode}`)
  }

  if (selector.limit !== null && selector.limit !== undefined) {
    if (!Number.isInteger(selector.limit) || selector.limit < 1) {
      diagnostics.push(error('selector.limit', '数量上限必须是大于 0 的整数', 'limit'))
    } else {
      args.push(`limit=${selector.limit}`)
    }
  }

  if (selector.sort) {
    args.push(`sort=${selector.sort}`)
  }

  for (const axis of ['x', 'y', 'z'] as const) {
    const value = selector[axis]
    if (value && value.trim()) {
      if (!COORDINATE.test(value.trim())) {
        diagnostics.push(error(`selector.${axis}`, `${axis.toUpperCase()} 坐标格式不正确`, axis))
      }
      args.push(`${axis}=${value.trim()}`)
    }
  }

  for (const axis of ['dx', 'dy', 'dz'] as const) {
    const value = selector[axis]
    if (value && value.trim()) {
      if (!RANGE.test(value.trim())) {
        diagnostics.push(error(`selector.${axis}`, `${axis} 必须是数字或范围`, axis))
      }
      args.push(`${axis}=${value.trim()}`)
    }
  }

  if (selector.scores && Object.keys(selector.scores).length > 0) {
    const parts: string[] = []
    for (const [objective, score] of Object.entries(selector.scores)) {
      if (!objective.trim()) {
        diagnostics.push(error('selector.scores', '记分板目标名不能为空', 'scores'))
        continue
      }
      const value = scoreValue(score)
      if (!value || !RANGE.test(value)) {
        diagnostics.push(
          error('selector.scores', `记分板 ${objective} 的值必须是数字或 a..b 范围`, 'scores')
        )
        continue
      }
      parts.push(`${objective.trim()}=${value}`)
    }
    if (parts.length > 0) args.push(`scores={${parts.join(',')}}`)
  }

  if (selector.nbt && selector.nbt.trim()) {
    if (!isBalancedCompound(selector.nbt.trim())) {
      diagnostics.push(error('selector.nbt', 'NBT 必须是一个完整的 {…} 复合标签', 'nbt'))
    }
    args.push(`nbt=${selector.nbt.trim()}`)
  }

  if (selector.team && selector.team.trim()) {
    args.push(`team=${selectorValue(selector.team.trim())}`)
  }

  const text = args.length > 0 ? `${selector.base}[${args.join(',')}]` : selector.base
  return { text, diagnostics }
}

export function describeSelector(selector: Selector): string {
  const { text } = serializeSelector(selector)
  if (!selectorHasFilters(selector)) {
    return `${selector.base}（无筛选条件）`
  }
  return text
}

export function assertIntegerRange(
  value: string,
  field: string,
  diagnostics: Diagnostic[]
): void {
  if (!INTEGER.test(value)) {
    diagnostics.push(error(`${field}.integer`, `${field} 必须是整数`, field))
  }
}

export function warnIfEntityTarget(selector: Selector, diagnostics: Diagnostic[]): void {
  if (selector.base === '@e' || selector.base === '@n') {
    diagnostics.push(
      warn('give.target', 'give 的目标必须是玩家；@e/@n 通常不会生效。建议使用 @s/@p/@a/@r。', 'target')
    )
  }
}
