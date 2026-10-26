import { describe, expect, it } from 'vitest'
import { compareVersions, isNewerVersion, isValidVersion, parseVersion } from './version'

describe('version', () => {
  it('parses semver', () => {
    expect(parseVersion('v0.1.2')).toEqual({ major: 0, minor: 1, patch: 2, prerelease: [] })
  })

  it('compares major, minor and patch', () => {
    expect(compareVersions('1.0.0', '0.9.9')).toBe(1)
    expect(compareVersions('0.1.0', '0.1.1')).toBe(-1)
    expect(compareVersions('0.1.0', '0.1.0')).toBe(0)
  })

  it('treats prerelease as older than release', () => {
    expect(compareVersions('0.1.0-beta.1', '0.1.0')).toBe(-1)
    expect(compareVersions('0.1.0-beta.2', '0.1.0-beta.1')).toBe(1)
  })

  it('detects newer versions', () => {
    expect(isNewerVersion('0.1.1', '0.1.0')).toBe(true)
    expect(isNewerVersion('0.1.0', '0.1.0')).toBe(false)
  })

  it('validates version strings', () => {
    expect(isValidVersion('0.1.0')).toBe(true)
    expect(isValidVersion('v0.1.0-beta.1')).toBe(true)
    expect(isValidVersion('latest')).toBe(false)
  })
})
