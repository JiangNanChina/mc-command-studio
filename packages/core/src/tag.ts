import { error } from './diagnostics'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type TagAction = 'add' | 'remove' | 'list'

export interface TagOptions {
  action: TagAction
  target: Selector
  name: string
}

export function createDefaultTagOptions(): TagOptions {
  return { action: 'add', target: { base: '@s' }, name: 'mcstudio.tag' }
}

export function buildTagCommand(options: TagOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)
  const parts = ['tag', target.text, options.action]
  if (options.action !== 'list') {
    const name = options.name.trim()
    if (!name) diagnostics.push(error('tag.name', '标签名不能为空', 'name'))
    if (/\s/.test(name)) diagnostics.push(error('tag.name.space', '标签名不能包含空格', 'name'))
    parts.push(name)
  }
  return { text: parts.join(' '), diagnostics }
}
