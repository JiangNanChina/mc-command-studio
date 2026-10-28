import { describe, expect, it } from 'vitest'
import { hasErrors } from './diagnostics'
import { serializeItemStack, createDefaultItem } from './item'

describe('item stack', () => {
  it('serializes a plain item', () => {
    expect(serializeItemStack(createDefaultItem()).text).toBe('minecraft:diamond_sword')
  })

  it('serializes custom_name', () => {
    const result = serializeItemStack({
      id: 'diamond_sword',
      components: [{ kind: 'custom_name', text: 'Excalibur', color: 'gold', italic: false }]
    })
    expect(result.text).toBe(
      'minecraft:diamond_sword[custom_name={text:"Excalibur",color:"gold",italic:false}]'
    )
    expect(hasErrors(result.diagnostics)).toBe(false)
  })

  it('serializes lore lines', () => {
    const result = serializeItemStack({
      id: 'minecraft:stick',
      components: [
        {
          kind: 'lore',
          lines: [
            { text: '第一行', color: 'gray', italic: false },
            { text: '第二行', color: '', italic: true }
          ]
        }
      ]
    })
    expect(result.text).toBe(
      'minecraft:stick[lore=[{text:"第一行",color:"gray",italic:false},{text:"第二行",italic:true}]]'
    )
  })

  it('serializes flat enchantments', () => {
    const result = serializeItemStack({
      id: 'minecraft:diamond_sword',
      components: [
        {
          kind: 'enchantments',
          entries: [
            { id: 'minecraft:sharpness', level: 5 },
            { id: 'knockback', level: 2 }
          ]
        }
      ]
    })
    expect(result.text).toBe(
      'minecraft:diamond_sword[enchantments={sharpness:5,knockback:2}]'
    )
  })

  it('serializes unbreakable and max_stack_size', () => {
    const result = serializeItemStack({
      id: 'minecraft:netherite_pickaxe',
      components: [{ kind: 'unbreakable' }, { kind: 'max_stack_size', value: 16 }]
    })
    expect(result.text).toBe(
      'minecraft:netherite_pickaxe[unbreakable={},max_stack_size=16]'
    )
  })

  it('passes through custom_model_data raw SNBT', () => {
    const result = serializeItemStack({
      id: 'minecraft:bone',
      components: [{ kind: 'custom_model_data', raw: '{strings:["my_pack:model"]}' }]
    })
    expect(result.text).toBe(
      'minecraft:bone[custom_model_data={strings:["my_pack:model"]}]'
    )
  })

  it('rejects empty item ids', () => {
    const result = serializeItemStack({ id: '', components: [] })
    expect(hasErrors(result.diagnostics)).toBe(true)
  })

  it('rejects duplicate components and invalid levels', () => {
    const result = serializeItemStack({
      id: 'minecraft:stone',
      components: [
        { kind: 'unbreakable' },
        { kind: 'unbreakable' },
        {
          kind: 'enchantments',
          entries: [{ id: 'minecraft:sharpness', level: 0 }]
        }
      ]
    })
    expect(result.diagnostics.filter((item) => item.severity === 'error').length).toBeGreaterThan(1)
  })

  it('serializes extended components and raw components', () => {
    const result = serializeItemStack({
      id: 'minecraft:diamond_sword',
      components: [
        { kind: 'item_name', text: 'Sword', color: 'aqua', italic: false },
        { kind: 'rarity', value: 'epic' },
        { kind: 'max_damage', value: 2000 },
        { kind: 'damage', value: 10 },
        { kind: 'enchantment_glint_override', value: true },
        { kind: 'custom_data', raw: '{foo:1b}' },
        { kind: 'raw', id: 'my_pack:test', value: '1b' }
      ]
    })
    expect(result.text).toBe(
      'minecraft:diamond_sword[item_name={text:"Sword",color:"aqua",italic:false},rarity=epic,max_damage=2000,damage=10,enchantment_glint_override=true,custom_data={foo:1b},"my_pack:test"=1b]'
    )
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toHaveLength(0)
  })

  it('rejects invalid custom_data', () => {
    const result = serializeItemStack({
      id: 'minecraft:stone',
      components: [{ kind: 'custom_data', raw: 'foo' }]
    })
    expect(result.diagnostics.some((item) => item.code === 'item.custom_data')).toBe(true)
  })

  it.each(['1.20.5', '1.20.6', '1.21.1', '1.21.4'])('uses wrapped enchantments in %s', (version) => {
    const result = serializeItemStack({
      id: 'diamond_sword',
      components: [{ kind: 'enchantments', entries: [{ id: 'sharpness', level: 5 }] }]
    }, version)
    expect(result.text).toBe('minecraft:diamond_sword[enchantments={levels:{sharpness:5}}]')
    expect(result.diagnostics).toEqual([])
  })

  it('encodes item names and lore as JSON strings before 1.21.5', () => {
    const result = serializeItemStack({
      id: 'diamond_sword',
      components: [
        { kind: 'custom_name', text: 'A  B', color: 'gold', italic: false },
        { kind: 'lore', lines: [{ text: 'C "D"', italic: true }] }
      ]
    }, '1.21.4')
    expect(result.text).toContain(`custom_name="{\\"text\\":\\"A  B\\",\\"color\\":\\"gold\\",\\"italic\\":false}"`)
    expect(result.text).toContain(`lore=["{\\"text\\":\\"C \\\\\\"D\\\\\\"\\",\\"italic\\":true}"]`)
    expect(result.diagnostics).toEqual([])
  })

  it('validates the custom model data shape at the 1.21.4 boundary without rewriting raw input', () => {
    const integer = { id: 'stick', components: [{ kind: 'custom_model_data' as const, raw: '123' }] }
    const compound = { id: 'stick', components: [{ kind: 'custom_model_data' as const, raw: '{strings:["model"]}' }] }
    expect(serializeItemStack(integer, '1.21.3').diagnostics).toEqual([])
    expect(serializeItemStack(compound, '1.21.4').diagnostics).toEqual([])
    expect(hasErrors(serializeItemStack(integer, '1.21.4').diagnostics)).toBe(true)
    const invalidOld = serializeItemStack(compound, '1.21.3')
    expect(hasErrors(invalidOld.diagnostics)).toBe(true)
    expect(invalidOld.text).toContain('custom_model_data={strings:["model"]}')
  })
})
