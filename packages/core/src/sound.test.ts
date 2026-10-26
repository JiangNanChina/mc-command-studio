import { describe, expect, it } from 'vitest'
import { buildSoundCommand, createDefaultSoundOptions } from './sound'

describe('sound', () => {
  it('builds playsound with all fields', () => {
    const result = buildSoundCommand({
      ...createDefaultSoundOptions(),
      target: { base: '@a' },
      sound: 'minecraft:block.note_block.pling',
      source: 'record',
      volume: '0.5',
      pitch: '1.2'
    })
    expect(result.text).toBe(
      'playsound minecraft:block.note_block.pling record @a ~ ~ ~ 0.5 1.2 0'
    )
  })

  it('builds stopsound variants', () => {
    expect(
      buildSoundCommand({ ...createDefaultSoundOptions(), action: 'stop', stopMode: 'all' }).text
    ).toBe('stopsound @s')
    expect(
      buildSoundCommand({
        ...createDefaultSoundOptions(),
        action: 'stop',
        stopMode: 'source',
        source: 'block'
      }).text
    ).toBe('stopsound @s block')
    expect(
      buildSoundCommand({
        ...createDefaultSoundOptions(),
        action: 'stop',
        stopMode: 'sound',
        source: 'block',
        sound: 'minecraft:block.chest.open'
      }).text
    ).toBe('stopsound @s block minecraft:block.chest.open')
  })

  it('validates sound and numeric fields', () => {
    const result = buildSoundCommand({
      ...createDefaultSoundOptions(),
      sound: '',
      volume: '-1',
      pitch: '0'
    })
    expect(result.diagnostics.some((item) => item.code === 'sound.id')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'sound.volume')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'sound.pitch')).toBe(true)
  })
})
