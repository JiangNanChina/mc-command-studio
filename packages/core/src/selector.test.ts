import { describe, expect, it } from 'vitest'
import { hasErrors } from './diagnostics'
import { createDefaultSelector, serializeSelector } from './selector'

describe('selector', () => {
  it('serializes the default selector', () => {
    expect(serializeSelector(createDefaultSelector()).text).toBe('@s')
  })

  it('serializes a full selector in a stable order', () => {
    const result = serializeSelector({
      base: '@e',
      name: 'Steve',
      type: 'zombie',
      tag: 'boss',
      distance: '0..10',
      level: '1..5',
      gamemode: 'creative',
      limit: 2,
      sort: 'nearest',
      x: '1',
      y: '~2',
      z: '3',
      dx: '5',
      dy: '5',
      dz: '5',
      scores: { kills: { min: 1, max: 5 } },
      nbt: '{NoAI:1b}',
      team: 'red'
    })
    expect(result.text).toBe(
      '@e[name="Steve",type=minecraft:zombie,tag="boss",distance=0..10,level=1..5,gamemode=creative,limit=2,sort=nearest,x=1,y=~2,z=3,dx=5,dy=5,dz=5,scores={kills=1..5},nbt={NoAI:1b},team="red"]'
    )
    expect(hasErrors(result.diagnostics)).toBe(false)
  })

  it('reports invalid distance and limit', () => {
    const result = serializeSelector({ base: '@e', distance: 'abc', limit: 0 })
    expect(result.diagnostics.some((item) => item.field === 'distance')).toBe(true)
    expect(result.diagnostics.some((item) => item.field === 'limit')).toBe(true)
  })

  it('quotes names with special characters', () => {
    const result = serializeSelector({ base: '@a', name: 'A "B"' })
    expect(result.text).toBe('@a[name="A \\"B\\""]')
  })

  it('validates nbt compound balance', () => {
    const result = serializeSelector({ base: '@e', nbt: '{NoAI:1b' })
    expect(result.diagnostics.some((item) => item.code === 'selector.nbt')).toBe(true)
  })

  it('supports score ranges', () => {
    const result = serializeSelector({
      base: '@a',
      scores: { kills: { min: 5, max: null }, deaths: { min: null, max: 3 } }
    })
    expect(result.text).toBe('@a[scores={kills=5..,deaths=..3}]')
  })
})
