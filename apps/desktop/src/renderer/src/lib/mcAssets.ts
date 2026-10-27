import atlasUrl from '../assets/mc-icons.png'
import atlasData from '../data/mc-icons.json'
import namesData from '../data/mc-names.json'
import legacyAssets from '../data/legacy-assets.json'

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

const LEGACY_ICON_ALIASES = legacyAssets.icons as Partial<
  Record<McCategory, Record<string, string>>
>
const LEGACY_NAMES = legacyAssets.names as Partial<
  Record<McCategory, Record<string, string>>
>

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
  if (category === 'entities' && mcShortId(id) === 'potion') {
    return atlas.icons.items?.potion
  }
  return atlas.icons[category]?.[legacyIconId(category, id)]
}

export function mcIconPosition(index: number): { column: number; row: number } {
  return { column: index % atlas.columns, row: Math.floor(index / atlas.columns) }
}

export function mcNameIndex(category: McCategory): Record<string, string> {
  return names[category]
}
