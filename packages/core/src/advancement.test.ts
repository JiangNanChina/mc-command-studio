import { describe, expect, it } from 'vitest'
import { buildAdvancementCommand, createDefaultAdvancementOptions } from './advancement'

describe('advancement', () => {
  it('grants only with optional criterion', () => {
    expect(buildAdvancementCommand(createDefaultAdvancementOptions()).text).toBe(
      'advancement grant @s only minecraft:story/root'
    )
    expect(
      buildAdvancementCommand({
        ...createDefaultAdvancementOptions(),
        criterion: 'crafting_table'
      }).text
    ).toBe('advancement grant @s only minecraft:story/root crafting_table')
  })

  it('grants everything and revokes through', () => {
    expect(
      buildAdvancementCommand({
        ...createDefaultAdvancementOptions(),
        mode: 'everything'
      }).text
    ).toBe('advancement grant @s everything')
    expect(
      buildAdvancementCommand({
        ...createDefaultAdvancementOptions(),
        action: 'revoke',
        mode: 'through',
        advancement: 'minecraft:story/mine_stone'
      }).text
    ).toBe('advancement revoke @s through minecraft:story/mine_stone')
  })

  it('validates advancement ids', () => {
    const result = buildAdvancementCommand({
      ...createDefaultAdvancementOptions(),
      advancement: 'bad id'
    })
    expect(result.diagnostics.some((item) => item.code === 'advancement.id')).toBe(true)
  })
})
