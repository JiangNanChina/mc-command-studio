import { error } from './diagnostics'
import { resourceId } from './escape'
import { serializePosition, type Position } from './position'
import { serializeSelector, type Selector } from './selector'
import { isValidResourceLocation, parseNumberUnit } from './units'
import type { BuildResult, Diagnostic } from './types'

export type DamageSource = 'none' | 'at' | 'by'

export interface DamageOptions {
  target: Selector
  amount: string
  damageType: string
  source: DamageSource
  position: Position
  sourceEntity: Selector
  causeEntity: Selector
}

export function createDefaultDamageOptions(): DamageOptions {
  return {
    target: { base: '@s' },
    amount: '5',
    damageType: 'minecraft:generic',
    source: 'none',
    position: { x: '~', y: '~', z: '~' },
    sourceEntity: { base: '@s' },
    causeEntity: { base: '@s' }
  }
}

export function buildDamageCommand(options: DamageOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)
  const amount = parseNumberUnit(options.amount, { min: 0 })
  if (!amount) diagnostics.push(error('damage.amount', '伤害值必须是非负数字', 'amount'))

  const parts = ['damage', target.text, amount?.text ?? '0']
  if (options.damageType.trim()) {
    if (!isValidResourceLocation(options.damageType)) {
      diagnostics.push(error('damage.type', '伤害类型必须是 namespace:path', 'damageType'))
    }
    parts.push(resourceId(options.damageType.trim()))
  }

  if (options.source === 'at') {
    const position = serializePosition(options.position)
    diagnostics.push(...position.diagnostics)
    parts.push('at', position.text)
  } else if (options.source === 'by') {
    const source = serializeSelector(options.sourceEntity)
    diagnostics.push(...source.diagnostics)
    parts.push('by', source.text)
  }

  return { text: parts.join(' '), diagnostics }
}
