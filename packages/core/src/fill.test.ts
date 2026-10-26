import { describe, expect, it } from 'vitest'
import { buildFillCommand, createDefaultFillOptions } from './fill'

describe('fill', () => {
  it('builds replace without filter', () => {
    const result = buildFillCommand({
      ...createDefaultFillOptions(),
      from: { x: '0', y: '64', z: '0' },
      to: { x: '2', y: '66', z: '2' },
      block: 'minecraft:stone'
    })
    expect(result.text).toBe('fill 0 64 0 2 66 2 minecraft:stone')
  })

  it('builds replace with filter and other modes', () => {
    expect(
      buildFillCommand({ ...createDefaultFillOptions(), filter: 'minecraft:dirt' }).text
    ).toBe('fill ~ ~ ~ ~2 ~2 ~2 minecraft:stone replace minecraft:dirt')
    expect(
      buildFillCommand({ ...createDefaultFillOptions(), mode: 'hollow' }).text
    ).toBe('fill ~ ~ ~ ~2 ~2 ~2 minecraft:stone hollow')
  })

  it('reports empty block and ignored filter', () => {
    const result = buildFillCommand({
      ...createDefaultFillOptions(),
      block: '',
      mode: 'keep',
      filter: 'minecraft:dirt'
    })
    expect(result.diagnostics.some((item) => item.code === 'fill.block')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'fill.filter')).toBe(true)
  })
})
