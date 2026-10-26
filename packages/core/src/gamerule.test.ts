import { describe, expect, it } from 'vitest'
import { buildGameruleCommand, createDefaultGameruleOptions } from './gamerule'

describe('gamerule', () => {
  it('sets boolean and integer rules', () => {
    expect(
      buildGameruleCommand({
        ...createDefaultGameruleOptions(),
        rule: 'keep_inventory',
        type: 'boolean',
        value: 'true'
      }).text
    ).toBe('gamerule keep_inventory true')
    expect(
      buildGameruleCommand({
        ...createDefaultGameruleOptions(),
        rule: 'random_tick_speed',
        type: 'integer',
        value: '3'
      }).text
    ).toBe('gamerule random_tick_speed 3')
  })

  it('queries a rule', () => {
    expect(
      buildGameruleCommand({ ...createDefaultGameruleOptions(), action: 'query' }).text
    ).toBe('gamerule keep_inventory')
  })

  it('validates values and rule names', () => {
    const bool = buildGameruleCommand({
      ...createDefaultGameruleOptions(),
      value: 'yes'
    })
    expect(bool.diagnostics.some((item) => item.code === 'gamerule.value')).toBe(true)
    const integer = buildGameruleCommand({
      ...createDefaultGameruleOptions(),
      type: 'integer',
      value: '1.5'
    })
    expect(integer.diagnostics.some((item) => item.code === 'gamerule.value')).toBe(true)
    const rule = buildGameruleCommand({
      ...createDefaultGameruleOptions(),
      rule: 'bad rule'
    })
    expect(rule.diagnostics.some((item) => item.code === 'gamerule.rule')).toBe(true)
  })
})
