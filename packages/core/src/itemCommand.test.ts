import { describe, expect, it } from 'vitest'
import { buildItemCommand, createDefaultItemOptions } from './itemCommand'

describe('item command', () => {
  it('replaces an entity slot item', () => {
    expect(buildItemCommand(createDefaultItemOptions()).text).toBe(
      'item replace entity @s weapon.mainhand with minecraft:diamond_sword 1'
    )
  })

  it('replaces a block container slot', () => {
    expect(
      buildItemCommand({
        ...createDefaultItemOptions(),
        targetType: 'block',
        position: { x: '10', y: '64', z: '-5' },
        slot: 'container.0',
        item: 'minecraft:apple',
        count: '5'
      }).text
    ).toBe('item replace block 10 64 -5 container.0 with minecraft:apple 5')
  })

  it('modifies an entity slot', () => {
    expect(
      buildItemCommand({
        ...createDefaultItemOptions(),
        action: 'modify',
        modifier: 'mcstudio:bonus'
      }).text
    ).toBe('item modify entity @s weapon.mainhand mcstudio:bonus')
  })

  it('appends NBT in the 1.20.4 engine', () => {
    const result = buildItemCommand(
      {
        ...createDefaultItemOptions(),
        nbtEnabled: true,
        nbt: '{display:{Name:\'{"text":"剑"}\'}}'
      },
      'nbt'
    )
    expect(result.text).toContain(
      'with minecraft:diamond_sword{display:{Name:\'{"text":"剑"}\'}} 1'
    )
    const invalid = buildItemCommand(
      { ...createDefaultItemOptions(), nbtEnabled: true, nbt: 'bad' },
      'nbt'
    )
    expect(invalid.diagnostics.some((item) => item.code === 'item.nbt')).toBe(true)
    expect(buildItemCommand(createDefaultItemOptions(), 'components').text).not.toContain('{')
  })

  it('validates slot, count and modifier', () => {
    const replace = buildItemCommand({
      ...createDefaultItemOptions(),
      slot: 'bad slot',
      count: '100'
    })
    expect(replace.diagnostics.some((item) => item.code === 'item.slot')).toBe(true)
    expect(replace.diagnostics.some((item) => item.code === 'item.count')).toBe(true)
    const modify = buildItemCommand({
      ...createDefaultItemOptions(),
      action: 'modify',
      modifier: 'bad modifier'
    })
    expect(modify.diagnostics.some((item) => item.code === 'item.modifier')).toBe(true)
  })
})
