import { describe, expect, it } from 'vitest'
import { buildTagCommand, createDefaultTagOptions } from './tag'

describe('tag', () => {
  it('builds add, remove and list', () => {
    expect(buildTagCommand(createDefaultTagOptions()).text).toBe(
      'tag @s add mcstudio.tag'
    )
    expect(
      buildTagCommand({ ...createDefaultTagOptions(), action: 'remove', name: 'foo' }).text
    ).toBe('tag @s remove foo')
    expect(
      buildTagCommand({ ...createDefaultTagOptions(), action: 'list', name: '' }).text
    ).toBe('tag @s list')
  })

  it('validates tag names', () => {
    expect(
      buildTagCommand({ ...createDefaultTagOptions(), name: '' }).diagnostics.some(
        (item) => item.code === 'tag.name'
      )
    ).toBe(true)
    expect(
      buildTagCommand({ ...createDefaultTagOptions(), name: 'a b' }).diagnostics.some(
        (item) => item.code === 'tag.name.space'
      )
    ).toBe(true)
  })
})
