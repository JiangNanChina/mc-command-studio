import { describe, expect, it } from 'vitest'
import { buildDamageCommand, createDefaultDamageOptions } from './damage'

describe('damage', () => {
  it('builds a basic damage command', () => {
    expect(buildDamageCommand(createDefaultDamageOptions()).text).toBe(
      'damage @s 5 minecraft:generic'
    )
  })

  it('builds at and by sources', () => {
    expect(
      buildDamageCommand({
        ...createDefaultDamageOptions(),
        source: 'at',
        position: { x: '0', y: '64', z: '0' },
        damageType: 'minecraft:lava'
      }).text
    ).toBe('damage @s 5 minecraft:lava at 0 64 0')
    expect(
      buildDamageCommand({
        ...createDefaultDamageOptions(),
        source: 'by',
        sourceEntity: { base: '@p' }
      }).text
    ).toBe('damage @s 5 minecraft:generic by @p')
  })

  it('validates amount and type', () => {
    const result = buildDamageCommand({
      ...createDefaultDamageOptions(),
      amount: '-1',
      damageType: 'bad type'
    })
    expect(result.diagnostics.some((item) => item.code === 'damage.amount')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'damage.type')).toBe(true)
  })
})
