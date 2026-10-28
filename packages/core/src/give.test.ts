import { describe, expect, it } from 'vitest'
import { buildGiveCommand, createDefaultGiveOptions } from './item'

describe('give command', () => {
  it('omits count when it is 1', () => {
    const result = buildGiveCommand(createDefaultGiveOptions())
    expect(result.text).toBe('give @s minecraft:diamond_sword')
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toHaveLength(0)
  })

  it('adds count and components', () => {
    const result = buildGiveCommand({
      target: { base: '@a', name: 'Steve' },
      item: {
        id: 'minecraft:diamond',
        components: [{ kind: 'custom_name', text: 'Shiny', color: 'aqua', italic: false }]
      },
      count: 5
    })
    expect(result.text).toBe(
      'give @a[name="Steve"] minecraft:diamond[custom_name={text:"Shiny",color:"aqua",italic:false}] 5'
    )
  })

  it('warns when count is above 99', () => {
    const result = buildGiveCommand({ ...createDefaultGiveOptions(), count: 100 })
    expect(result.diagnostics.some((item) => item.code === 'give.count.large')).toBe(true)
  })

  it('warns when target is not a player selector', () => {
    const result = buildGiveCommand({
      ...createDefaultGiveOptions(),
      target: { base: '@e' }
    })
    expect(result.diagnostics.some((item) => item.code === 'give.target')).toBe(true)
  })

  it('preserves whitespace inside names, selectors and raw data', () => {
    const result = buildGiveCommand({
      target: { base: '@a', name: 'A  B' },
      item: {
        id: 'diamond_sword',
        components: [
          { kind: 'custom_name', text: 'A  B', italic: false },
          { kind: 'custom_data', raw: '{note:"C  D"}' }
        ]
      },
      count: 1
    })
    expect(result.text).toContain('@a[name="A  B"]')
    expect(result.text).toContain('text:"A  B"')
    expect(result.text).toContain('note:"C  D"')
    expect(result.diagnostics).toEqual([])
  })

  it('passes the target version to item serialization', () => {
    const options = createDefaultGiveOptions()
    options.item.components = [{ kind: 'enchantments', entries: [{ id: 'sharpness', level: 5 }] }]
    expect(buildGiveCommand(options, '1.21.1').text).toBe(
      'give @s minecraft:diamond_sword[enchantments={levels:{sharpness:5}}]'
    )
    expect(buildGiveCommand(options, '1.21.5').text).toBe(
      'give @s minecraft:diamond_sword[enchantments={sharpness:5}]'
    )
  })
})
