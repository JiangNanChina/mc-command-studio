import { describe, expect, it } from 'vitest'
import { buildXpCommand, createDefaultXpOptions } from './xp'

describe('xp', () => {
  it('builds add points', () => {
    const result = buildXpCommand({ ...createDefaultXpOptions(), amount: '100' })
    expect(result.text).toBe('xp add @s 100')
  })

  it('builds set levels and query', () => {
    expect(
      buildXpCommand({
        ...createDefaultXpOptions(),
        action: 'set',
        amount: '30',
        unit: 'levels'
      }).text
    ).toBe('xp set @s 30 levels')
    expect(
      buildXpCommand({ ...createDefaultXpOptions(), action: 'query', unit: 'levels' }).text
    ).toBe('xp query @s levels')
  })

  it('allows zero and rejects invalid amount', () => {
    expect(buildXpCommand({ ...createDefaultXpOptions(), amount: '0' }).text).toBe('xp add @s 0')
    const result = buildXpCommand({ ...createDefaultXpOptions(), amount: '-2' })
    expect(result.diagnostics.some((item) => item.code === 'xp.amount')).toBe(true)
  })
})
