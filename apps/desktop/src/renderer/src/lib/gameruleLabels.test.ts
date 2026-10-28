import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import rulesJson from '../data/gamerules.json'
import { gameruleLabel } from './gameruleLabels'

describe('game-rule display labels', () => {
  it('reuses current Chinese metadata with or without the vanilla namespace', () => {
    for (const rule of rulesJson) {
      expect(gameruleLabel(rule.id)).toEqual(rule)
      expect(gameruleLabel(`minecraft:${rule.id}`)).toEqual({ ...rule, id: `minecraft:${rule.id}` })
    }
  })

  it('resolves semantic renames while retaining the original command ID', () => {
    for (const [legacy, modern] of [
      ['doDaylightCycle', 'advance_time'],
      ['keepInventory', 'keep_inventory'],
      ['doMobLoot', 'mob_drops'],
      ['doTileDrops', 'block_drops'],
      ['doInsomnia', 'spawn_phantoms'],
      ['announceAdvancements', 'show_advancement_messages'],
      ['naturalRegeneration', 'natural_health_regeneration'],
      ['maxCommandChainLength', 'max_command_sequence_length'],
      ['spawnRadius', 'respawn_radius'],
      ['commandBlocksEnabled', 'command_blocks_work']
    ]) {
      expect(gameruleLabel(legacy)).toEqual({ ...gameruleLabel(modern), id: legacy })
    }
  })

  it('preserves the meaning and type of inverted or removed legacy rules', () => {
    expect(gameruleLabel('disableRaids')).toMatchObject({ name: '禁用袭击', type: 'boolean' })
    expect(gameruleLabel('disableElytraMovementCheck')).toMatchObject({ name: '禁用鞘翅移动检查', type: 'boolean' })
    expect(gameruleLabel('disablePlayerMovementCheck')).toMatchObject({ name: '禁用玩家移动检查', type: 'boolean' })
    expect(gameruleLabel('doFireTick')).toMatchObject({ type: 'boolean' })
    expect(gameruleLabel('spawnChunkRadius')).toMatchObject({ type: 'integer', min: 0, max: 32 })
  })

  it('has Chinese names for the literal game rules in every bundled version', () => {
    const packsPath = resolve('packs')
    for (const version of readdirSync(packsPath)) {
      const commandsPath = resolve(packsPath, version, 'commands.json')
      if (!existsSync(commandsPath)) continue
      const commands = JSON.parse(readFileSync(commandsPath, 'utf8'))
      const rules = commands.children?.gamerule?.children ?? {}
      for (const [id, node] of Object.entries(rules)) {
        if ((node as { type?: string }).type !== 'literal') continue
        const label = gameruleLabel(id)
        expect(label.id).toBe(id)
        expect(label.name, `${version}: ${id}`).toMatch(/[\u3400-\u9fff]/)
        expect(label.name, `${version}: ${id}`).not.toBe('扩展游戏规则')
      }
    }
  })

  it('keeps unknown or custom-namespaced IDs as secondary information', () => {
    expect(gameruleLabel('pack:keep_inventory')).toMatchObject({ id: 'pack:keep_inventory', name: '扩展游戏规则' })
    expect(gameruleLabel('futureRule')).toMatchObject({ id: 'futureRule', name: '扩展游戏规则' })
    expect(gameruleLabel('constructor')).toMatchObject({ id: 'constructor', name: '扩展游戏规则' })
    expect(gameruleLabel('futureRule').type).toBeUndefined()
  })
})
