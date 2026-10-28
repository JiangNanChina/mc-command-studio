import { describe, expect, it } from 'vitest'
import { blockStateName, blockStateValueName } from './blockStateLabels'

describe('Chinese block state labels', () => {
  it('names directions, boolean flags, and numbered slots', () => {
    expect(blockStateName('facing')).toBe('朝向')
    expect(blockStateName('waterlogged')).toBe('含水')
    expect(blockStateName('slot_3_occupied')).toBe('第 4 格有物品')
    expect(blockStateValueName('true')).toBe('是')
    expect(blockStateValueName('north_up')).toBe('北 / 上')
    expect(blockStateValueName('3')).toBe('3')
  })

  it('provides neutral Chinese labels for custom states', () => {
    expect(blockStateName('custom_state')).toBe('扩展状态')
    expect(blockStateValueName('custom_value')).toBe('扩展状态值')
  })
})
