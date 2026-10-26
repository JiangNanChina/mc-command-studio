import { error } from './diagnostics'
import { resourceId } from './escape'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export interface ClearOptions {
  target: Selector
  allItems: boolean
  item: string
  maxCountEnabled: boolean
  maxCount: string
}

export function createDefaultClearOptions(): ClearOptions {
  return {
    target: { base: '@s' },
    allItems: true,
    item: 'minecraft:diamond',
    maxCountEnabled: false,
    maxCount: '1'
  }
}

export function buildClearCommand(options: ClearOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)
  const parts = ['clear', target.text]

  if (!options.allItems) {
    if (!options.item.trim()) {
      diagnostics.push(error('clear.item', '请选择要清除的物品', 'item'))
    } else {
      parts.push(resourceId(options.item))
    }
    if (options.maxCountEnabled) {
      if (!/^\d+$/.test(options.maxCount.trim())) {
        diagnostics.push(error('clear.count', '最大数量必须是非负整数', 'maxCount'))
      }
      parts.push(options.maxCount.trim())
    }
  }

  return { text: parts.join(' '), diagnostics }
}
