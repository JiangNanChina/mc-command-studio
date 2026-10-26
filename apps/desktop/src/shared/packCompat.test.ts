import { describe, expect, it } from 'vitest'
import { supportsLegacyForm } from '../renderer/src/lib/packCompat'

describe('legacy pack compatibility', () => {
  it('keeps common 1.20.4 commands on visual forms', () => {
    expect(supportsLegacyForm('give')).toBe(true)
    expect(supportsLegacyForm('summon')).toBe(true)
    expect(supportsLegacyForm('setblock')).toBe(true)
    expect(supportsLegacyForm('execute')).toBe(true)
    expect(supportsLegacyForm('team')).toBe(true)
    expect(supportsLegacyForm('data')).toBe(true)
  })

  it('routes version-sensitive commands to the command tree', () => {
    expect(supportsLegacyForm('gamerule')).toBe(false)
    expect(supportsLegacyForm('particle')).toBe(false)
    expect(supportsLegacyForm('attribute')).toBe(false)
  })

  it('enables loot now that 1.20.4 syntax is adapted', () => {
    expect(supportsLegacyForm('loot')).toBe(true)
  })
})

