import { describe, expect, it } from 'vitest'
import {
  buildSpreadplayersCommand,
  createDefaultSpreadplayersOptions
} from './spreadplayers'

describe('spreadplayers', () => {
  it('builds the default spread', () => {
    expect(buildSpreadplayersCommand(createDefaultSpreadplayersOptions()).text).toBe(
      'spreadplayers 0 0 10 50 true @a'
    )
  })

  it('supports under and negative center', () => {
    expect(
      buildSpreadplayersCommand({
        ...createDefaultSpreadplayersOptions(),
        centerX: '-100',
        centerZ: '200',
        underEnabled: true,
        maxHeight: '100',
        respectTeams: false
      }).text
    ).toBe('spreadplayers -100 200 10 50 under 100 false @a')
  })

  it('validates distances', () => {
    const result = buildSpreadplayersCommand({
      ...createDefaultSpreadplayersOptions(),
      spreadDistance: '-1',
      maxRange: '0'
    })
    expect(result.diagnostics.some((item) => item.code === 'spreadplayers.distance')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'spreadplayers.range')).toBe(true)
  })
})
