import { describe, expect, it } from 'vitest'
import {
  buildDifficultyCommand,
  buildTimeCommand,
  buildWeatherCommand,
  createDefaultWorldOptions
} from './world'

describe('world control', () => {
  it('builds time set/add/query', () => {
    const base = createDefaultWorldOptions().time
    expect(buildTimeCommand(base).text).toBe('time set day')
    expect(buildTimeCommand({ ...base, action: 'add', preset: 'night' }).text).toBe(
      'time add night'
    )
    expect(
      buildTimeCommand({ ...base, action: 'query', query: 'gametime' }).text
    ).toBe('time query gametime')
    expect(
      buildTimeCommand({ ...base, preset: 'custom', customTicks: '1500' }).text
    ).toBe('time set 1500')
  })

  it('validates custom ticks', () => {
    const result = buildTimeCommand({
      ...createDefaultWorldOptions().time,
      preset: 'custom',
      customTicks: '-5'
    })
    expect(result.diagnostics.some((item) => item.code === 'time.ticks')).toBe(true)
  })

  it('builds weather with optional duration', () => {
    const base = createDefaultWorldOptions().weather
    expect(buildWeatherCommand(base).text).toBe('weather clear')
    expect(
      buildWeatherCommand({
        ...base,
        type: 'thunder',
        durationEnabled: true,
        seconds: '6000'
      }).text
    ).toBe('weather thunder 6000')
    const invalid = buildWeatherCommand({
      ...base,
      durationEnabled: true,
      seconds: '0'
    })
    expect(invalid.diagnostics.some((item) => item.code === 'weather.duration')).toBe(true)
  })

  it('builds difficulty', () => {
    expect(buildDifficultyCommand({ level: 'hard' }).text).toBe('difficulty hard')
    expect(buildDifficultyCommand({ level: 'peaceful' }).text).toBe('difficulty peaceful')
  })
})
