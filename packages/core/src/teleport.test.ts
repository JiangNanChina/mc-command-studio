import { describe, expect, it } from 'vitest'
import { buildTeleportCommand, createDefaultTeleportOptions } from './teleport'

describe('teleport', () => {
  it('builds position teleport', () => {
    const result = buildTeleportCommand({
      ...createDefaultTeleportOptions(),
      target: { base: '@a' },
      destination: { mode: 'position', position: { x: '0', y: '64', z: '0' } }
    })
    expect(result.text).toBe('tp @a 0 64 0')
  })

  it('adds rotation and entity destination', () => {
    expect(
      buildTeleportCommand({
        ...createDefaultTeleportOptions(),
        rotate: true,
        yaw: '90',
        pitch: '0',
        destination: { mode: 'position', position: { x: '~', y: '~', z: '~' } }
      }).text
    ).toBe('tp @s ~ ~ ~ 90 0')

    expect(
      buildTeleportCommand({
        ...createDefaultTeleportOptions(),
        destination: { mode: 'entity', target: { base: '@e', type: 'armor_stand' } }
      }).text
    ).toBe('tp @s @e[type=minecraft:armor_stand]')
  })

  it('warns when rotating an entity destination', () => {
    const result = buildTeleportCommand({
      ...createDefaultTeleportOptions(),
      rotate: true,
      destination: { mode: 'entity', target: { base: '@e' } }
    })
    expect(result.diagnostics.some((item) => item.code === 'tp.rotate.entity')).toBe(true)
  })
})
