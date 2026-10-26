import { describe, expect, it } from 'vitest'
import { buildTickCommand, createDefaultTickOptions } from './tick'

describe('tick', () => {
  it('freezes and unfreezes', () => {
    expect(buildTickCommand(createDefaultTickOptions()).text).toBe('tick freeze')
    expect(
      buildTickCommand({ ...createDefaultTickOptions(), action: 'unfreeze' }).text
    ).toBe('tick unfreeze')
  })

  it('sets rate and steps', () => {
    expect(
      buildTickCommand({ ...createDefaultTickOptions(), action: 'rate', rate: '5' }).text
    ).toBe('tick rate 5')
    expect(
      buildTickCommand({ ...createDefaultTickOptions(), action: 'step', time: '100' }).text
    ).toBe('tick step 100')
    expect(
      buildTickCommand({ ...createDefaultTickOptions(), action: 'stepStop' }).text
    ).toBe('tick step stop')
  })

  it('validates rate', () => {
    expect(
      buildTickCommand({ ...createDefaultTickOptions(), action: 'rate', rate: '0' }).diagnostics
        .some((item) => item.code === 'tick.rate')
    ).toBe(true)
  })
})
