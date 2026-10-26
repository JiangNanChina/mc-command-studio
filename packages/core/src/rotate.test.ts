import { describe, expect, it } from 'vitest'
import { buildRotateCommand, createDefaultRotateOptions } from './rotate'

describe('rotate', () => {
  it('builds absolute and relative rotation', () => {
    expect(buildRotateCommand(createDefaultRotateOptions()).text).toBe('rotate @s 0 0')
    expect(
      buildRotateCommand({ ...createDefaultRotateOptions(), yaw: '~90', pitch: '-10' }).text
    ).toBe('rotate @s ~90 -10')
  })

  it('builds facing location and entity', () => {
    expect(
      buildRotateCommand({
        ...createDefaultRotateOptions(),
        mode: 'facingLocation',
        position: { x: '0', y: '64', z: '0' }
      }).text
    ).toBe('rotate @s facing 0 64 0')
    expect(
      buildRotateCommand({
        ...createDefaultRotateOptions(),
        mode: 'facingEntity',
        facingTarget: { base: '@p' },
        anchor: 'feet'
      }).text
    ).toBe('rotate @s facing entity @p feet')
  })

  it('validates rotation numbers', () => {
    const result = buildRotateCommand({
      ...createDefaultRotateOptions(),
      yaw: 'abc',
      pitch: 'x'
    })
    expect(result.diagnostics.some((item) => item.code === 'rotate.yaw')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'rotate.pitch')).toBe(true)
  })
})
