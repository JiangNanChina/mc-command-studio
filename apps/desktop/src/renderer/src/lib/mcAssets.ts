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
  return names[category][key] ?? key.replace(/_/g, ' ')
}

export function mcIconIndex(category: McCategory, id: string): number | undefined {
  return atlas.icons[category]?.[mcShortId(id)]
}

export function mcIconPosition(index: number): { column: number; row: number } {
  return { column: index % atlas.columns, row: Math.floor(index / atlas.columns) }
}

export function mcNameIndex(category: McCategory): Record<string, string> {
  return names[category]
}
