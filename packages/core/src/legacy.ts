import { error, warn } from './diagnostics'
import { containsControlCharacters } from './escape'
import type { BuildResult, Diagnostic } from './types'

export interface LegacyTestforOptions {
  target: string
  nbt: string
}

export interface LegacyBlockdataOptions {
  x: string
  y: string
  z: string
  nbt: string
}

export interface LegacyEntitydataOptions {
  target: string
  nbt: string
}

export type ReplaceitemTarget = 'block' | 'entity'

export interface LegacyReplaceitemOptions {
  target: ReplaceitemTarget
  selector: string
  x: string
  y: string
  z: string
  slot: string
  item: string
  count: string
  data: string
  nbt: string
}

export const LEGACY_SLOTS = [
  'slot.weapon.mainhand',
  'slot.weapon.offhand',
  'slot.armor.head',
  'slot.armor.chest',
  'slot.armor.legs',
  'slot.armor.feet',
  'slot.hotbar.0',
  'slot.inventory.0',
  'slot.enderchest.0',
  'slot.horse.saddle',
  'slot.horse.armor',
  'slot.horse.chest.0'
]

export const LEGACY_DIRECTIONS = [
  { value: 'down', label: '下', meta: 0 },
  { value: 'up', label: '上', meta: 1 },
  { value: 'north', label: '北', meta: 2 },
  { value: 'south', label: '南', meta: 3 },
  { value: 'west', label: '西', meta: 4 },
  { value: 'east', label: '东', meta: 5 }
] as const

export type LegacyDirection = (typeof LEGACY_DIRECTIONS)[number]['value']

export function createDefaultTestfor(): LegacyTestforOptions {
  return { target: '@a', nbt: '' }
}

export function createDefaultBlockdata(): LegacyBlockdataOptions {
  return { x: '~', y: '~', z: '~', nbt: '' }
}

export function createDefaultEntitydata(): LegacyEntitydataOptions {
  return { target: '@e', nbt: '' }
}

export function createDefaultReplaceitem(): LegacyReplaceitemOptions {
  return {
    target: 'entity',
    selector: '@p',
    x: '~',
    y: '~',
    z: '~',
    slot: 'slot.weapon.mainhand',
    item: 'minecraft:diamond_sword',
    count: '1',
    data: '0',
    nbt: ''
  }
}

export const LEGACY_BLOCK_PRESETS = [
  { label: '上锁容器', nbt: '{Lock:"mcstudio"}' },
  { label: '自定义名称', nbt: '{CustomName:"MC Studio"}' },
  { label: '箱子物品', nbt: '{Items:[{Slot:0b,id:"minecraft:diamond",Count:1b}]}' },
  { label: '告示牌四行', nbt: '{Text1:"{\\"text\\":\\"第一行\\"}",Text2:"{\\"text\\":\\"第二行\\"}",Text3:"{\\"text\\":\\"第三行\\"}",Text4:"{\\"text\\":\\"第四行\\"}"}' },
  { label: '命令方块', nbt: '{Command:"say hello",auto:1b,powered:1b,TrackOutput:0b}' },
  { label: '刷怪笼', nbt: '{SpawnCount:4s,SpawnRange:4s,Delay:20s,MinSpawnDelay:200s,MaxSpawnDelay:800s}' }
]

export const LEGACY_ENTITY_PRESETS = [
  { label: '无重力', nbt: '{NoGravity:1b}' },
  { label: '静音', nbt: '{Silent:1b}' },
  { label: '无敌', nbt: '{Invulnerable:1b}' },
  { label: '禁用 AI', nbt: '{NoAI:1b}' },
  { label: '自定义名称', nbt: '{CustomName:"MC Studio",CustomNameVisible:1b}' },
  { label: '10 点生命', nbt: '{Health:10f}' },
  { label: '静止', nbt: '{Motion:[0.0,0.0,0.0]}' },
  { label: '发光', nbt: '{Glowing:1b}' }
]

