import { describe, expect, it } from 'vitest'
import { buildWorldborderCommand, createDefaultWorldborderOptions } from './worldborder'

describe('worldborder', () => {
  it('builds set/add with optional time', () => {
    const base = createDefaultWorldborderOptions()
    expect(buildWorldborderCommand(base).text).toBe('worldborder set 1000')
    expect(
      buildWorldborderCommand({ ...base, action: 'add', distance: '-100', timeEnabled: true }).text
    ).toBe('worldborder add -100 10s')
  })

  it('builds center', () => {
    expect(
      buildWorldborderCommand({
        ...createDefaultWorldborderOptions(),
        action: 'center',
        x: '100',
        z: '-200'
      }).text
    ).toBe('worldborder center 100 -200')
  })

  it('builds damage and warning', () => {
    expect(
      buildWorldborderCommand({
        ...createDefaultWorldborderOptions(),
        action: 'damage-amount',
        value: '0.5'
      }).text
    ).toBe('worldborder damage amount 0.5')
    expect(
      buildWorldborderCommand({
        ...createDefaultWorldborderOptions(),
        action: 'warning-distance',
        value: '5'
      }).text
    ).toBe('worldborder warning distance 5')
    expect(
      buildWorldborderCommand({
        ...createDefaultWorldborderOptions(),
        action: 'warning-time',
        value: '20s'
      }).text
    ).toBe('worldborder warning time 20s')
  })

  it('builds get and validates numbers', () => {
    expect(
      buildWorldborderCommand({ ...createDefaultWorldborderOptions(), action: 'get' }).text
    ).toBe('worldborder get')
    const invalid = buildWorldborderCommand({
      ...createDefaultWorldborderOptions(),
      action: 'set',
      distance: 'abc',
      timeEnabled: true,
      time: 'ten'
    })
    expect(invalid.diagnostics.some((item) => item.code === 'worldborder.distance')).toBe(true)
    expect(invalid.diagnostics.some((item) => item.code === 'worldborder.time')).toBe(true)
  })
})
