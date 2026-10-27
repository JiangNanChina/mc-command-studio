import atlasUrl from '../assets/mc-icons.png'
import atlasData from '../data/mc-icons.json'
import namesData from '../data/mc-names.json'

export type McCategory =
  | 'items'
  | 'blocks'
  | 'effects'
  | 'enchantments'
  | 'entities'
  | 'sounds'

interface AtlasData {
  cell: number
  columns: number
  icons: Record<McCategory, Record<string, number>>
}

interface NamesData {
  items: Record<string, string>
  blocks: Record<string, string>
  effects: Record<string, string>
  enchantments: Record<string, string>
  entities: Record<string, string>
  sounds: Record<string, string>
}

const atlas = atlasData as AtlasData
const names = namesData as NamesData
const allIcons = Object.values(atlas.icons).flatMap((group) => Object.values(group))

const LEGACY_ICON_ALIASES: Partial<Record<McCategory, Record<string, string>>> = {
  items: {
    grass: 'short_grass',
    grass_path: 'dirt_path',
    sign: 'oak_sign',
    rose_red: 'red_dye',
    dandelion_yellow: 'yellow_dye',
    cactus_green: 'green_dye',
    scute: 'turtle_scute',
    zombie_pigman_spawn_egg: 'zombified_piglin_spawn_egg'
  },
  blocks: {
    grass: 'short_grass',
    grass_path: 'dirt_path',
    sign: 'oak_sign',
    wall_sign: 'oak_sign',
    chain: 'iron_chain'
  },
  entities: {
    boat: 'oak_boat',
    chest_boat: 'oak_chest_boat',
    potion: 'potion',
    zombie_pigman: 'zombified_piglin'
  },
  enchantments: {
    sweeping: 'sweeping_edge'
  }
}

const LEGACY_NAMES: Partial<Record<McCategory, Record<string, string>>> = {
  items: {
    grass: '草',
    grass_path: '土径',
    sign: '告示牌',
    rose_red: '玫瑰红染料',
    dandelion_yellow: '蒲公英黄染料',
    cactus_green: '仙人掌绿染料',
    scute: '鳞甲',
    zombie_pigman_spawn_egg: '僵尸猪人刷怪蛋',
    chain: '锁链'
  },
  blocks: {
    grass: '草方块',
    grass_path: '土径',
    sign: '告示牌',
    wall_sign: '墙上的告示牌',
    chain: '锁链'
  },
  entities: {
    boat: '船',
    chest_boat: '运输船',
    potion: '药水',
    zombie_pigman: '僵尸猪人',
    tropical_fish: '热带鱼'
  },
  enchantments: {
    sweeping: '横扫之刃'
  }
}

function legacyIconId(category: McCategory, id: string): string {
  const short = mcShortId(id)
  if (category === 'entities') {
    if (short.startsWith('tropical_fish.')) return 'tropical_fish'
    if (short.startsWith('villager.')) return 'villager'
  }
  return LEGACY_ICON_ALIASES[category]?.[short] ?? short
}

function legacyName(category: McCategory, id: string): string | undefined {
  const short = mcShortId(id)
  const explicit = LEGACY_NAMES[category]?.[short]
  if (explicit) return explicit
  if (category === 'entities') {
    if (short.startsWith('tropical_fish.')) return '热带鱼'
    if (short.startsWith('villager.')) {
      const professions: Record<string, string> = {
        armorer: '盔甲匠',
        butcher: '屠夫',
        cartographer: '制图师',
        cleric: '牧师',
        farmer: '农民',
        fisherman: '渔夫',
        fletcher: '制箭师',
        leatherworker: '皮匠',
        librarian: '图书管理员',
        nitwit: '傻子',
        shepherd: '牧羊人',
        tool_smith: '工具匠',
        weapon_smith: '武器匠'
      }
      const profession = short.slice('villager.'.length)
      return `村民（${professions[profession] ?? profession.replace(/_/g, ' ')}）`
    }
  }
  return undefined
}
export const MC_ATLAS_URL = atlasUrl
export const MC_ATLAS_COLUMNS = atlas.columns
export const MC_ATLAS_ROWS = Math.ceil((Math.max(...allIcons, 0) + 1) / atlas.columns)
export const MC_ATLAS_CELL = atlas.cell

export function mcId(value: string): string {
  return value.includes(':') ? value : `minecraft:${value}`
}

export function mcShortId(value: string): string {
  return value.replace(/^minecraft:/, '')
}

export function mcName(category: McCategory, id: string): string {
  const key = mcShortId(id)
  return (
    names[category][key] ??
    legacyName(category, key) ??
    key.replace(/_/g, ' ')
  )
}

export function mcIconIndex(category: McCategory, id: string): number | undefined {
  const direct = atlas.icons[category]?.[mcShortId(id)]
  if (direct !== undefined) return direct
  return atlas.icons[category]?.[legacyIconId(category, id)]
}

export function mcIconPosition(index: number): { column: number; row: number } {
  return { column: index % atlas.columns, row: Math.floor(index / atlas.columns) }
}

export function mcNameIndex(category: McCategory): Record<string, string> {
  return names[category]
}
