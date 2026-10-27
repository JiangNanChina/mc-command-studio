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

export function createDefaultTrigger(): LegacyTriggerOptions {
  return { objective: 'objective', action: 'add', value: '1' }
}

export function createDefaultIdle(): LegacyIdleOptions {
  return { minutes: '0' }
}

export function createDefaultSave(): LegacySaveOptions {
  return { action: 'hold' }
}

export function createDefaultScoreboard(): LegacyScoreboardOptions {
  return {
    action: 'players-set',
    name: 'kills',
    criterion: 'dummy',
    display: '击杀数',
    target: '@p',
    objective: 'kills',
    value: '0'
  }
}

export function createDefaultStats(): LegacyStatsOptions {
  return {
    targetType: 'entity',
    target: '@p',
    x: '~',
    y: '~',
    z: '~',
    action: 'set',
    stat: 'SuccessCount',
    objective: 'objective'
  }
}

export function createDefaultGive(): LegacyGiveOptions {
  return {
    target: '@p',
    item: 'minecraft:diamond',
    count: '1',
    data: '0',
    nbt: ''
  }
}

export function createDefaultTestforblock(): LegacyTestforblockOptions {
  return { x: '~', y: '~', z: '~', block: 'minecraft:stone', data: '' }
}

export function createDefaultTestforblocks(): LegacyTestforblocksOptions {
  return {
    fromX: '~', fromY: '~', fromZ: '~',
    toX: '~', toY: '~', toZ: '~',
    destX: '~', destY: '~', destZ: '~',
    mode: 'all'
  }
}

