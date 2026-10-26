import { describe, expect, it } from 'vitest'
import { buildFunctionCommand, createDefaultFunctionOptions } from './function'

describe('function', () => {
  it('builds a function call', () => {
    expect(buildFunctionCommand(createDefaultFunctionOptions()).text).toBe(
      'function mcstudio:main'
    )
  })

  it('builds arguments and validates them', () => {
    expect(
      buildFunctionCommand({
        ...createDefaultFunctionOptions(),
        argumentsEnabled: true,
        arguments: '{name:"Steve"}'
      }).text
    ).toBe('function mcstudio:main {name:"Steve"}')
    expect(
      buildFunctionCommand({
        ...createDefaultFunctionOptions(),
        argumentsEnabled: true,
        arguments: 'bad'
      }).diagnostics.some((item) => item.code === 'function.arguments')
    ).toBe(true)
  })

  it('validates function ids', () => {
    expect(
      buildFunctionCommand({ ...createDefaultFunctionOptions(), name: 'bad name' }).diagnostics.some(
        (item) => item.code === 'function.name'
      )
    ).toBe(true)
  })
})
