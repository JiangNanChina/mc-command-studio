import { error } from './diagnostics'
import { isValidResourceLocation } from './units'
import { serializePosition, type Position } from './position'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type LootAction = 'give' | 'insert' | 'spawn' | 'replace'

export interface LootOptions {
  action: LootAction
  target: Selector
  position: Position
  lootTable: string
  slot: string
  replaceTargetType: 'block' | 'entity'
  count: string
}

export function createDefaultLootOptions(): LootOptions {
  return {
    action: 'give',
    target: { base: '@s' },
    position: { x: '~', y: '~', z: '~' },
    lootTable: 'minecraft:chests/simple_dungeon',
    slot: 'container.0',
    replaceTargetType: 'block',
    count: '1'
  }
}

export function buildLootCommand(
  options: LootOptions,
  engine: 'components' | 'nbt' | 'legacy' = 'components'
): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (!isValidResourceLocation(options.lootTable)) {
    diagnostics.push(error('loot.table', '战利品表 ID 必须是 namespace:path', 'lootTable'))
  }
  if (options.action === 'give') {
    const target = serializeSelector(options.target)
    diagnostics.push(...target.diagnostics)
    return {
      text: `loot give ${target.text} loot ${options.lootTable.trim()}`,
      diagnostics
    }
  }

  if (options.action === 'replace') {
    const count = options.count.trim() || '1'
    const target =
      options.replaceTargetType === 'entity'
        ? serializeSelector(options.target)
        : serializePosition(options.position)
    diagnostics.push(...target.diagnostics)
    const place =
      options.replaceTargetType === 'entity'
        ? `entity ${target.text}`
        : `block ${target.text}`
    return {
      text: `loot replace ${place} ${options.slot.trim()} ${count} loot ${options.lootTable.trim()}`,
      diagnostics
    }
  }

  const position = serializePosition(options.position)
  diagnostics.push(...position.diagnostics)
  if (options.action === 'insert') {
    if (engine === 'nbt') {
      return {
        text: `loot insert ${position.text} loot ${options.lootTable.trim()}`,
        diagnostics
      }
    }
    if (!options.slot.trim()) {
      diagnostics.push(error('loot.slot', '插入槽位不能为空', 'slot'))
    }
    return {
      text: `loot insert ${position.text} loot ${options.lootTable.trim()} ${options.slot.trim()}`,
      diagnostics
    }
  }
  return {
    text: `loot spawn ${position.text} loot ${options.lootTable.trim()}`,
    diagnostics
  }
}
