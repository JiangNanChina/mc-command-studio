import { describe, expect, it } from 'vitest'
import { buildAttributeCommand, createDefaultAttributeOptions } from './attribute'

describe('attribute', () => {
  it('builds get and base get with scale', () => {
    const base = createDefaultAttributeOptions()
    expect(
      buildAttributeCommand({
        ...base,
        attribute: 'minecraft:max_health'
      }).text
    ).toBe('attribute @s minecraft:max_health get')
    expect(
      buildAttributeCommand({
        ...base,
        action: 'base-get',
        scaleEnabled: true,
        scale: '2'
      }).text
    ).toBe('attribute @s minecraft:max_health base get 2')
  })

  it('builds base set and reset', () => {
    expect(
      buildAttributeCommand({ ...createDefaultAttributeOptions(), action: 'base-set', value: '30' }).text
    ).toBe('attribute @s minecraft:max_health base set 30')
    expect(
      buildAttributeCommand({ ...createDefaultAttributeOptions(), action: 'base-reset' }).text
    ).toBe('attribute @s minecraft:max_health base reset')
  })

  it('builds modifier add, remove and value get', () => {
    expect(
      buildAttributeCommand({
        ...createDefaultAttributeOptions(),
        action: 'modifier-add',
        modifierId: 'mcstudio:bonus',
        modifierValue: '5'
      }).text
    ).toBe(
      'attribute @s minecraft:max_health modifier add mcstudio:bonus 5 add_value'
    )
    expect(
      buildAttributeCommand({
        ...createDefaultAttributeOptions(),
        action: 'modifier-remove',
        modifierId: 'mcstudio:bonus'
      }).text
    ).toBe('attribute @s minecraft:max_health modifier remove mcstudio:bonus')
    expect(
      buildAttributeCommand({
        ...createDefaultAttributeOptions(),
        action: 'modifier-value',
        modifierId: 'mcstudio:bonus'
      }).text
    ).toBe(
      'attribute @s minecraft:max_health modifier value get mcstudio:bonus'
    )
  })

  it('builds legacy 1.20.4 uuid modifiers', () => {
    const base = createDefaultAttributeOptions()
    const uuid = '12345678-1234-1234-1234-123456789abc'
    expect(
      buildAttributeCommand(
        {
          ...base,
          action: 'modifier-add',
          modifierUuid: uuid,
          modifierName: 'Bonus',
          modifierValue: '5',
          operation: 'add_multiplied_base'
        },
        'nbt'
      ).text
    ).toBe(
      `attribute @s minecraft:max_health modifier add ${uuid} Bonus 5 multiply_base`
    )
    expect(
      buildAttributeCommand(
        { ...base, action: 'modifier-remove', modifierUuid: uuid },
        'nbt'
      ).text
    ).toBe(`attribute @s minecraft:max_health modifier remove ${uuid}`)
    expect(
      buildAttributeCommand(
        { ...base, action: 'modifier-value', modifierUuid: uuid },
        'nbt'
      ).text
    ).toBe(`attribute @s minecraft:max_health modifier value get ${uuid}`)
    expect(
      buildAttributeCommand({ ...base, action: 'base-reset' }, 'nbt').diagnostics.some(
        (item) => item.code === 'attribute.reset'
      )
    ).toBe(true)
  })

  it('validates numbers and resource ids', () => {
    const result = buildAttributeCommand({
      ...createDefaultAttributeOptions(),
      action: 'modifier-add',
      attribute: 'bad id',
      modifierId: 'bad modifier',
      modifierValue: 'x'
    })
    expect(result.diagnostics.some((item) => item.code === 'attribute.id')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'attribute.modifier')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'attribute.modifierValue')).toBe(true)
  })
})
