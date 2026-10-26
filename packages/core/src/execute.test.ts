import { describe, expect, it } from 'vitest'
import { buildExecuteCommand, createDefaultExecuteOptions, type ExecuteClause } from './execute'

function clause(id: string, value: any): ExecuteClause {
  return { ...value, id } as ExecuteClause
}

describe('execute', () => {
  it('requires a run subcommand', () => {
    const result = buildExecuteCommand(createDefaultExecuteOptions())
    expect(result.text).toBe('execute')
    expect(result.diagnostics.some((item) => item.code === 'execute.run')).toBe(true)
  })

  it('builds a chain of clauses', () => {
    const result = buildExecuteCommand({
      clauses: [
        clause('1', { kind: 'as', selector: { base: '@a' } }),
        clause('2', { kind: 'at', selector: { base: '@s' } }),
        clause('3', { kind: 'positioned', position: { x: '~', y: '~1', z: '~' } }),
        clause('4', { kind: 'anchored', anchor: 'eyes' }),
        clause('5', { kind: 'rotated', yaw: '90', pitch: '0' }),
        clause('6', { kind: 'align', axes: 'xyz' }),
        clause('7', { kind: 'in', dimension: 'minecraft:the_nether' })
      ],
      run: 'say hello'
    })
    expect(result.text).toBe(
      'execute as @a at @s positioned ~ ~1 ~ anchored eyes rotated 90 0 align xyz in minecraft:the_nether run say hello'
    )
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toHaveLength(0)
  })

  it('builds if entity and unless block conditions', () => {
    const result = buildExecuteCommand({
      clauses: [
        clause('1', { kind: 'if', condition: { type: 'entity', selector: { base: '@e', type: 'zombie' } } }),
        clause('2', {
          kind: 'unless',
          condition: {
            type: 'block',
            position: { x: '0', y: '64', z: '0' },
            block: 'minecraft:stone'
          }
        })
      ],
      run: 'kill @s'
    })
    expect(result.text).toContain('if entity @e[type=minecraft:zombie]')
    expect(result.text).toContain('unless block 0 64 0 minecraft:stone')
  })

  it('builds score conditions and store', () => {
    const result = buildExecuteCommand({
      clauses: [
        clause('1', {
          kind: 'if',
          condition: {
            type: 'score',
            target: '@s',
            objective: 'kills',
            operator: '>=',
            source: '@s',
            sourceObjective: 'deaths'
          }
        }),
        clause('2', { kind: 'store', mode: 'result', target: '@s', objective: 'result' })
      ],
      run: 'say hi'
    })
    expect(result.text).toContain('if score @s kills >= @s deaths')
    expect(result.text).toContain('store result score @s result')
  })

  it('supports raw clauses and reports invalid values', () => {
    const result = buildExecuteCommand({
      clauses: [
        clause('1', { kind: 'raw', text: 'on vehicle' }),
        clause('2', { kind: 'align', axes: 'qq' }),
        clause('3', { kind: 'rotated', yaw: '', pitch: '' })
      ],
      run: ''
    })
    expect(result.text).toContain('on vehicle')
    expect(result.diagnostics.some((item) => item.code === 'execute.align')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'execute.rotated')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'execute.run')).toBe(true)
  })
})
