import { describe, expect, it } from 'vitest'
import { buildDatapackFiles } from './datapack'

const base = {
  namespace: 'mcstudio',
  description: 'test pack',
  packFormat: 121,
  functions: [{ name: 'main', commands: '/give @s minecraft:stone' }],
  loadFunction: '',
  tickFunction: ''
}

describe('datapack export', () => {
  it('builds pack.mcmeta and functions', () => {
    const result = buildDatapackFiles(base)
    expect(result.functionIds).toEqual(['mcstudio:main'])
    expect(result.files.map((file) => file.path)).toEqual([
      'pack.mcmeta',
      'data/mcstudio/function/main.mcfunction'
    ])
    expect(result.files[1].content).toBe('give @s minecraft:stone\n')
    const meta = JSON.parse(result.files[0].content)
    expect(meta.pack.pack_format).toBe(121)
  })

  it('builds multiple functions with load and tick tags', () => {
    const result = buildDatapackFiles({
      ...base,
      functions: [
        { name: 'main', commands: 'say hi' },
        { name: 'lib/init', commands: 'scoreboard objectives add kills dummy\n' }
      ],
      loadFunction: 'lib/init',
      tickFunction: 'main'
    })
    expect(result.functionIds).toEqual(['mcstudio:main', 'mcstudio:lib/init'])
    expect(result.files.some((file) => file.path.endsWith('lib/init.mcfunction'))).toBe(true)
    const load = result.files.find((file) => file.path.endsWith('load.json'))
    const tick = result.files.find((file) => file.path.endsWith('tick.json'))
    expect(JSON.parse(load!.content).values).toEqual(['mcstudio:lib/init'])
    expect(JSON.parse(tick!.content).values).toEqual(['mcstudio:main'])
  })

  it('allows empty function bodies', () => {
    const result = buildDatapackFiles({ ...base, functions: [{ name: 'empty', commands: '' }] })
    expect(result.files[1].content).toBe('')
  })

  it('rejects invalid names, duplicates and missing tag functions', () => {
    expect(() => buildDatapackFiles({ ...base, namespace: 'Bad Namespace' })).toThrow()
    expect(() => buildDatapackFiles({ ...base, functions: [] })).toThrow()
    expect(() =>
      buildDatapackFiles({
        ...base,
        functions: [
          { name: 'main', commands: '' },
          { name: 'main', commands: '' }
        ]
      })
    ).toThrow()
    expect(() => buildDatapackFiles({ ...base, loadFunction: 'missing' })).toThrow()
  })

  it('adds advancement, predicate and loot table JSON files', () => {
    const result = buildDatapackFiles({
      ...base,
      files: [
        { type: 'predicate', name: 'is_sneaking', content: '{"condition":"minecraft:entity_properties"}' },
        { type: 'loot_table', name: 'chest/reward', content: '{"type":"minecraft:chest","pools":[]}' },
        { type: 'advancement', name: 'root', content: '{"criteria":{"tick":{"trigger":"minecraft:tick"}}}' }
      ]
    })
    expect(result.files.map((file) => file.path)).toEqual(
      expect.arrayContaining([
        'data/mcstudio/predicate/is_sneaking.json',
        'data/mcstudio/loot_table/chest/reward.json',
        'data/mcstudio/advancement/root.json'
      ])
    )
  })

  it('rejects invalid JSON and duplicate data paths', () => {
    expect(() =>
      buildDatapackFiles({
        ...base,
        files: [{ type: 'predicate', name: 'bad', content: 'not json' }]
      })
    ).toThrow()
    expect(() =>
      buildDatapackFiles({
        ...base,
        files: [
          { type: 'predicate', name: 'same', content: '{}' },
          { type: 'predicate', name: 'same', content: '{}' }
        ]
      })
    ).toThrow()
  })
})
