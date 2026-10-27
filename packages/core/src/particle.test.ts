import { describe, expect, it } from 'vitest'
import {
  buildParticleCommand,
  createDefaultParticleOptions,
  inferredParticleMode
} from './particle'

describe('particle', () => {
  it('builds a plain particle', () => {
    expect(buildParticleCommand(createDefaultParticleOptions()).text).toBe(
      'particle minecraft:flame ~ ~1 ~ 0 0 0 0 1 normal'
    )
  })

  it('infers option modes', () => {
    expect(inferredParticleMode('minecraft:block')).toBe('block')
    expect(inferredParticleMode('minecraft:dust')).toBe('dust')
    expect(inferredParticleMode('minecraft:dust_color_transition')).toBe('dust_transition')
    expect(inferredParticleMode('minecraft:item')).toBe('item')
    expect(inferredParticleMode('minecraft:entity_effect')).toBe('rgba')
    expect(inferredParticleMode('minecraft:effect')).toBe('color')
    expect(inferredParticleMode('minecraft:instant_effect')).toBe('color')
    expect(inferredParticleMode('minecraft:flame')).toBe('none')
  })

  it('builds dust and block SNBT options', () => {
    const dust = buildParticleCommand({
      ...createDefaultParticleOptions(),
      particle: 'minecraft:dust',
      dustColor: '#ff0000',
      scale: '2'
    })
    expect(dust.text).toContain('particle minecraft:dust{color:[1,0,0],scale:2}')
    const block = buildParticleCommand({
      ...createDefaultParticleOptions(),
      particle: 'minecraft:block',
      block: 'minecraft:stone'
    })
    expect(block.text).toContain('particle minecraft:block{block_state:"minecraft:stone"}')
  })

  it('builds item, transition and rgba options', () => {
    expect(
      buildParticleCommand({
        ...createDefaultParticleOptions(),
        particle: 'minecraft:item',
        item: 'minecraft:diamond'
      }).text
    ).toContain('particle minecraft:item{item:"minecraft:diamond"}')
    expect(
      buildParticleCommand({
        ...createDefaultParticleOptions(),
        particle: 'minecraft:dust_color_transition',
        fromColor: '#ff0000',
        toColor: '#0000ff',
        scale: '1.5'
      }).text
    ).toContain(
      'particle minecraft:dust_color_transition{from_color:[1,0,0],to_color:[0,0,1],scale:1.5}'
    )
    expect(
      buildParticleCommand({
        ...createDefaultParticleOptions(),
        particle: 'minecraft:entity_effect',
        effectColor: '#00ff00',
        alpha: '0.5'
      }).text
    ).toContain('particle minecraft:entity_effect{color:[0,1,0,0.5]}')
  })

  it('supports raw SNBT and viewers', () => {
    const result = buildParticleCommand({
      ...createDefaultParticleOptions(),
      particle: 'minecraft:shriek',
      rawOptions: '{delay:20}',
      force: true,
      viewersEnabled: true,
      viewers: { base: '@a' }
    })
    expect(result.text).toBe('particle minecraft:shriek{delay:20} ~ ~1 ~ 0 0 0 0 1 force @a')
  })

  it('builds legacy 1.20.4 argument syntax', () => {
    const base = createDefaultParticleOptions()
    expect(buildParticleCommand(base, 'nbt').text).toBe(
      'particle minecraft:flame ~ ~1 ~ 0 0 0 0 1 normal'
    )
    expect(
      buildParticleCommand(
        { ...base, particle: 'minecraft:dust', dustColor: '#ff0000', scale: '2' },
        'nbt'
      ).text
    ).toBe('particle minecraft:dust 1 0 0 2 ~ ~1 ~ 0 0 0 0 1 normal')
    expect(
      buildParticleCommand(
        { ...base, particle: 'minecraft:block', block: 'minecraft:stone' },
        'nbt'
      ).text
    ).toBe('particle minecraft:block minecraft:stone ~ ~1 ~ 0 0 0 0 1 normal')
    expect(
      buildParticleCommand(
        { ...base, particle: 'minecraft:item', item: 'minecraft:diamond' },
        'nbt'
      ).text
    ).toBe('particle minecraft:item minecraft:diamond ~ ~1 ~ 0 0 0 0 1 normal')
    expect(
      buildParticleCommand(
        { ...base, particle: 'minecraft:shriek', rawOptions: '{delay:20}' },
        'nbt'
      ).diagnostics.some((item) => item.code === 'particle.legacy')
    ).toBe(true)
    expect(
      buildParticleCommand(
        { ...base, particle: 'minecraft:effect', effectColor: '#00ff00' },
        'nbt'
      ).text
    ).toContain('particle minecraft:effect 0 1 0 ~ ~1 ~')
  })

  it('validates numeric fields and raw syntax', () => {
    const result = buildParticleCommand({
      ...createDefaultParticleOptions(),
      particle: 'minecraft:dust',
      dustColor: 'red',
      scale: '0',
      count: '1.5',
      speed: '-1',
      deltaX: 'x'
    })
    expect(result.diagnostics.some((item) => item.code === 'particle.color')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'particle.scale')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'particle.count')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'particle.speed')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'particle.deltaX')).toBe(true)
  })
})
