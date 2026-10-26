import { containsControlCharacters, resourceId } from './escape'
import { error, warn } from './diagnostics'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type EffectAction = 'give' | 'clear'

export interface EffectOptions {
  action: EffectAction
  target: Selector
  effect: string
  duration: string
  amplifier: string
  hideParticles: boolean
}

export function createDefaultEffectOptions(): EffectOptions {
  return {
    action: 'give',
    target: { base: '@s' },
    effect: 'minecraft:speed',
    duration: '30',
    amplifier: '0',
    hideParticles: false
  }
}

function integerInRange(value: string, min: number, max: number): boolean {
  if (!/^\d+$/.test(value.trim())) return false
  const number = Number(value)
  return number >= min && number <= max
}

export function buildEffectCommand(options: EffectOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)

  const effect = resourceId(options.effect.trim())
  if (options.action === 'give' && !options.effect.trim()) {
    diagnostics.push(error('effect.id', '请选择或填写状态效果 ID', 'effect'))
  }

  if (options.action === 'clear') {
    const parts = ['effect', 'clear', target.text]
    if (options.effect.trim()) parts.push(effect)
    return finish(parts, diagnostics)
  }

  const parts = ['effect', 'give', target.text, effect]
  const duration = options.duration.trim()
  const amplifier = options.amplifier.trim()

  if (duration) {
    if (!integerInRange(duration, 1, 1_000_000)) {
      diagnostics.push(error('effect.duration', '持续时间必须是 1–1,000,000 的整数秒', 'duration'))
    }
    parts.push(duration)
  }
  if (amplifier) {
    if (!duration) {
      diagnostics.push(error('effect.amplifier', '填写等级前需要先填写持续时间', 'amplifier'))
    }
    if (!integerInRange(amplifier, 0, 255)) {
      diagnostics.push(error('effect.amplifier', '等级必须是 0–255 的整数', 'amplifier'))
    }
    parts.push(amplifier)
  }
  if (options.hideParticles) parts.push('true')

  return finish(parts, diagnostics)
}

function finish(parts: string[], diagnostics: Diagnostic[]): BuildResult {
  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (containsControlCharacters(text)) {
    diagnostics.push(warn('effect.control', '命令中包含不可见控制字符'))
  }
  return { text, diagnostics }
}
