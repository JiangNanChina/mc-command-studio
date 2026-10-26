import {
  buildBossbarCommands,
  buildChainCommands,
  buildCloneCommand,
  buildEffectCommand,
  buildEnchantCommand,
  buildExecuteCommand,
  buildFillCommand,
  buildGiveCommand,
  buildSetblockCommand,
  buildScoreboardCommand,
  buildParticleCommand,
  buildTimeCommand,
  buildWeatherCommand,
  buildDifficultyCommand,
  buildTagCommand,
  buildClearCommand,
  buildGameruleCommand,
  buildWorldborderCommand,
  buildTeamCommands,
  buildSpawnpointCommand,
  buildWorldSpawnCommand,
  buildForceloadCommand,
  buildAttributeCommand,
  buildAdvancementCommand,
  buildFunctionCommand,
  buildScheduleCommand,
  buildItemCommand,
  buildDataCommand,
  buildNbtGiveCommand,
  buildGamemodeCommand,
  buildDamageCommand,
  buildRotateCommand,
  createDefaultNbtGiveOptions,
  createDefaultGamemodeOptions,
  createDefaultDamageOptions,
  createDefaultRotateOptions,
  buildLootCommand,
  buildSoundCommand,
  buildSummonCommand,
  buildTeleportCommand,
  buildTellrawCommand,
  buildTitleCommand,
  buildXpCommand,
  createChainBlock,
  createDefaultBossbarOptions,
  createDefaultChainOptions,
  createDefaultCloneOptions,
  createDefaultCommandBlockOptions,
  createDefaultEffectOptions,
  createDefaultEnchantOptions,
  createDefaultExecuteOptions,
  createDefaultFillOptions,
  createDefaultGiveOptions,
  createDefaultScoreboardOptions,
  createDefaultParticleOptions,
  createDefaultWorldOptions,
  createDefaultTagOptions,
  createDefaultClearOptions,
  createDefaultGameruleOptions,
  createDefaultWorldborderOptions,
  createDefaultTeamOptions,
  createDefaultSpawnpointOptions,
  createDefaultWorldSpawnOptions,
  createDefaultForceloadOptions,
  createDefaultAttributeOptions,
  createDefaultAdvancementOptions,
  createDefaultFunctionOptions,
  createDefaultScheduleOptions,
  createDefaultItemOptions,
  createDefaultDataOptions,
  createDefaultLootOptions,
  createDefaultSetblockOptions,
  createDefaultSoundOptions,
  createDefaultSummonOptions,
  createDefaultTeleportOptions,
  createDefaultTellrawOptions,
  createDefaultTitleOptions,
  createDefaultXpOptions,
  createTextSegment,
  createProjectFile,
  parseProjectFile,
  serializeGeneric,
  type BlockStateValue,
  type BossbarOptions,
  type BuildResult,
  type ChainBlock,
  type ChainOptions,
  type CloneOptions,
  type CommandBlockOptions,
  type CommandNodeData,
  type EffectOptions,
  type EnchantOptions,
  type ExecuteClause,
  type ExecuteOptions,
  type FillOptions,
  type GenericStep,
  type GiveOptions,
  type ItemComponent,
  type Position,
  type Selector,
  type ScoreboardOptions,
  type ParticleOptions,
  type WorldOptions,
  type TagOptions,
  type ClearOptions,
  type GameruleOptions,
  type WorldborderOptions,
  type TeamOptions,
  type SpawnpointOptions,
  type WorldSpawnOptions,
  type ForceloadOptions,
  type AttributeOptions,
  type AdvancementOptions,
  type FunctionOptions,
  type ScheduleOptions,
  type ItemOptions,
  type NbtGiveOptions,
  type GamemodeOptions,
  type DamageOptions,
  type RotateOptions,
  type DataOptions,
  type LootOptions,
  type TimeOptions,
  type SetblockMode,
  type SetblockOptions,
  type SoundOptions,
  type SummonOptions,
  type TeleportDestination,
  type TeleportOptions,
  type TellrawOptions,
  type TextSegment,
  type TitleOptions,
  type VersionPack,
  type XpOptions
} from '@mcstudio/core'
import type { CommandCategory } from '@mcstudio/content'
import type {
  AppInfo,
  PackSummary,
  UpdateState,
  UserSettings
} from '../../shared/types'
import { DEFAULT_SETTINGS } from '../../shared/types'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { getApi } from './lib/api'

export type OutputMode = 'command' | 'command-block'

export interface GenericDraft {
  root: string | null
  steps: { name: string; value?: string }[]
}

export interface DatapackFunctionDraft {
  id: string
  name: string
  commands: string
}

export interface DatapackDataFileDraft {
  id: string
  type: 'advancement' | 'predicate' | 'loot_table'
  name: string
  content: string
}

export interface DatapackDraft {
  namespace: string
  description: string
  functions: DatapackFunctionDraft[]
  activeFunctionId: string
  loadFunction: string
  tickFunction: string
  dataFiles: DatapackDataFileDraft[]
  activeDataFileId: string
}

export interface AutomationOptions {
  advancement: AdvancementOptions
  function: FunctionOptions
  schedule: ScheduleOptions
}

const DATAPACK_FILE_TEMPLATES: Record<DatapackDataFileDraft['type'], { name: string; content: string }> = {
  predicate: {
    name: 'is_sneaking',
    content: JSON.stringify(
      {
        condition: 'minecraft:entity_properties',
        entity: 'this',
        predicate: { flags: { is_sneaking: true } }
      },
      null,
      2
    )
  },
  loot_table: {
    name: 'reward',
    content: JSON.stringify(
      {
        type: 'minecraft:chest',
        pools: [
          {
            rolls: 1,
            entries: [{ type: 'minecraft:item', name: 'minecraft:diamond' }]
          }
        ]
      },
      null,
      2
    )
  },
  advancement: {
    name: 'root',
    content: JSON.stringify(
      {
        display: {
          icon: { id: 'minecraft:stone' },
          title: { text: '示例进度' },
          description: { text: '在数据包工作区中编辑。' },
          frame: 'task',
          show_toast: true,
          announce_to_chat: true,
          hidden: false
        },
        criteria: { requirement: { trigger: 'minecraft:impossible' } }
      },
      null,
      2
    )
  }
}

function defaultDatapackDraft(): DatapackDraft {
  return {
    namespace: 'mcstudio',
    description: 'MC 指令工坊数据包',
    functions: [{ id: 'main', name: 'main', commands: 'say 你好' }],
    activeFunctionId: 'main',
    loadFunction: '',
    tickFunction: '',
    dataFiles: [],
    activeDataFileId: ''
  }
}

export interface ProjectPayload {
  activeCommandId: string | null
  give: GiveOptions
  nbtGive: NbtGiveOptions
  gamemode: GamemodeOptions
  damage: DamageOptions
  rotate: RotateOptions
  summon: SummonOptions
  setblock: SetblockOptions
  execute: ExecuteOptions
  teleport: TeleportOptions
  effect: EffectOptions
  fill: FillOptions
  clone: CloneOptions
  chain: ChainOptions
  enchant: EnchantOptions
  xp: XpOptions
  tellraw: TellrawOptions
  title: TitleOptions
  sound: SoundOptions
  bossbar: BossbarOptions
  scoreboard: ScoreboardOptions
  particle: ParticleOptions
  world: WorldOptions
  tag: TagOptions
  clear: ClearOptions
  gamerule: GameruleOptions
  worldborder: WorldborderOptions
  team: TeamOptions
  spawnpoint: SpawnpointOptions
  worldSpawn: WorldSpawnOptions
  forceload: ForceloadOptions
  attribute: AttributeOptions
  automation: AutomationOptions
  itemCommand: ItemOptions
  dataCommand: DataOptions
  loot: LootOptions
  datapack: DatapackDraft
  generic: GenericDraft
  commandBlock: CommandBlockOptions
  outputMode: OutputMode
}

export interface Toast {
  id: number
  message: string
  kind: 'info' | 'success' | 'error'
}

export type DialogName = 'settings' | 'about' | 'itemPicker' | 'selector'

interface AppStore {
  booted: boolean
  bootError: string | null
  appInfo: AppInfo | null
  packs: PackSummary[]
  pack: VersionPack | null
  activePackId: string
  settings: UserSettings
  update: UpdateState
  activeCommandId: string | null
  give: GiveOptions
  nbtGive: NbtGiveOptions
  gamemode: GamemodeOptions
  damage: DamageOptions
  rotate: RotateOptions
  summon: SummonOptions
  setblock: SetblockOptions
  execute: ExecuteOptions
  teleport: TeleportOptions
  effect: EffectOptions
  fill: FillOptions
  clone: CloneOptions
  chain: ChainOptions
  enchant: EnchantOptions
  xp: XpOptions
  tellraw: TellrawOptions
  title: TitleOptions
  sound: SoundOptions
  bossbar: BossbarOptions
  scoreboard: ScoreboardOptions
  particle: ParticleOptions
  world: WorldOptions
  tag: TagOptions
  clear: ClearOptions
  gamerule: GameruleOptions
  worldborder: WorldborderOptions
  team: TeamOptions
  spawnpoint: SpawnpointOptions
  worldSpawn: WorldSpawnOptions
  forceload: ForceloadOptions
  attribute: AttributeOptions
  automation: AutomationOptions
  itemCommand: ItemOptions
  dataCommand: DataOptions
  loot: LootOptions
  datapack: DatapackDraft
  generic: GenericDraft
  commandBlock: CommandBlockOptions
  outputMode: OutputMode
  search: string
  category: CommandCategory | '全部'
  projectName: string
  projectPath: string | null
  dirty: boolean
  autosaveAvailable: boolean
  lastAutosaveAt: string | null
  announcementOpen: boolean
  historyPast: string[]
  historyFuture: string[]
  dialogs: Record<DialogName, boolean>
  toast: Toast | null

