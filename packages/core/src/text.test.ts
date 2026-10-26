import { describe, expect, it } from 'vitest'
import {
  buildTellrawCommand,
  buildTitleCommand,
  createDefaultTellrawOptions,
  createDefaultTitleOptions,
  createTextSegment,
  textComponentJson,
  type TextSegment
} from './text'

function segment(patch: Partial<TextSegment>): TextSegment {
  return { ...createTextSegment(), ...patch }
}

describe('text components', () => {
  it('serializes a single segment with styles', () => {
    expect(
      textComponentJson([segment({ text: 'Hi', color: 'gold', bold: true, underlined: true })])
    ).toBe('{"text":"Hi","color":"gold","bold":true,"underlined":true}')
  })

  it('serializes extra segments and events', () => {
    const json = textComponentJson([
      segment({ text: 'Click', click: { action: 'run_command', value: '/say hi' }, hover: '提示' }),
      segment({ text: ' tail' })
    ])
    expect(json).toContain('"extra"')
    expect(json).toContain('"clickEvent":{"action":"run_command","value":"/say hi"}')
    expect(json).toContain('"hoverEvent":{"action":"show_text","contents":{"text":"提示"}}')
  })

  it('builds tellraw', () => {
    const result = buildTellrawCommand({
      ...createDefaultTellrawOptions(),
      target: { base: '@a' },
      segments: [segment({ text: 'Hello' })]
    })
    expect(result.text).toBe('tellraw @a {"text":"Hello"}')
  })

  it('builds title with times', () => {
    const result = buildTitleCommand({
      ...createDefaultTitleOptions(),
      action: 'subtitle',
      times: true,
      fadeIn: '5',
      stay: '40',
      fadeOut: '10',
      segments: [segment({ text: 'Sub' })]
    })
    expect(result.text.split('\n')).toEqual([
      'title @a times 5 40 10',
      'title @a subtitle {"text":"Sub"}'
    ])
  })

  it('reports invalid times and missing click values', () => {
    const result = buildTitleCommand({
      ...createDefaultTitleOptions(),
      times: true,
      fadeIn: 'x',
      segments: [segment({ text: 'A', click: { action: 'open_url', value: '' } })]
    })
    expect(result.diagnostics.some((item) => item.code === 'title.times')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'text.click')).toBe(true)
  })
})
