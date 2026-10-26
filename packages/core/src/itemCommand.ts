import { error } from './diagnostics'
import { resourceId } from './escape'
import { serializePosition, type Position } from './position'
import { serializeSelector, type Selector } from './selector'
import { isValidResourceLocation, isValidSlot, parseNumberUnit } from './units'
import type { BuildResult, Diagnostic } from './types'

export type ItemAction = 'replace' | 'modify'
export type ItemTargetType = 'entity' | 'block'

export interface ItemOptions {
  action: ItemAction
  targetType: ItemTargetType
  target: Selector
  position: Position
  slot: string
  item: string
  count: string
  modifier: string
}

export const ITEM_SLOTS = [
  'weapon.mainhand',
  'weapon.offhand',
  'armor.head',
  'armor.chest',
  'armor.legs',
  'armor.feet',
  'hotbar.0',
  'inventory.0',
  'container.0',
  'enderchest.0',
  'horse.saddle',
  'villager.0',
  'player.cursor',
  'player.crafting.0'
]

export function createDefaultItemOptions(): ItemOptions {
  return {
    action: 'replace',
    targetType: 'entity',
    target: { base: '@s' },
    position: { x: '0', y: '64', z: '0' },
    slot: 'weapon.mainhand',
    item: 'minecraft:diamond_sword',
    count: '1',
    modifier: 'mcstudio:bonus'
  }
}

function validSlot(slot: string): boolean {
  return isValidSlot(slot)
}

export function buildItemCommand(options: ItemOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const slot = options.slot.trim()
  if (!validSlot(slot)) {
    diagnostics.push(error('item.slot', '槽位名不合法，例如 weapon.mainhand 或 container.0', 'slot'))
  }

  const parts = ['item', options.action, options.targetType]
  if (options.targetType === 'entity') {
    const target = serializeSelector(options.target)
    diagnostics.push(...target.diagnostics)
    parts.push(target.text)
  } else {
    const position = serializePosition(options.position)
    diagnostics.push(...position.diagnostics)
    parts.push(position.text)
  }
  parts.push(slot)

  if (options.action === 'replace') {
    const item = resourceId(options.item.trim())
    if (!options.item.trim()) {
      diagnostics.push(error('item.id', '请选择要放入的物品', 'item'))
    } else if (!isValidResourceLocation(options.item)) {
      diagnostics.push(error('item.id', '物品 ID 不合法', 'item'))
    }
    if (!parseNumberUnit(options.count, { min: 1, max: 99, integer: true })) {
      diagnostics.push(error('item.count', '数量必须是 1–99 的整数', 'count'))
    }
    parts.push('with', item, options.count.trim())
  } else {
    const modifier = resourceId(options.modifier.trim())
    if (!isValidResourceLocation(options.modifier)) {
      diagnostics.push(error('item.modifier', '物品修饰符 ID 必须是 namespace:path', 'modifier'))
    }
    parts.push(modifier)
  }

  return { text: parts.join(' '), diagnostics }
}
