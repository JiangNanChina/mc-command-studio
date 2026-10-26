import { describe, expect, it } from 'vitest'
import { buildRideCommand, createDefaultRideOptions } from './ride'

describe('ride', () => {
  it('mounts a horse', () => {
    expect(buildRideCommand(createDefaultRideOptions()).text).toBe(
      'ride @s mount @e[type=minecraft:horse]'
    )
  })

  it('dismounts without a vehicle', () => {
    expect(
      buildRideCommand({ ...createDefaultRideOptions(), action: 'dismount' }).text
    ).toBe('ride @s dismount')
  })
})
