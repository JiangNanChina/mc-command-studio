import { describe, expect, it } from 'vitest'
import { buildCloneCommand, createDefaultCloneOptions } from './clone'

describe('clone', () => {
  it('builds replace clone', () => {
    const result = buildCloneCommand({
      ...createDefaultCloneOptions(),
      begin: { x: '0', y: '64', z: '0' },
      end: { x: '2', y: '66', z: '2' },
      destination: { x: '10', y: '64', z: '0' }
    })
    expect(result.text).toBe('clone 0 64 0 2 66 2 10 64 0')
  })

  it('supports masked and filtered', () => {
    expect(
      buildCloneCommand({ ...createDefaultCloneOptions(), mode: 'masked' }).text
    ).toBe('clone ~ ~ ~ ~2 ~2 ~2 ~ ~ ~ masked')
    expect(
      buildCloneCommand({
        ...createDefaultCloneOptions(),
        mode: 'filtered',
        filter: 'minecraft:stone'
      }).text
    ).toBe('clone ~ ~ ~ ~2 ~2 ~2 ~ ~ ~ filtered minecraft:stone')
  })

  it('supports move and force', () => {
    expect(
      buildCloneCommand({ ...createDefaultCloneOptions(), move: 'force' }).text
    ).toBe('clone ~ ~ ~ ~2 ~2 ~2 ~ ~ ~ force')
  })

  it('requires a filter for filtered mode', () => {
    const result = buildCloneCommand({ ...createDefaultCloneOptions(), mode: 'filtered' })
    expect(result.diagnostics.some((item) => item.code === 'clone.filter')).toBe(true)
  })
})
