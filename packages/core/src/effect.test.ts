import { describe, expect, it } from 'vitest'
import { buildEffectCommand, createDefaultEffectOptions } from './effect'

describe('effect', () => {
  it('builds give with duration and amplifier', () => {
    const result = buildEffectCommand({
      ...createDefaultEffectOptions(),
      target: { base: '@a' },
      effect: 'minecraft:speed'
    })
    expect(result.text).toBe('effect give @a minecraft:speed 30 0')
  })

  it('supports hiding particles and clearing one effect', () => {
    expect(
      buildEffectCommand({ ...createDefaultEffectOptions(), hideParticles: true }).text
    ).toBe('effect give @s minecraft:speed 30 0 true')
    expect(
      buildEffectCommand({
        ...createDefaultEffectOptions(),
        action: 'clear',
        effect: 'minecraft:speed'
      }).text
    ).toBe('effect clear @s minecraft:speed')
    expect(
      buildEffectCommand({
        ...createDefaultEffectOptions(),
        action: 'clear',
        effect: ''
      }).text
    ).toBe('effect clear @s')
  })

  it('supports permanent effects', () => {
    const result = buildEffectCommand({
      ...createDefaultEffectOptions(),
      effect: 'minecraft:night_vision',
      permanent: true,
      duration: '',
      amplifier: '0'
    })
    expect(result.text).toBe('effect give @s minecraft:night_vision infinite 0')
  })

  it('validates duration and amplifier', () => {
    const result = buildEffectCommand({
      ...createDefaultEffectOptions(),
      duration: '0',
      amplifier: '300'
    })
    expect(result.diagnostics.some((item) => item.code === 'effect.duration')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'effect.amplifier')).toBe(true)
  })
})
