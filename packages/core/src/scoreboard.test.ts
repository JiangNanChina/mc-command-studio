import { describe, expect, it } from 'vitest'
import { buildScoreboardCommand, createDefaultScoreboardOptions } from './scoreboard'

describe('scoreboard', () => {
  it('creates and removes objectives', () => {
    expect(
      buildScoreboardCommand({
        ...createDefaultScoreboardOptions(),
        objective: 'kills',
        criteria: 'deathCount',
        displayName: '死亡数'
      }).text
    ).toBe('scoreboard objectives add kills deathCount "死亡数"')
    expect(
      buildScoreboardCommand({ ...createDefaultScoreboardOptions(), action: 'objective-remove' }).text
    ).toBe('scoreboard objectives remove kills')
  })

  it('sets display slots', () => {
    expect(
      buildScoreboardCommand({
        ...createDefaultScoreboardOptions(),
        action: 'objective-display',
        slot: 'sidebar',
        objective: 'kills'
      }).text
    ).toBe('scoreboard objectives setdisplay sidebar kills')
    expect(
      buildScoreboardCommand({
        ...createDefaultScoreboardOptions(),
        action: 'objective-display',
        slot: 'sidebar',
        objective: ''
      }).text
    ).toBe('scoreboard objectives setdisplay sidebar')
  })

  it('sets, adds, removes, resets and gets player scores', () => {
    expect(
      buildScoreboardCommand({
        ...createDefaultScoreboardOptions(),
        action: 'players-set',
        score: '10'
      }).text
    ).toBe('scoreboard players set @s kills 10')
    expect(
      buildScoreboardCommand({
        ...createDefaultScoreboardOptions(),
        action: 'players-add',
        score: '5'
      }).text
    ).toBe('scoreboard players add @s kills 5')
    expect(
      buildScoreboardCommand({
        ...createDefaultScoreboardOptions(),
        action: 'players-remove',
        score: '2'
      }).text
    ).toBe('scoreboard players remove @s kills 2')
    expect(
      buildScoreboardCommand({ ...createDefaultScoreboardOptions(), action: 'players-reset' }).text
    ).toBe('scoreboard players reset @s kills')
    expect(
      buildScoreboardCommand({ ...createDefaultScoreboardOptions(), action: 'players-get' }).text
    ).toBe('scoreboard players get @s kills')
  })

  it('builds operations', () => {
    expect(
      buildScoreboardCommand({
        ...createDefaultScoreboardOptions(),
        action: 'players-operation',
        operation: '+=',
        source: { base: '@p' },
        sourceObjective: 'deaths'
      }).text
    ).toBe('scoreboard players operation @s kills += @p deaths')
  })

  it('modifies objective display settings', () => {
    const base = {
      ...createDefaultScoreboardOptions(),
      action: 'objective-modify' as const
    }
    expect(buildScoreboardCommand({ ...base, modifyField: 'displayname', displayName: '击杀' }).text).toBe(
      'scoreboard objectives modify kills displayname "击杀"'
    )
    expect(buildScoreboardCommand({ ...base, modifyField: 'displayautoupdate', autoUpdate: false }).text).toBe(
      'scoreboard objectives modify kills displayautoupdate false'
    )
    expect(buildScoreboardCommand({ ...base, modifyField: 'numberformat', numberFormat: 'blank' }).text).toBe(
      'scoreboard objectives modify kills numberformat blank'
    )
    expect(
      buildScoreboardCommand({
        ...base,
        modifyField: 'numberformat',
        numberFormat: 'fixed',
        numberFormatValue: '积分'
      }).text
    ).toBe('scoreboard objectives modify kills numberformat fixed "积分"')
    expect(buildScoreboardCommand({ ...base, modifyField: 'rendertype', renderType: 'hearts' }).text).toBe(
      'scoreboard objectives modify kills rendertype hearts'
    )
  })

  it('validates objective names and scores', () => {
    const result = buildScoreboardCommand({
      ...createDefaultScoreboardOptions(),
      objective: 'bad name',
      score: '1.5',
      action: 'players-set'
    })
    expect(result.diagnostics.some((item) => item.code === 'scoreboard.objective')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'scoreboard.score')).toBe(true)
  })
})
