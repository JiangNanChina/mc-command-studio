import { describe, expect, it } from 'vitest'
import { buildGamemodeCommand, createDefaultGamemodeOptions } from './gamemode'

describe('gamemode', () => {
  it('sets creative for a player', () => {
    expect(buildGamemodeCommand(createDefaultGamemodeOptions()).text).toBe(
      'gamemode creative @s'
    )
  })

  it('supports all game modes and targets', () => {
    expect(
      buildGamemodeCommand({
        mode: 'spectator',
        target: { base: '@a' }
      }).text
    ).toBe('gamemode spectator @a')
  })
})
