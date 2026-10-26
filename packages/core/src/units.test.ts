import { describe, expect, it } from 'vitest'
import {
  formatResourceLocation,
  isValidResourceLocation,
  isValidSlot,
  itemStackText,
  parseItemStackUnit,
  parseNumberUnit,
  parseResourceLocation
} from './units'

describe('unit system', () => {
  it('parses and formats resource locations', () => {
    expect(parseResourceLocation('diamond_sword')).toEqual({
      namespace: 'minecraft',
      path: 'diamond_sword'
    })
    expect(parseResourceLocation('mcstudio:lib/init')).toEqual({
      namespace: 'mcstudio',
      path: 'lib/init'
    })
    expect(formatResourceLocation({ namespace: 'mcstudio', path: 'lib/init' })).toBe(
      'mcstudio:lib/init'
    )
    expect(isValidResourceLocation('Bad ID')).toBe(false)
  })

  it('validates numbers with constraints', () => {
    expect(parseNumberUnit('3.5', { min: 0 })).toEqual({ value: 3.5, text: '3.5' })
    expect(parseNumberUnit('1.5', { integer: true })).toBeNull()
    expect(parseNumberUnit('-1', { min: 0 })).toBeNull()
    expect(parseNumberUnit('101', { max: 100 })).toBeNull()
    expect(parseNumberUnit('abc')).toBeNull()
  })

  it('builds item stacks and validates slots', () => {
    const stack = parseItemStackUnit('diamond_sword', 5)
    expect(stack).toEqual({ id: 'minecraft:diamond_sword', count: 5 })
    expect(stack ? itemStackText(stack) : '').toBe('minecraft:diamond_sword 5')
    expect(parseItemStackUnit('stone', 0)).toBeNull()
    expect(isValidSlot('container.0')).toBe(true)
    expect(isValidSlot('bad slot')).toBe(false)
  })
})
