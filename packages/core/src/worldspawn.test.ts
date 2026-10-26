import { describe, expect, it } from 'vitest'
import {
  buildForceloadCommand,
  buildSpawnpointCommand,
  buildWorldSpawnCommand,
  createDefaultForceloadOptions,
  createDefaultSpawnpointOptions,
  createDefaultWorldSpawnOptions
} from './worldspawn'

describe('world spawn', () => {
  it('builds spawnpoint with and without angle', () => {
    expect(buildSpawnpointCommand(createDefaultSpawnpointOptions()).text).toBe(
      'spawnpoint @s ~ ~ ~'
    )
    expect(
      buildSpawnpointCommand({
        ...createDefaultSpawnpointOptions(),
        position: { x: '10', y: '64', z: '-5' },
        angleEnabled: true,
        yaw: '90',
        pitch: '0'
      }).text
    ).toBe('spawnpoint @s 10 64 -5 90 0')
  })

  it('builds setworldspawn', () => {
    expect(buildWorldSpawnCommand(createDefaultWorldSpawnOptions()).text).toBe(
      'setworldspawn 0 64 0'
    )
    expect(
      buildWorldSpawnCommand({
        ...createDefaultWorldSpawnOptions(),
        angleEnabled: true,
        yaw: '180'
      }).text
    ).toBe('setworldspawn 0 64 0 180 0')
  })

  it('builds forceload add/remove/query', () => {
    const base = createDefaultForceloadOptions()
    expect(buildForceloadCommand(base).text).toBe('forceload add 0 0')
    expect(
      buildForceloadCommand({ ...base, toEnabled: true, toX: '2', toZ: '3' }).text
    ).toBe('forceload add 0 0 2 3')
    expect(buildForceloadCommand({ ...base, action: 'remove' }).text).toBe('forceload remove 0 0')
    expect(buildForceloadCommand({ ...base, action: 'remove-all' }).text).toBe(
      'forceload remove all'
    )
    expect(buildForceloadCommand({ ...base, action: 'query' }).text).toBe('forceload query 0 0')
  })

  it('validates forceload integer coordinates', () => {
    const result = buildForceloadCommand({
      ...createDefaultForceloadOptions(),
      fromX: '1.5',
      toEnabled: true,
      toZ: 'x'
    })
    expect(result.diagnostics.some((item) => item.code === 'forceload.from')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'forceload.to')).toBe(true)
  })
})
