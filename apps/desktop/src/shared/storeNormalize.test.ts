import { describe, expect, it } from 'vitest'
import { normalizeProjectPayload } from '../renderer/src/store/normalize'

describe('normalizeProjectPayload', () => {
  it('creates a complete default project', () => {
    const payload = normalizeProjectPayload(null)
    expect(payload.activeCommandId).toBeNull()
    expect(payload.give.count).toBe(1)
    expect(payload.gamemode.mode).toBe('creative')
    expect(payload.random.mode).toBe('value')
    expect(payload.outputMode).toBe('command')
    expect(payload.datapack.namespace).toBe('mcstudio')
  })

  it('repairs malformed values', () => {
    const payload = normalizeProjectPayload({
      give: { count: -5 },
      gamemode: { mode: 'not-a-mode' },
      random: { mode: 'not-a-mode', range: 'bad' },
      social: { uuids: true },
      datapack: { functions: 'not-an-array' },
      outputMode: 'not-an-output-mode'
    })
    expect(payload.give.count).toBe(1)
    expect(payload.gamemode.mode).toBe('creative')
    expect(payload.random.mode).toBe('value')
    expect(payload.social.uuids).toBe(true)
    expect(Array.isArray(payload.datapack.functions)).toBe(true)
    expect(payload.outputMode).toBe('command')
  })
})
