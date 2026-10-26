import { describe, expect, it } from 'vitest'
import {
  createAdvancementModel,
  parseAdvancement,
  serializeAdvancement
} from './advancement'

describe('advancement model', () => {
  it('round-trips a simple advancement', () => {
    const model = createAdvancementModel()
    expect(parseAdvancement(serializeAdvancement(model))).toEqual(model)
  })

  it('parses string text components and optional display', () => {
    const model = parseAdvancement(
      JSON.stringify({
        parent: 'minecraft:story/root',
        display: {
          icon: { id: 'minecraft:diamond' },
          title: '钻石！',
          description: ['复杂组件应回退'],
          frame: 'challenge'
        },
        criteria: {
          get_diamond: { trigger: 'minecraft:inventory_changed' }
        }
      })
    )
    expect(model).toBeNull()

    const simple = parseAdvancement(
      JSON.stringify({
        display: {
          icon: { id: 'minecraft:diamond' },
          title: '钻石！',
          description: '获得钻石',
          frame: 'challenge',
          show_toast: false,
          announce_to_chat: false,
          hidden: true
        },
        criteria: { get_diamond: { trigger: 'minecraft:inventory_changed' } }
      })
    )
    expect(simple).toEqual({
      parent: '',
      displayEnabled: true,
      icon: 'minecraft:diamond',
      title: '钻石！',
      description: '获得钻石',
      frame: 'challenge',
      showToast: false,
      announceToChat: false,
      hidden: true,
      criteria: [{ name: 'get_diamond', trigger: 'minecraft:inventory_changed' }]
    })
  })

  it('rejects requirements, conditions and complex display components', () => {
    expect(
      parseAdvancement(
        JSON.stringify({
          criteria: { a: { trigger: 'minecraft:tick' } },
          requirements: [['a']]
        })
      )
    ).toBeNull()
    expect(
      parseAdvancement(
        JSON.stringify({
          criteria: {
            a: { trigger: 'minecraft:tick', conditions: { player: [] } }
          }
        })
      )
    ).toBeNull()
    expect(
      parseAdvancement(
        JSON.stringify({
          display: {
            icon: { id: 'minecraft:stone' },
            title: { text: 'A', color: 'red' },
            description: { text: 'B' },
            frame: 'task'
          },
          criteria: { a: { trigger: 'minecraft:tick' } }
        })
      )
    ).toBeNull()
  })

  it('serializes multiple criteria without display', () => {
    const json = serializeAdvancement({
      parent: '',
      displayEnabled: false,
      icon: 'minecraft:stone',
      title: '',
      description: '',
      frame: 'task',
      showToast: true,
      announceToChat: true,
      hidden: false,
      criteria: [
        { name: 'one', trigger: 'minecraft:tick' },
        { name: 'two', trigger: 'minecraft:impossible' }
      ]
    })
    const parsed = JSON.parse(json)
    expect(parsed.display).toBeUndefined()
    expect(Object.keys(parsed.criteria)).toEqual(['one', 'two'])
  })
})
