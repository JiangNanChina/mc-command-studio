import { containsControlCharacters } from './escape'
import { error, warn } from './diagnostics'
import { serializePosition, type Position } from './position'
import type { BuildResult, Diagnostic } from './types'

export type CloneMode = 'replace' | 'masked' | 'filtered'
export type CloneMove = 'normal' | 'force' | 'move'

export interface CloneOptions {
  begin: Position
  end: Position
  destination: Position
  mode: CloneMode
  filter: string
  move: CloneMove
}

export function createDefaultCloneOptions(): CloneOptions {
  return {
    begin: { x: '~', y: '~', z: '~' },
    end: { x: '~2', y: '~2', z: '~2' },
    destination: { x: '~', y: '~', z: '~' },
    mode: 'replace',
    filter: '',
    move: 'normal'
  }
}

export function buildCloneCommand(options: CloneOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const begin = serializePosition(options.begin)
  const end = serializePosition(options.end)
  const destination = serializePosition(options.destination)
  diagnostics.push(...begin.diagnostics, ...end.diagnostics, ...destination.diagnostics)

  const parts = ['clone', begin.text, end.text, destination.text]

  if (options.mode === 'filtered') {
    const filter = options.filter.trim()
    if (!filter) diagnostics.push(error('clone.filter', 'filtered 模式需要过滤方块', 'filter'))
    parts.push('filtered', filter)
  } else if (options.mode === 'masked') {
    parts.push('masked')
  }

  if (options.move !== 'normal') parts.push(options.move)

  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (containsControlCharacters(text)) {
    diagnostics.push(warn('clone.control', '命令中包含不可见控制字符'))
  }
  return { text, diagnostics }
}
