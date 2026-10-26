import { describe, expect, it } from 'vitest'
import {
  collectStats,
  getRoots,
  permissionLabel,
  serializeGeneric,
  validateRawArgument,
  type GenericStep
} from './commandTree'
import type { CommandTree } from './types'

const tree: CommandTree = {
  type: 'root',
  children: {
    give: {
      type: 'literal',
      children: {
        targets: {
          type: 'argument',
          parser: 'minecraft:entity',
          children: {
            item: {
              type: 'argument',
              parser: 'minecraft:item_stack',
              children: {
                count: {
                  type: 'argument',
                  parser: 'brigadier:integer',
                  properties: { min: 1 },
                  executable: true
                }
              }
            }
          }
        }
      },
      permissions: { type: 'minecraft:require', permission: { type: 'minecraft:command_level', level: 'gamemasters' } }
    },
    time: {
      type: 'literal',
      children: {
        set: { type: 'literal', children: { value: { type: 'argument', parser: 'minecraft:time', executable: true } } }
      }
    }
  }
}

describe('command tree', () => {
  it('lists roots alphabetically', () => {
    expect(getRoots(tree).map((root) => root.name)).toEqual(['give', 'time'])
  })

  it('collects stats', () => {
    const stats = collectStats(tree)
    expect(stats.roots).toBe(2)
    expect(stats.literals).toBe(3)
    expect(stats.parsers).toBe(4)
  })

  it('serializes a generic path', () => {
    const steps: GenericStep[] = [
      { name: 'targets', node: tree.children!.give.children!.targets, value: '@s' },
      { name: 'item', node: tree.children!.give.children!.targets.children!.item, value: 'minecraft:stone' },
      { name: 'count', node: tree.children!.give.children!.targets.children!.item.children!.count, value: '5' }
    ]
    const result = serializeGeneric('give', steps)
    expect(result.text).toBe('give @s minecraft:stone 5')
    expect(result.diagnostics).toHaveLength(0)
  })

  it('validates integer bounds', () => {
    const diagnostics = validateRawArgument('brigadier:integer', '0', { min: 1 }, 'count')
    expect(diagnostics.some((item) => item.code === 'arg.min')).toBe(true)
    expect(validateRawArgument('brigadier:integer', 'abc', {}, 'count')).toHaveLength(1)
  })

  it('validates ranges and vectors', () => {
    expect(validateRawArgument('minecraft:int_range', '1..10', {}, 'range')).toHaveLength(0)
    expect(validateRawArgument('minecraft:int_range', '1-10', {}, 'range')).toHaveLength(1)
    expect(validateRawArgument('minecraft:block_pos', '~ ~1 ~', {}, 'pos')).toHaveLength(0)
    expect(validateRawArgument('minecraft:block_pos', '1 2', {}, 'pos')).toHaveLength(1)
  })

  it('reports empty generic values', () => {
    const steps: GenericStep[] = [
      { name: 'targets', node: tree.children!.give.children!.targets, value: '' }
    ]
    expect(serializeGeneric('give', steps).diagnostics.some((item) => item.code === 'generic.empty')).toBe(true)
  })

  it('maps permission levels to labels', () => {
    expect(permissionLabel(tree.children!.give)).toBe('需要管理员权限')
  })
})
