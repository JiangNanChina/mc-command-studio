import { error } from './diagnostics'
import type { BuildResult, Diagnostic } from './types'

export type GameruleAction = 'set' | 'query'
export type GameruleType = 'boolean' | 'integer'

export interface GameruleOptions {
  action: GameruleAction
  rule: string
  type: GameruleType
  value: string
}

export function createDefaultGameruleOptions(): GameruleOptions {
  return {
    action: 'set',
    rule: 'keep_inventory',
    type: 'boolean',
    value: 'false'
  }
}

export function buildGameruleCommand(options: GameruleOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const rule = options.rule.trim().replace(/^minecraft:/, '')
  if (!/^[a-z0-9_]+$/.test(rule)) {
    diagnostics.push(error('gamerule.rule', '游戏规则名不合法', 'rule'))
  }
  if (options.action === 'query') {
    return { text: `gamerule ${rule}`, diagnostics }
  }

  const value = options.value.trim()
  if (options.type === 'boolean') {
    if (value !== 'true' && value !== 'false') {
      diagnostics.push(error('gamerule.value', '布尔规则只能是 true 或 false', 'value'))
    }
  } else if (!/^-?\d+$/.test(value)) {
    diagnostics.push(error('gamerule.value', '整数规则必须是整数', 'value'))
  }
  return { text: `gamerule ${rule} ${value}`, diagnostics }
}
