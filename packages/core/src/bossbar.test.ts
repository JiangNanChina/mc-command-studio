import { describe, expect, it } from 'vitest'
import { buildBossbarCommands, createDefaultBossbarOptions } from './bossbar'

describe('bossbar', () => {
  it('builds a create sequence', () => {
    const result = buildBossbarCommands({
      ...createDefaultBossbarOptions(),
      id: 'mcstudio:raid',
      name: '袭击',
      color: 'purple',
      style: 'notched_10',
      max: '200',
      value: '120',
      players: { base: '@a' }
    })
    const lines = result.text.split('\n')
    expect(lines[0]).toBe('bossbar add mcstudio:raid "袭击"')
    expect(lines).toContain('bossbar set mcstudio:raid color purple')
    expect(lines).toContain('bossbar set mcstudio:raid style notched_10')
    expect(lines).toContain('bossbar set mcstudio:raid max 200')
    expect(lines).toContain('bossbar set mcstudio:raid value 120')
    expect(lines).toContain('bossbar set mcstudio:raid players @a')
  })

  it('builds update without add and remove', () => {
    const update = buildBossbarCommands({
      ...createDefaultBossbarOptions(),
      action: 'update',
      playersEnabled: false
    })
    expect(update.text.split('\n')[0]).toBe('bossbar set mcstudio:boss name "BOSS"')
    expect(update.text).not.toContain('bossbar add')
    expect(update.text).not.toContain(' players ')
    expect(
      buildBossbarCommands({ ...createDefaultBossbarOptions(), action: 'remove' }).text
    ).toBe('bossbar remove mcstudio:boss')
  })

  it('validates id, max and value', () => {
    const result = buildBossbarCommands({
      ...createDefaultBossbarOptions(),
      id: 'Bad ID',
      max: '0',
      value: '5',
      name: ''
    })
    expect(result.diagnostics.some((item) => item.code === 'bossbar.id')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'bossbar.max')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'bossbar.value.range')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'bossbar.name')).toBe(true)
  })
})
