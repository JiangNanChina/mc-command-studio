import { describe, expect, it } from 'vitest'
import { getVersionCapabilities } from './versionCapabilities'

describe('version capabilities', () => {
  it('distinguishes the independent item codec boundaries', () => {
    expect(getVersionCapabilities('1.20.4').itemComponents).toBe(false)
    expect(getVersionCapabilities('1.20.5')).toEqual({
      itemComponents: true,
      textComponents: 'json-string',
      enchantments: 'levels',
      customModelData: 'integer'
    })
    expect(getVersionCapabilities('1.21.4')).toEqual({
      itemComponents: true,
      textComponents: 'json-string',
      enchantments: 'levels',
      customModelData: 'compound'
    })
    expect(getVersionCapabilities('1.21.5')).toEqual(getVersionCapabilities())
    expect(getVersionCapabilities().textComponents).toBe('snbt')
  })
})
