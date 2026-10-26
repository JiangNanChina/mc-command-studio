import { describe, expect, it } from 'vitest'
import { buildDataCommand, createDefaultDataOptions } from './dataCommand'

describe('data', () => {
  it('gets entity data with optional scale', () => {
    expect(buildDataCommand(createDefaultDataOptions()).text).toBe(
      'data get entity @s Health'
    )
    expect(
      buildDataCommand({ ...createDefaultDataOptions(), scaleEnabled: true, scale: '2' }).text
    ).toBe('data get entity @s Health 2')
  })

  it('gets block and storage data', () => {
    expect(
      buildDataCommand({
        ...createDefaultDataOptions(),
        targetType: 'block',
        path: 'Items'
      }).text
    ).toBe('data get block ~ ~ ~ Items')
    expect(
      buildDataCommand({
        ...createDefaultDataOptions(),
        targetType: 'storage',
        storage: 'mcstudio:data',
        path: 'foo'
      }).text
    ).toBe('data get storage mcstudio:data foo')
  })

  it('merges and removes data', () => {
    expect(
      buildDataCommand({
        ...createDefaultDataOptions(),
        action: 'merge',
        nbt: '{Health:20}'
      }).text
    ).toBe('data merge entity @s {Health:20}')
    expect(
      buildDataCommand({
        ...createDefaultDataOptions(),
        action: 'remove',
        path: 'Inventory[0]'
      }).text
    ).toBe('data remove entity @s Inventory[0]')
  })

  it('modifies paths with set/merge/append/insert/remove', () => {
    const base = {
      ...createDefaultDataOptions(),
      action: 'modify' as const,
      path: 'Inventory'
    }
    expect(buildDataCommand({ ...base, modifyOperation: 'set', nbt: '{id:"minecraft:stone"}' }).text).toBe(
      'data modify entity @s Inventory set value {id:"minecraft:stone"}'
    )
    expect(buildDataCommand({ ...base, modifyOperation: 'append', nbt: '{id:"minecraft:stone"}' }).text).toBe(
      'data modify entity @s Inventory append value {id:"minecraft:stone"}'
    )
    expect(
      buildDataCommand({ ...base, modifyOperation: 'insert', index: '2', nbt: '{id:"minecraft:stone"}' })
        .text
    ).toBe('data modify entity @s Inventory insert 2 value {id:"minecraft:stone"}')
    expect(buildDataCommand({ ...base, modifyOperation: 'remove', index: '1' }).text).toBe(
      'data modify entity @s Inventory remove 1'
    )
    const bad = buildDataCommand({ ...base, modifyOperation: 'insert', index: 'x', nbt: 'bad' })
    expect(bad.diagnostics.some((item) => item.code === 'data.index')).toBe(true)
    expect(bad.diagnostics.some((item) => item.code === 'data.nbt')).toBe(true)
  })

  it('modifies from another NBT source', () => {
    const base = {
      ...createDefaultDataOptions(),
      action: 'modify' as const,
      path: 'Inventory[0]',
      fromEnabled: true
    }
    expect(buildDataCommand(base).text).toBe(
      'data modify entity @s Inventory[0] set from entity @s'
    )
    expect(
      buildDataCommand({
        ...base,
        fromTargetType: 'storage',
        fromStorage: 'mcstudio:data',
        fromPath: 'item'
      }).text
    ).toBe('data modify entity @s Inventory[0] set from storage mcstudio:data item')
    expect(
      buildDataCommand({
        ...base,
        modifyOperation: 'insert',
        index: '1',
        fromTargetType: 'block',
        fromPosition: { x: '0', y: '64', z: '0' },
        fromPath: 'Items[0]'
      }).text
    ).toBe('data modify entity @s Inventory[0] insert 1 from block 0 64 0 Items[0]')
  })

  it('validates path, nbt and scale', () => {
    const result = buildDataCommand({
      ...createDefaultDataOptions(),
      action: 'merge',
      nbt: 'bad',
      path: '',
      scaleEnabled: true,
      scale: 'x'
    })
    expect(result.diagnostics.some((item) => item.code === 'data.nbt')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'data.path')).toBe(false)
    const remove = buildDataCommand({
      ...createDefaultDataOptions(),
      action: 'remove',
      path: ''
    })
    expect(remove.diagnostics.some((item) => item.code === 'data.path')).toBe(true)
    const get = buildDataCommand({
      ...createDefaultDataOptions(),
      scaleEnabled: true,
      scale: 'x'
    })
    expect(get.diagnostics.some((item) => item.code === 'data.scale')).toBe(true)
  })
})
