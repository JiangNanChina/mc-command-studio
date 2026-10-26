import { describe, expect, it } from 'vitest'
import {
  createLootTableModel,
  parseLootTable,
  serializeLootTable
} from './lootTable'

describe('loot table model', () => {
  it('round-trips a simple table', () => {
    const model = createLootTableModel()
    const parsed = parseLootTable(serializeLootTable(model))
    expect(parsed).toEqual(model)
  })

  it('parses rolls, weights and count ranges', () => {
    const model = parseLootTable(
      JSON.stringify({
        type: 'minecraft:chest',
        pools: [
          {
            rolls: { type: 'minecraft:uniform', min: 1, max: 3 },
            bonus_rolls: 1,
            entries: [
              {
                type: 'minecraft:item',
                name: 'minecraft:apple',
                weight: 5,
                functions: [
                  {
                    function: 'minecraft:set_count',
                    count: { type: 'minecraft:uniform', min: 2, max: 4 }
                  }
                ]
              }
            ]
          }
        ]
      })
    )
    expect(model).toEqual({
      type: 'minecraft:chest',
      minRolls: 1,
      maxRolls: 3,
      bonusRolls: 1,
      entries: [
        {
          id: 'minecraft:apple',
          weight: 5,
          minCount: 2,
          maxCount: 4
        }
      ]
    })
  })

  it('rejects multi-pool, conditional and non-item tables', () => {
    expect(parseLootTable('{"pools":[]}')).toBeNull()
    expect(
      parseLootTable(
        JSON.stringify({
          type: 'minecraft:chest',
          pools: [
            { rolls: 1, entries: [{ type: 'minecraft:item', name: 'minecraft:stone' }] },
            { rolls: 1, entries: [{ type: 'minecraft:item', name: 'minecraft:dirt' }] }
          ]
        })
      )
    ).toBeNull()
    expect(
      parseLootTable(
        JSON.stringify({
          type: 'minecraft:chest',
          pools: [
            {
              rolls: 1,
              entries: [
                {
                  type: 'minecraft:item',
                  name: 'minecraft:stone',
                  conditions: [{ condition: 'minecraft:random_chance' }]
                }
              ]
            }
          ]
        })
      )
    ).toBeNull()
  })

  it('serializes uniform counts and bonuses', () => {
    const json = serializeLootTable({
      type: 'minecraft:chest',
      minRolls: 1,
      maxRolls: 2,
      bonusRolls: 1,
      entries: [
        { id: 'minecraft:apple', weight: 2, minCount: 2, maxCount: 4 }
      ]
    })
    const parsed = JSON.parse(json)
    expect(parsed.pools[0].rolls).toEqual({
      type: 'minecraft:uniform',
      min: 1,
      max: 2
    })
    expect(parsed.pools[0].bonus_rolls).toBe(1)
    expect(parsed.pools[0].entries[0].functions[0].count).toEqual({
      type: 'minecraft:uniform',
      min: 2,
      max: 4
    })
  })
})
