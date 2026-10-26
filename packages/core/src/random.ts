import { error } from './diagnostics'
import { resourceId } from './escape'
import { isValidResourceLocation, parseNumberUnit } from './units'
import type { BuildResult, Diagnostic } from './types'

export type RandomMode = 'value' | 'roll'

export interface RandomOptions {
  mode: RandomMode
  range: string
  sequence: string
}

export function createDefaultRandomOptions(): RandomOptions {
  return { mode: 'value', range: '1..6', sequence: '' }
}

const INT_RANGE = /^-?\d+(?:\.\.-?\d+)?$/

export function buildRandomCommand(options: RandomOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (!INT_RANGE.test(options.range.trim())) {
    diagnostics.push(error('random.range', '范围格式应为 1..6、1.. 或 ..6', 'range'))
  }
  const parts = ['random', options.mode, options.range.trim()]
  if (options.sequence.trim()) {
    if (!isValidResourceLocation(options.sequence)) {
      diagnostics.push(error('random.sequence', '序列 ID 必须是 namespace:path', 'sequence'))
    }
    parts.push(resourceId(options.sequence.trim()))
  }
  return { text: parts.join(' '), diagnostics }
}

export interface RandomResetOptions {
  sequence: string
  seed: string
  includeWorldSeed: boolean
  includeSequenceId: boolean
}

export function createDefaultRandomResetOptions(): RandomResetOptions {
  return { sequence: '', seed: '0', includeWorldSeed: false, includeSequenceId: false }
}

export function buildRandomResetCommand(options: RandomResetOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (!parseNumberUnit(options.seed, { integer: true })) {
    diagnostics.push(error('random.seed', '种子必须是整数', 'seed'))
  }
  const target = options.sequence.trim() || '*'
  if (target !== '*' && !isValidResourceLocation(target)) {
    diagnostics.push(error('random.sequence', '序列 ID 必须是 namespace:path', 'sequence'))
  }
  const parts = ['random', 'reset', target, options.seed.trim()]
  if (options.includeWorldSeed || options.includeSequenceId) {
    parts.push(String(options.includeWorldSeed), String(options.includeSequenceId))
  }
  return { text: parts.join(' '), diagnostics }
}
