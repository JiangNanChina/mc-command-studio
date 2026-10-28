import atlasUrl from '../assets/mc-icons.png'
import atlasData from '../data/mc-icons.json'
import namesData from '../data/mc-names.json'
import legacyAssets from '../data/legacy-assets.json'
import { localizedSoundName } from './soundLabels'

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

const CATEGORY_LABELS: Record<McCategory, string> = {
  items: '物品', blocks: '方块', effects: '状态效果', enchantments: '附魔', entities: '实体', sounds: '声音'
}

const BANNER_COLORS: Record<string, string> = {
  white: '白色', orange: '橙色', magenta: '品红色', light_blue: '淡蓝色', yellow: '黄色',
  lime: '黄绿色', pink: '粉红色', gray: '灰色', light_gray: '淡灰色', cyan: '青色',
  purple: '紫色', blue: '蓝色', brown: '棕色', green: '绿色', red: '红色', black: '黑色'
}

function hasChineseName(value: string | undefined): value is string {
  return Boolean(value && /[\u3400-\u9fff]/.test(value))
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
    const fishType = short.match(/^tropical_fish\.type\.(.+)$/)?.[1]
    const fishPreset = short.match(/^tropical_fish\.predefined\.(\d+)$/)?.[1]
    if ((fishType && ['betty', 'blockfish', 'brinely', 'clayfish', 'dasher', 'flopper',
      'glitter', 'kob', 'snooper', 'spotty', 'stripey', 'sunstreak'].includes(fishType))
      || (fishPreset !== undefined && Number(fishPreset) >= 0 && Number(fishPreset) <= 21)) return '热带鱼'
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
      return professions[profession] ? `村民（${professions[profession]}）` : undefined
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
  if (id.includes(':') && !id.startsWith('minecraft:')) return `自定义${CATEGORY_LABELS[category]}`
  const name = localName(category, key)
  return name ?? `未收录的${CATEGORY_LABELS[category]}`
}

function localName(category: McCategory, key: string): string | undefined {
  if ((category === 'items' || category === 'blocks') && key === 'tnt') return '炸药（TNT）'
  if (category === 'blocks') {
    const color = key.match(/^(.+)_wall_banner$/)?.[1]
    if (color && BANNER_COLORS[color]) return `${BANNER_COLORS[color]}墙上的旗帜`
  }
  const known = names[category][key] ?? legacyName(category, key)
  if (hasChineseName(known)) return known.replace(/^TNT：/, '炸药（TNT）：')
  // Resolve only known catalog entries; arbitrary IDs must not acquire guessed names.
  if (category === 'sounds' && Object.prototype.hasOwnProperty.call(names.sounds, key)) {
    return localizedSoundName(key, localName)
  }
  return undefined
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
  return Object.fromEntries(Object.keys(names[category]).map((id) => [id, mcName(category, id)]))
}