  boot: () => Promise<void>
  loadPack: (id: string) => Promise<void>
  selectCommand: (id: string | null) => void
  setTarget: (target: Selector) => void
  setItemId: (id: string) => void
  setCount: (count: number) => void
  addComponent: (kind: ItemComponent['kind']) => void
  replaceComponent: (index: number, component: ItemComponent) => void
  removeComponent: (index: number) => void
  applyGiveImport: (options: GiveOptions) => void
  updateSummon: (patch: Partial<SummonOptions>) => void
  updateSummonPosition: (patch: Partial<Position>) => void
  updateSetblock: (patch: Partial<SetblockOptions>) => void
  updateSetblockPosition: (patch: Partial<Position>) => void
  selectBlock: (block: BlockStateValue) => void
  setBlockState: (key: string, value: string) => void
  setBlockNbt: (nbt: string) => void
  setBlockMode: (mode: SetblockMode) => void
  addExecuteClause: (kind: ExecuteClause['kind']) => void
  updateExecuteClause: (id: string, clause: ExecuteClause) => void
  removeExecuteClause: (id: string) => void
  moveExecuteClause: (id: string, direction: -1 | 1) => void
  setExecuteRun: (run: string) => void
  setExecuteClauses: (clauses: ExecuteClause[]) => void
  updateTeleport: (patch: Partial<TeleportOptions>) => void
  updateEffect: (patch: Partial<EffectOptions>) => void
  updateNbtGive: (patch: Partial<NbtGiveOptions>) => void
  updateGamemode: (patch: Partial<GamemodeOptions>) => void
  updateDamage: (patch: Partial<DamageOptions>) => void
  updateRotate: (patch: Partial<RotateOptions>) => void
  updateFill: (patch: Partial<FillOptions>) => void
  updateClone: (patch: Partial<CloneOptions>) => void
  updateEnchant: (patch: Partial<EnchantOptions>) => void
  updateXp: (patch: Partial<XpOptions>) => void
  updateTellraw: (patch: Partial<TellrawOptions>) => void
  updateTitle: (patch: Partial<TitleOptions>) => void
  updateSound: (patch: Partial<SoundOptions>) => void
  updateBossbar: (patch: Partial<BossbarOptions>) => void
  updateScoreboard: (patch: Partial<ScoreboardOptions>) => void
  updateParticle: (patch: Partial<ParticleOptions>) => void
  updateTime: (patch: Partial<TimeOptions>) => void
  updateWeather: (patch: Partial<WorldOptions['weather']>) => void
  updateDifficulty: (patch: Partial<WorldOptions['difficulty']>) => void
  updateTag: (patch: Partial<TagOptions>) => void
  updateClear: (patch: Partial<ClearOptions>) => void
  updateGamerule: (patch: Partial<GameruleOptions>) => void
  updateWorldborder: (patch: Partial<WorldborderOptions>) => void
  updateTeam: (patch: Partial<TeamOptions>) => void
  updateSpawnpoint: (patch: Partial<SpawnpointOptions>) => void
  updateWorldSpawn: (patch: Partial<WorldSpawnOptions>) => void
  updateForceload: (patch: Partial<ForceloadOptions>) => void
  updateAttribute: (patch: Partial<AttributeOptions>) => void
  updateAdvancement: (patch: Partial<AdvancementOptions>) => void
  updateFunction: (patch: Partial<FunctionOptions>) => void
  updateSchedule: (patch: Partial<ScheduleOptions>) => void
  updateItemCommand: (patch: Partial<ItemOptions>) => void
  updateDataCommand: (patch: Partial<DataOptions>) => void
  updateLoot: (patch: Partial<LootOptions>) => void
  openDatapack: () => void
  updateDatapackMeta: (patch: Partial<Pick<DatapackDraft, 'namespace' | 'description'>>) => void
  addDatapackFunction: () => void
  removeDatapackFunction: (id: string) => void
  selectDatapackFunction: (id: string) => void
  updateDatapackFunction: (id: string, patch: Partial<Pick<DatapackFunctionDraft, 'name' | 'commands'>>) => void
  addDatapackDataFile: (type: DatapackDataFileDraft['type']) => void
  removeDatapackDataFile: (id: string) => void
  selectDatapackDataFile: (id: string) => void
  updateDatapackDataFile: (id: string, patch: Partial<Pick<DatapackDataFileDraft, 'type' | 'name' | 'content'>>) => void
  setDatapackLoadFunction: (name: string) => void
  setDatapackTickFunction: (name: string) => void
  openChain: () => void
  updateChain: (patch: Partial<ChainOptions>) => void
  addChainBlock: () => void
  updateChainBlock: (id: string, patch: Partial<ChainBlock>) => void
  removeChainBlock: (id: string) => void
  moveChainBlock: (id: string, direction: -1 | 1) => void
  setGenericRoot: (root: string | null) => void
  pushGenericStep: (step: { name: string; value?: string }) => void
  popGenericStep: () => void
  truncateGeneric: (length: number) => void
  resetGeneric: () => void
  setOutputMode: (mode: OutputMode) => void
  setCommandBlock: (patch: Partial<CommandBlockOptions>) => void
  setSearch: (value: string) => void
  setCategory: (value: CommandCategory | '全部') => void
  setTheme: (theme: 'dark' | 'light') => Promise<void>
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>
  setUpdate: (state: UpdateState) => void
  checkForUpdates: (manual?: boolean) => Promise<void>
  downloadUpdate: () => Promise<void>
  installUpdate: () => Promise<void>
  skipUpdate: (version: string) => Promise<void>
  newProject: () => void
  setProjectName: (name: string) => void
  serializeProject: () => string
  applyProjectContent: (content: string, path: string | null, fallbackName: string) => Promise<void>
  saveProject: (saveAs?: boolean) => Promise<boolean>
  openProject: () => Promise<void>
  openProjectPath: (path: string) => Promise<void>
  autosave: () => Promise<void>
  restoreAutosave: () => Promise<void>
  dismissAutosave: () => Promise<void>
  showToast: (message: string, kind?: Toast['kind']) => void
  hideToast: () => void
  openAnnouncement: () => void
  closeAnnouncement: () => Promise<void>
  markAnnouncementSeen: () => Promise<void>
  undo: () => void
  redo: () => void
  clearHistory: () => void
  setDialog: (name: DialogName, open: boolean) => void
}

let booting = false

