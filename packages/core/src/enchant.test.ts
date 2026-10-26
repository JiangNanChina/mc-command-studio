import { describe, expect, it } from 'vitest'
import { buildEnchantCommand, createDefaultEnchantOptions } from './enchant'

describe('enchant', () => {
  it('builds enchant with level', () => {
    const result = buildEnchantCommand({
      ...createDefaultEnchantOptions(),
      target: { base: '@a' },
      enchantment: 'minecraft:sharpness',
      level: '5'
    })
    expect(result.text).toBe('enchant @a minecraft:sharpness 5')
  })

  it('adds namespace and validates level', () => {
    const result = buildEnchantCommand({
      ...createDefaultEnchantOptions(),
      enchantment: 'unbreaking',
      level: '300'
    })
    expect(result.text).toContain('minecraft:unbreaking')
    expect(result.diagnostics.some((item) => item.code === 'enchant.level')).toBe(true)
  })

  it('reports empty enchantment', () => {
    const result = buildEnchantCommand({ ...createDefaultEnchantOptions(), enchantment: '' })
    expect(result.diagnostics.some((item) => item.code === 'enchant.id')).toBe(true)
  })
})
