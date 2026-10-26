import { describe, expect, it } from 'vitest'
import {
  createVersionPack,
  parsePackManifest,
  pickRegistries
} from './pack'

const manifest = {
  schemaVersion: 1,
  id: '26.3',
  gameVersion: '26.3',
  dataVersion: 5023,
  packFormat: 121,
  type: 'release',
  generatedAt: '2026-01-01T00:00:00.000Z',
  sources: [{ name: 'commands', url: 'https://example.com', sha256: 'a'.repeat(64) }],
  files: { commands: 'commands.json' },
  counts: {
    roots: 94,
    literals: 1197,
    parsers: 59,
    items: 1658,
    blocks: 1286,
    enchantments: 43,
    entities: 161
  }
}

describe('version pack', () => {
  it('parses a valid manifest', () => {
    expect(parsePackManifest(manifest).id).toBe('26.3')
  })

  it('rejects an invalid manifest', () => {
    expect(() => parsePackManifest({ ...manifest, id: '' })).toThrow()
    expect(() => parsePackManifest({ ...manifest, type: 'weekly' })).toThrow()
  })

  it('creates a pack from raw JSON', () => {
    const pack = createVersionPack({
      manifest,
      commands: { type: 'root', children: { give: { type: 'literal' } } },
      registries: { item: ['stone'], block: ['stone'] },
      blocks: { stone: [{}, {}] },
      itemComponents: { stone: {} }
    })
    expect(pack.commands.children?.give.type).toBe('literal')
    expect(pack.registries.item).toEqual(['stone'])
  })

  it('picks only requested registries', () => {
    const picked = pickRegistries({ item: ['a'], block: ['b'], other: ['c'] }, ['item'])
    expect(picked).toEqual({ item: ['a'] })
  })

  it('rejects a commands root with the wrong type', () => {
    expect(() =>
      createVersionPack({
        manifest,
        commands: { type: 'literal', children: {} },
        registries: {},
        blocks: {},
        itemComponents: {}
      })
    ).toThrowError(/root/)
  })
})
