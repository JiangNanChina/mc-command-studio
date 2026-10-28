import { describe, expect, it } from 'vitest'
import { getVersionCapabilities } from './versionCapabilities'

describe('version capabilities', () => {
  it('distinguishes the independent item codec boundaries', () => {
    expect(getVersionCapabilities('1.20.4').itemComponents).toBe(false)
    expect(getVersionCapabilities('1.20.5')).toEqual({
      itemComponents: true,
      textComponents: 'json-string',
      enchantments: 'levels',
      customModelData: 'integer',
      attributeModifiers: 'legacy',
      attributeTypeFormat: 'generic',
      blockPredicates: 'wrapped'
    })
    expect(getVersionCapabilities('1.21.1').attributeModifiers).toBe('wrapped')
    expect(getVersionCapabilities('1.21.1').attributeTypeFormat).toBe('generic')
    expect(getVersionCapabilities('1.21.2').attributeTypeFormat).toBe('bare')
    expect(getVersionCapabilities('1.21.4')).toEqual({
      itemComponents: true,
      textComponents: 'json-string',
      enchantments: 'levels',
      customModelData: 'compound',
      attributeModifiers: 'wrapped',
      attributeTypeFormat: 'bare',
      blockPredicates: 'wrapped'
    })
    expect(getVersionCapabilities('1.21.5')).toEqual(getVersionCapabilities())
    expect(getVersionCapabilities().textComponents).toBe('snbt')
    expect(getVersionCapabilities('1.21.5').attributeModifiers).toBe('list')
    expect(getVersionCapabilities('1.21.5').attributeTypeFormat).toBe('bare')
    expect(getVersionCapabilities('1.21.5').blockPredicates).toBe('list')
  })
})
