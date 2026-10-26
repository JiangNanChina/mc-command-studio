import { containsControlCharacters } from './escape'
import { error, warn } from './diagnostics'
import { serializePosition, type Position } from './position'
import type { BuildResult, Diagnostic } from './types'

export type FillMode = 'replace' | 'destroy' | 'hollow' | 'keep' | 'outline' | 'strict'

export interface FillOptions {
  from: Position
  to: Position
  block: string
  mode: FillMode
  filter: string
}

export function createDefaultFillOptions(): FillOptions {
  return {
    from: { x: '~', y: '~', z: '~' },
    to: { x: '~2', y: '~2', z: '~2' },
    block: 'minecraft:stone',
    mode: 'replace',
    filter: ''
  }
}

export function buildFillCommand(options: FillOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const from = serializePosition(options.from)
  const to = serializePosition(options.to)
  diagnostics.push(...from.diagnostics, ...to.diagnostics)

  const block = options.block.trim()
  if (!block) diagnostics.push(error('fill.block', '请填写方块', 'block'))

  const parts = ['fill', from.text, to.text, block]
  if (options.mode === 'replace') {
    if (options.filter.trim()) parts.push('replace', options.filter.trim())
  } else {
    parts.push(options.mode)
    if (options.filter.trim()) {
      diagnostics.push(warn('fill.filter', '过滤方块只用于 replace 模式，当前已忽略', 'filter'))
    }
  }

  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (containsControlCharacters(text)) {
    diagnostics.push(warn('fill.control', '命令中包含不可见控制字符'))
  }
  return { text, diagnostics }
}
