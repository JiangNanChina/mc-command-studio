import { containsControlCharacters } from './escape'
import { error, warn } from './diagnostics'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type XpAction = 'add' | 'set' | 'query'
export type XpUnit = 'points' | 'levels'

export interface XpOptions {
  action: XpAction
  target: Selector
  amount: string
  unit: XpUnit
}

export function createDefaultXpOptions(): XpOptions {
  return {
    action: 'add',
    target: { base: '@s' },
    amount: '100',
    unit: 'points'
  }
}

export function buildXpCommand(options: XpOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)

  const parts = ['xp', options.action, target.text]

  if (options.action !== 'query') {
    const amount = options.amount.trim()
    if (!amount) {
      diagnostics.push(error('xp.amount', '数量不能为空', 'amount'))
    } else if (!/^\d+$/.test(amount) || Number(amount) > 2_147_483_647) {
      diagnostics.push(error('xp.amount', '数量必须是 0–2,147,483,647 的整数', 'amount'))
    }
    parts.push(amount)
  }

  if (options.unit !== 'points') parts.push(options.unit)

  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (containsControlCharacters(text)) {
    diagnostics.push(warn('xp.control', '命令中包含不可见控制字符'))
  }
  return { text, diagnostics }
}
