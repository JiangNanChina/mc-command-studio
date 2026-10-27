import { describe, expect, it } from 'vitest'
import {
  buildBlockdata,
  buildEntitydata,
  buildReplaceitem,
  buildTestfor,
  buildLegacyGive,
  buildTestforblock,
  buildTestforblocks,
  buildAchievement,
  buildTrigger,
  buildSetidletimeout,
  buildSave,
  buildStats,
  buildScoreboard,
  buildLegacyExecute,
  buildAdvancement,
  buildClear,
  buildWorldborder,
  buildSpreadplayers,
  buildTitle,
  buildParticle,
  buildSummon,
  buildGamerule,
  buildXp,
  buildTellraw,
  buildEffect,
  buildEnchant,
  createDefaultBlockdata,
  createDefaultEntitydata,
  createDefaultGive,
  createDefaultReplaceitem,
  createDefaultTestfor,
  createDefaultStats,
  createDefaultScoreboard,
  createDefaultLegacyExecute,
  createDefaultAdvancement,
  createDefaultClear,
  createDefaultWorldborder,
  createDefaultSpreadplayers,
  createDefaultTitle,
  createDefaultParticle,
  createDefaultSummon,
  createDefaultGamerule,
  createDefaultXp,
  createDefaultTellraw,
  createDefaultEffect,
  createDefaultEnchant
} from './legacy'

