import { describe, expect, it } from 'vitest'
import {
  createPredicateModel,
  parsePredicate,
  predicateMode,
  serializePredicate,
  updatePredicateMode
} from './predicate'

describe('predicate model', () => {
  it('round-trips a single condition', () => {
    const model = createPredicateModel()
    expect(parsePredicate(serializePredicate(model))).toEqual(model)
  })

  it('parses all_of and any_of groups', () => {
    const model = parsePredicate(
      JSON.stringify({
        condition: 'minecraft:any_of',
        terms: [
          { condition: 'minecraft:random_chance', chance: 0.25 },
          { condition: 'minecraft:weather_check', raining: false, thundering: true },
          { condition: 'minecraft:time_check', value: 13000 },
          {
            condition: 'minecraft:entity_properties',
            entity: 'this',
            predicate: { flags: { is_sneaking: true, is_on_fire: false } }
          }
        ]
      })
    )
    expect(model?.mode).toBe('any_of')
    expect(model?.conditions).toHaveLength(4)
    expect(model?.conditions[3].flags).toEqual(['is_sneaking'])
  })

  it('rejects unsupported and complex conditions', () => {
    expect(parsePredicate(JSON.stringify({ condition: 'minecraft:location_check' }))).toBeNull()
    expect(
      parsePredicate(
        JSON.stringify({
          condition: 'minecraft:entity_properties',
          entity: 'this',
          predicate: { flags: { is_sneaking: true }, type: 'minecraft:player' }
        })
      )
    ).toBeNull()
    expect(
      parsePredicate(
        JSON.stringify({
          condition: 'minecraft:all_of',
          terms: [{ condition: 'minecraft:random_chance', chance: 2 }]
        })
      )
    ).toBeNull()
  })

  it('serializes groups and mode helpers', () => {
    const model = {
      mode: 'all_of' as const,
      conditions: [
        { ...createPredicateModel().conditions[0], chance: 0.5 },
        {
          ...createPredicateModel().conditions[0],
          type: 'weather_check' as const,
          raining: true,
          thundering: false
        }
      ]
    }
    const parsed = JSON.parse(serializePredicate(model))
    expect(parsed.condition).toBe('minecraft:all_of')
    expect(parsed.terms).toHaveLength(2)
    expect(predicateMode(model)).toBe('all_of')
    expect(predicateMode(updatePredicateMode(model, 'any_of'))).toBe('any_of')
  })
})