const COORDINATE = /^[~^]?-?\d*(?:\.\d+)?$/

function validateCoordinate(value: string, axis: string, diagnostics: Diagnostic[]): void {
  if (!value.trim()) {
    diagnostics.push(error('legacy.coordinate', `${axis} 坐标不能为空`, axis))
  } else if (!COORDINATE.test(value.trim())) {
    diagnostics.push(error('legacy.coordinate', `${axis} 坐标格式不正确`, axis))
  }
}

function validateNbt(nbt: string, diagnostics: Diagnostic[]): boolean {
  const value = nbt.trim()
  if (!value) return false
  if (!value.startsWith('{') || !value.endsWith('}')) {
    diagnostics.push(error('legacy.nbt', 'NBT 必须写成 { ... } 形式', 'nbt'))
    return false
  }
  return true
}

function finish(parts: string[], diagnostics: Diagnostic[]): BuildResult {
  const text = parts.join(' ')
  if (containsControlCharacters(text)) {
    diagnostics.push(warn('legacy.control', '命令中包含不可见控制字符'))
  }
  return { text, diagnostics }
}

export function buildTestfor(options: LegacyTestforOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (!options.target.trim()) diagnostics.push(error('legacy.target', '目标不能为空', 'target'))
  validateNbt(options.nbt, diagnostics)
  const parts = ['testfor', options.target.trim()]
  if (options.nbt.trim()) parts.push(options.nbt.trim())
  return finish(parts, diagnostics)
}

export function buildBlockdata(options: LegacyBlockdataOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  validateCoordinate(options.x, 'X', diagnostics)
  validateCoordinate(options.y, 'Y', diagnostics)
  validateCoordinate(options.z, 'Z', diagnostics)
  if (!validateNbt(options.nbt, diagnostics)) {
    diagnostics.push(error('legacy.nbt', 'blockdata 必须填写 NBT', 'nbt'))
  }
  return finish(
    ['blockdata', options.x.trim(), options.y.trim(), options.z.trim(), options.nbt.trim()],
    diagnostics
  )
}

export function buildEntitydata(options: LegacyEntitydataOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (!options.target.trim()) diagnostics.push(error('legacy.target', '目标不能为空', 'target'))
  if (!validateNbt(options.nbt, diagnostics)) {
    diagnostics.push(error('legacy.nbt', 'entitydata 必须填写 NBT', 'nbt'))
  }
  return finish(['entitydata', options.target.trim(), options.nbt.trim()], diagnostics)
}

export function buildReplaceitem(options: LegacyReplaceitemOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (!options.slot.trim()) diagnostics.push(error('legacy.slot', '槽位不能为空', 'slot'))
  if (!options.item.trim()) diagnostics.push(error('legacy.item', '物品不能为空', 'item'))
  if (!/^\d+$/.test(options.count.trim()) || Number(options.count) < 1) {
    diagnostics.push(error('legacy.count', '数量必须是大于 0 的整数', 'count'))
  }
  if (!/^\d+$/.test(options.data.trim())) {
    diagnostics.push(error('legacy.data', '数据值必须是非负整数', 'data'))
  }
  validateNbt(options.nbt, diagnostics)

  const parts = ['replaceitem']
  if (options.target === 'block') {
    validateCoordinate(options.x, 'X', diagnostics)
    validateCoordinate(options.y, 'Y', diagnostics)
    validateCoordinate(options.z, 'Z', diagnostics)
    parts.push('block', options.x.trim(), options.y.trim(), options.z.trim())
  } else {
    if (!options.selector.trim()) diagnostics.push(error('legacy.target', '目标不能为空', 'selector'))
    parts.push('entity', options.selector.trim())
  }
  parts.push(options.slot.trim(), options.item.trim(), options.count.trim(), options.data.trim())
  if (options.nbt.trim()) parts.push(options.nbt.trim())
  return finish(parts, diagnostics)
}
