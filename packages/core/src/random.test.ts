import { describe, expect, it } from 'vitest'
import {
  buildRandomCommand,
  buildRandomResetCommand,
  createDefaultRandomOptions,
  createDefaultRandomResetOptions
} from './random'

describe('random', () => {
  it('builds value and roll', () => {
    expect(buildRandomCommand(createDefaultRandomOptions()).text).toBe('random value 1..6')
    expect(
      buildRandomCommand({ mode: 'roll', range: '1..20', sequence: 'mcstudio:dice' }).text
    ).toBe('random roll 1..20 mcstudio:dice')
  })

  it('resets a sequence', () => {
    expect(
      buildRandomResetCommand({
        ...createDefaultRandomResetOptions(),
        sequence: 'mcstudio:dice',
        seed: '42',
        includeWorldSeed: true
      }).text
    ).toBe('random reset mcstudio:dice 42 true false')
  })

  it('validates range and seed', () => {
    expect(
      buildRandomCommand({ mode: 'value', range: 'bad', sequence: '' }).diagnostics.some(
        (item) => item.code === 'random.range'
      )
    ).toBe(true)
    expect(
      buildRandomResetCommand({ ...createDefaultRandomResetOptions(), seed: 'x' }).diagnostics.some(
        (item) => item.code === 'random.seed'
      )
    ).toBe(true)
  })
})
