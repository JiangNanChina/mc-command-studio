import { describe, expect, it } from 'vitest'
import { isNewerVersion } from './version'

describe('isNewerVersion', () => {
  it('compares stable versions', () => {
    expect(isNewerVersion('0.6.0', '0.5.0')).toBe(true)
    expect(isNewerVersion('0.5.0', '0.5.0')).toBe(false)
    expect(isNewerVersion('0.5.0', '0.6.0')).toBe(false)
  })

  it('compares test prereleases', () => {
    expect(isNewerVersion('0.5.1-test.2', '0.5.1-test.1')).toBe(true)
    expect(isNewerVersion('0.5.1-test.1', '0.5.1-test.1')).toBe(false)
    expect(isNewerVersion('0.5.1-test.1', '0.5.1')).toBe(false)
    expect(isNewerVersion('0.5.1', '0.5.1-test.1')).toBe(true)
  })
})
