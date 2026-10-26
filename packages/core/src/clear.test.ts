import { describe, expect, it } from 'vitest'
import { buildClearCommand, createDefaultClearOptions } from './clear'

describe('clear', () => {
  it('clears all items', () => {
    expect(buildClearCommand(createDefaultClearOptions()).text).toBe('clear @s')
  })

  it('clears an item and optional max count', () => {
    expect(
      buildClearCommand({
        ...createDefaultClearOptions(),
        allItems: false,
        item: 'minecraft:diamond'
      }).text
    ).toBe('clear @s minecraft:diamond')
    expect(
      buildClearCommand({
        ...createDefaultClearOptions(),
        allItems: false,
        item: 'minecraft:diamond',
        maxCountEnabled: true,
        maxCount: '5'
      }).text
    ).toBe('clear @s minecraft:diamond 5')
  })

  it('validates count and ignores max count for all items', () => {
    const invalid = buildClearCommand({
      ...createDefaultClearOptions(),
      allItems: false,
      maxCountEnabled: true,
      maxCount: '-1'
    })
    expect(invalid.diagnostics.some((item) => item.code === 'clear.count')).toBe(true)
    expect(
      buildClearCommand({
        ...createDefaultClearOptions(),
        maxCountEnabled: true,
        maxCount: '5'
      }).text
    ).toBe('clear @s')
  })
})
