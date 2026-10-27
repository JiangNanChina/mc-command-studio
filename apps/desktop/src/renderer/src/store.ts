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
  buildSpreadplayersCommand,
  buildRideCommand,
  buildRandomCommand,
  buildTickCommand,
  buildSayCommand,
  buildMsgCommand,
  buildKillCommand,
  buildListCommand,
  buildSeedCommand,
  buildMeCommand,
  buildKickCommand,
  buildOpCommand,
  createDefaultNbtGiveOptions,
  createDefaultGamemodeOptions,
  createDefaultDamageOptions,
  createDefaultRotateOptions,
  createDefaultSpreadplayersOptions,
  createDefaultRideOptions,
  createDefaultRandomOptions,
  createDefaultTickOptions,
  createDefaultSocialOptions,
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
  type SpreadplayersOptions,
  type RideOptions,
  type RandomOptions,
  type TickOptions,
  type SocialOptions,
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
import { applyPresetBundle, loadPresetBundle } from './lib/customPresets'
import type {
  AutomationOptions,
  DatapackDataFileDraft,
  DatapackDraft,
  DatapackFunctionDraft,
  DialogName,
  GenericDraft,
  OutputMode,
  ProjectPayload,
  Toast
} from './store/model'
import {
  DATAPACK_FILE_TEMPLATES,
  defaultComponent,
  defaultDatapackDraft,
  defaultExecuteClause,
  emptyGeneric,
  newClauseId
} from './store/defaults'
import { normalizeProjectPayload } from './store/normalize'

export type {
  AutomationOptions,
  DatapackDataFileDraft,
  DatapackDraft,
  DatapackFunctionDraft,
  DialogName,
  GenericDraft,
  OutputMode,
  ProjectPayload,
  Toast
} from './store/model'

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
  spreadplayers: SpreadplayersOptions
  ride: RideOptions
  random: RandomOptions
  tick: TickOptions
  social: SocialOptions
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
  updateSpreadplayers: (patch: Partial<SpreadplayersOptions>) => void
  updateRide: (patch: Partial<RideOptions>) => void
  updateRandom: (patch: Partial<RandomOptions>) => void
  updateTick: (patch: Partial<TickOptions>) => void
  updateSocial: (patch: Partial<SocialOptions>) => void
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

function documentSnapshot(state: AppStore): string {
  return JSON.stringify({
    projectName: state.projectName,
    give: state.give,
    nbtGive: state.nbtGive,
    gamemode: state.gamemode,
    damage: state.damage,
    rotate: state.rotate,
    spreadplayers: state.spreadplayers,
    ride: state.ride,
    random: state.random,
    tick: state.tick,
    social: state.social,
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
    spreadplayers: createDefaultSpreadplayersOptions(),
    ride: createDefaultRideOptions(),
    random: createDefaultRandomOptions(),
    tick: createDefaultTickOptions(),
    social: createDefaultSocialOptions(),
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

    updateSpreadplayers: (patch) => {
      set((state) => {
        state.spreadplayers = { ...state.spreadplayers, ...patch }
        state.dirty = true
      })
    },

    updateRide: (patch) => {
      set((state) => {
        state.ride = { ...state.ride, ...patch }
        state.dirty = true
      })
    },

    updateRandom: (patch) => {
      set((state) => {
        state.random = { ...state.random, ...patch }
        state.dirty = true
      })
    },

    updateTick: (patch) => {
      set((state) => {
        state.tick = { ...state.tick, ...patch }
        state.dirty = true
      })
    },

    updateSocial: (patch) => {
      set((state) => {
        state.social = { ...state.social, ...patch }
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
        state.spreadplayers = createDefaultSpreadplayersOptions()
        state.ride = createDefaultRideOptions()
        state.random = createDefaultRandomOptions()
        state.tick = createDefaultTickOptions()
        state.social = createDefaultSocialOptions()
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
        spreadplayers: state.spreadplayers,
        ride: state.ride,
        random: state.random,
        tick: state.tick,
        social: state.social,
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
      const file = createProjectFile(
        state.projectName,
        state.activePackId,
        payload,
        loadPresetBundle()
      )
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
      const payload = normalizeProjectPayload(project.data)
      applyPresetBundle(project.presets)
      set((state) => {
        state.activeCommandId = payload.activeCommandId
        state.give = payload.give
        state.nbtGive = payload.nbtGive
        state.gamemode = payload.gamemode
        state.damage = payload.damage
        state.rotate = payload.rotate
        state.spreadplayers = payload.spreadplayers
        state.ride = payload.ride
        state.random = payload.random
        state.tick = payload.tick
        state.social = payload.social
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

export * from './store/selectors'