describe('1.12 legacy commands', () => {
  it('builds testfor with optional NBT', () => {
    expect(buildTestfor({ ...createDefaultTestfor(), nbt: '{Health:10f}' }).text).toBe(
      'testfor @a {Health:10f}'
    )
  })

  it('builds blockdata and entitydata', () => {
    expect(
      buildBlockdata({ ...createDefaultBlockdata(), x: '0', y: '64', z: '0', nbt: '{Lock:"key"}' })
        .text
    ).toBe('blockdata 0 64 0 {Lock:"key"}')
    expect(buildEntitydata({ ...createDefaultEntitydata(), nbt: '{NoGravity:1b}' }).text).toBe(
      'entitydata @e {NoGravity:1b}'
    )
  })

  it('builds replaceitem for entity and block', () => {
    const entity = buildReplaceitem({
      ...createDefaultReplaceitem(),
      item: 'minecraft:diamond',
      count: '3',
      data: '0'
    })
    expect(entity.text).toBe(
      'replaceitem entity @p slot.weapon.mainhand minecraft:diamond 3 0'
    )
    const block = buildReplaceitem({
      ...createDefaultReplaceitem(),
      target: 'block',
      x: '1',
      y: '2',
      z: '3',
      slot: 'slot.inventory.0'
    })
    expect(block.text).toContain('replaceitem block 1 2 3 slot.inventory.0')
  })

  it('builds old block and achievement checks', () => {
    expect(
      buildTestforblock({ x: '0', y: '64', z: '0', block: 'minecraft:stone', data: '' }).text
    ).toBe('testforblock 0 64 0 minecraft:stone')
    expect(
      buildTestforblocks({
        fromX: '0', fromY: '0', fromZ: '0',
        toX: '1', toY: '1', toZ: '1',
        destX: '5', destY: '5', destZ: '5',
        mode: 'masked'
      }).text
    ).toBe('testforblocks 0 0 0 1 1 1 5 5 5 masked')
    expect(
      buildAchievement({ action: 'give', target: '@p', achievement: 'minecraft:story/root' }).text
    ).toBe('achievement give minecraft:story/root @p')
  })

  it('builds trigger, idle timeout and save', () => {
    expect(buildTrigger({ objective: 'quest', action: 'add', value: '1' }).text).toBe(
      'trigger quest add 1'
    )
    expect(buildSetidletimeout({ minutes: '30' }).text).toBe('setidletimeout 30')
    expect(buildSave({ action: 'query' }).text).toBe('save query')
  })

  it('builds stats set/clear', () => {
    const base = createDefaultStats()
    expect(
      buildStats({ ...base, target: '@p', stat: 'SuccessCount', objective: 'kills' }).text
    ).toBe('stats entity @p set SuccessCount kills')
    expect(buildStats({ ...base, action: 'clear', stat: 'SuccessCount' }).text).toBe(
      'stats entity @p clear SuccessCount'
    )
  })

  it('builds effect and enchant', () => {
    expect(
      buildEffect({
        action: 'give',
        target: '@p',
        effect: 'minecraft:speed',
        seconds: '30',
        amplifier: '1',
        hideParticles: false
      }).text
    ).toBe('effect @p minecraft:speed 30 1')
    expect(
      buildEnchant({ target: '@p', enchantment: 'minecraft:sharpness', level: '5' }).text
    ).toBe('enchant @p minecraft:sharpness 5')
  })

  it('builds xp and tellraw', () => {
    expect(buildXp({ amount: '100', levels: false, target: '@p' }).text).toBe('xp 100 @p')
    expect(buildXp({ amount: '5', levels: true, target: '@p' }).text).toBe('xp 5L @p')
    expect(
      buildTellraw({ target: '@a', json: '{"text":"Hello","color":"gold"}' }).text
    ).toBe('tellraw @a {"text":"Hello","color":"gold"}')
  })

  it('builds summon and gamerule', () => {
    expect(
      buildSummon({
        ...createDefaultSummon(),
        entity: 'minecraft:zombie',
        x: '~',
        y: '~',
        z: '~',
        nbt: '{NoAI:1b}'
      }).text
    ).toBe('summon minecraft:zombie ~ ~ ~ {NoAI:1b}')
    expect(buildGamerule({ rule: 'keepInventory', value: 'true' }).text).toBe(
      'gamerule keepInventory true'
    )
  })

  it('builds title and particle', () => {
    expect(
      buildTitle({
        ...createDefaultTitle(),
        target: '@a',
        action: 'title',
        text: '{"text":"Hi"}'
      }).text
    ).toBe('title @a title {"text":"Hi"}')
    expect(
      buildParticle({
        ...createDefaultParticle(),
        name: 'minecraft:flame',
        x: '~',
        y: '~1',
        z: '~',
        dx: '0',
        dy: '0',
        dz: '0',
        speed: '0.1',
        count: '20'
      }).text
    ).toBe('particle minecraft:flame ~ ~1 ~ 0 0 0 0.1 20')
  })

  it('builds advancement and clear', () => {
    expect(
      buildAdvancement({
        ...createDefaultAdvancement(),
        action: 'grant',
        target: '@p',
        mode: 'only',
        advancement: 'minecraft:story/root'
      }).text
    ).toBe('advancement grant @p only minecraft:story/root')
    expect(
      buildClear({
        ...createDefaultClear(),
        target: '@p',
        item: 'minecraft:dirt',
        data: '0',
        maxCount: '16'
      }).text
    ).toBe('clear @p minecraft:dirt 0 16')
  })

  it('builds worldborder and spreadplayers', () => {
    expect(
      buildWorldborder({ ...createDefaultWorldborder(), action: 'set', value: '200' }).text
    ).toBe('worldborder set 200')
    expect(
      buildSpreadplayers({
        ...createDefaultSpreadplayers(),
        x: '0',
        z: '0',
        min: '10',
        max: '50',
        respectTeams: false,
        targets: '@a'
      }).text
    ).toBe('spreadplayers 0 0 10 50 false @a')
  })

  it('builds legacy execute with detect', () => {
    const base = createDefaultLegacyExecute()
    expect(buildLegacyExecute({ ...base, target: '@p', command: 'say hi' }).text).toBe(
      'execute @p ~ ~ ~ say hi'
    )
    expect(
      buildLegacyExecute({
        ...base,
        detect: true,
        block: 'minecraft:stone',
        data: '0',
        command: 'say found'
      }).text
    ).toBe('execute @p ~ ~ ~ detect minecraft:stone 0 say found')
  })

  it('builds legacy scoreboard operations', () => {
    const base = createDefaultScoreboard()
    expect(
      buildScoreboard({ ...base, action: 'players-set', target: '@p', objective: 'kills', value: '3' })
        .text
    ).toBe('scoreboard players set @p kills 3')
    expect(
      buildScoreboard({ ...base, action: 'objectives-add', name: 'kills', criterion: 'dummy', display: '击杀数' })
        .text
    ).toBe('scoreboard objectives add kills dummy 击杀数')
  })

  it('builds legacy give with NBT', () => {
    const result = buildLegacyGive({
      ...createDefaultGive(),
      item: 'minecraft:diamond_sword',
      count: '1',
      data: '0',
      nbt: '{display:{Name:"Sword"}}'
    })
    expect(result.text).toBe(
      'give @p minecraft:diamond_sword 1 0 {display:{Name:"Sword"}}'
    )
  })

  it('validates NBT and counts', () => {
    const result = buildReplaceitem({
      ...createDefaultReplaceitem(),
      count: '0',
      data: '-1',
      nbt: 'bad'
    })
    expect(result.diagnostics.some((item) => item.code === 'legacy.count')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'legacy.data')).toBe(true)
    expect(result.diagnostics.some((item) => item.code === 'legacy.nbt')).toBe(true)
  })
})
