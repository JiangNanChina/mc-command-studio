import { describe, expect, it } from 'vitest'
import { buildDatapackFiles } from './datapack'

const base = {
  command: '/give @s minecraft:stone',
  namespace: 'mcstudio',
  functionName: 'main',
  description: 'test pack',
  packFormat: 121,
  load: false,
  tick: false
}

describe('datapack export', () => {
  it('builds pack.mcmeta and a function', () => {
    const result = buildDatapackFiles(base)
    expect(result.functionId).toBe('mcstudio:main')
    expect(result.files.map((file) => file.path)).toEqual([
      'pack.mcmeta',
      'data/mcstudio/function/main.mcfunction'
    ])
    const functionFile = result.files[1]
    expect(functionFile.content).toBe('give @s minecraft:stone\n')
    const meta = JSON.parse(result.files[0].content)
    expect(meta.pack.pack_format).toBe(121)
  })

  it('adds load and tick tags', () => {
    const result = buildDatapackFiles({ ...base, load: true, tick: true, functionName: 'lib/main' })
    expect(result.functionId).toBe('mcstudio:lib/main')
    expect(result.files.some((file) => file.path.endsWith('tags/function/load.json'))).toBe(true)
    expect(result.files.some((file) => file.path.endsWith('tags/function/tick.json'))).toBe(true)
    expect(result.files.some((file) => file.path.endsWith('lib/main.mcfunction'))).toBe(true)
  })

  it('rejects invalid names and commands', () => {
    expect(() => buildDatapackFiles({ ...base, namespace: 'Bad Namespace' })).toThrow()
    expect(() => buildDatapackFiles({ ...base, functionName: 'a//b' })).toThrow()
    expect(() => buildDatapackFiles({ ...base, command: '  ' })).toThrow()
    expect(() => buildDatapackFiles({ ...base, command: 'say a\nsay b' })).toThrow()
  })
})
