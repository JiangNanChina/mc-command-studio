import { describe, expect, it } from 'vitest'
import { parseGiveCommand } from './parseGive'

describe('parse give command', () => {
  it('parses a minimal give command', () => {
    const result = parseGiveCommand('/give @s minecraft:diamond_sword')
    expect(result.ok).toBe(true)
    expect(result.options.target.base).toBe('@s')
    expect(result.options.item.id).toBe('minecraft:diamond_sword')
    expect(result.options.item.components).toEqual([])
    expect(result.options.count).toBe(1)
  })

  it('parses selector, components and count', () => {
    const result = parseGiveCommand(
      'give @a[name="Steve",distance=0..10,limit=3] minecraft:diamond_sword[custom_name={text:"Excalibur",color:"gold",italic:false},lore=[{text:"第一行",color:"gray",italic:false}],enchantments={sharpness:5,knockback:2},unbreakable={},max_stack_size=1] 2'
    )
    expect(result.ok).toBe(true)
    expect(result.options.target.name).toBe('Steve')
    expect(result.options.target.distance).toBe('0..10')
    expect(result.options.target.limit).toBe(3)
    expect(result.options.count).toBe(2)
    expect(result.options.item.components).toEqual([
      { kind: 'custom_name', text: 'Excalibur', color: 'gold', italic: false },
      { kind: 'lore', lines: [{ text: '第一行', color: 'gray', italic: false }] },
      {
        kind: 'enchantments',
        entries: [
          { id: 'minecraft:sharpness', level: 5 },
          { id: 'minecraft:knockback', level: 2 }
        ]
      },
      { kind: 'unbreakable' },
      { kind: 'max_stack_size', value: 1 }
    ])
  })

  it('preserves unknown components as raw', () => {
    const result = parseGiveCommand(
      'give @s minecraft:stone[my_custom={foo:1b},rarity=epic]'
    )
    expect(result.ok).toBe(true)
    expect(result.options.item.components).toEqual([
      { kind: 'raw', id: 'my_custom', value: '{foo:1b}' },
      { kind: 'rarity', value: 'epic' }
    ])
  })

  it('rejects non-give commands and missing arguments', () => {
    expect(parseGiveCommand('/summon zombie').ok).toBe(false)
    expect(parseGiveCommand('/give @s').ok).toBe(false)
  })
})
