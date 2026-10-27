import { describe, expect, it } from 'vitest'
import { supportsLegacyForm } from '../renderer/src/lib/packCompat'
import { particleModeSupported } from '../renderer/src/lib/versionFeatures'

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
    expect(supportsLegacyForm('visit')).toBe(false)
  })

  it('enables adapted forms', () => {
    expect(supportsLegacyForm('loot')).toBe(true)
    expect(supportsLegacyForm('gamerule')).toBe(true)
    expect(supportsLegacyForm('attribute')).toBe(true)
    expect(supportsLegacyForm('particle')).toBe(true)
  })

  it('filters particle modes by version', () => {
    expect(particleModeSupported('1.13.2', 'nbt', 'block')).toBe(true)
    expect(particleModeSupported('1.13.2', 'nbt', 'dust_transition')).toBe(false)
    expect(particleModeSupported('1.20.4', 'nbt', 'dust_transition')).toBe(true)
    expect(particleModeSupported('1.20.4', 'nbt', 'raw')).toBe(false)
    expect(particleModeSupported('26.3', 'components', 'raw')).toBe(true)
  })
})

