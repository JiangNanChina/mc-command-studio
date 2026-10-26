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

export interface DatapackDraft {
  namespace: string
  description: string
  functions: DatapackFunctionDraft[]
  activeFunctionId: string
  loadFunction: string
  tickFunction: string
}

function defaultDatapackDraft(): DatapackDraft {
  return {
    namespace: 'mcstudio',
    description: 'MC 指令工坊数据包',
    functions: [{ id: 'main', name: 'main', commands: 'say 你好' }],
    activeFunctionId: 'main',
    loadFunction: '',
    tickFunction: ''
  }
}

export interface ProjectPayload {
  activeCommandId: string | null
  give: GiveOptions
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
  updateFill: (patch: Partial<FillOptions>) => void
  updateClone: (patch: Partial<CloneOptions>) => void
  updateEnchant: (patch: Partial<EnchantOptions>) => void
  updateXp: (patch: Partial<XpOptions>) => void
  updateTellraw: (patch: Partial<TellrawOptions>) => void
  updateTitle: (patch: Partial<TitleOptions>) => void
  updateSound: (patch: Partial<SoundOptions>) => void
  updateBossbar: (patch: Partial<BossbarOptions>) => void
  openDatapack: () => void
  updateDatapackMeta: (patch: Partial<Pick<DatapackDraft, 'namespace' | 'description'>>) => void
  addDatapackFunction: () => void
  removeDatapackFunction: (id: string) => void
  selectDatapackFunction: (id: string) => void
  updateDatapackFunction: (id: string, patch: Partial<Pick<DatapackFunctionDraft, 'name' | 'commands'>>) => void
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
      input.action === 'update' || input.action === 'remove' ? input.action : 'create',
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
    players: input.players?.base ? input.players : fallback.players
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
        : ''
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
        if (id && id !== 'give') {
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
