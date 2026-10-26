import { describe, expect, it } from 'vitest'
import { buildScheduleCommand, createDefaultScheduleOptions } from './schedule'

describe('schedule', () => {
  it('builds function scheduling', () => {
    expect(buildScheduleCommand(createDefaultScheduleOptions()).text).toBe(
      'schedule function mcstudio:main 1s replace'
    )
    expect(
      buildScheduleCommand({ ...createDefaultScheduleOptions(), mode: 'append', time: '20t' })
        .text
    ).toBe('schedule function mcstudio:main 20t append')
  })

  it('builds clear', () => {
    expect(
      buildScheduleCommand({ ...createDefaultScheduleOptions(), action: 'clear' }).text
    ).toBe('schedule clear mcstudio:main')
  })

  it('validates time and function ids', () => {
    const result = buildScheduleCommand({
      ...createDefaultScheduleOptions(),
      time: 'soon',
      functionName: 'bad id'
    })
    expect(result.diagnostics.some((item) => item.code === 'schedule.time')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'schedule.function')).toBe(true)
  })
})
