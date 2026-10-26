import { describe, expect, it } from 'vitest'
import { buildChainCommands, createDefaultChainOptions, type ChainBlock } from './chain'

function block(id: string, patch: Partial<ChainBlock> = {}): ChainBlock {
  return {
    id,
    command: 'say hi',
    kind: 'chain',
    conditional: false,
    auto: true,
    ...patch
  }
}

describe('command block chain', () => {
  it('builds an east-facing chain', () => {
    const result = buildChainCommands({
      origin: { x: '0', y: '64', z: '0' },
      direction: 'east',
      blocks: [
        block('1', { kind: 'impulse', auto: false, command: 'say one' }),
        block('2', { kind: 'chain', command: 'say two' })
      ]
    })
    const lines = result.text.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('setblock 0 64 0 minecraft:command_block[facing=east]')
    expect(lines[0]).toContain('Command:"say one"')
    expect(lines[1]).toContain('setblock 1 64 0 minecraft:chain_command_block[facing=east]')
  })

  it('offsets relative coordinates along each axis', () => {
    const result = buildChainCommands({
      origin: { x: '~', y: '~1', z: '~-2' },
      direction: 'west',
      blocks: [block('1'), block('2'), block('3')]
    })
    expect(result.text.split('\n')[2]).toContain('setblock ~-2 ~1 ~-2')
  })

  it('vertical chains and conditional blocks', () => {
    const result = buildChainCommands({
      origin: { x: '1', y: '2', z: '3' },
      direction: 'up',
      blocks: [block('1', { conditional: true }), block('2', { kind: 'repeating' })]
    })
    expect(result.text).toContain('facing=up,conditional=true')
    expect(result.text).toContain('setblock 1 3 3 minecraft:repeating_command_block')
  })

  it('escapes quotes in commands', () => {
    const result = buildChainCommands({
      origin: { x: '0', y: '0', z: '0' },
      direction: 'north',
      blocks: [block('1', { command: 'tellraw @a {"text":"hi"}' })]
    })
    expect(result.text).toContain('Command:"tellraw @a {\\"text\\":\\"hi\\"}"')
  })

  it('reports empty commands and local coordinates', () => {
    const result = buildChainCommands({
      origin: { x: '^', y: '~', z: '~' },
      direction: 'east',
      blocks: [block('1', { command: '' })]
    })
    expect(result.diagnostics.some((item) => item.code === 'chain.command')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'chain.local')).toBe(true)
  })
})
