import { error } from './diagnostics'
import { parseNumberUnit } from './units'
import type { BuildResult, Diagnostic } from './types'

export type TickAction =
  | 'freeze'
  | 'unfreeze'
  | 'sprint'
  | 'sprintStop'
  | 'rate'
  | 'step'
  | 'stepStop'

export interface TickOptions {
  action: TickAction
  rate: string
  time: string
}

export function createDefaultTickOptions(): TickOptions {
  return { action: 'freeze', rate: '20', time: '20' }
}

export function buildTickCommand(options: TickOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  let text = 'tick'
  if (options.action === 'freeze' || options.action === 'unfreeze') {
    text += ` ${options.action}`
  } else if (options.action === 'sprint') {
    text += ' sprint'
  } else if (options.action === 'sprintStop') {
    text += ' sprint stop'
  } else if (options.action === 'rate') {
    if (!parseNumberUnit(options.rate, { min: 1, max: 10000, integer: true })) {
      diagnostics.push(error('tick.rate', 'tick 速率必须是 1–10000 的整数', 'rate'))
    }
    text += ` rate ${options.rate.trim()}`
  } else if (options.action === 'step') {
    if (!parseNumberUnit(options.time, { min: 1, max: 10000, integer: true })) {
      diagnostics.push(error('tick.step', '步进时间必须是 1–10000 的整数', 'time'))
    }
    text += ` step ${options.time.trim()}`
  } else {
    text += ' step stop'
  }
  return { text, diagnostics }
}
