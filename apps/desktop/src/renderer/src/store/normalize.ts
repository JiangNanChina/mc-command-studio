// 项目文件/自动保存的容错归一化，供 store 与测试使用。
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
import type {
  AutomationOptions,
  DatapackDataFileDraft,
  DatapackDraft,
  ProjectPayload
} from './model'
import { defaultDatapackDraft, emptyGeneric } from './defaults'

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

function normalizeSpreadplayers(
  input: Partial<SpreadplayersOptions> | undefined
): SpreadplayersOptions {
  const fallback = createDefaultSpreadplayersOptions()
  if (!input) return fallback
  return {
    centerX: typeof input.centerX === 'string' ? input.centerX : fallback.centerX,
    centerZ: typeof input.centerZ === 'string' ? input.centerZ : fallback.centerZ,
    spreadDistance:
      typeof input.spreadDistance === 'string' ? input.spreadDistance : fallback.spreadDistance,
    maxRange: typeof input.maxRange === 'string' ? input.maxRange : fallback.maxRange,
    underEnabled: Boolean(input.underEnabled),
    maxHeight: typeof input.maxHeight === 'string' ? input.maxHeight : fallback.maxHeight,
    respectTeams: input.respectTeams !== false,
    targets: input.targets?.base ? input.targets : fallback.targets
  }
}

function normalizeRide(input: Partial<RideOptions> | undefined): RideOptions {
  const fallback = createDefaultRideOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    action: input.action === 'dismount' ? 'dismount' : 'mount',
    vehicle: input.vehicle?.base ? input.vehicle : fallback.vehicle
  }
}

function normalizeRandom(input: Partial<RandomOptions> | undefined): RandomOptions {
  const fallback = createDefaultRandomOptions()
  if (!input) return fallback
  return {
    mode: input.mode === 'roll' ? 'roll' : 'value',
    range: typeof input.range === 'string' ? input.range : fallback.range,
    sequence: typeof input.sequence === 'string' ? input.sequence : fallback.sequence
  }
}

function normalizeTick(input: Partial<TickOptions> | undefined): TickOptions {
  const fallback = createDefaultTickOptions()
  if (!input) return fallback
  const actions: TickOptions['action'][] = [
    'freeze',
    'unfreeze',
    'sprint',
    'sprintStop',
    'rate',
    'step',
    'stepStop'
  ]
  return {
    action: actions.includes(input.action as TickOptions['action'])
      ? (input.action as TickOptions['action'])
      : 'freeze',
    rate: typeof input.rate === 'string' ? input.rate : fallback.rate,
    time: typeof input.time === 'string' ? input.time : fallback.time
  }
}

function normalizeSocial(input: Partial<SocialOptions> | undefined): SocialOptions {
  const fallback = createDefaultSocialOptions()
  if (!input) return fallback
  return {
    message: typeof input.message === 'string' ? input.message : fallback.message,
    target: input.target?.base ? input.target : fallback.target,
    uuids: Boolean(input.uuids),
    reason: typeof input.reason === 'string' ? input.reason : fallback.reason
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

export function normalizeProjectPayload(input: unknown): ProjectPayload {
  const data = (input ?? {}) as Partial<ProjectPayload>
  return {
    activeCommandId: typeof data.activeCommandId === 'string' ? data.activeCommandId : null,
    give: normalizeGive(data.give),
    nbtGive: normalizeNbtGive(data.nbtGive),
    gamemode: normalizeGamemode(data.gamemode),
    damage: normalizeDamage(data.damage),
    rotate: normalizeRotate(data.rotate),
    spreadplayers: normalizeSpreadplayers(data.spreadplayers),
    ride: normalizeRide(data.ride),
    random: normalizeRandom(data.random),
    tick: normalizeTick(data.tick),
    social: normalizeSocial(data.social),
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

