import { error } from './diagnostics'
import { resourceId } from './escape'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type AdvancementAction = 'grant' | 'revoke'
export type AdvancementMode = 'everything' | 'only' | 'from' | 'through' | 'until'

export interface AdvancementOptions {
  action: AdvancementAction
  mode: AdvancementMode
  target: Selector
  advancement: string
  criterion: string
}

export function createDefaultAdvancementOptions(): AdvancementOptions {
  return {
    action: 'grant',
    mode: 'only',
    target: { base: '@s' },
    advancement: 'minecraft:story/root',
    criterion: ''
  }
}

export function buildAdvancementCommand(options: AdvancementOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)
  const parts = ['advancement', options.action, target.text, options.mode]

  if (options.mode !== 'everything') {
    const advancement = resourceId(options.advancement.trim())
    if (!/^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(advancement)) {
      diagnostics.push(
        error('advancement.id', '进度 ID 必须是 namespace:path 格式', 'advancement')
      )
    }
    parts.push(advancement)
    if (options.mode === 'only' && options.criterion.trim()) {
      parts.push(options.criterion.trim())
    }
  }

  return { text: parts.join(' '), diagnostics }
}
