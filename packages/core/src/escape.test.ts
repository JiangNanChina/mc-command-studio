import { describe, expect, it } from 'vitest'
import {
  commandBlockString,
  containsControlCharacters,
  resourceId,
  shortId,
  snbtKey,
  snbtString
} from './escape'

describe('escape', () => {
  it('escapes double quotes and backslashes for SNBT', () => {
    expect(snbtString('a "b" c')).toBe('"a \\"b\\" c"')
    expect(snbtString('C:\\temp')).toBe('"C:\\\\temp"')
  })

  it('escapes newlines and tabs', () => {
    expect(snbtString('a\nb\tc')).toBe('"a\\nb\\tc"')
  })

  it('adds the minecraft namespace only when missing', () => {
    expect(resourceId('diamond_sword')).toBe('minecraft:diamond_sword')
    expect(resourceId('minecraft:diamond_sword')).toBe('minecraft:diamond_sword')
    expect(resourceId('mypack:ruby')).toBe('mypack:ruby')
    expect(resourceId('#logs')).toBe('#minecraft:logs')
  })

  it('shortens minecraft ids and quotes non-plain snbt keys', () => {
    expect(shortId('minecraft:sharpness')).toBe('sharpness')
    expect(snbtKey('minecraft:sharpness')).toBe('sharpness')
    expect(snbtKey('mypack:custom/enchant')).toBe('"mypack:custom/enchant"')
  })

  it('detects control characters in commands', () => {
    expect(containsControlCharacters('say hi')).toBe(false)
    expect(containsControlCharacters('say\u0001hi')).toBe(true)
  })

  it('keeps command block strings readable', () => {
    expect(commandBlockString('give @s stone')).toBe('"give @s stone"')
  })
})
