import { describe, expect, it } from 'vitest'
import { buildTeamCommands, createDefaultTeamOptions } from './team'
import { createTextSegment } from './text'

describe('team', () => {
  it('creates a team with all options', () => {
    const lines = buildTeamCommands(createDefaultTeamOptions()).text.split('\n')
    expect(lines[0]).toBe('team add red_team "红队"')
    expect(lines).toContain('team modify red_team color red')
    expect(lines).toContain('team modify red_team friendlyFire false')
    expect(lines).toContain('team modify red_team nametagVisibility always')
    expect(lines).toContain('team modify red_team collisionRule always')
    expect(lines).toHaveLength(6)
  })

  it('builds modify without add', () => {
    const text = buildTeamCommands({
      ...createDefaultTeamOptions(),
      action: 'modify',
      displayName: '',
      color: 'blue'
    }).text
    expect(text).not.toContain('team add')
    expect(text.split('\n')[0]).toBe('team modify red_team color blue')
  })

  it('builds join, leave, remove and list', () => {
    expect(
      buildTeamCommands({ ...createDefaultTeamOptions(), action: 'join' }).text
    ).toBe('team join red_team @a')
    expect(
      buildTeamCommands({
        ...createDefaultTeamOptions(),
        action: 'leave',
        target: { base: '@s' }
      }).text
    ).toBe('team leave @s')
    expect(buildTeamCommands({ ...createDefaultTeamOptions(), action: 'remove' }).text).toBe(
      'team remove red_team'
    )
    expect(buildTeamCommands({ ...createDefaultTeamOptions(), action: 'list' }).text).toBe(
      'team list red_team'
    )
  })

  it('adds prefix and suffix text components', () => {
    const prefix = { ...createTextSegment(), text: '[RED]' }
    const suffix = { ...createTextSegment(), text: '<>' }
    const lines = buildTeamCommands({
      ...createDefaultTeamOptions(),
      action: 'modify',
      prefix: [prefix],
      suffix: [suffix]
    }).text.split('\n')
    expect(lines).toContain('team modify red_team prefix {"text":"[RED]"}')
    expect(lines).toContain('team modify red_team suffix {"text":"<>"}')
  })

  it('uses a text component display name when enabled', () => {
    const display = { ...createTextSegment(), text: '红队', color: 'red' }
    const lines = buildTeamCommands({
      ...createDefaultTeamOptions(),
      action: 'modify',
      displayAdvanced: true,
      displaySegments: [display]
    }).text.split('\n')
    expect(lines).toContain(
      'team modify red_team displayName {"text":"红队","color":"red"}'
    )
  })

  it('validates team names', () => {
    expect(
      buildTeamCommands({ ...createDefaultTeamOptions(), name: 'bad name' }).diagnostics.some(
        (item) => item.code === 'team.name'
      )
    ).toBe(true)
    expect(
      buildTeamCommands({ ...createDefaultTeamOptions(), action: 'leave', name: '' }).diagnostics
    ).toHaveLength(0)
  })
})
