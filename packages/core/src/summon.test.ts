import { describe, expect, it } from 'vitest'
import { buildSummonCommand, createDefaultSummonOptions } from './summon'

describe('summon', () => {
  it('builds a default summon command', () => {
    expect(buildSummonCommand(createDefaultSummonOptions()).text).toBe(
      'summon minecraft:zombie ~ ~ ~'
    )
  })

  it('adds nbt after position', () => {
    const result = buildSummonCommand({
      ...createDefaultSummonOptions(),
      position: { x: '0', y: '64', z: '0' },
      nbt: '{NoAI:1b,CustomName:"\\"Test\\""}'
    })
    expect(result.text).toBe(
      'summon minecraft:zombie 0 64 0 {NoAI:1b,CustomName:"\\"Test\\""}'
    )
  })

  it('omits position when disabled', () => {
    expect(
      buildSummonCommand({ ...createDefaultSummonOptions(), usePosition: false }).text
    ).toBe('summon minecraft:zombie')
  })

  it('warns when nbt is set without position', () => {
    const result = buildSummonCommand({
      ...createDefaultSummonOptions(),
      usePosition: false,
      nbt: '{NoAI:1b}'
    })
    expect(result.text).toBe('summon minecraft:zombie')
    expect(result.diagnostics.some((item) => item.code === 'summon.nbt.position')).toBe(true)
  })

  it('rejects unbalanced nbt and empty entity', () => {
    expect(
      buildSummonCommand({ ...createDefaultSummonOptions(), nbt: '{NoAI:1b' }).diagnostics.some(
        (item) => item.code === 'summon.nbt'
      )
    ).toBe(true)
    expect(
      buildSummonCommand({ ...createDefaultSummonOptions(), entity: '' }).diagnostics.some(
        (item) => item.code === 'summon.entity'
      )
    ).toBe(true)
  })
})