function applyTheme(theme: 'dark' | 'light'): void {
  document.documentElement.dataset.theme = theme
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function emptyGeneric(): GenericDraft {
  return { root: null, steps: [] }
}

function defaultComponent(kind: ItemComponent['kind']): ItemComponent {
  switch (kind) {
    case 'custom_name':
    case 'item_name':
      return { kind, text: '', color: '', italic: false }
    case 'lore':
      return { kind, lines: [{ text: '', color: '', italic: false }] }
    case 'enchantments':
      return { kind, entries: [{ id: 'minecraft:sharpness', level: 1 }] }
    case 'unbreakable':
      return { kind }
    case 'max_stack_size':
      return { kind, value: 64 }
    case 'max_damage':
      return { kind, value: 1000 }
    case 'damage':
      return { kind, value: 0 }
    case 'rarity':
      return { kind, value: 'common' }
    case 'enchantment_glint_override':
      return { kind, value: true }
    case 'custom_model_data':
    case 'custom_data':
      return { kind, raw: '' }
    case 'raw':
      return { kind, id: 'minecraft:tooltip_display', value: '{}' }
  }
}

function normalizePosition(input: Partial<Position> | undefined): Position {
  return {
    x: typeof input?.x === 'string' ? input.x : '~',
    y: typeof input?.y === 'string' ? input.y : '~',
    z: typeof input?.z === 'string' ? input.z : '~'
  }
}

function normalizeSummon(input: Partial<SummonOptions> | undefined): SummonOptions {
  const fallback = createDefaultSummonOptions()
  if (!input) return fallback
  return {
    entity: typeof input.entity === 'string' ? input.entity : fallback.entity,
    usePosition: input.usePosition !== false,
    position: normalizePosition(input.position),
    nbt: typeof input.nbt === 'string' ? input.nbt : ''
  }
}

function normalizeSetblock(input: Partial<SetblockOptions> | undefined): SetblockOptions {
  const fallback = createDefaultSetblockOptions()
  if (!input) return fallback
  const block = input.block
  return {
    position: normalizePosition(input.position),
    block:
      block && typeof block.id === 'string'
        ? {
            id: block.id,
            states:
              block.states && typeof block.states === 'object'
                ? Object.fromEntries(
                    Object.entries(block.states).filter(
                      ([key, value]) => typeof key === 'string' && typeof value === 'string'
                    )
                  )
                : {},
            nbt: typeof block.nbt === 'string' ? block.nbt : ''
          }
        : fallback.block,
    mode:
      input.mode === 'destroy' || input.mode === 'keep' || input.mode === 'strict'
        ? input.mode
        : 'replace'
  }
}

function newClauseId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `clause-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

function defaultExecuteClause(kind: ExecuteClause['kind']): ExecuteClause {
  const id = newClauseId()
  switch (kind) {
    case 'as':
    case 'at':
      return { id, kind, selector: { base: '@s' } }
    case 'positioned':
    case 'facing':
      return { id, kind, position: { x: '~', y: '~', z: '~' } }
    case 'align':
      return { id, kind, axes: 'xyz' }
    case 'anchored':
      return { id, kind, anchor: 'eyes' }
    case 'rotated':
      return { id, kind, yaw: '0', pitch: '0' }
    case 'in':
      return { id, kind, dimension: 'minecraft:overworld' }
    case 'if':
    case 'unless':
      return { id, kind, condition: { type: 'entity', selector: { base: '@e' } } }
    case 'store':
      return { id, kind, mode: 'result', target: '@s', objective: 'result' }
    case 'raw':
      return { id, kind, text: '' }
  }
}

function normalizeExecute(input: Partial<ExecuteOptions> | undefined): ExecuteOptions {
  if (!input) return createDefaultExecuteOptions()
  const clauses = Array.isArray(input.clauses)
    ? (input.clauses.filter(
        (clause) => clause && typeof clause.id === 'string' && typeof clause.kind === 'string'
      ) as ExecuteClause[])
    : []
  return {
    clauses,
    run: typeof input.run === 'string' ? input.run : ''
  }
}

function normalizeTeleport(input: Partial<TeleportOptions> | undefined): TeleportOptions {
  const fallback = createDefaultTeleportOptions()
  if (!input) return fallback
  const destination: TeleportDestination =
    input.destination?.mode === 'entity' && input.destination.target?.base
      ? { mode: 'entity', target: input.destination.target }
      : {
          mode: 'position',
          position: normalizePosition(
            input.destination?.mode === 'position' ? input.destination.position : undefined
          )
        }
  return {
    target: input.target?.base ? input.target : fallback.target,
    destination,
    rotate: Boolean(input.rotate),
    yaw: typeof input.yaw === 'string' ? input.yaw : fallback.yaw,
    pitch: typeof input.pitch === 'string' ? input.pitch : fallback.pitch
  }
}

function normalizeEffect(input: Partial<EffectOptions> | undefined): EffectOptions {
  const fallback = createDefaultEffectOptions()
  if (!input) return fallback
  return {
    action: input.action === 'clear' ? 'clear' : 'give',
    target: input.target?.base ? input.target : fallback.target,
    effect: typeof input.effect === 'string' ? input.effect : fallback.effect,
    duration: typeof input.duration === 'string' ? input.duration : fallback.duration,
    amplifier: typeof input.amplifier === 'string' ? input.amplifier : fallback.amplifier,
    hideParticles: Boolean(input.hideParticles),
    permanent: Boolean(input.permanent)
  }
}

function normalizeFill(input: Partial<FillOptions> | undefined): FillOptions {
  const fallback = createDefaultFillOptions()
  if (!input) return fallback
  const modes: FillOptions['mode'][] = ['replace', 'destroy', 'hollow', 'keep', 'outline', 'strict']
  return {
    from: normalizePosition(input.from),
    to: normalizePosition(input.to),
    block: typeof input.block === 'string' ? input.block : fallback.block,
    mode: modes.includes(input.mode as FillOptions['mode'])
      ? (input.mode as FillOptions['mode'])
      : 'replace',
    filter: typeof input.filter === 'string' ? input.filter : ''
  }
}

function normalizeClone(input: Partial<CloneOptions> | undefined): CloneOptions {
  const fallback = createDefaultCloneOptions()
  if (!input) return fallback
  const modes: CloneOptions['mode'][] = ['replace', 'masked', 'filtered']
  const moves: CloneOptions['move'][] = ['normal', 'force', 'move']
  return {
    begin: normalizePosition(input.begin),
    end: normalizePosition(input.end),
    destination: normalizePosition(input.destination),
    mode: modes.includes(input.mode as CloneOptions['mode'])
      ? (input.mode as CloneOptions['mode'])
      : 'replace',
    filter: typeof input.filter === 'string' ? input.filter : '',
    move: moves.includes(input.move as CloneOptions['move'])
      ? (input.move as CloneOptions['move'])
      : 'normal'
  }
}

function normalizeChain(input: Partial<ChainOptions> | undefined): ChainOptions {
  const fallback = createDefaultChainOptions()
  if (!input) return fallback
  const directions: ChainOptions['direction'][] = [
    'up',
    'down',
    'north',
    'south',
    'east',
    'west'
  ]
  const kinds: ChainBlock['kind'][] = ['impulse', 'chain', 'repeating']
  const blocks = Array.isArray(input.blocks)
    ? input.blocks
        .filter((block) => block && typeof block.id === 'string')
        .map((block) => ({
          id: block.id,
          command: typeof block.command === 'string' ? block.command : '',
          kind: kinds.includes(block.kind as ChainBlock['kind'])
            ? (block.kind as ChainBlock['kind'])
            : 'chain',
          conditional: Boolean(block.conditional),
          auto: Boolean(block.auto)
        }))
    : fallback.blocks
  return {
    origin: normalizePosition(input.origin),
    direction: directions.includes(input.direction as ChainOptions['direction'])
      ? (input.direction as ChainOptions['direction'])
      : 'east',
    blocks
  }
}

function normalizeEnchant(input: Partial<EnchantOptions> | undefined): EnchantOptions {
  const fallback = createDefaultEnchantOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    enchantment: typeof input.enchantment === 'string' ? input.enchantment : fallback.enchantment,
    level: typeof input.level === 'string' ? input.level : fallback.level
  }
}

function normalizeXp(input: Partial<XpOptions> | undefined): XpOptions {
  const fallback = createDefaultXpOptions()
  if (!input) return fallback
  return {
    action:
      input.action === 'set' || input.action === 'query' ? input.action : 'add',
    target: input.target?.base ? input.target : fallback.target,
    amount: typeof input.amount === 'string' ? input.amount : fallback.amount,
    unit: input.unit === 'levels' ? 'levels' : 'points'
  }
}

function normalizeTextSegment(input: Partial<TextSegment> | undefined): TextSegment {
  const fallback = createTextSegment()
  if (!input) return fallback
  const click =
    input.click &&
    ['open_url', 'run_command', 'suggest_command', 'copy_to_clipboard'].includes(input.click.action) &&
    typeof input.click.value === 'string'
      ? { action: input.click.action, value: input.click.value }
      : null
  return {
    text: typeof input.text === 'string' ? input.text : '',
    color: typeof input.color === 'string' ? input.color : 'white',
    bold: Boolean(input.bold),
    italic: Boolean(input.italic),
    underlined: Boolean(input.underlined),
    strikethrough: Boolean(input.strikethrough),
    obfuscated: Boolean(input.obfuscated),
    click,
    hover: typeof input.hover === 'string' ? input.hover : ''
  }
}

function normalizeTellraw(input: Partial<TellrawOptions> | undefined): TellrawOptions {
  const fallback = createDefaultTellrawOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    segments:
      Array.isArray(input.segments) && input.segments.length > 0
        ? input.segments.map(normalizeTextSegment)
        : fallback.segments
  }
}

function normalizeTitle(input: Partial<TitleOptions> | undefined): TitleOptions {
  const fallback = createDefaultTitleOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    action:
      input.action === 'subtitle' || input.action === 'actionbar' ? input.action : 'title',
    segments:
      Array.isArray(input.segments) && input.segments.length > 0
        ? input.segments.map(normalizeTextSegment)
        : fallback.segments,
    times: Boolean(input.times),
    fadeIn: typeof input.fadeIn === 'string' ? input.fadeIn : fallback.fadeIn,
    stay: typeof input.stay === 'string' ? input.stay : fallback.stay,
    fadeOut: typeof input.fadeOut === 'string' ? input.fadeOut : fallback.fadeOut
  }
}

function normalizeSound(input: Partial<SoundOptions> | undefined): SoundOptions {
  const fallback = createDefaultSoundOptions()
  if (!input) return fallback
  const sources: SoundOptions['source'][] = [
    'master',
    'music',
    'record',
    'weather',
    'block',
    'hostile',
    'neutral',
    'player',
    'ambient',
    'voice'
  ]
  return {
    action: input.action === 'stop' ? 'stop' : 'play',
    target: input.target?.base ? input.target : fallback.target,
    sound: typeof input.sound === 'string' ? input.sound : fallback.sound,
    source: sources.includes(input.source as SoundOptions['source'])
      ? (input.source as SoundOptions['source'])
      : 'master',
    position: normalizePosition(input.position),
    volume: typeof input.volume === 'string' ? input.volume : fallback.volume,
    pitch: typeof input.pitch === 'string' ? input.pitch : fallback.pitch,
    minVolume: typeof input.minVolume === 'string' ? input.minVolume : fallback.minVolume,
    stopMode:
      input.stopMode === 'source' || input.stopMode === 'sound' ? input.stopMode : 'all'
  }
}

function normalizeBossbar(input: Partial<BossbarOptions> | undefined): BossbarOptions {
  const fallback = createDefaultBossbarOptions()
  if (!input) return fallback
  const colors: BossbarOptions['color'][] = [
    'blue',
    'green',
    'pink',
    'purple',
    'red',
    'white',
    'yellow'
  ]
  const styles: BossbarOptions['style'][] = [
    'progress',
    'notched_6',
    'notched_10',
    'notched_12',
    'notched_20'
  ]
  return {
    action:
      input.action === 'update' ||
      input.action === 'remove' ||
      input.action === 'get' ||
      input.action === 'list'
        ? input.action
        : 'create',
    id: typeof input.id === 'string' ? input.id : fallback.id,
    name: typeof input.name === 'string' ? input.name : fallback.name,
    color: colors.includes(input.color as BossbarOptions['color'])
      ? (input.color as BossbarOptions['color'])
      : 'red',
    style: styles.includes(input.style as BossbarOptions['style'])
      ? (input.style as BossbarOptions['style'])
      : 'progress',
    max: typeof input.max === 'string' ? input.max : fallback.max,
    value: typeof input.value === 'string' ? input.value : fallback.value,
    visible: Boolean(input.visible),
    playersEnabled: Boolean(input.playersEnabled),
    players: input.players?.base ? input.players : fallback.players,
    field:
      input.field === 'players' ||
      input.field === 'value' ||
      input.field === 'visible'
        ? input.field
        : 'max'
  }
}

function normalizeDatapack(input: Partial<DatapackDraft> | undefined): DatapackDraft {
  const fallback = defaultDatapackDraft()
  if (!input) return fallback
  const functions = Array.isArray(input.functions)
    ? input.functions
        .filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string')
        .map((item, index) => ({
          id: item.id,
          name: item.name,
          commands: typeof item.commands === 'string' ? item.commands : ''
        }))
        .filter((item) => item.name.trim().length > 0)
    : fallback.functions
  const list = functions.length > 0 ? functions : fallback.functions
  const activeFunctionId = list.some((item) => item.id === input.activeFunctionId)
    ? (input.activeFunctionId as string)
    : list[0].id
  const names = new Set(list.map((item) => item.name))
  const dataFiles = Array.isArray(input.dataFiles)
    ? input.dataFiles
        .filter((item) => item && typeof item.id === 'string' && typeof item.type === 'string')
        .map((item) => ({
          id: item.id,
          type: (['advancement', 'predicate', 'loot_table'].includes(item.type)
            ? item.type
            : 'predicate') as DatapackDataFileDraft['type'],
          name: typeof item.name === 'string' ? item.name : 'file',
          content: typeof item.content === 'string' ? item.content : '{}'
        }))
    : []
  return {
    namespace: typeof input.namespace === 'string' ? input.namespace : fallback.namespace,
    description:
      typeof input.description === 'string' ? input.description : fallback.description,
    functions: list,
    activeFunctionId,
    loadFunction:
      typeof input.loadFunction === 'string' && names.has(input.loadFunction)
        ? input.loadFunction
        : '',
    tickFunction:
      typeof input.tickFunction === 'string' && names.has(input.tickFunction)
        ? input.tickFunction
        : '',
    dataFiles,
    activeDataFileId: dataFiles.some((item) => item.id === input.activeDataFileId)
      ? (input.activeDataFileId as string)
      : (dataFiles[0]?.id ?? '')
  }
}

function normalizeScoreboard(input: Partial<ScoreboardOptions> | undefined): ScoreboardOptions {
  const fallback = createDefaultScoreboardOptions()
  if (!input) return fallback
  const actions: ScoreboardOptions['action'][] = [
    'objective-add',
    'objective-remove',
    'objective-display',
    'objective-modify',
    'players-set',
    'players-add',
    'players-remove',
    'players-reset',
    'players-get',
    'players-operation'
  ]
  const operations: ScoreboardOptions['operation'][] = [
    '=',
    '+=',
    '-=',
    '*=',
    '/=',
    '%=',
    '<',
    '>',
    '><'
  ]
  return {
    action: actions.includes(input.action as ScoreboardOptions['action'])
      ? (input.action as ScoreboardOptions['action'])
      : 'objective-add',
    objective: typeof input.objective === 'string' ? input.objective : fallback.objective,
    criteria: typeof input.criteria === 'string' ? input.criteria : fallback.criteria,
    displayName:
      typeof input.displayName === 'string' ? input.displayName : fallback.displayName,
    slot: typeof input.slot === 'string' ? input.slot : fallback.slot,
    target: input.target?.base ? input.target : fallback.target,
    score: typeof input.score === 'string' ? input.score : fallback.score,
    operation: operations.includes(input.operation as ScoreboardOptions['operation'])
      ? (input.operation as ScoreboardOptions['operation'])
      : '=',
    source: input.source?.base ? input.source : fallback.source,
    sourceObjective:
      typeof input.sourceObjective === 'string'
        ? input.sourceObjective
        : fallback.sourceObjective,
    modifyField:
      input.modifyField === 'displayautoupdate' ||
      input.modifyField === 'numberformat' ||
      input.modifyField === 'rendertype'
        ? input.modifyField
        : 'displayname',
    autoUpdate: input.autoUpdate !== false,
    numberFormat:
      input.numberFormat === 'fixed' || input.numberFormat === 'styled'
        ? input.numberFormat
        : 'blank',
    numberFormatValue:
      typeof input.numberFormatValue === 'string'
        ? input.numberFormatValue
        : fallback.numberFormatValue,
    renderType: input.renderType === 'hearts' ? 'hearts' : 'integer'
  }
}

function normalizeParticle(input: Partial<ParticleOptions> | undefined): ParticleOptions {
  const fallback = createDefaultParticleOptions()
  if (!input) return fallback
  const modes: ParticleOptions['optionMode'][] = [
    'auto',
    'none',
    'block',
    'dust',
    'dust_transition',
    'item',
    'color',
    'rgba',
    'raw'
  ]
  return {
    particle: typeof input.particle === 'string' ? input.particle : fallback.particle,
    optionMode: modes.includes(input.optionMode as ParticleOptions['optionMode'])
      ? (input.optionMode as ParticleOptions['optionMode'])
      : 'auto',
    block: typeof input.block === 'string' ? input.block : fallback.block,
    dustColor: typeof input.dustColor === 'string' ? input.dustColor : fallback.dustColor,
    fromColor: typeof input.fromColor === 'string' ? input.fromColor : fallback.fromColor,
    toColor: typeof input.toColor === 'string' ? input.toColor : fallback.toColor,
    scale: typeof input.scale === 'string' ? input.scale : fallback.scale,
    item: typeof input.item === 'string' ? input.item : fallback.item,
    effectColor:
      typeof input.effectColor === 'string' ? input.effectColor : fallback.effectColor,
    alpha: typeof input.alpha === 'string' ? input.alpha : fallback.alpha,
    power: typeof input.power === 'string' ? input.power : fallback.power,
    rawOptions:
      typeof input.rawOptions === 'string' ? input.rawOptions : fallback.rawOptions,
    position: normalizePosition(input.position),
    deltaX: typeof input.deltaX === 'string' ? input.deltaX : fallback.deltaX,
    deltaY: typeof input.deltaY === 'string' ? input.deltaY : fallback.deltaY,
    deltaZ: typeof input.deltaZ === 'string' ? input.deltaZ : fallback.deltaZ,
    speed: typeof input.speed === 'string' ? input.speed : fallback.speed,
    count: typeof input.count === 'string' ? input.count : fallback.count,
    force: Boolean(input.force),
    viewersEnabled: Boolean(input.viewersEnabled),
    viewers: input.viewers?.base ? input.viewers : fallback.viewers
  }
}

function normalizeWorld(input: Partial<WorldOptions> | undefined): WorldOptions {
  const fallback = createDefaultWorldOptions()
  if (!input) return fallback
  const timeActions: TimeOptions['action'][] = ['set', 'add', 'query']
  const presets: TimeOptions['preset'][] = [
    'day',
    'noon',
    'night',
    'midnight',
    'sunrise',
    'sunset',
    'custom'
  ]
  const queries: TimeOptions['query'][] = ['day', 'daytime', 'gametime']
  const weatherTypes: WorldOptions['weather']['type'][] = ['clear', 'rain', 'thunder']
  const levels: WorldOptions['difficulty']['level'][] = [
    'peaceful',
    'easy',
    'normal',
    'hard'
  ]
  return {
    time: {
      action: timeActions.includes(input.time?.action as TimeOptions['action'])
        ? (input.time?.action as TimeOptions['action'])
        : 'set',
      preset: presets.includes(input.time?.preset as TimeOptions['preset'])
        ? (input.time?.preset as TimeOptions['preset'])
        : 'day',
      customTicks:
        typeof input.time?.customTicks === 'string'
          ? input.time.customTicks
          : fallback.time.customTicks,
      query: queries.includes(input.time?.query as TimeOptions['query'])
        ? (input.time?.query as TimeOptions['query'])
        : 'daytime'
    },
    weather: {
      type: weatherTypes.includes(input.weather?.type as WorldOptions['weather']['type'])
        ? (input.weather?.type as WorldOptions['weather']['type'])
        : 'clear',
      durationEnabled: Boolean(input.weather?.durationEnabled),
      seconds:
        typeof input.weather?.seconds === 'string'
          ? input.weather.seconds
          : fallback.weather.seconds
    },
    difficulty: {
      level: levels.includes(input.difficulty?.level as WorldOptions['difficulty']['level'])
        ? (input.difficulty?.level as WorldOptions['difficulty']['level'])
        : 'normal'
    }
  }
}

function normalizeTag(input: Partial<TagOptions> | undefined): TagOptions {
  const fallback = createDefaultTagOptions()
  if (!input) return fallback
  return {
    action:
      input.action === 'remove' || input.action === 'list' ? input.action : 'add',
    target: input.target?.base ? input.target : fallback.target,
    name: typeof input.name === 'string' ? input.name : fallback.name
  }
}

function normalizeClear(input: Partial<ClearOptions> | undefined): ClearOptions {
  const fallback = createDefaultClearOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    allItems: input.allItems !== false,
    item: typeof input.item === 'string' ? input.item : fallback.item,
    maxCountEnabled: Boolean(input.maxCountEnabled),
    maxCount: typeof input.maxCount === 'string' ? input.maxCount : fallback.maxCount
  }
}

function normalizeGamerule(input: Partial<GameruleOptions> | undefined): GameruleOptions {
  const fallback = createDefaultGameruleOptions()
  if (!input) return fallback
  return {
    action: input.action === 'query' ? 'query' : 'set',
    rule: typeof input.rule === 'string' ? input.rule : fallback.rule,
    type: input.type === 'integer' ? 'integer' : 'boolean',
    value: typeof input.value === 'string' ? input.value : fallback.value
  }
}

function normalizeWorldborder(
  input: Partial<WorldborderOptions> | undefined
): WorldborderOptions {
  const fallback = createDefaultWorldborderOptions()
  if (!input) return fallback
  const actions: WorldborderOptions['action'][] = [
    'set',
    'add',
    'center',
    'damage-amount',
    'damage-buffer',
    'warning-distance',
    'warning-time',
    'get'
  ]
  return {
    action: actions.includes(input.action as WorldborderOptions['action'])
      ? (input.action as WorldborderOptions['action'])
      : 'set',
    distance: typeof input.distance === 'string' ? input.distance : fallback.distance,
    timeEnabled: Boolean(input.timeEnabled),
    time: typeof input.time === 'string' ? input.time : fallback.time,
    x: typeof input.x === 'string' ? input.x : fallback.x,
    z: typeof input.z === 'string' ? input.z : fallback.z,
    value: typeof input.value === 'string' ? input.value : fallback.value
  }
}

function normalizeTeam(input: Partial<TeamOptions> | undefined): TeamOptions {
  const fallback = createDefaultTeamOptions()
  if (!input) return fallback
  const actions: TeamOptions['action'][] = [
    'create',
    'modify',
    'join',
    'leave',
    'remove',
    'list'
  ]
  const colors: TeamOptions['color'][] = [
    'black',
    'dark_blue',
    'dark_green',
    'dark_aqua',
    'dark_red',
    'dark_purple',
    'gold',
    'gray',
    'dark_gray',
    'blue',
    'green',
    'aqua',
    'red',
    'light_purple',
    'yellow',
    'white'
  ]
  const visibilities: TeamOptions['nametagVisibility'][] = [
    'always',
    'hideForOtherTeams',
    'hideForOwnTeam',
    'never'
  ]
  const collisions: TeamOptions['collisionRule'][] = [
    'always',
    'pushOtherTeams',
    'pushOwnTeam',
    'never'
  ]
  return {
    action: actions.includes(input.action as TeamOptions['action'])
      ? (input.action as TeamOptions['action'])
      : 'create',
    name: typeof input.name === 'string' ? input.name : fallback.name,
    displayName:
      typeof input.displayName === 'string' ? input.displayName : fallback.displayName,
    color: colors.includes(input.color as TeamOptions['color'])
      ? (input.color as TeamOptions['color'])
      : 'red',
    friendlyFire: Boolean(input.friendlyFire),
    seeFriendlyInvisibles: input.seeFriendlyInvisibles !== false,
    nametagVisibility: visibilities.includes(
      input.nametagVisibility as TeamOptions['nametagVisibility']
    )
      ? (input.nametagVisibility as TeamOptions['nametagVisibility'])
      : 'always',
    collisionRule: collisions.includes(input.collisionRule as TeamOptions['collisionRule'])
      ? (input.collisionRule as TeamOptions['collisionRule'])
      : 'always',
    target: input.target?.base ? input.target : fallback.target,
    prefix: Array.isArray(input.prefix)
      ? input.prefix.map(normalizeTextSegment)
      : [],
    suffix: Array.isArray(input.suffix)
      ? input.suffix.map(normalizeTextSegment)
      : [],
    displayAdvanced: Boolean(input.displayAdvanced),
    displaySegments: Array.isArray(input.displaySegments)
      ? input.displaySegments.map(normalizeTextSegment)
      : []
  }
}

function normalizeSpawnpoint(input: Partial<SpawnpointOptions> | undefined): SpawnpointOptions {
  const fallback = createDefaultSpawnpointOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    position: normalizePosition(input.position),
    angleEnabled: Boolean(input.angleEnabled),
    yaw: typeof input.yaw === 'string' ? input.yaw : fallback.yaw,
    pitch: typeof input.pitch === 'string' ? input.pitch : fallback.pitch
  }
}

function normalizeWorldSpawn(input: Partial<WorldSpawnOptions> | undefined): WorldSpawnOptions {
  const fallback = createDefaultWorldSpawnOptions()
  if (!input) return fallback
  return {
    position: normalizePosition(input.position),
    angleEnabled: Boolean(input.angleEnabled),
    yaw: typeof input.yaw === 'string' ? input.yaw : fallback.yaw,
    pitch: typeof input.pitch === 'string' ? input.pitch : fallback.pitch
  }
}

function normalizeForceload(input: Partial<ForceloadOptions> | undefined): ForceloadOptions {
  const fallback = createDefaultForceloadOptions()
  if (!input) return fallback
  const actions: ForceloadOptions['action'][] = ['add', 'remove', 'remove-all', 'query']
  return {
    action: actions.includes(input.action as ForceloadOptions['action'])
      ? (input.action as ForceloadOptions['action'])
      : 'add',
    fromX: typeof input.fromX === 'string' ? input.fromX : fallback.fromX,
    fromZ: typeof input.fromZ === 'string' ? input.fromZ : fallback.fromZ,
    toEnabled: Boolean(input.toEnabled),
    toX: typeof input.toX === 'string' ? input.toX : fallback.toX,
    toZ: typeof input.toZ === 'string' ? input.toZ : fallback.toZ
  }
}

function normalizeAttribute(input: Partial<AttributeOptions> | undefined): AttributeOptions {
  const fallback = createDefaultAttributeOptions()
  if (!input) return fallback
  const actions: AttributeOptions['action'][] = [
    'get',
    'base-get',
    'base-set',
    'base-reset',
    'modifier-add',
    'modifier-remove',
    'modifier-value'
  ]
  const operations: AttributeOptions['operation'][] = [
    'add_value',
    'add_multiplied_base',
    'add_multiplied_total'
  ]
  return {
    action: actions.includes(input.action as AttributeOptions['action'])
      ? (input.action as AttributeOptions['action'])
      : 'get',
    target: input.target?.base ? input.target : fallback.target,
    attribute: typeof input.attribute === 'string' ? input.attribute : fallback.attribute,
    value: typeof input.value === 'string' ? input.value : fallback.value,
    scaleEnabled: Boolean(input.scaleEnabled),
    scale: typeof input.scale === 'string' ? input.scale : fallback.scale,
    modifierId:
      typeof input.modifierId === 'string' ? input.modifierId : fallback.modifierId,
    modifierValue:
      typeof input.modifierValue === 'string' ? input.modifierValue : fallback.modifierValue,
    operation: operations.includes(input.operation as AttributeOptions['operation'])
      ? (input.operation as AttributeOptions['operation'])
      : 'add_value'
  }
}

function normalizeAutomation(input: Partial<AutomationOptions> | undefined): AutomationOptions {
  const advancementFallback = createDefaultAdvancementOptions()
  const functionFallback = createDefaultFunctionOptions()
  const scheduleFallback = createDefaultScheduleOptions()
  const advancementModes: AdvancementOptions['mode'][] = [
    'everything',
    'only',
    'from',
    'through',
    'until'
  ]
  const scheduleModes: ScheduleOptions['mode'][] = ['append', 'replace']
  return {
    advancement: {
      action: input?.advancement?.action === 'revoke' ? 'revoke' : 'grant',
      mode: advancementModes.includes(input?.advancement?.mode as AdvancementOptions['mode'])
        ? (input?.advancement?.mode as AdvancementOptions['mode'])
        : 'only',
      target: input?.advancement?.target?.base
        ? input.advancement.target
        : advancementFallback.target,
      advancement:
        typeof input?.advancement?.advancement === 'string'
          ? input.advancement.advancement
          : advancementFallback.advancement,
      criterion:
        typeof input?.advancement?.criterion === 'string'
          ? input.advancement.criterion
          : ''
    },
    function: {
      name:
        typeof input?.function?.name === 'string'
          ? input.function.name
          : functionFallback.name,
      argumentsEnabled: Boolean(input?.function?.argumentsEnabled),
      arguments:
        typeof input?.function?.arguments === 'string'
          ? input.function.arguments
          : functionFallback.arguments
    },
    schedule: {
      action: input?.schedule?.action === 'clear' ? 'clear' : 'function',
      functionName:
        typeof input?.schedule?.functionName === 'string'
          ? input.schedule.functionName
          : scheduleFallback.functionName,
      time: typeof input?.schedule?.time === 'string' ? input.schedule.time : scheduleFallback.time,
      mode: scheduleModes.includes(input?.schedule?.mode as ScheduleOptions['mode'])
        ? (input?.schedule?.mode as ScheduleOptions['mode'])
        : 'replace'
    }
  }
}

function normalizeItemCommand(input: Partial<ItemOptions> | undefined): ItemOptions {
  const fallback = createDefaultItemOptions()
  if (!input) return fallback
  return {
    action: input.action === 'modify' ? 'modify' : 'replace',
    targetType: input.targetType === 'block' ? 'block' : 'entity',
    target: input.target?.base ? input.target : fallback.target,
    position: normalizePosition(input.position),
    slot: typeof input.slot === 'string' ? input.slot : fallback.slot,
    item: typeof input.item === 'string' ? input.item : fallback.item,
    count: typeof input.count === 'string' ? input.count : fallback.count,
    modifier: typeof input.modifier === 'string' ? input.modifier : fallback.modifier,
    nbtEnabled: Boolean(input.nbtEnabled),
    nbt: typeof input.nbt === 'string' ? input.nbt : fallback.nbt
  }
}

function normalizeDataCommand(input: Partial<DataOptions> | undefined): DataOptions {
  const fallback = createDefaultDataOptions()
  if (!input) return fallback
  const operations: DataOptions['modifyOperation'][] = [
    'set',
    'merge',
    'append',
    'prepend',
    'insert',
    'remove'
  ]
  return {
    action:
      input.action === 'merge' || input.action === 'remove' || input.action === 'modify'
        ? input.action
        : 'get',
    targetType:
      input.targetType === 'block' || input.targetType === 'storage'
        ? input.targetType
        : 'entity',
    target: input.target?.base ? input.target : fallback.target,
    position: normalizePosition(input.position),
    storage: typeof input.storage === 'string' ? input.storage : fallback.storage,
    path: typeof input.path === 'string' ? input.path : fallback.path,
    scaleEnabled: Boolean(input.scaleEnabled),
    scale: typeof input.scale === 'string' ? input.scale : fallback.scale,
    nbt: typeof input.nbt === 'string' ? input.nbt : fallback.nbt,
    modifyOperation: operations.includes(input.modifyOperation as DataOptions['modifyOperation'])
      ? (input.modifyOperation as DataOptions['modifyOperation'])
      : 'set',
    index: typeof input.index === 'string' ? input.index : fallback.index,
    fromEnabled: Boolean(input.fromEnabled),
    fromTargetType:
      input.fromTargetType === 'block' || input.fromTargetType === 'storage'
        ? input.fromTargetType
        : 'entity',
    fromTarget: input.fromTarget?.base ? input.fromTarget : fallback.fromTarget,
    fromPosition: normalizePosition(input.fromPosition),
    fromStorage:
      typeof input.fromStorage === 'string' ? input.fromStorage : fallback.fromStorage,
    fromPath: typeof input.fromPath === 'string' ? input.fromPath : fallback.fromPath
  }
}

function normalizeLoot(input: Partial<LootOptions> | undefined): LootOptions {
  const fallback = createDefaultLootOptions()
  if (!input) return fallback
  return {
    action:
      input.action === 'insert' || input.action === 'spawn' ? input.action : 'give',
    target: input.target?.base ? input.target : fallback.target,
    position: normalizePosition(input.position),
    lootTable: typeof input.lootTable === 'string' ? input.lootTable : fallback.lootTable,
    slot: typeof input.slot === 'string' ? input.slot : fallback.slot
  }
}

function normalizeGamemode(input: Partial<GamemodeOptions> | undefined): GamemodeOptions {
  const fallback = createDefaultGamemodeOptions()
  if (!input) return fallback
  const modes: GamemodeOptions['mode'][] = ['survival', 'creative', 'adventure', 'spectator']
  return {
    mode: modes.includes(input.mode as GamemodeOptions['mode'])
      ? (input.mode as GamemodeOptions['mode'])
      : 'creative',
    target: input.target?.base ? input.target : fallback.target
  }
}

function normalizeDamage(input: Partial<DamageOptions> | undefined): DamageOptions {
  const fallback = createDefaultDamageOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    amount: typeof input.amount === 'string' ? input.amount : fallback.amount,
    damageType: typeof input.damageType === 'string' ? input.damageType : fallback.damageType,
    source:
      input.source === 'at' || input.source === 'by' ? input.source : 'none',
    position: normalizePosition(input.position),
    sourceEntity: input.sourceEntity?.base ? input.sourceEntity : fallback.sourceEntity,
    causeEntity: input.causeEntity?.base ? input.causeEntity : fallback.causeEntity
  }
}

function normalizeRotate(input: Partial<RotateOptions> | undefined): RotateOptions {
  const fallback = createDefaultRotateOptions()
  if (!input) return fallback
  const modes: RotateOptions['mode'][] = ['rotation', 'facingLocation', 'facingEntity']
  return {
    target: input.target?.base ? input.target : fallback.target,
    mode: modes.includes(input.mode as RotateOptions['mode'])
      ? (input.mode as RotateOptions['mode'])
      : 'rotation',
    yaw: typeof input.yaw === 'string' ? input.yaw : fallback.yaw,
    pitch: typeof input.pitch === 'string' ? input.pitch : fallback.pitch,
    position: normalizePosition(input.position),
    facingTarget: input.facingTarget?.base ? input.facingTarget : fallback.facingTarget,
    anchor: input.anchor === 'feet' ? 'feet' : 'eyes'
  }
}

function normalizeNbtGive(input: Partial<NbtGiveOptions> | undefined): NbtGiveOptions {
  const fallback = createDefaultNbtGiveOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    item: typeof input.item === 'string' ? input.item : fallback.item,
    count: typeof input.count === 'string' ? input.count : fallback.count,
    name: typeof input.name === 'string' ? input.name : '',
    lore: typeof input.lore === 'string' ? input.lore : '',
    enchantments: Array.isArray(input.enchantments)
      ? input.enchantments
          .filter((entry) => entry && typeof entry.id === 'string')
          .map((entry) => ({
            id: entry.id,
            level: typeof entry.level === 'string' ? entry.level : '1'
          }))
      : [],
    unbreakable: Boolean(input.unbreakable)
  }
}

function normalizeGive(input: Partial<GiveOptions> | undefined): GiveOptions {
  const fallback = createDefaultGiveOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    item:
      input.item && typeof input.item.id === 'string'
        ? {
            id: input.item.id,
            components: Array.isArray(input.item.components) ? input.item.components : []
          }
        : fallback.item,
    count:
      typeof input.count === 'number' && Number.isFinite(input.count)
        ? Math.max(1, Math.floor(input.count))
        : 1
  }
}

function normalizePayload(input: unknown): ProjectPayload {
  const data = (input ?? {}) as Partial<ProjectPayload>
  return {
    activeCommandId: typeof data.activeCommandId === 'string' ? data.activeCommandId : null,
    give: normalizeGive(data.give),
    nbtGive: normalizeNbtGive(data.nbtGive),
    gamemode: normalizeGamemode(data.gamemode),
    damage: normalizeDamage(data.damage),
    rotate: normalizeRotate(data.rotate),
    summon: normalizeSummon(data.summon),
    setblock: normalizeSetblock(data.setblock),
    execute: normalizeExecute(data.execute),
    teleport: normalizeTeleport(data.teleport),
    effect: normalizeEffect(data.effect),
    fill: normalizeFill(data.fill),
    clone: normalizeClone(data.clone),
    chain: normalizeChain(data.chain),
    enchant: normalizeEnchant(data.enchant),
    xp: normalizeXp(data.xp),
    tellraw: normalizeTellraw(data.tellraw),
    title: normalizeTitle(data.title),
    sound: normalizeSound(data.sound),
    bossbar: normalizeBossbar(data.bossbar),
    scoreboard: normalizeScoreboard(data.scoreboard),
    particle: normalizeParticle(data.particle),
    world: normalizeWorld(data.world),
    tag: normalizeTag(data.tag),
    clear: normalizeClear(data.clear),
    gamerule: normalizeGamerule(data.gamerule),
    worldborder: normalizeWorldborder(data.worldborder),
    team: normalizeTeam(data.team),
    spawnpoint: normalizeSpawnpoint(data.spawnpoint),
    worldSpawn: normalizeWorldSpawn(data.worldSpawn),
    forceload: normalizeForceload(data.forceload),
    attribute: normalizeAttribute(data.attribute),
    automation: normalizeAutomation(data.automation),
    itemCommand: normalizeItemCommand(data.itemCommand),
    dataCommand: normalizeDataCommand(data.dataCommand),
    loot: normalizeLoot(data.loot),
    datapack: normalizeDatapack(data.datapack),
    generic:
      data.generic && Array.isArray(data.generic.steps)
        ? {
            root: typeof data.generic.root === 'string' ? data.generic.root : null,
            steps: data.generic.steps
              .filter((step) => step && typeof step.name === 'string')
              .map((step) => ({ name: step.name, value: step.value }))
          }
        : emptyGeneric(),
    commandBlock: {
      ...createDefaultCommandBlockOptions(),
      ...(data.commandBlock ?? {})
    },
    outputMode: data.outputMode === 'command-block' ? 'command-block' : 'command'
  }
}

function documentSnapshot(state: AppStore): string {
  return JSON.stringify({
    projectName: state.projectName,
    give: state.give,
    nbtGive: state.nbtGive,
    gamemode: state.gamemode,
    damage: state.damage,
    rotate: state.rotate,
    summon: state.summon,
    setblock: state.setblock,
    execute: state.execute,
    teleport: state.teleport,
    effect: state.effect,
    fill: state.fill,
    clone: state.clone,
    chain: state.chain,
    enchant: state.enchant,
    xp: state.xp,
    tellraw: state.tellraw,
    title: state.title,
    sound: state.sound,
    bossbar: state.bossbar,
    scoreboard: state.scoreboard,
    particle: state.particle,
    world: state.world,
    tag: state.tag,
    clear: state.clear,
    gamerule: state.gamerule,
    worldborder: state.worldborder,
    team: state.team,
    spawnpoint: state.spawnpoint,
    worldSpawn: state.worldSpawn,
    forceload: state.forceload,
    attribute: state.attribute,
    automation: state.automation,
    itemCommand: state.itemCommand,
    dataCommand: state.dataCommand,
    loot: state.loot,
    datapack: state.datapack,
    generic: state.generic,
    commandBlock: state.commandBlock
  })
}

export const useAppStore = create<AppStore>()(
  immer((setRaw, get) => {
    let restoring = false
    let lastPushAt = 0

    const set = ((updater: any, replace?: boolean) => {
      const before = documentSnapshot(get())
      ;(setRaw as any)(updater, replace)
      const after = documentSnapshot(get())
      if (!restoring && before !== after && Date.now() - lastPushAt > 500) {
        setRaw((state) => {
          state.historyPast.push(before)
          if (state.historyPast.length > 100) state.historyPast.shift()
          state.historyFuture = []
        })
        lastPushAt = Date.now()
      }
    }) as typeof setRaw

    return {
    booted: false,
    bootError: null,
    appInfo: null,
    packs: [],
    pack: null,
    activePackId: '26.3',
    settings: { ...DEFAULT_SETTINGS },
    update: { status: 'idle' },
    activeCommandId: null,
    give: createDefaultGiveOptions(),
    nbtGive: createDefaultNbtGiveOptions(),
    gamemode: createDefaultGamemodeOptions(),
    damage: createDefaultDamageOptions(),
    rotate: createDefaultRotateOptions(),
    summon: createDefaultSummonOptions(),
    setblock: createDefaultSetblockOptions(),
    execute: createDefaultExecuteOptions(),
    teleport: createDefaultTeleportOptions(),
    effect: createDefaultEffectOptions(),
    fill: createDefaultFillOptions(),
    clone: createDefaultCloneOptions(),
    chain: createDefaultChainOptions(),
    enchant: createDefaultEnchantOptions(),
    xp: createDefaultXpOptions(),
    tellraw: createDefaultTellrawOptions(),
    title: createDefaultTitleOptions(),
    sound: createDefaultSoundOptions(),
    bossbar: createDefaultBossbarOptions(),
    scoreboard: createDefaultScoreboardOptions(),
    particle: createDefaultParticleOptions(),
    world: createDefaultWorldOptions(),
    tag: createDefaultTagOptions(),
    clear: createDefaultClearOptions(),
    gamerule: createDefaultGameruleOptions(),
    worldborder: createDefaultWorldborderOptions(),
    team: createDefaultTeamOptions(),
    spawnpoint: createDefaultSpawnpointOptions(),
    worldSpawn: createDefaultWorldSpawnOptions(),
    forceload: createDefaultForceloadOptions(),
    attribute: createDefaultAttributeOptions(),
    automation: {
      advancement: createDefaultAdvancementOptions(),
      function: createDefaultFunctionOptions(),
      schedule: createDefaultScheduleOptions()
    },
    itemCommand: createDefaultItemOptions(),
    dataCommand: createDefaultDataOptions(),
    loot: createDefaultLootOptions(),
    datapack: defaultDatapackDraft(),
    generic: emptyGeneric(),
    commandBlock: createDefaultCommandBlockOptions(),
    outputMode: 'command',
    search: '',
    category: '全部',
    projectName: '未命名项目',
    projectPath: null,
    dirty: false,
    autosaveAvailable: false,
    lastAutosaveAt: null,
    announcementOpen: false,
    historyPast: [],
    historyFuture: [],
    dialogs: { settings: false, about: false, itemPicker: false, selector: false },
    toast: null,

    boot: async () => {
      if (booting || get().booted) return
      booting = true
      try {
        const api = getApi()
        const [settings, packs, appInfo] = await Promise.all([
          api.settings.get(),
          api.packs.list(),
          api.app.info()
        ])
        applyTheme(settings.theme)
        set((state) => {
          state.settings = settings
          state.packs = packs
          state.appInfo = appInfo
          state.activePackId = settings.lastPackId ?? packs[0]?.id ?? '26.3'
        })

        const preferred = settings.lastPackId ?? packs[0]?.id ?? '26.3'
        await get().loadPack(preferred)

        const autosave = await api.project.getAutosave()
        if (autosave) {
          set((state) => {
            state.autosaveAvailable = true
          })
        }
        const update = await api.updater.getState()
        set((state) => {
          state.update = update
          state.booted = true
          state.bootError = null
        })
      } catch (error) {
        set((state) => {
          state.booted = true
          state.bootError = `启动失败：${messageOf(error)}`
        })
      } finally {
        booting = false
      }
    },

    loadPack: async (id) => {
      try {
        const api = getApi()
        const result = await api.packs.load(id)
        if (!result.ok) {
          set((state) => {
            state.bootError = result.error
            if (result.hint) state.bootError += `\n${result.hint}`
          })
          return
        }
        set({
          pack: result.pack,
          activePackId: id,
          bootError: null
        })
        const settings = await api.settings.update({ lastPackId: id })
        set((state) => {
          state.settings = settings
        })
      } catch (error) {
        set((state) => {
          state.bootError = `加载数据包失败：${messageOf(error)}`
        })
      }
    },

    selectCommand: (id) => {
      set((state) => {
        state.activeCommandId = id
        if (id) {
          state.generic = { root: id, steps: [] }
        }
        state.dirty = true
      })
    },

    setTarget: (target) => {
      set((state) => {
        state.give.target = target
        state.dirty = true
      })
    },

    setItemId: (id) => {
      set((state) => {
        state.give.item.id = id
        state.dirty = true
      })
    },

    setCount: (count) => {
      set((state) => {
        state.give.count = count
        state.dirty = true
      })
    },

    addComponent: (kind) => {
      set((state) => {
        if (kind !== 'raw' && state.give.item.components.some((item) => item.kind === kind)) return
        state.give.item.components.push(defaultComponent(kind))
        state.dirty = true
      })
    },

    replaceComponent: (index, component) => {
      set((state) => {
        if (index < 0 || index >= state.give.item.components.length) return
        state.give.item.components[index] = component
        state.dirty = true
      })
    },

    removeComponent: (index) => {
      set((state) => {
        state.give.item.components.splice(index, 1)
        state.dirty = true
      })
    },

    applyGiveImport: (options) => {
      set((state) => {
        state.activeCommandId = 'give'
        state.give = options
        state.dirty = true
      })
    },

    updateSummon: (patch) => {
      set((state) => {
        Object.assign(state.summon, patch)
        state.dirty = true
      })
    },

    updateSummonPosition: (patch) => {
      set((state) => {
        Object.assign(state.summon.position, patch)
        state.dirty = true
      })
    },

    updateSetblock: (patch) => {
      set((state) => {
        Object.assign(state.setblock, patch)
        state.dirty = true
      })
    },

    updateSetblockPosition: (patch) => {
      set((state) => {
        Object.assign(state.setblock.position, patch)
        state.dirty = true
      })
    },

    selectBlock: (block) => {
      set((state) => {
        state.setblock.block = block
        state.dirty = true
      })
    },

    setBlockState: (key, value) => {
      set((state) => {
        state.setblock.block.states[key] = value
        state.dirty = true
      })
    },

    setBlockNbt: (nbt) => {
      set((state) => {
        state.setblock.block.nbt = nbt
        state.dirty = true
      })
    },

    setBlockMode: (mode) => {
      set((state) => {
        state.setblock.mode = mode
        state.dirty = true
      })
    },

    addExecuteClause: (kind) => {
      set((state) => {
        state.execute.clauses.push(defaultExecuteClause(kind))
        state.dirty = true
      })
    },

    updateExecuteClause: (id, clause) => {
      set((state) => {
        const index = state.execute.clauses.findIndex((item) => item.id === id)
        if (index >= 0) state.execute.clauses[index] = clause
        state.dirty = true
      })
    },

    removeExecuteClause: (id) => {
      set((state) => {
        state.execute.clauses = state.execute.clauses.filter((item) => item.id !== id)
        state.dirty = true
      })
    },

    moveExecuteClause: (id, direction) => {
      set((state) => {
        const index = state.execute.clauses.findIndex((item) => item.id === id)
        const target = index + direction
        if (index < 0 || target < 0 || target >= state.execute.clauses.length) return
        const [clause] = state.execute.clauses.splice(index, 1)
        state.execute.clauses.splice(target, 0, clause)
        state.dirty = true
      })
    },

    setExecuteRun: (run) => {
      set((state) => {
        state.execute.run = run
        state.dirty = true
      })
    },

    setExecuteClauses: (clauses) => {
      set((state) => {
        state.execute.clauses = clauses
        state.dirty = true
      })
    },

    updateTeleport: (patch) => {
      set((state) => {
        state.teleport = { ...state.teleport, ...patch }
        state.dirty = true
      })
    },

    updateEffect: (patch) => {
      set((state) => {
        state.effect = { ...state.effect, ...patch }
        state.dirty = true
      })
    },

    updateNbtGive: (patch) => {
      set((state) => {
        state.nbtGive = { ...state.nbtGive, ...patch }
        state.dirty = true
      })
    },

    updateGamemode: (patch) => {
      set((state) => {
        state.gamemode = { ...state.gamemode, ...patch }
        state.dirty = true
      })
    },

    updateDamage: (patch) => {
      set((state) => {
        state.damage = { ...state.damage, ...patch }
        state.dirty = true
      })
    },

    updateRotate: (patch) => {
      set((state) => {
        state.rotate = { ...state.rotate, ...patch }
        state.dirty = true
      })
    },

    updateFill: (patch) => {
      set((state) => {
        state.fill = { ...state.fill, ...patch }
        state.dirty = true
      })
    },

    updateClone: (patch) => {
      set((state) => {
        state.clone = { ...state.clone, ...patch }
        state.dirty = true
      })
    },

    updateEnchant: (patch) => {
      set((state) => {
        state.enchant = { ...state.enchant, ...patch }
        state.dirty = true
      })
    },

    updateXp: (patch) => {
      set((state) => {
        state.xp = { ...state.xp, ...patch }
        state.dirty = true
      })
    },

    updateTellraw: (patch) => {
      set((state) => {
        state.tellraw = { ...state.tellraw, ...patch }
        state.dirty = true
      })
    },

    updateTitle: (patch) => {
      set((state) => {
        state.title = { ...state.title, ...patch }
        state.dirty = true
      })
    },

    updateSound: (patch) => {
      set((state) => {
        state.sound = { ...state.sound, ...patch }
        state.dirty = true
      })
    },

    updateBossbar: (patch) => {
      set((state) => {
        state.bossbar = { ...state.bossbar, ...patch }
        state.dirty = true
      })
    },

    updateScoreboard: (patch) => {
      set((state) => {
        state.scoreboard = { ...state.scoreboard, ...patch }
        state.dirty = true
      })
    },

    updateParticle: (patch) => {
      set((state) => {
        state.particle = { ...state.particle, ...patch }
        state.dirty = true
      })
    },

    updateTime: (patch) => {
      set((state) => {
        state.world.time = { ...state.world.time, ...patch }
        state.dirty = true
      })
    },

    updateWeather: (patch) => {
      set((state) => {
        state.world.weather = { ...state.world.weather, ...patch }
        state.dirty = true
      })
    },

    updateDifficulty: (patch) => {
      set((state) => {
        state.world.difficulty = { ...state.world.difficulty, ...patch }
        state.dirty = true
      })
    },

    updateTag: (patch) => {
      set((state) => {
        state.tag = { ...state.tag, ...patch }
        state.dirty = true
      })
    },

    updateClear: (patch) => {
      set((state) => {
        state.clear = { ...state.clear, ...patch }
        state.dirty = true
      })
    },

    updateGamerule: (patch) => {
      set((state) => {
        state.gamerule = { ...state.gamerule, ...patch }
        state.dirty = true
      })
    },

    updateWorldborder: (patch) => {
      set((state) => {
        state.worldborder = { ...state.worldborder, ...patch }
        state.dirty = true
      })
    },

    updateTeam: (patch) => {
      set((state) => {
        state.team = { ...state.team, ...patch }
        state.dirty = true
      })
    },

    updateSpawnpoint: (patch) => {
      set((state) => {
        state.spawnpoint = { ...state.spawnpoint, ...patch }
        state.dirty = true
      })
    },

    updateWorldSpawn: (patch) => {
      set((state) => {
        state.worldSpawn = { ...state.worldSpawn, ...patch }
        state.dirty = true
      })
    },

    updateForceload: (patch) => {
      set((state) => {
        state.forceload = { ...state.forceload, ...patch }
        state.dirty = true
      })
    },

    updateAttribute: (patch) => {
      set((state) => {
        state.attribute = { ...state.attribute, ...patch }
        state.dirty = true
      })
    },

    updateAdvancement: (patch) => {
      set((state) => {
        state.automation.advancement = { ...state.automation.advancement, ...patch }
        state.dirty = true
      })
    },

    updateFunction: (patch) => {
      set((state) => {
        state.automation.function = { ...state.automation.function, ...patch }
        state.dirty = true
      })
    },

    updateSchedule: (patch) => {
      set((state) => {
        state.automation.schedule = { ...state.automation.schedule, ...patch }
        state.dirty = true
      })
    },

    updateItemCommand: (patch) => {
      set((state) => {
        state.itemCommand = { ...state.itemCommand, ...patch }
        state.dirty = true
      })
    },

    updateDataCommand: (patch) => {
      set((state) => {
        state.dataCommand = { ...state.dataCommand, ...patch }
        state.dirty = true
      })
    },

    updateLoot: (patch) => {
      set((state) => {
        state.loot = { ...state.loot, ...patch }
        state.dirty = true
      })
    },

    openDatapack: () => {
      set((state) => {
        state.activeCommandId = 'datapack'
        state.outputMode = 'command'
      })
    },

    updateDatapackMeta: (patch) => {
      set((state) => {
        state.datapack = { ...state.datapack, ...patch }
        state.dirty = true
      })
    },

    addDatapackFunction: () => {
      set((state) => {
        const names = new Set(state.datapack.functions.map((item) => item.name))
        let index = 1
        let name = 'function'
        while (names.has(name)) {
          index += 1
          name = `function_${index}`
        }
        const id = newClauseId()
        state.datapack.functions.push({ id, name, commands: '' })
        state.datapack.activeFunctionId = id
        state.dirty = true
      })
    },

    removeDatapackFunction: (id) => {
      set((state) => {
        if (state.datapack.functions.length <= 1) return
        const target = state.datapack.functions.find((item) => item.id === id)
        if (!target) return
        state.datapack.functions = state.datapack.functions.filter((item) => item.id !== id)
        if (state.datapack.loadFunction === target.name) state.datapack.loadFunction = ''
        if (state.datapack.tickFunction === target.name) state.datapack.tickFunction = ''
        if (state.datapack.activeFunctionId === id) {
          state.datapack.activeFunctionId = state.datapack.functions[0].id
        }
        state.dirty = true
      })
    },

    selectDatapackFunction: (id) => {
      set((state) => {
        if (state.datapack.functions.some((item) => item.id === id)) {
          state.datapack.activeFunctionId = id
        }
      })
    },

    updateDatapackFunction: (id, patch) => {
      set((state) => {
        const target = state.datapack.functions.find((item) => item.id === id)
        if (!target) return
        const oldName = target.name
        if (typeof patch.name === 'string') target.name = patch.name
        if (typeof patch.commands === 'string') target.commands = patch.commands
        if (patch.name && patch.name !== oldName) {
          if (state.datapack.loadFunction === oldName) state.datapack.loadFunction = patch.name
          if (state.datapack.tickFunction === oldName) state.datapack.tickFunction = patch.name
        }
        state.dirty = true
      })
    },

    addDatapackDataFile: (type) => {
      set((state) => {
        const template = DATAPACK_FILE_TEMPLATES[type]
        const names = new Set(state.datapack.dataFiles.map((item) => item.name))
        let name = template.name
        let index = 1
        while (names.has(name)) {
          index += 1
          name = `${template.name}_${index}`
        }
        const id = newClauseId()
        state.datapack.dataFiles.push({
          id,
          type,
          name,
          content: template.content
        })
        state.datapack.activeDataFileId = id
        state.dirty = true
      })
    },

    removeDatapackDataFile: (id) => {
      set((state) => {
        state.datapack.dataFiles = state.datapack.dataFiles.filter((item) => item.id !== id)
        if (state.datapack.activeDataFileId === id) {
          state.datapack.activeDataFileId = state.datapack.dataFiles[0]?.id ?? ''
        }
        state.dirty = true
      })
    },

    selectDatapackDataFile: (id) => {
      set((state) => {
        if (state.datapack.dataFiles.some((item) => item.id === id)) {
          state.datapack.activeDataFileId = id
        }
      })
    },

    updateDatapackDataFile: (id, patch) => {
      set((state) => {
        const target = state.datapack.dataFiles.find((item) => item.id === id)
        if (!target) return
        if (typeof patch.name === 'string') target.name = patch.name
        if (typeof patch.type === 'string') target.type = patch.type
        if (typeof patch.content === 'string') target.content = patch.content
        state.dirty = true
      })
    },

    setDatapackLoadFunction: (name) => {
      set((state) => {
        state.datapack.loadFunction = name
        state.dirty = true
      })
    },

    setDatapackTickFunction: (name) => {
      set((state) => {
        state.datapack.tickFunction = name
        state.dirty = true
      })
    },

    openChain: () => {
      set((state) => {
        state.activeCommandId = 'chain'
        state.outputMode = 'command'
      })
    },

    updateChain: (patch) => {
      set((state) => {
        state.chain = { ...state.chain, ...patch }
        state.dirty = true
      })
    },

    addChainBlock: () => {
      set((state) => {
        const index = state.chain.blocks.length
        state.chain.blocks.push(createChainBlock(index, index === 0 ? 'impulse' : 'chain'))
        state.dirty = true
      })
    },

    updateChainBlock: (id, patch) => {
      set((state) => {
        const block = state.chain.blocks.find((item) => item.id === id)
        if (block) Object.assign(block, patch)
        state.dirty = true
      })
    },

    removeChainBlock: (id) => {
      set((state) => {
        state.chain.blocks = state.chain.blocks.filter((block) => block.id !== id)
        state.dirty = true
      })
    },

    moveChainBlock: (id, direction) => {
      set((state) => {
        const index = state.chain.blocks.findIndex((block) => block.id === id)
        const target = index + direction
        if (index < 0 || target < 0 || target >= state.chain.blocks.length) return
        const [block] = state.chain.blocks.splice(index, 1)
        state.chain.blocks.splice(target, 0, block)
        state.dirty = true
      })
    },

    setGenericRoot: (root) => {
      set((state) => {
        state.generic = { root, steps: [] }
        state.activeCommandId = root
        state.dirty = true
      })
    },

    pushGenericStep: (step) => {
      set((state) => {
        state.generic.steps.push(step)
        state.dirty = true
      })
    },

    popGenericStep: () => {
      set((state) => {
        state.generic.steps.pop()
        state.dirty = true
      })
    },

    truncateGeneric: (length) => {
      set((state) => {
        state.generic.steps = state.generic.steps.slice(0, Math.max(0, length))
        state.dirty = true
      })
    },

    resetGeneric: () => {
      set((state) => {
        state.generic.steps = []
        state.dirty = true
      })
    },

    setOutputMode: (mode) => {
      set((state) => {
        state.outputMode = mode
        state.dirty = true
      })
    },

    setCommandBlock: (patch) => {
      set((state) => {
        Object.assign(state.commandBlock, patch)
        state.dirty = true
      })
    },

    setSearch: (value) => {
      set((state) => {
        state.search = value
      })
    },

    setCategory: (value) => {
      set((state) => {
        state.category = value
      })
    },

    setTheme: async (theme) => {
      applyTheme(theme)
      set((state) => {
        state.settings.theme = theme
      })
      try {
        const next = await getApi().settings.update({ theme })
        set((state) => {
          state.settings = next
        })
      } catch (error) {
        get().showToast(`主题保存失败：${messageOf(error)}`, 'error')
      }
    },

    updateSettings: async (patch) => {
      try {
        const next = await getApi().settings.update(patch)
        set((state) => {
          state.settings = next
        })
        if (patch.theme) applyTheme(patch.theme)
      } catch (error) {
        get().showToast(`设置保存失败：${messageOf(error)}`, 'error')
      }
    },

    setUpdate: (update) => {
      set((state) => {
        state.update = update
      })
    },

    checkForUpdates: async (manual = true) => {
      try {
        const update = await getApi().updater.check(manual)
        set((state) => {
          state.update = update
        })
      } catch (error) {
        get().showToast(`检查更新失败：${messageOf(error)}`, 'error')
      }
    },

    downloadUpdate: async () => {
      try {
        const update = await getApi().updater.download()
        set((state) => {
          state.update = update
        })
      } catch (error) {
        get().showToast(`下载更新失败：${messageOf(error)}`, 'error')
      }
    },

    installUpdate: async () => {
      try {
        await getApi().updater.install()
      } catch (error) {
        get().showToast(`安装更新失败：${messageOf(error)}`, 'error')
      }
    },

    skipUpdate: async (version) => {
      try {
        const update = await getApi().updater.skip(version)
        set((state) => {
          state.update = update
        })
        get().showToast(`已跳过 ${version}，可在设置中重新检查`, 'info')
      } catch (error) {
        get().showToast(`操作失败：${messageOf(error)}`, 'error')
      }
    },

    newProject: () => {
      set((state) => {
        state.activeCommandId = null
        state.give = createDefaultGiveOptions()
        state.nbtGive = createDefaultNbtGiveOptions()
        state.gamemode = createDefaultGamemodeOptions()
        state.damage = createDefaultDamageOptions()
        state.rotate = createDefaultRotateOptions()
        state.summon = createDefaultSummonOptions()
        state.setblock = createDefaultSetblockOptions()
        state.execute = createDefaultExecuteOptions()
        state.teleport = createDefaultTeleportOptions()
        state.effect = createDefaultEffectOptions()
        state.fill = createDefaultFillOptions()
        state.clone = createDefaultCloneOptions()
        state.chain = createDefaultChainOptions()
        state.enchant = createDefaultEnchantOptions()
        state.xp = createDefaultXpOptions()
        state.tellraw = createDefaultTellrawOptions()
        state.title = createDefaultTitleOptions()
        state.sound = createDefaultSoundOptions()
        state.bossbar = createDefaultBossbarOptions()
        state.scoreboard = createDefaultScoreboardOptions()
        state.particle = createDefaultParticleOptions()
        state.world = createDefaultWorldOptions()
        state.tag = createDefaultTagOptions()
        state.clear = createDefaultClearOptions()
        state.gamerule = createDefaultGameruleOptions()
        state.worldborder = createDefaultWorldborderOptions()
        state.team = createDefaultTeamOptions()
        state.spawnpoint = createDefaultSpawnpointOptions()
        state.worldSpawn = createDefaultWorldSpawnOptions()
        state.forceload = createDefaultForceloadOptions()
        state.attribute = createDefaultAttributeOptions()
        state.automation = {
          advancement: createDefaultAdvancementOptions(),
          function: createDefaultFunctionOptions(),
          schedule: createDefaultScheduleOptions()
        }
        state.itemCommand = createDefaultItemOptions()
        state.dataCommand = createDefaultDataOptions()
        state.loot = createDefaultLootOptions()
        state.datapack = defaultDatapackDraft()
        state.generic = emptyGeneric()
        state.commandBlock = createDefaultCommandBlockOptions()
        state.outputMode = 'command'
        state.projectName = '未命名项目'
        state.projectPath = null
        state.dirty = false
        state.autosaveAvailable = false
      })
      get().clearHistory()
      void getApi().project.clearAutosave()
      get().showToast('已新建项目', 'info')
    },

    setProjectName: (name) => {
      set((state) => {
        state.projectName = name.trim() || '未命名项目'
        state.dirty = true
      })
    },

    serializeProject: () => {
      const state = get()
      const payload: ProjectPayload = {
        activeCommandId: state.activeCommandId,
        give: state.give,
        nbtGive: state.nbtGive,
        gamemode: state.gamemode,
        damage: state.damage,
        rotate: state.rotate,
        summon: state.summon,
        setblock: state.setblock,
        execute: state.execute,
        teleport: state.teleport,
        effect: state.effect,
        fill: state.fill,
        clone: state.clone,
        chain: state.chain,
        enchant: state.enchant,
        xp: state.xp,
        tellraw: state.tellraw,
        title: state.title,
        sound: state.sound,
        bossbar: state.bossbar,
        scoreboard: state.scoreboard,
        particle: state.particle,
        world: state.world,
        tag: state.tag,
        clear: state.clear,
        gamerule: state.gamerule,
        worldborder: state.worldborder,
        team: state.team,
        spawnpoint: state.spawnpoint,
        worldSpawn: state.worldSpawn,
        forceload: state.forceload,
        attribute: state.attribute,
        automation: state.automation,
        itemCommand: state.itemCommand,
        dataCommand: state.dataCommand,
        loot: state.loot,
        datapack: state.datapack,
        generic: state.generic,
        commandBlock: state.commandBlock,
        outputMode: state.outputMode
      }
      const file = createProjectFile(state.projectName, state.activePackId, payload)
      return `${JSON.stringify(file, null, 2)}\n`
    },

    applyProjectContent: async (content, path, fallbackName) => {
      const parsed = parseProjectFile(JSON.parse(content))
      if (!parsed.ok || !parsed.project) {
        throw new Error(parsed.error ?? '项目文件无法解析')
      }
      const project = parsed.project
      if (project.packId && project.packId !== get().activePackId) {
        await get().loadPack(project.packId)
      }
      const payload = normalizePayload(project.data)
      set((state) => {
        state.activeCommandId = payload.activeCommandId
        state.give = payload.give
        state.nbtGive = payload.nbtGive
        state.gamemode = payload.gamemode
        state.damage = payload.damage
        state.rotate = payload.rotate
        state.summon = payload.summon
        state.setblock = payload.setblock
        state.execute = payload.execute
        state.teleport = payload.teleport
        state.effect = payload.effect
        state.fill = payload.fill
        state.clone = payload.clone
        state.chain = payload.chain
        state.enchant = payload.enchant
        state.xp = payload.xp
        state.tellraw = payload.tellraw
        state.title = payload.title
        state.sound = payload.sound
        state.bossbar = payload.bossbar
        state.scoreboard = payload.scoreboard
        state.particle = payload.particle
        state.world = payload.world
        state.tag = payload.tag
        state.clear = payload.clear
        state.gamerule = payload.gamerule
        state.worldborder = payload.worldborder
        state.team = payload.team
        state.spawnpoint = payload.spawnpoint
        state.worldSpawn = payload.worldSpawn
        state.forceload = payload.forceload
        state.attribute = payload.attribute
        state.automation = payload.automation
        state.itemCommand = payload.itemCommand
        state.dataCommand = payload.dataCommand
        state.loot = payload.loot
        state.datapack = payload.datapack
        state.generic = payload.generic
        state.commandBlock = payload.commandBlock
        state.outputMode = payload.outputMode
        state.projectName = project.name || fallbackName
        state.projectPath = path
        state.dirty = false
        state.autosaveAvailable = false
      })
      get().clearHistory()
      await getApi().project.clearAutosave()
      get().showToast('项目已打开', 'success')
    },

    saveProject: async (saveAs = false) => {
      try {
        const api = getApi()
        const content = get().serializeProject()
        const result =
          saveAs || !get().projectPath
            ? await api.project.saveAs(content, get().projectName)
            : await api.project.save(content, get().projectPath)
        if (!result) return false
        set((state) => {
          state.projectPath = result.path
          state.projectName = result.name
          state.dirty = false
          state.autosaveAvailable = false
        })
        await api.project.clearAutosave()
        get().showToast(`已保存：${result.name}`, 'success')
        return true
      } catch (error) {
        get().showToast(`保存失败：${messageOf(error)}`, 'error')
        return false
      }
    },

    openProject: async () => {
      try {
        const result = await getApi().project.open()
        if (!result) return
        await get().applyProjectContent(result.content, result.path, result.name)
      } catch (error) {
        get().showToast(`打开失败：${messageOf(error)}`, 'error')
      }
    },

    openProjectPath: async (path) => {
      try {
        const result = await getApi().project.openPath(path)
        if (!result) return
        await get().applyProjectContent(result.content, result.path, result.name)
      } catch (error) {
        get().showToast(`打开失败：${messageOf(error)}`, 'error')
      }
    },

    autosave: async () => {
      if (!get().dirty) return
      try {
        await getApi().project.autosave(get().serializeProject())
        set((state) => {
          state.lastAutosaveAt = new Date().toISOString()
        })
      } catch {
        // 自动保存失败不打扰用户，下次编辑再试
      }
    },

    restoreAutosave: async () => {
      try {
        const autosave = await getApi().project.getAutosave()
        if (!autosave) {
          set((state) => {
            state.autosaveAvailable = false
          })
          return
        }
        await get().applyProjectContent(autosave.content, null, '自动恢复的项目')
        set((state) => {
          state.dirty = true
          state.autosaveAvailable = false
        })
        get().showToast('已恢复自动保存的内容，请另存为新项目', 'success')
      } catch (error) {
        get().showToast(`恢复失败：${messageOf(error)}`, 'error')
      }
    },

    dismissAutosave: async () => {
      await getApi().project.clearAutosave()
      set((state) => {
        state.autosaveAvailable = false
      })
    },

    showToast: (message, kind = 'info') => {
      set((state) => {
        state.toast = { id: Date.now(), message, kind }
      })
    },

    hideToast: () => {
      set((state) => {
        state.toast = null
      })
    },

    openAnnouncement: () => {
      set((state) => {
        state.announcementOpen = true
      })
    },

    closeAnnouncement: async () => {
      set((state) => {
        state.announcementOpen = false
      })
      await get().markAnnouncementSeen()
    },

    markAnnouncementSeen: async () => {
      const version = get().appInfo?.version
      if (!version || get().settings.lastSeenVersion === version) return
      await get().updateSettings({ lastSeenVersion: version })
    },

    setDialog: (name, open) => {
      set((state) => {
        state.dialogs[name] = open
      })
    },

    undo: () => {
      const state = get()
      const previous = state.historyPast[state.historyPast.length - 1]
      if (!previous) return
      const current = documentSnapshot(state)
      restoring = true
      set((draft) => {
        Object.assign(draft, JSON.parse(previous))
        draft.historyPast.pop()
        draft.historyFuture.push(current)
        draft.dirty = true
      })
      restoring = false
      lastPushAt = 0
    },

    redo: () => {
      const state = get()
      const next = state.historyFuture[state.historyFuture.length - 1]
      if (!next) return
      const current = documentSnapshot(state)
      restoring = true
      set((draft) => {
        Object.assign(draft, JSON.parse(next))
        draft.historyFuture.pop()
        draft.historyPast.push(current)
        draft.dirty = true
      })
      restoring = false
      lastPushAt = 0
    },

    clearHistory: () => {
      set((state) => {
        state.historyPast = []
        state.historyFuture = []
      })
      lastPushAt = 0
    }
  }
  })
)

/** 当前泛型构建器所在的命令节点。 */
export function selectGenericNode(pack: VersionPack | null, draft: GenericDraft): CommandNodeData | null {
  if (!pack || !draft.root) return null
  let node: CommandNodeData | undefined = pack.commands.children?.[draft.root]
  for (const step of draft.steps) {
    node = node?.children?.[step.name]
    if (!node) return null
  }
  return node ?? null
}

/** 把路径状态还原成 core 需要的 GenericStep[]。 */
export function selectGenericSteps(pack: VersionPack | null, draft: GenericDraft): GenericStep[] {
  if (!pack || !draft.root) return []
  let node: CommandNodeData | undefined = pack.commands.children?.[draft.root]
  const steps: GenericStep[] = []
  for (const step of draft.steps) {
    const child = node?.children?.[step.name]
    if (!child) break
    steps.push({ name: step.name, node: child, value: step.value })
    node = child
  }
  return steps
}

export function selectGenericOutput(pack: VersionPack | null, draft: GenericDraft): BuildResult {
  if (!pack || !draft.root) {
    return { text: '', diagnostics: [] }
  }
  return serializeGeneric(draft.root, selectGenericSteps(pack, draft))
}

export function selectGiveOutput(give: GiveOptions): BuildResult {
  return buildGiveCommand(give)
}

export function selectNbtGiveOutput(nbtGive: NbtGiveOptions): BuildResult {
  return buildNbtGiveCommand(nbtGive)
}

export function selectGamemodeOutput(gamemode: GamemodeOptions): BuildResult {
  return buildGamemodeCommand(gamemode)
}

export function selectDamageOutput(damage: DamageOptions): BuildResult {
  return buildDamageCommand(damage)
}

export function selectRotateOutput(rotate: RotateOptions): BuildResult {
  return buildRotateCommand(rotate)
}

export function selectSummonOutput(summon: SummonOptions): BuildResult {
  return buildSummonCommand(summon)
}

export function selectSetblockOutput(setblock: SetblockOptions): BuildResult {
  return buildSetblockCommand(setblock)
}

export function selectExecuteOutput(execute: ExecuteOptions): BuildResult {
  return buildExecuteCommand(execute)
}

export function selectTeleportOutput(teleport: TeleportOptions): BuildResult {
  return buildTeleportCommand(teleport)
}

export function selectEffectOutput(effect: EffectOptions): BuildResult {
  return buildEffectCommand(effect)
}

export function selectFillOutput(fill: FillOptions): BuildResult {
  return buildFillCommand(fill)
}

export function selectCloneOutput(clone: CloneOptions): BuildResult {
  return buildCloneCommand(clone)
}

export function selectChainOutput(chain: ChainOptions): BuildResult {
  return buildChainCommands(chain)
}

export function selectEnchantOutput(enchant: EnchantOptions): BuildResult {
  return buildEnchantCommand(enchant)
}

export function selectXpOutput(xp: XpOptions): BuildResult {
  return buildXpCommand(xp)
}

export function selectTellrawOutput(tellraw: TellrawOptions): BuildResult {
  return buildTellrawCommand(tellraw)
}

export function selectTitleOutput(title: TitleOptions): BuildResult {
  return buildTitleCommand(title)
}

export function selectSoundOutput(sound: SoundOptions): BuildResult {
  return buildSoundCommand(sound)
}

export function selectBossbarOutput(bossbar: BossbarOptions): BuildResult {
  return buildBossbarCommands(bossbar)
}

export function selectScoreboardOutput(scoreboard: ScoreboardOptions): BuildResult {
  return buildScoreboardCommand(scoreboard)
}

export function selectParticleOutput(particle: ParticleOptions): BuildResult {
  return buildParticleCommand(particle)
}

export function selectTimeOutput(time: TimeOptions): BuildResult {
  return buildTimeCommand(time)
}

export function selectWeatherOutput(weather: WorldOptions['weather']): BuildResult {
  return buildWeatherCommand(weather)
}

export function selectDifficultyOutput(
  difficulty: WorldOptions['difficulty']
): BuildResult {
  return buildDifficultyCommand(difficulty)
}

export function selectTagOutput(tag: TagOptions): BuildResult {
  return buildTagCommand(tag)
}

export function selectClearOutput(clear: ClearOptions): BuildResult {
  return buildClearCommand(clear)
}

export function selectGameruleOutput(gamerule: GameruleOptions): BuildResult {
  return buildGameruleCommand(gamerule)
}

export function selectWorldborderOutput(worldborder: WorldborderOptions): BuildResult {
  return buildWorldborderCommand(worldborder)
}

export function selectTeamOutput(team: TeamOptions): BuildResult {
  return buildTeamCommands(team)
}

export function selectSpawnpointOutput(spawnpoint: SpawnpointOptions): BuildResult {
  return buildSpawnpointCommand(spawnpoint)
}

export function selectWorldSpawnOutput(worldSpawn: WorldSpawnOptions): BuildResult {
  return buildWorldSpawnCommand(worldSpawn)
}

export function selectForceloadOutput(forceload: ForceloadOptions): BuildResult {
  return buildForceloadCommand(forceload)
}

export function selectAttributeOutput(attribute: AttributeOptions): BuildResult {
  return buildAttributeCommand(attribute)
}

export function selectAdvancementOutput(advancement: AdvancementOptions): BuildResult {
  return buildAdvancementCommand(advancement)
}

export function selectFunctionOutput(fn: FunctionOptions): BuildResult {
  return buildFunctionCommand(fn)
}

export function selectScheduleOutput(schedule: ScheduleOptions): BuildResult {
  return buildScheduleCommand(schedule)
}

export function selectItemCommandOutput(
  itemCommand: ItemOptions,
  engine: 'components' | 'nbt' | 'legacy' = 'components'
): BuildResult {
  return buildItemCommand(itemCommand, engine)
}

export function selectDataCommandOutput(dataCommand: DataOptions): BuildResult {
  return buildDataCommand(dataCommand)
}

export function selectLootOutput(
  loot: LootOptions,
  engine: 'components' | 'nbt' | 'legacy' = 'components'
): BuildResult {
  return buildLootCommand(loot, engine)
}
