import { describe, expect, it } from 'vitest'
import {
  buildSetblockCommand,
  createDefaultSetblockOptions,
  serializeBlockState
} from './setblock'

describe('setblock', () => {
  it('builds a default setblock command', () => {
    expect(buildSetblockCommand(createDefaultSetblockOptions()).text).toBe(
      'setblock ~ ~ ~ minecraft:stone'
    )
  })

  it('serializes block states and nbt without a space', () => {
    const result = buildSetblockCommand({
      position: { x: '0', y: '64', z: '0' },
      block: {
        id: 'minecraft:chest',
        states: { facing: 'east', type: 'single' },
        nbt: '{Items:[]}'
      },
      mode: 'replace'
    })
    expect(result.text).toBe(
      'setblock 0 64 0 minecraft:chest[facing=east,type=single]{Items:[]}'
    )
  })

  it('adds non-replace modes', () => {
    const result = buildSetblockCommand({
      ...createDefaultSetblockOptions(),
      mode: 'keep'
    })
    expect(result.text).toBe('setblock ~ ~ ~ minecraft:stone keep')
  })

  it('validates block id, state names and nbt', () => {
    expect(
      serializeBlockState({ id: '', states: {}, nbt: '' }).diagnostics.some(
        (item) => item.code === 'setblock.block'
      )
    ).toBe(true)
    expect(
      serializeBlockState({
        id: 'minecraft:oak_stairs',
        states: { 'bad key': 'x' },
        nbt: ''
      }).diagnostics.some((item) => item.code === 'setblock.state')
    ).toBe(true)
    expect(
      serializeBlockState({ id: 'minecraft:chest', states: {}, nbt: '{Items:[]' }).diagnostics.some(
        (item) => item.code === 'setblock.nbt'
      )
    ).toBe(true)
  })
})
