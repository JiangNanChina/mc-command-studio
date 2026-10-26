import { describe, expect, it } from 'vitest'
import {
  buildCommandBlockNbt,
  buildCommandBlockSetblock,
  createDefaultCommandBlockOptions
} from './commandBlock'

describe('command block', () => {
  it('builds a default setblock command', () => {
    const result = buildCommandBlockSetblock('give @s minecraft:stone', createDefaultCommandBlockOptions())
    expect(result.text).toBe(
      'setblock 0 64 0 minecraft:command_block[facing=up]{Command:"give @s minecraft:stone",auto:0b,conditionMet:0b,powered:1b,TrackOutput:0b,UpdateLastExecution:0b}'
    )
    expect(result.diagnostics).toHaveLength(0)
  })

  it('escapes quotes inside the command', () => {
    const result = buildCommandBlockSetblock('tellraw @a {text:"hi"}', createDefaultCommandBlockOptions())
    expect(result.text).toContain('Command:"tellraw @a {text:\\"hi\\"}"')
  })

  it('supports facing and conditional state', () => {
    const result = buildCommandBlockSetblock('say hi', {
      ...createDefaultCommandBlockOptions(),
      facing: 'north',
      conditional: true,
      auto: true,
      trackOutput: true
    })
    expect(result.text).toContain('command_block[facing=north,conditional=true]')
    expect(result.text).toContain('auto:1b')
    expect(result.text).toContain('TrackOutput:1b')
  })

  it('rejects commands with newlines', () => {
    const result = buildCommandBlockSetblock('say a\nsay b', createDefaultCommandBlockOptions())
    expect(result.diagnostics.some((item) => item.code === 'commandblock.newline')).toBe(true)
  })

  it('rejects invalid coordinates', () => {
    const result = buildCommandBlockSetblock('say hi', {
      ...createDefaultCommandBlockOptions(),
      x: 'abc'
    })
    expect(result.diagnostics.some((item) => item.code === 'commandblock.coordinate')).toBe(true)
  })

  it('produces NBT without outer braces', () => {
    const nbt = buildCommandBlockNbt('say hi', {
      auto: false,
      powered: false,
      trackOutput: false
    })
    expect(nbt.startsWith('Command:"say hi"')).toBe(true)
    expect(nbt).toContain('powered:0b')
  })
})