export function createDefaultAchievement(): LegacyAchievementOptions {
  return { action: 'give', target: '@p', achievement: 'minecraft:story/root' }
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

export interface LegacyTestforblockOptions {
  x: string
  y: string
  z: string
  block: string
  data: string
}

export interface LegacyTestforblocksOptions {
  fromX: string
  fromY: string
  fromZ: string
  toX: string
  toY: string
  toZ: string
  destX: string
  destY: string
  destZ: string
  mode: 'all' | 'masked'
}

export interface LegacyAchievementOptions {
  action: 'give' | 'take'
  target: string
  achievement: string
}

export interface LegacyTriggerOptions {
  objective: string
  action: 'add' | 'set'
  value: string
}

export interface LegacyIdleOptions {
  minutes: string
}

export interface LegacySaveOptions {
  action: 'hold' | 'query'
}

export interface LegacyScoreboardOptions {
  action:
    | 'objectives-add'
    | 'objectives-remove'
    | 'objectives-list'
    | 'players-set'
    | 'players-add'
    | 'players-remove'
  name: string
  criterion: string
  display: string
  target: string
  objective: string
  value: string
}

export interface LegacyStatsOptions {
  targetType: 'entity' | 'block'
  target: string
  x: string
  y: string
  z: string
  action: 'set' | 'clear'
  stat: string
  objective: string
}

export interface LegacyGiveOptions {
  target: string
  item: string
  count: string
  data: string
  nbt: string
}

export const LEGACY_BLOCK_PRESETS = [
  { label: '上锁容器', nbt: '{Lock:"mcstudio"}' },
  { label: '自定义名称', nbt: '{CustomName:"MC Studio"}' },
  { label: '箱子物品', nbt: '{Items:[{Slot:0b,id:"minecraft:diamond",Count:1b}]}' },
  { label: '告示牌四行', nbt: '{Text1:"{\\"text\\":\\"第一行\\"}",Text2:"{\\"text\\":\\"第二行\\"}",Text3:"{\\"text\\":\\"第三行\\"}",Text4:"{\\"text\\":\\"第四行\\"}"}' },
  { label: '命令方块', nbt: '{Command:"say hello",auto:1b,powered:1b,TrackOutput:0b}' },
  { label: '刷怪笼', nbt: '{SpawnCount:4s,SpawnRange:4s,Delay:20s,MinSpawnDelay:200s,MaxSpawnDelay:800s}' },
  { label: '旗帜图案', nbt: '{Base:4,Patterns:[{Pattern:"cre",Color:1},{Pattern:"bri",Color:15}]}' },
  { label: '发射器物品', nbt: '{Items:[{Slot:0b,id:"minecraft:diamond",Count:1b}]}' },
  { label: '药水效果', nbt: '{CustomPotionEffects:[{Id:1b,Amplifier:1b,Duration:200}]}' },
  { label: '刷怪笼实体', nbt: '{SpawnData:{id:"minecraft:zombie"},SpawnCount:4s,SpawnRange:4s,Delay:20s,MinSpawnDelay:200s,MaxSpawnDelay:800s}' },
  { label: '刷怪笼实体列表', nbt: '{SpawnPotentials:[{Weight:1,Entity:{id:"minecraft:zombie"}},{Weight:1,Entity:{id:"minecraft:skeleton"}}],SpawnCount:4s,SpawnRange:4s,Delay:20s,MinSpawnDelay:200s,MaxSpawnDelay:800s}' },
  { label: '刷怪笼权重', nbt: '{SpawnPotentials:[{Weight:3,Entity:{id:"minecraft:zombie"}},{Weight:1,Entity:{id:"minecraft:skeleton"}}],SpawnCount:4s,SpawnRange:4s,Delay:20s,MinSpawnDelay:200s,MaxSpawnDelay:800s}' },
  { label: '命令方块链', nbt: '{Command:"say chain",auto:1b,conditionMet:1b,powered:1b,TrackOutput:0b}' },
  { label: '命令方块链参数', nbt: '{Command:"say chain",auto:1b,conditionMet:1b,powered:1b,TrackOutput:1b,UpdateLastExecution:0b,SuccessCount:1,LastOutput:"chain"}' },
  { label: '循环命令方块', nbt: '{Command:"say loop",auto:1b,conditionMet:0b,powered:1b,TrackOutput:1b,UpdateLastExecution:0b,SuccessCount:0,LastOutput:""}' }
]

export const LEGACY_ITEM_PRESETS = [
  { label: '成书', nbt: '{title:"MC Studio",author:"MC Studio",pages:["第一页","第二页","第三页","第四页"]}' },
  { label: '长书', nbt: '{title:"MC Studio 手册",author:"MC Studio",pages:["第一章：入门","第二章：命令","第三章：数据包","第四章：进阶","第五章：附录"]}' },
  { label: '八页书', nbt: '{title:"MC Studio 全书",author:"MC Studio",pages:["第 1 页","第 2 页","第 3 页","第 4 页","第 5 页","第 6 页","第 7 页","第 8 页"]}' },
  { label: '附魔剑', nbt: '{display:{Name:"{\\"text\\":\\"Excalibur\\"}"},ench:[{id:16s,lvl:5s}]}' },
  { label: '药水', nbt: '{Potion:"minecraft:strong_healing"}' },
  { label: '烟花火箭', nbt: '{Fireworks:{Flight:1b,Explosions:[{Type:1,Colors:[11743532]}]}}' },
  { label: '头颅', nbt: '{SkullOwner:"Notch"}' }
]

export const LEGACY_ENTITY_PRESETS = [
  { label: '无重力', nbt: '{NoGravity:1b}' },
  { label: '静音', nbt: '{Silent:1b}' },
  { label: '无敌', nbt: '{Invulnerable:1b}' },
  { label: '禁用 AI', nbt: '{NoAI:1b}' },
  { label: '自定义名称', nbt: '{CustomName:"MC Studio",CustomNameVisible:1b}' },
  { label: '10 点生命', nbt: '{Health:10f}' },
  { label: '静止', nbt: '{Motion:[0.0,0.0,0.0]}' },
  { label: '发光', nbt: '{Glowing:1b}' },
  { label: '村民交易', nbt: '{Offers:{Recipes:[{buy:{id:"minecraft:emerald",Count:1b},sell:{id:"minecraft:diamond",Count:1b},maxUses:10}]}}' },
  { label: '盔甲架', nbt: '{ArmorItems:[{},{},{},{id:"minecraft:diamond_helmet",Count:1b}],Pose:{Head:[0f,0f,0f]}}' },
  { label: '药水效果', nbt: '{ActiveEffects:[{Id:1b,Amplifier:1b,Duration:200}]}' },
  { label: '持久化', nbt: '{PersistenceRequired:1b}' }
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

export function buildTestforblock(options: LegacyTestforblockOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  validateCoordinate(options.x, 'X', diagnostics)
  validateCoordinate(options.y, 'Y', diagnostics)
  validateCoordinate(options.z, 'Z', diagnostics)
  if (!options.block.trim()) diagnostics.push(error('legacy.block', '方块不能为空', 'block'))
  if (options.data.trim() && !/^\d+$/.test(options.data.trim())) {
    diagnostics.push(error('legacy.data', '数据值必须是非负整数', 'data'))
  }
  const parts = ['testforblock', options.x.trim(), options.y.trim(), options.z.trim(), options.block.trim()]
  if (options.data.trim()) parts.push(options.data.trim())
  return finish(parts, diagnostics)
}

export function buildTestforblocks(options: LegacyTestforblocksOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  for (const [axis, value] of [
    ['X1', options.fromX], ['Y1', options.fromY], ['Z1', options.fromZ],
    ['X2', options.toX], ['Y2', options.toY], ['Z2', options.toZ],
    ['DX', options.destX], ['DY', options.destY], ['DZ', options.destZ]
  ] as const) {
    validateCoordinate(value, axis, diagnostics)
  }
  return finish(
    [
      'testforblocks',
      options.fromX.trim(), options.fromY.trim(), options.fromZ.trim(),
      options.toX.trim(), options.toY.trim(), options.toZ.trim(),
      options.destX.trim(), options.destY.trim(), options.destZ.trim(),
      options.mode
    ],
    diagnostics
  )
}

export function buildAchievement(options: LegacyAchievementOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (!options.target.trim()) diagnostics.push(error('legacy.target', '目标不能为空', 'target'))
  if (!options.achievement.trim()) {
    diagnostics.push(error('legacy.achievement', '成就 ID 不能为空', 'achievement'))
  }
  return finish(
    ['achievement', options.action, options.achievement.trim(), options.target.trim()],
    diagnostics
  )
}

export function buildTrigger(options: LegacyTriggerOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (!options.objective.trim()) {
    diagnostics.push(error('legacy.objective', '记分板目标不能为空', 'objective'))
  }
  if (!/^\d+$/.test(options.value.trim())) {
    diagnostics.push(error('legacy.value', 'trigger 值必须是非负整数', 'value'))
  }
  return finish(
    ['trigger', options.objective.trim(), options.action, options.value.trim()],
    diagnostics
  )
}

export function buildSetidletimeout(options: LegacyIdleOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (!/^\d+$/.test(options.minutes.trim())) {
    diagnostics.push(error('legacy.minutes', '挂机时间必须是非负整数分钟', 'minutes'))
  }
  return finish(['setidletimeout', options.minutes.trim()], diagnostics)
}

export function buildSave(options: LegacySaveOptions): BuildResult {
  return finish(['save', options.action], [])
}

export function buildScoreboard(options: LegacyScoreboardOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (options.action === 'objectives-add') {
    if (!options.name.trim()) diagnostics.push(error('legacy.name', '目标名不能为空', 'name'))
    if (!options.criterion.trim()) {
      diagnostics.push(error('legacy.criterion', '准则不能为空', 'criterion'))
    }
    const parts = ['scoreboard', 'objectives', 'add', options.name.trim(), options.criterion.trim()]
    if (options.display.trim()) parts.push(options.display.trim())
    return finish(parts, diagnostics)
  }
  if (options.action === 'objectives-remove') {
    if (!options.name.trim()) diagnostics.push(error('legacy.name', '目标名不能为空', 'name'))
    return finish(['scoreboard', 'objectives', 'remove', options.name.trim()], diagnostics)
  }
  if (options.action === 'objectives-list') {
    return finish(['scoreboard', 'objectives', 'list'], diagnostics)
  }
  if (!options.target.trim()) diagnostics.push(error('legacy.target', '目标不能为空', 'target'))
  if (!options.objective.trim()) {
    diagnostics.push(error('legacy.objective', '目标名不能为空', 'objective'))
  }
  if (!/^-?\d+$/.test(options.value.trim())) {
    diagnostics.push(error('legacy.value', '分数必须是整数', 'value'))
  }
  return finish(
    [
      'scoreboard',
      'players',
      options.action.replace('players-', ''),
      options.target.trim(),
      options.objective.trim(),
      options.value.trim()
    ],
    diagnostics
  )
}

export function buildStats(options: LegacyStatsOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (!options.stat.trim()) diagnostics.push(error('legacy.stat', '统计项不能为空', 'stat'))
  if (options.action === 'set' && !options.objective.trim()) {
    diagnostics.push(error('legacy.objective', 'set 模式必须填写目标', 'objective'))
  }
  const target =
    options.targetType === 'entity'
      ? ['entity', options.target.trim()]
      : ['block', options.x.trim(), options.y.trim(), options.z.trim()]
  if (options.targetType === 'entity' && !options.target.trim()) {
    diagnostics.push(error('legacy.target', '目标不能为空', 'target'))
  }
  const parts = ['stats', ...target, options.action, options.stat.trim()]
  if (options.action === 'set') parts.push(options.objective.trim())
  return finish(parts, diagnostics)
}

export function buildLegacyGive(options: LegacyGiveOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (!options.target.trim()) diagnostics.push(error('legacy.target', '目标不能为空', 'target'))
  if (!options.item.trim()) diagnostics.push(error('legacy.item', '物品不能为空', 'item'))
  if (!/^\d+$/.test(options.count.trim()) || Number(options.count) < 1) {
    diagnostics.push(error('legacy.count', '数量必须是大于 0 的整数', 'count'))
  }
  if (!/^\d+$/.test(options.data.trim())) {
    diagnostics.push(error('legacy.data', '数据值必须是非负整数', 'data'))
  }
  validateNbt(options.nbt, diagnostics)
  const parts = [
    'give',
    options.target.trim(),
    options.item.trim(),
    options.count.trim(),
    options.data.trim()
  ]
  if (options.nbt.trim()) parts.push(options.nbt.trim())
  return finish(parts, diagnostics)
}

export function buildReplaceitem(options: LegacyReplaceitemOptions): BuildResult {  const diagnostics: Diagnostic[] = []
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
