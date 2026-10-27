import { describe, expect, it } from 'vitest'
import type { VersionPack } from '@mcstudio/core'
import {
  hasCommandPath,
  hasLiteral,
  isLegacyNbtPack,
  particleModeSupported
} from './versionFeatures'

function pack(engine: 'nbt' | 'components' | 'legacy'): VersionPack {
  return {
    manifest: {
      schemaVersion: 1,
      id: 'test',
      gameVersion: 'test',
      dataVersion: 1,
      packFormat: 1,
      engine,
      type: 'release',
      generatedAt: '2026-01-01T00:00:00.000Z',
      sources: [],
      files: {},
      counts: {
        roots: 1,
        literals: 1,
        parsers: 1,
        items: 0,
        blocks: 0,
        enchantments: 0,
        entities: 0
      }
    },
    commands: {
      type: 'root',
      children: {
        give: {
          type: 'literal',
          children: {
            target: { type: 'argument', parser: 'minecraft:entity', executable: true },
            mode: { type: 'literal', executable: true }
          }
        }
      }
    },
    registries: {},
    blocks: {},
    itemComponents: {}
  }
}

describe('version features', () => {
  it('detects tree paths and literals', () => {
    const value = pack('components')
    expect(hasCommandPath(value, 'give', 'target')).toBe(true)
    expect(hasCommandPath(value, 'missing')).toBe(false)
    expect(hasLiteral(value, 'give', 'mode')).toBe(true)
    expect(hasLiteral(value, 'give', 'other')).toBe(false)
  })

  it('classifies engines', () => {
    expect(isLegacyNbtPack(pack('nbt'))).toBe(true)
    expect(isLegacyNbtPack(pack('components'))).toBe(false)
    expect(isLegacyNbtPack(pack('legacy'))).toBe(false)
  })

  it('gates particle modes by engine and version', () => {
    expect(particleModeSupported('1.20.4', 'nbt', 'raw')).toBe(false)
    expect(particleModeSupported('1.20.5', 'components', 'raw')).toBe(true)
    expect(particleModeSupported('1.13.2', 'nbt', 'dust_transition')).toBe(false)
    expect(particleModeSupported('1.14.4', 'nbt', 'dust_transition')).toBe(true)
  })
})
