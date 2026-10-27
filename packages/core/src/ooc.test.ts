import { describe, expect, it } from 'vitest'
import { buildOocCommand, createDefaultOocOptions } from './ooc'

describe('ooc', () => {
  it('builds falling sand chains', () => {
    const result = buildOocCommand({
      ...createDefaultOocOptions(),
      commands: 'say one\nsay two'
    })
    expect(result.text).toContain('summon minecraft:falling_block ~ ~1 ~')
    expect(result.text).toContain('Block:"minecraft:redstone_block"')
    expect(result.text).toContain('say one')
    expect(result.text).toContain('say two')
    expect(result.text.match(/minecraft:falling_block/g)?.length).toBe(3)
  })

  it('builds legacy command block and minecart syntax', () => {
    const block = buildOocCommand({
      ...createDefaultOocOptions(),
      mode: 'command-block',
      commands: '/say hi',
      x: '0',
      y: '64',
      z: '0'
    })
    expect(block.text).toBe(
      'setblock 0 64 0 command_block 1 replace {Command:"say hi",auto:1b,conditionMet:0b,powered:1b,TrackOutput:0b,UpdateLastExecution:0b}'
    )
    const minecart = buildOocCommand({
      ...createDefaultOocOptions(),
      mode: 'command-block-minecart',
      commands: 'say hi'
    })
    expect(minecart.text).toContain('summon commandblock_minecart ~ ~1 ~ {Command:"say hi"')
  })

  it('lays out multiple command blocks along Y', () => {
    const result = buildOocCommand({
      ...createDefaultOocOptions(),
      mode: 'command-block',
      x: '0',
      y: '64',
      z: '0',
      layerStep: '2',
      commands: 'say one\nsay two'
    })
    const lines = result.text.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('setblock 0 64 0 command_block')
    expect(lines[1]).toContain('setblock 0 66 0 command_block')
  })

  it('lays out along X and builds a conditional chain', () => {
    const result = buildOocCommand({
      ...createDefaultOocOptions(),
      mode: 'command-block',
      x: '0',
      y: '64',
      z: '0',
      layerStep: '1',
      layoutAxis: 'x',
      conditional: true,
      commands: 'say one\nsay two'
    })
    const lines = result.text.split('\n')
    expect(lines[0]).toContain('setblock 0 64 0 command_block 1 ')
    expect(lines[1]).toContain('setblock 1 64 0 command_block 9 ')
  })

  it('lays out a two-axis grid', () => {
    const result = buildOocCommand({
      ...createDefaultOocOptions(),
      mode: 'command-block',
      x: '0',
      y: '64',
      z: '0',
      layerStep: '1',
      layoutAxis: 'x',
      secondaryAxis: 'y',
      rowSize: '2',
      commands: 'say a\nsay b\nsay c\nsay d'
    })
    const lines = result.text.split('\n')
    expect(lines[0]).toContain('setblock 0 64 0')
    expect(lines[1]).toContain('setblock 0 65 0')
    expect(lines[2]).toContain('setblock 1 64 0')
    expect(lines[3]).toContain('setblock 1 65 0')
  })

  it('validates empty commands and coordinates', () => {
    const result = buildOocCommand({ ...createDefaultOocOptions(), commands: '', x: 'bad' })
    expect(result.diagnostics.some((item) => item.code === 'ooc.commands')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'ooc.coordinate')).toBe(true)
  })
})
