import { describe, expect, it } from 'vitest'
import { buildLootCommand, createDefaultLootOptions } from './loot'

describe('loot', () => {
  it('gives loot to players', () => {
    expect(buildLootCommand(createDefaultLootOptions()).text).toBe(
      'loot give @s loot minecraft:chests/simple_dungeon'
    )
  })

  it('spawns and inserts loot', () => {
    expect(
      buildLootCommand({
        ...createDefaultLootOptions(),
        action: 'spawn',
        position: { x: '0', y: '64', z: '0' },
        lootTable: 'minecraft:chests/shipwreck_treasure'
      }).text
    ).toBe('loot spawn 0 64 0 loot minecraft:chests/shipwreck_treasure')
    expect(
      buildLootCommand({
        ...createDefaultLootOptions(),
        action: 'insert',
        position: { x: '10', y: '64', z: '-5' },
        slot: 'container.3'
      }).text
    ).toBe('loot insert 10 64 -5 loot minecraft:chests/simple_dungeon container.3')
  })

  it('builds 1.20.4 insert without a slot', () => {
    expect(
      buildLootCommand(
        {
          ...createDefaultLootOptions(),
          action: 'insert',
          position: { x: '10', y: '64', z: '-5' }
        },
        'nbt'
      ).text
    ).toBe('loot insert 10 64 -5 loot minecraft:chests/simple_dungeon')
  })

  it('builds loot replace for blocks and entities', () => {
    expect(
      buildLootCommand({
        ...createDefaultLootOptions(),
        action: 'replace',
        replaceTargetType: 'block',
        position: { x: '1', y: '64', z: '2' },
        slot: 'container.0',
        count: '3'
      }).text
    ).toBe('loot replace block 1 64 2 container.0 3 loot minecraft:chests/simple_dungeon')
    expect(
      buildLootCommand({
        ...createDefaultLootOptions(),
        action: 'replace',
        replaceTargetType: 'entity',
        target: { base: '@s' },
        slot: 'weapon.mainhand',
        count: '1'
      }).text
    ).toBe('loot replace entity @s weapon.mainhand 1 loot minecraft:chests/simple_dungeon')
  })

  it('validates loot table and slot', () => {
    const result = buildLootCommand({
      ...createDefaultLootOptions(),
      action: 'insert',
      lootTable: 'bad table',
      slot: ''
    })
    expect(result.diagnostics.some((item) => item.code === 'loot.table')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'loot.slot')).toBe(true)
  })
})
