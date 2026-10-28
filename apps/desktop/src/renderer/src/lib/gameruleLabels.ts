import rulesJson from '../data/gamerules.json'
import type { GameruleRule } from '../components/GamerulePickerDialog'

export interface GameruleLabel {
  id: string
  name: string
  description: string
  type?: GameruleRule['type']
  min?: number
  max?: number
}

const rules = new Map((rulesJson as GameruleRule[]).map((rule) => [rule.id, rule]))

/** Display aliases only: command generation must keep the version's original ID. */
const SEMANTIC_ALIASES: Record<string, string> = {
  announce_advancements: 'show_advancement_messages',
  do_daylight_cycle: 'advance_time',
  do_entity_drops: 'entity_drops',
  do_limited_crafting: 'limited_crafting',
  do_mob_loot: 'mob_drops',
  do_mob_spawning: 'spawn_mobs',
  do_tile_drops: 'block_drops',
  do_weather_cycle: 'advance_weather',
  max_command_chain_length: 'max_command_sequence_length',
  natural_regeneration: 'natural_health_regeneration',
  spawn_radius: 'respawn_radius',
  do_immediate_respawn: 'immediate_respawn',
  do_insomnia: 'spawn_phantoms',
  do_patrol_spawning: 'spawn_patrols',
  do_trader_spawning: 'spawn_wandering_traders',
  do_warden_spawning: 'spawn_wardens',
  snow_accumulation_height: 'max_snow_accumulation_height',
  command_modification_block_limit: 'max_block_modifications',
  do_vines_spread: 'spread_vines',
  max_command_fork_count: 'max_command_forks',
  command_blocks_enabled: 'command_blocks_work',
  minecart_max_speed: 'max_minecart_speed',
  spawner_blocks_enabled: 'spawner_blocks_work'
}

/** Inverted, removed, or type-changed legacy rules need their own descriptions. */
const LEGACY_LABELS: Record<string, Omit<GameruleRule, 'id'>> = {
  disable_elytra_movement_check: {
    name: '禁用鞘翅移动检查', type: 'boolean',
    description: '开启后关闭服务器对鞘翅飞行速度的检查。'
  },
  disable_player_movement_check: {
    name: '禁用玩家移动检查', type: 'boolean',
    description: '开启后关闭服务器对玩家移动速度的检查。'
  },
  disable_raids: {
    name: '禁用袭击', type: 'boolean',
    description: '开启后禁止发生袭击。'
  },
  do_fire_tick: {
    name: '火焰蔓延与自然熄灭', type: 'boolean',
    description: '控制火焰能否蔓延，以及是否会自然熄灭。'
  },
  allow_fire_ticks_away_from_player: {
    name: '允许远离玩家的火焰更新', type: 'boolean',
    description: '控制远离玩家的火焰是否继续更新。'
  },
  spawn_chunk_radius: {
    name: '出生区块半径', type: 'integer', min: 0, max: 32,
    description: '设置世界出生点周围保持加载的区块半径。'
  }
}

export function gameruleLabel(id: string): GameruleLabel {
  // A custom namespace must not accidentally borrow a vanilla rule's meaning.
  const shortId = id.replace(/^minecraft:/, '')
  const snakeId = shortId.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)
  const canonicalId = Object.hasOwn(SEMANTIC_ALIASES, snakeId) ? SEMANTIC_ALIASES[snakeId] : snakeId
  const legacyRule = Object.hasOwn(LEGACY_LABELS, snakeId) ? LEGACY_LABELS[snakeId] : undefined
  const rule = legacyRule ?? rules.get(canonicalId)
  return rule
    ? { ...rule, id }
    : { id, name: '扩展游戏规则', description: '此规则由当前版本或扩展内容提供，请按原始 ID 确认其用途。' }
}
