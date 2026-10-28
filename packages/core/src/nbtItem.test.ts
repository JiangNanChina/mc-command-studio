import { describe, expect, it } from 'vitest'
import {
  LEGACY_NBT_ATTRIBUTES, buildNbtGiveCommand, createDefaultNbtGiveOptions, legacyNbtAttributeId
} from './nbtItem'

describe('nbt give', () => {
  it('builds a plain legacy give command', () => {
    expect(buildNbtGiveCommand(createDefaultNbtGiveOptions()).text).toBe(
      'give @s minecraft:diamond_sword 1'
    )
  })

  it('builds name, lore, enchantments and unbreakable', () => {
    const result = buildNbtGiveCommand({
      ...createDefaultNbtGiveOptions(),
      name: '屠龙剑',
      lore: '第一行\n第二行',
      enchantments: [
        { id: 'minecraft:sharpness', level: '5' },
        { id: 'minecraft:unbreaking', level: '3' }
      ],
      unbreakable: true
    })
    expect(result.text).toContain('display:{Name:')
    expect(result.text).toContain('Lore:[')
    expect(result.text).toContain('Enchantments:[{id:"minecraft:sharpness",lvl:5}')
    expect(result.text).toContain('Unbreakable:1b')
    expect(result.text).toMatch(/^give @s minecraft:diamond_sword\{display:/)
    expect(result.text).toMatch(/Unbreakable:1b\} 1$/)
  })

  it('validates item, count, lore and enchantments', () => {
    const result = buildNbtGiveCommand({
      ...createDefaultNbtGiveOptions(),
      item: 'bad id',
      count: '0',
      enchantments: [{ id: 'bad id', level: '0' }]
    })
    expect(result.diagnostics.some((item) => item.code === 'nbt.item')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'nbt.count')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'nbt.enchant.id')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'nbt.enchant.level')).toBe(true)
  })

  it('serializes old item NBT fields without changing the default command', () => {
    const result = buildNbtGiveCommand({
      ...createDefaultNbtGiveOptions(),
      damage: '42',
      tags: ['builder', 'a"tag'],
      attributes: [{
        attribute: 'generic.attack_damage',
        amount: '7.5',
        operation: 0,
        slot: 'mainhand',
        name: 'Forged "power"'
      }],
      potion: 'minecraft:strong_healing',
      potionColor: '#12aBcD',
      potionEffects: [
        { id: 'minecraft:speed', duration: '600', amplifier: '1' },
        { id: '5', duration: '200', amplifier: '2' }
      ],
      canDestroy: ['stone', '#minecraft:logs'],
      canPlaceOn: ['minecraft:dirt'],
      spawnerEntity: 'minecraft:zombie',
      spawnerDelay: '20',
      spawnerMinSpawnDelay: '200',
      spawnerMaxSpawnDelay: '800',
      spawnerSpawnCount: '4',
      spawnerMaxNearbyEntities: '6',
      spawnerRequiredPlayerRange: '16',
      spawnerSpawnRange: '4'
    }, '1.20.4')

    expect(result.diagnostics).toEqual([])
    expect(result.text).toContain('Damage:42')
    expect(result.text).toContain('Tags:["builder","a\\\"tag"]')
    expect(result.text).toContain('AttributeName:"minecraft:generic.attack_damage"')
    expect(result.text).toContain('Name:"Forged \\\"power\\\""')
    expect(result.text).toMatch(/UUID:\[I;-?\d+,-?\d+,-?\d+,-?\d+\]/)
    expect(result.text).toContain('Potion:"minecraft:strong_healing"')
    expect(result.text).toContain('CustomPotionColor:1223629')
    expect(result.text).toContain('custom_potion_effects:[{id:"minecraft:speed",amplifier:1,duration:600},{id:"minecraft:strength",amplifier:2,duration:200}]')
    expect(result.text).toContain('CanDestroy:["minecraft:stone","#minecraft:logs"]')
    expect(result.text).toContain('CanPlaceOn:["minecraft:dirt"]')
    expect(result.text).toContain('BlockEntityTag:{SpawnData:{entity:{id:"minecraft:zombie"}},Delay:20s,MinSpawnDelay:200s,MaxSpawnDelay:800s,SpawnCount:4s,MaxNearbyEntities:6s,RequiredPlayerRange:16s,SpawnRange:4s}')
  })

  it('uses the pre-1.16 modifier UUID and pre-1.18 spawner entity shapes', () => {
    const result = buildNbtGiveCommand({
      ...createDefaultNbtGiveOptions(),
      attributes: [{ attribute: 'generic.max_health', amount: '2', operation: 1, slot: 'head', name: 'old' }],
      spawnerEntity: 'minecraft:skeleton'
    }, '1.15.2')
    expect(result.text).toMatch(/UUIDMost:-?\d+L,UUIDLeast:-?\d+L/)
    expect(result.text).toContain('AttributeName:"generic.maxHealth"')
    expect(result.text).toContain('SpawnData:{id:"minecraft:skeleton"}')
    expect(result.text).not.toContain('UUID:[I;')
    expect(result.diagnostics).toEqual([])
  })

  it.each(['1.17.1', '1.18', '1.20.1'])('keeps numeric potion effect NBT before 1.20.2 (%s)', (version) => {
    const result = buildNbtGiveCommand({
      ...createDefaultNbtGiveOptions(),
      item: 'minecraft:potion',
      potionEffects: [
        { id: 'minecraft:speed', duration: '600', amplifier: '1' },
        { id: '5', duration: '200', amplifier: '2' }
      ]
    }, version)
    expect(result.diagnostics).toEqual([])
    expect(result.text).toBe('give @s minecraft:potion{CustomPotionEffects:[{Id:1b,Amplifier:1b,Duration:600},{Id:5b,Amplifier:2b,Duration:200}]} 1')
  })

  it.each(['1.20.2', '1.20.4'])('uses resource potion effect IDs and renamed fields from 1.20.2 (%s)', (version) => {
    const result = buildNbtGiveCommand({
      ...createDefaultNbtGiveOptions(),
      item: 'minecraft:potion',
      potionEffects: [
        { id: 'minecraft:speed', duration: '600', amplifier: '1' },
        { id: '5', duration: '200', amplifier: '2' },
        { id: 'darkness', duration: '100', amplifier: '0' }
      ]
    }, version)
    expect(result.diagnostics).toEqual([])
    expect(result.text).toBe('give @s minecraft:potion{custom_potion_effects:[{id:"minecraft:speed",amplifier:1,duration:600},{id:"minecraft:strength",amplifier:2,duration:200},{id:"minecraft:darkness",amplifier:0,duration:100}]} 1')
  })

  it.each([
    ['1.17.1', '{id:"minecraft:skeleton"}'],
    ['1.18', '{entity:{id:"minecraft:skeleton"}}'],
    ['1.20.1', '{entity:{id:"minecraft:skeleton"}}'],
    ['1.20.2', '{entity:{id:"minecraft:skeleton"}}'],
    ['1.20.4', '{entity:{id:"minecraft:skeleton"}}']
  ])('uses the matching SpawnData structure across the 1.18 boundary (%s)', (version, spawnData) => {
    const result = buildNbtGiveCommand({
      ...createDefaultNbtGiveOptions(),
      item: 'minecraft:spawner',
      spawnerEntity: 'minecraft:skeleton'
    }, version)
    expect(result.diagnostics).toEqual([])
    expect(result.text).toBe(`give @s minecraft:spawner{BlockEntityTag:{SpawnData:${spawnData}}} 1`)
  })

  it.each(['1.13.2', '1.15.2'])('serializes supported %s vanilla AttributeName strings without a namespace', (version) => {
    const attributes = LEGACY_NBT_ATTRIBUTES.filter(({ id }) => legacyNbtAttributeId(id, version))
    const result = buildNbtGiveCommand({
      ...createDefaultNbtGiveOptions(),
      attributes: attributes.map(({ id }) => ({ attribute: id, amount: '2', operation: 0, slot: 'mainhand', name: '旧版加成' }))
    }, version)
    expect(result.diagnostics).toEqual([])
    for (const { id } of attributes) expect(result.text).toContain(`AttributeName:"${id}"`)
    expect(result.text).not.toContain('AttributeName:"minecraft:')
    expect(result.text).toMatch(/UUIDMost:-?\d+L,UUIDLeast:-?\d+L/)
  })

  it('converts only known vanilla aliases before 1.16 and rejects unsupported legacy attributes', () => {
    expect(legacyNbtAttributeId('minecraft:generic.attack_damage', '1.15.2')).toBe('generic.attackDamage')
    expect(legacyNbtAttributeId('horse.jump_strength', '1.13.2')).toBe('horse.jumpStrength')
    expect(legacyNbtAttributeId('generic.attackKnockback', '1.13.2')).toBeNull()
    expect(legacyNbtAttributeId('my_pack:generic.attack_damage', '1.15.2')).toBeNull()
    for (const attribute of ['generic.unknownName', 'generic.attackKnockback', '攻击伤害']) {
      const result = buildNbtGiveCommand({ ...createDefaultNbtGiveOptions(), attributes: [
        { attribute, amount: '2', operation: 0, slot: 'mainhand', name: 'test' }
      ] }, '1.13.2')
      expect(result.diagnostics.some((item) => item.code === 'nbt.attribute.id')).toBe(true)
      expect(result.text).not.toContain('AttributeModifiers')
    }
    const custom = buildNbtGiveCommand({ ...createDefaultNbtGiveOptions(), attributes: [
      { attribute: 'my_pack:bonus', amount: '2', operation: 0, slot: 'mainhand', name: 'test' }
    ] }, '1.15.2')
    expect(custom.diagnostics).toEqual([])
    expect(custom.text).toContain('AttributeName:"my_pack:bonus"')
    const customWithoutNamespace = buildNbtGiveCommand({ ...createDefaultNbtGiveOptions(), attributes: [
      { attribute: 'bonus', amount: '2', operation: 0, slot: 'mainhand', name: 'test' }
    ] }, '1.15.2')
    expect(customWithoutNamespace.diagnostics.some((item) => item.code === 'nbt.attribute.id')).toBe(true)
    expect(customWithoutNamespace.text).not.toContain('AttributeName:"minecraft:bonus"')
  })

  it.each(['1.16', '1.20.4'])('keeps %s resource-ID validation strict and modern UUID output intact', (version) => {
    const base = { ...createDefaultNbtGiveOptions(), attributes: [
      { attribute: 'generic.attackDamage', amount: '2', operation: 0 as const, slot: 'mainhand', name: 'test' }
    ] }
    const invalid = buildNbtGiveCommand(base, version)
    expect(invalid.diagnostics.some((item) => item.code === 'nbt.attribute.id')).toBe(true)
    expect(invalid.text).not.toContain('AttributeModifiers')
    const valid = buildNbtGiveCommand({ ...base, attributes: [
      { ...base.attributes[0], attribute: 'minecraft:generic.attack_damage' }
    ] }, version)
    expect(valid.diagnostics).toEqual([])
    expect(valid.text).toContain('AttributeName:"minecraft:generic.attack_damage"')
    expect(valid.text).toMatch(/UUID:\[I;-?\d+,-?\d+,-?\d+,-?\d+\]/)
    expect(valid.text).not.toContain('UUIDMost')
  })

  it('allows the spawner delay sentinel value', () => {
    const result = buildNbtGiveCommand({
      ...createDefaultNbtGiveOptions(),
      spawnerDelay: '-1'
    }, '1.20.4')

    expect(result.text).toContain('BlockEntityTag:{Delay:-1s}')
    expect(result.diagnostics).toEqual([])
  })

  it('rejects potion effects that were introduced after the selected version', () => {
    const result = buildNbtGiveCommand({
      ...createDefaultNbtGiveOptions(),
      potionEffects: [{ id: 'darkness', duration: '100', amplifier: '0' }]
    }, '1.18.2')
    expect(result.text).not.toContain('CustomPotionEffects')
    expect(result.diagnostics.some((item) => item.code === 'nbt.potion_effect.id')).toBe(true)
  })

  it('validates numeric values, identifiers, slots, operations and ranges', () => {
    const result = buildNbtGiveCommand({
      ...createDefaultNbtGiveOptions(),
      damage: '-1',
      tags: [''],
      attributes: [{ attribute: 'bad id', amount: 'NaN', operation: 9 as 0, slot: 'body', name: '' }],
      potion: 'bad potion',
      potionColor: '#12345g',
      potionEffects: [
        { id: 'speed', duration: '0', amplifier: '256' },
        { id: 'wind_charged', duration: '100', amplifier: '0' }
      ],
      canDestroy: ['not a block'],
      canPlaceOn: ['minecraft:stone'],
      spawnerEntity: 'not an entity',
      spawnerMinSpawnDelay: '900',
      spawnerMaxSpawnDelay: '200'
    })
    const codes = result.diagnostics.map((item) => item.code)
    expect(codes).toEqual(expect.arrayContaining([
      'nbt.damage', 'nbt.tag.value', 'nbt.attribute.id', 'nbt.attribute.amount',
      'nbt.attribute.operation', 'nbt.attribute.name', 'nbt.attribute.slot', 'nbt.potion',
      'nbt.potion_color', 'nbt.potion_effect.id', 'nbt.canDestroy', 'nbt.spawner.entity',
      'nbt.spawner.delay_range'
    ]))
    expect(codes).toContain('nbt.potion_effect.duration')
    expect(codes).toContain('nbt.potion_effect.amplifier')
  })
})
