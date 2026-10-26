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
})
