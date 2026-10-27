import { describe, expect, it } from 'vitest'
import {
  buildBlockdata,
  buildEntitydata,
  buildReplaceitem,
  buildTestfor,
  buildLegacyGive,
  createDefaultBlockdata,
  createDefaultEntitydata,
  createDefaultGive,
  createDefaultReplaceitem,
  createDefaultTestfor
} from './legacy'

describe('1.12 legacy commands', () => {
  it('builds testfor with optional NBT', () => {
    expect(buildTestfor({ ...createDefaultTestfor(), nbt: '{Health:10f}' }).text).toBe(
      'testfor @a {Health:10f}'
    )
  })

  it('builds blockdata and entitydata', () => {
    expect(
      buildBlockdata({ ...createDefaultBlockdata(), x: '0', y: '64', z: '0', nbt: '{Lock:"key"}' })
        .text
    ).toBe('blockdata 0 64 0 {Lock:"key"}')
    expect(buildEntitydata({ ...createDefaultEntitydata(), nbt: '{NoGravity:1b}' }).text).toBe(
      'entitydata @e {NoGravity:1b}'
    )
  })

  it('builds replaceitem for entity and block', () => {
    const entity = buildReplaceitem({
      ...createDefaultReplaceitem(),
      item: 'minecraft:diamond',
      count: '3',
      data: '0'
    })
    expect(entity.text).toBe(
      'replaceitem entity @p slot.weapon.mainhand minecraft:diamond 3 0'
    )
    const block = buildReplaceitem({
      ...createDefaultReplaceitem(),
      target: 'block',
      x: '1',
      y: '2',
      z: '3',
      slot: 'slot.inventory.0'
    })
    expect(block.text).toContain('replaceitem block 1 2 3 slot.inventory.0')
  })

  it('builds legacy give with NBT', () => {
    const result = buildLegacyGive({
      ...createDefaultGive(),
      item: 'minecraft:diamond_sword',
      count: '1',
      data: '0',
      nbt: '{display:{Name:"Sword"}}'
    })
    expect(result.text).toBe(
      'give @p minecraft:diamond_sword 1 0 {display:{Name:"Sword"}}'
    )
  })

  it('validates NBT and counts', () => {
    const result = buildReplaceitem({
      ...createDefaultReplaceitem(),
      count: '0',
      data: '-1',
      nbt: 'bad'
    })
    expect(result.diagnostics.some((item) => item.code === 'legacy.count')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'legacy.data')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'legacy.nbt')).toBe(true)
  })
})
