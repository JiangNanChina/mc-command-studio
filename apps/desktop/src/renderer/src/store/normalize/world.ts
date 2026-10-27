// 世界/方块/计分板类命令命令的容错归一化。
import {
  createDefaultBossbarOptions,
  createDefaultCloneOptions,
  createDefaultFillOptions,
  createDefaultScoreboardOptions,
  createDefaultParticleOptions,
  createDefaultWorldOptions,
  createDefaultGameruleOptions,
  createDefaultWorldborderOptions,
  createDefaultTeamOptions,
  createDefaultSpawnpointOptions,
  createDefaultWorldSpawnOptions,
  createDefaultForceloadOptions,
  createDefaultSetblockOptions,
  type BossbarOptions,
  type CloneOptions,
  type FillOptions,
  type ScoreboardOptions,
  type ParticleOptions,
  type WorldOptions,
  type GameruleOptions,
  type WorldborderOptions,
  type TeamOptions,
  type SpawnpointOptions,
  type WorldSpawnOptions,
  type ForceloadOptions,
  type TimeOptions,
  type SetblockOptions
} from '@mcstudio/core'
import { normalizePosition, normalizeTextSegment } from './common'

export function normalizeSetblock(input: Partial<SetblockOptions> | undefined): SetblockOptions {
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

export function normalizeFill(input: Partial<FillOptions> | undefined): FillOptions {
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

export function normalizeClone(input: Partial<CloneOptions> | undefined): CloneOptions {
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

export function normalizeWorld(input: Partial<WorldOptions> | undefined): WorldOptions {
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

export function normalizeGamerule(input: Partial<GameruleOptions> | undefined): GameruleOptions {
  const fallback = createDefaultGameruleOptions()
  if (!input) return fallback
  return {
    action: input.action === 'query' ? 'query' : 'set',
    rule: typeof input.rule === 'string' ? input.rule : fallback.rule,
    type: input.type === 'integer' ? 'integer' : 'boolean',
    value: typeof input.value === 'string' ? input.value : fallback.value
  }
}

export function normalizeWorldborder(
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

export function normalizeTeam(input: Partial<TeamOptions> | undefined): TeamOptions {
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

export function normalizeSpawnpoint(input: Partial<SpawnpointOptions> | undefined): SpawnpointOptions {
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

export function normalizeWorldSpawn(input: Partial<WorldSpawnOptions> | undefined): WorldSpawnOptions {
  const fallback = createDefaultWorldSpawnOptions()
  if (!input) return fallback
  return {
    position: normalizePosition(input.position),
    angleEnabled: Boolean(input.angleEnabled),
    yaw: typeof input.yaw === 'string' ? input.yaw : fallback.yaw,
    pitch: typeof input.pitch === 'string' ? input.pitch : fallback.pitch
  }
}

export function normalizeForceload(input: Partial<ForceloadOptions> | undefined): ForceloadOptions {
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

export function normalizeParticle(input: Partial<ParticleOptions> | undefined): ParticleOptions {
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

export function normalizeScoreboard(input: Partial<ScoreboardOptions> | undefined): ScoreboardOptions {
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

export function normalizeBossbar(input: Partial<BossbarOptions> | undefined): BossbarOptions {
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
