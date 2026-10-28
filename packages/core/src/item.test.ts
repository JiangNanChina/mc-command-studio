import { describe, expect, it } from 'vitest'
import { hasErrors } from './diagnostics'
import { serializeItemStack, createDefaultItem } from './item'

describe('item stack', () => {
  it('serializes a plain item', () => {
    expect(serializeItemStack(createDefaultItem()).text).toBe('minecraft:diamond_sword')
  })

  it('serializes custom_name', () => {
    const result = serializeItemStack({
      id: 'diamond_sword',
      components: [{ kind: 'custom_name', text: 'Excalibur', color: 'gold', italic: false }]
    })
    expect(result.text).toBe(
      'minecraft:diamond_sword[custom_name={text:"Excalibur",color:"gold",italic:false}]'
    )
    expect(hasErrors(result.diagnostics)).toBe(false)
  })

  it('serializes lore lines', () => {
    const result = serializeItemStack({
      id: 'minecraft:stick',
      components: [
        {
          kind: 'lore',
          lines: [
            { text: '第一行', color: 'gray', italic: false },
            { text: '第二行', color: '', italic: true }
          ]
        }
      ]
    })
    expect(result.text).toBe(
      'minecraft:stick[lore=[{text:"第一行",color:"gray",italic:false},{text:"第二行",italic:true}]]'
    )
  })

  it('serializes flat enchantments', () => {
    const result = serializeItemStack({
      id: 'minecraft:diamond_sword',
      components: [
        {
          kind: 'enchantments',
          entries: [
            { id: 'minecraft:sharpness', level: 5 },
            { id: 'knockback', level: 2 }
          ]
        }
      ]
    })
    expect(result.text).toBe(
      'minecraft:diamond_sword[enchantments={sharpness:5,knockback:2}]'
    )
  })

  it('serializes unbreakable and max_stack_size', () => {
    const result = serializeItemStack({
      id: 'minecraft:netherite_pickaxe',
      components: [{ kind: 'unbreakable' }, { kind: 'max_stack_size', value: 16 }]
    })
    expect(result.text).toBe(
      'minecraft:netherite_pickaxe[unbreakable={},max_stack_size=16]'
    )
  })

  it('passes through custom_model_data raw SNBT', () => {
    const result = serializeItemStack({
      id: 'minecraft:bone',
      components: [{ kind: 'custom_model_data', raw: '{strings:["my_pack:model"]}' }]
    })
    expect(result.text).toBe(
      'minecraft:bone[custom_model_data={strings:["my_pack:model"]}]'
    )
  })

  it('rejects empty item ids', () => {
    const result = serializeItemStack({ id: '', components: [] })
    expect(hasErrors(result.diagnostics)).toBe(true)
  })

  it('rejects duplicate components and invalid levels', () => {
    const result = serializeItemStack({
      id: 'minecraft:stone',
      components: [
        { kind: 'unbreakable' },
        { kind: 'unbreakable' },
        {
          kind: 'enchantments',
          entries: [{ id: 'minecraft:sharpness', level: 0 }]
        }
      ]
    })
    expect(result.diagnostics.filter((item) => item.severity === 'error').length).toBeGreaterThan(1)
  })

  it('serializes extended components and raw components', () => {
    const result = serializeItemStack({
      id: 'minecraft:diamond_sword',
      components: [
        { kind: 'item_name', text: 'Sword', color: 'aqua', italic: false },
        { kind: 'rarity', value: 'epic' },
        { kind: 'max_damage', value: 2000 },
        { kind: 'damage', value: 10 },
        { kind: 'enchantment_glint_override', value: true },
        { kind: 'custom_data', raw: '{foo:1b}' },
        { kind: 'raw', id: 'my_pack:test', value: '1b' }
      ]
    })
    expect(result.text).toBe(
      'minecraft:diamond_sword[item_name={text:"Sword",color:"aqua",italic:false},rarity=epic,max_damage=2000,damage=10,enchantment_glint_override=true,custom_data={foo:1b},"my_pack:test"=1b]'
    )
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toHaveLength(0)
  })

  it('rejects invalid custom_data', () => {
    const result = serializeItemStack({
      id: 'minecraft:stone',
      components: [{ kind: 'custom_data', raw: 'foo' }]
    })
    expect(result.diagnostics.some((item) => item.code === 'item.custom_data')).toBe(true)
  })

  it.each(['1.20.5', '1.20.6', '1.21.1', '1.21.4'])('uses wrapped enchantments in %s', (version) => {
    const result = serializeItemStack({
      id: 'diamond_sword',
      components: [{ kind: 'enchantments', entries: [{ id: 'sharpness', level: 5 }] }]
    }, version)
    expect(result.text).toBe('minecraft:diamond_sword[enchantments={levels:{sharpness:5}}]')
    expect(result.diagnostics).toEqual([])
  })

  it('encodes item names and lore as JSON strings before 1.21.5', () => {
    const result = serializeItemStack({
      id: 'diamond_sword',
      components: [
        { kind: 'custom_name', text: 'A  B', color: 'gold', italic: false },
        { kind: 'lore', lines: [{ text: 'C "D"', italic: true }] }
      ]
    }, '1.21.4')
    expect(result.text).toContain(`custom_name="{\\"text\\":\\"A  B\\",\\"color\\":\\"gold\\",\\"italic\\":false}"`)
    expect(result.text).toContain(`lore=["{\\"text\\":\\"C \\\\\\"D\\\\\\"\\",\\"italic\\":true}"]`)
    expect(result.diagnostics).toEqual([])
  })

  it('validates the custom model data shape at the 1.21.4 boundary without rewriting raw input', () => {
    const integer = { id: 'stick', components: [{ kind: 'custom_model_data' as const, raw: '123' }] }
    const compound = { id: 'stick', components: [{ kind: 'custom_model_data' as const, raw: '{strings:["model"]}' }] }
    expect(serializeItemStack(integer, '1.21.3').diagnostics).toEqual([])
    expect(serializeItemStack(compound, '1.21.4').diagnostics).toEqual([])
    expect(hasErrors(serializeItemStack(integer, '1.21.4').diagnostics)).toBe(true)
    const invalidOld = serializeItemStack(compound, '1.21.3')
    expect(hasErrors(invalidOld.diagnostics)).toBe(true)
    expect(invalidOld.text).toContain('custom_model_data={strings:["model"]}')
  })

  it.each(['1.20.5', '1.21.1', '1.21.4'])(
    'serializes structured item components with the compatible codec in %s', (version) => {
      const result = serializeItemStack({
        id: 'potion',
        components: [
          {
            kind: 'potion_contents',
            potion: 'strong_healing',
            customColor: 16711680,
            effects: [{
              id: 'speed', duration: 1200, amplifier: 1,
              ambient: false, showParticles: true, showIcon: false
            }]
          },
          { kind: 'can_break', blocks: ['#mineable/pickaxe', 'stone'] },
          { kind: 'can_place_on', blocks: ['oak_planks'] },
          { kind: 'entity_data', raw: '{id:"minecraft:allay",Health:20.0f}' },
          {
            kind: 'block_entity_data', entity: 'zombie', delay: 20,
            minSpawnDelay: 100, maxSpawnDelay: 800, spawnCount: 4,
            maxNearbyEntities: 6, requiredPlayerRange: 16, spawnRange: 4
          }
        ]
      }, version)

      expect(result.text).toBe(
        'minecraft:potion[potion_contents={potion:"minecraft:strong_healing",custom_color:16711680,custom_effects:[{id:"minecraft:speed",duration:1200,amplifier:1,ambient:0b,show_particles:1b,show_icon:0b}]},can_break={predicates:[{blocks:"#minecraft:mineable/pickaxe"},{blocks:"minecraft:stone"}],show_in_tooltip:true},can_place_on={predicates:[{blocks:"minecraft:oak_planks"}],show_in_tooltip:true},entity_data={id:"minecraft:allay",Health:20.0f},block_entity_data={id:"minecraft:mob_spawner",Delay:20s,MinSpawnDelay:100s,MaxSpawnDelay:800s,SpawnCount:4s,MaxNearbyEntities:6s,RequiredPlayerRange:16s,SpawnRange:4s,SpawnData:{entity:{id:"minecraft:zombie"}}}]'
      )
      expect(result.diagnostics).toEqual([])
    }
  )

  it.each([
    ['1.20.5', 'attack_damage', 'minecraft:generic.attack_damage', 'legacy'],
    ['1.21.1', 'attack_damage', 'minecraft:generic.attack_damage', 'wrapped'],
    ['1.21.2', 'generic.attack_damage', 'minecraft:attack_damage', 'wrapped'],
    ['1.21.4', 'generic.attack_damage', 'minecraft:attack_damage', 'wrapped'],
    ['1.21.5', 'generic.attack_damage', 'minecraft:attack_damage', 'list']
  ] as const)('uses the %s attribute modifier codec and ID format', (version, inputType, outputType, format) => {
    const options = {
      id: 'stick',
      components: [{
        kind: 'attribute_modifiers' as const,
        entries: [{ id: 'example:power', type: inputType, amount: 2, operation: 'add_value' as const, slot: 'mainhand' }]
      }]
    }
    const result = serializeItemStack(options, version)
    expect(result.diagnostics).toEqual([])
    if (format === 'legacy') {
      expect(result.text).toMatch(new RegExp(`attribute_modifiers=\\{modifiers:\\[\\{type:"${outputType}",amount:2\\.0,name:"example:power",operation:"add_value",slot:"mainhand",uuid:\\[I;-?\\d+,-?\\d+,-?\\d+,-?\\d+\\]\\}\\],show_in_tooltip:true\\}`))
      expect(serializeItemStack(options, version).text).toBe(result.text)
    } else {
      const modifier = `{id:"example:power",type:"${outputType}",amount:2.0,operation:"add_value",slot:"mainhand"}`
      const serialized = format === 'list' ? `[${modifier}]` : `{modifiers:[${modifier}],show_in_tooltip:true}`
      expect(result.text).toBe(`minecraft:stick[attribute_modifiers=${serialized}]`)
    }
  })

  it.each([
    'burning_time',
    'explosion_knockback_resistance',
    'movement_efficiency',
    'oxygen_bonus',
    'water_movement_efficiency'
  ])('restores the generic attribute alias for %s in 1.21.1', (attribute) => {
    const result = serializeItemStack({
      id: 'stick',
      components: [{
        kind: 'attribute_modifiers',
        entries: [{
          id: `example:${attribute}`,
          type: attribute,
          amount: 1,
          operation: 'add_value',
          slot: 'mainhand'
        }]
      }]
    }, '1.21.1')

    expect(result.diagnostics).toEqual([])
    expect(result.text).toContain(`type:"minecraft:generic.${attribute}"`)
  })

  it('uses direct block predicate lists from 1.21.5', () => {
    const result = serializeItemStack({
      id: 'stick',
      components: [
        { kind: 'can_break', blocks: ['stone'] },
        { kind: 'can_place_on', blocks: ['dirt', '#logs'] }
      ]
    }, '1.21.5')
    expect(result.text).toBe(
      'minecraft:stick[can_break=[{blocks:"minecraft:stone"}],can_place_on=[{blocks:"minecraft:dirt"},{blocks:"#minecraft:logs"}]]'
    )
    expect(result.diagnostics).toEqual([])
  })

  it('rejects repeated modifier IDs', () => {
    const result = serializeItemStack({
      id: 'stick',
      components: [{
        kind: 'attribute_modifiers',
        entries: [
          { id: 'example:power', type: 'attack_damage', amount: 2, operation: 'add_value', slot: 'mainhand' },
          { id: 'example:power', type: 'attack_speed', amount: 1, operation: 'add_value', slot: 'mainhand' }
        ]
      }]
    })
    expect(result.diagnostics.some((item) => item.code === 'item.attribute_modifiers.duplicate')).toBe(true)
    expect(result.text).toContain('type:"minecraft:attack_damage"')
    expect(result.text).not.toContain('type:"minecraft:attack_speed"')
  })

  it('serializes item tags through custom_data and rejects invalid tags', () => {
    const valid = serializeItemStack({
      id: 'stick',
      components: [{ kind: 'item_tags', tags: [' quest:item ', 'rare'] }]
    })
    expect(valid.text).toBe('minecraft:stick[custom_data={Tags:["quest:item","rare"]}]')
    expect(valid.diagnostics).toEqual([])

    const invalid = serializeItemStack({
      id: 'stick',
      components: [{ kind: 'item_tags', tags: [' ', 'duplicate', ' duplicate ', 'bad\nvalue'] }]
    })
    expect(hasErrors(invalid.diagnostics)).toBe(true)
    expect(invalid.text).toBe('minecraft:stick[custom_data={Tags:["duplicate"]}]')

    const empty = serializeItemStack({
      id: 'stick',
      components: [{ kind: 'item_tags', tags: [] }]
    })
    expect(empty.text).toBe('minecraft:stick')
    expect(empty.diagnostics.some((item) => item.code === 'item.item_tags.empty')).toBe(true)
  })

  it('does not emit item_tags and custom_data as duplicate components', () => {
    const result = serializeItemStack({
      id: 'stick',
      components: [
        { kind: 'item_tags', tags: ['one'] },
        { kind: 'custom_data', raw: '{other:1b}' }
      ]
    })
    expect(result.text).toBe('minecraft:stick[custom_data={Tags:["one"]}]')
    expect(result.diagnostics.some((item) => item.code === 'item.component.duplicate')).toBe(true)
  })

  it('rejects invalid structured component values instead of emitting malformed SNBT', () => {
    const result = serializeItemStack({
      id: 'stick',
      components: [
        {
          kind: 'attribute_modifiers',
          entries: [{ id: 'bad id', type: 'generic.attack_damage', amount: Number.NaN, operation: 'multiply', slot: 'invalid' } as never]
        },
        {
          kind: 'potion_contents', potion: '', customColor: 0x1000000,
          effects: [{ id: 'speed', duration: -1, amplifier: 256, ambient: false, showParticles: true, showIcon: true }]
        },
        { kind: 'can_break', blocks: ['bad id'] },
        { kind: 'entity_data', raw: '{broken' },
        {
          kind: 'block_entity_data', entity: 'zombie', delay: 0,
          minSpawnDelay: 900, maxSpawnDelay: 100, spawnCount: 0,
          maxNearbyEntities: 6, requiredPlayerRange: 16, spawnRange: 4
        }
      ]
    })

    expect(hasErrors(result.diagnostics)).toBe(true)
    expect(result.text).not.toContain('attribute_modifiers=')
    expect(result.text).not.toContain('potion_contents=')
    expect(result.text).not.toContain('can_break=')
    expect(result.text).not.toContain('entity_data=')
    expect(result.text).not.toContain('block_entity_data=')
  })

  it.each(['{foo:[1}}', '{foo:{bar:1]}'])('rejects mismatched SNBT delimiters in entity data: %s', (raw) => {
    const result = serializeItemStack({
      id: 'zombie_spawn_egg',
      components: [{ kind: 'entity_data', raw }]
    })

    expect(hasErrors(result.diagnostics)).toBe(true)
    expect(result.text).not.toContain('entity_data=')
  })

  it('keeps new components unsupported by the pre-component item engine', () => {
    const result = serializeItemStack({
      id: 'stick',
      components: [{ kind: 'can_break', blocks: ['stone'] }]
    }, '1.20.4')
    expect(result.diagnostics.some((item) => item.code === 'item.components.version')).toBe(true)
  })
})
