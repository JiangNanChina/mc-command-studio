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
