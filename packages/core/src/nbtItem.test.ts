import { describe, expect, it } from 'vitest'
import { buildNbtGiveCommand, createDefaultNbtGiveOptions } from './nbtItem'

describe('nbt give', () => {
  it('builds a plain legacy give command', () => {
    expect(buildNbtGiveCommand(createDefaultNbtGiveOptions()).text).toBe(
      'give @s minecraft:diamond_sword 1'
    )
  })

  it('builds name, lore, enchantments and unbreakable', () => {
    const result = buildNbtGiveCommand({
      ...createDefaultNbtGiveOptions(),
      name: '屠龙剑',
      lore: '第一行\n第二行',
      enchantments: [
        { id: 'minecraft:sharpness', level: '5' },
        { id: 'minecraft:unbreaking', level: '3' }
      ],
      unbreakable: true
    })
    expect(result.text).toContain('display:{Name:')
    expect(result.text).toContain('Lore:[')
    expect(result.text).toContain('Enchantments:[{id:"minecraft:sharpness",lvl:5}')
    expect(result.text).toContain('Unbreakable:1b')
  })

  it('validates item, count, lore and enchantments', () => {
    const result = buildNbtGiveCommand({
      ...createDefaultNbtGiveOptions(),
      item: 'bad id',
      count: '0',
      enchantments: [{ id: 'bad id', level: '0' }]
    })
    expect(result.diagnostics.some((item) => item.code === 'nbt.item')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'nbt.count')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'nbt.enchant.id')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'nbt.enchant.level')).toBe(true)
  })
})
