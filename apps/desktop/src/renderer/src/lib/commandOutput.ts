import { buildCommandBlockSetblock, error, hasErrors, type BuildResult, type Diagnostic, type VersionPack } from '@mcstudio/core'
import type { ProjectPayload } from '../store/model'
import { buildQuickCommand, isNbtQuickSafe, isQuickCommand } from './quickCommands'
import { supportsLegacyForm } from './packCompat'
import {
  selectNbtGiveOutput,
  selectGamemodeOutput,
  selectDamageOutput,
  selectRotateOutput,
  selectSpreadplayersOutput,
  selectRideOutput,
  selectRandomOutput,
  selectTickOutput,
  selectSocialOutput,
  selectChainOutput,
  selectCloneOutput,
  selectBossbarOutput,
  selectEffectOutput,
  selectEnchantOutput,
  selectExecuteOutput,
  selectFillOutput,
  selectGenericOutput,
  selectGiveOutput,
  selectSetblockOutput,
  selectScoreboardOutput,
  selectParticleOutput,
  selectTimeOutput,
  selectWeatherOutput,
  selectDifficultyOutput,
  selectTagOutput,
  selectClearOutput,
  selectGameruleOutput,
  selectWorldborderOutput,
  selectTeamOutput,
  selectSpawnpointOutput,
  selectWorldSpawnOutput,
  selectForceloadOutput,
  selectAttributeOutput,
  selectAdvancementOutput,
  selectFunctionOutput,
  selectScheduleOutput,
  selectItemCommandOutput,
  selectDataCommandOutput,
  selectLootOutput,
  selectSoundOutput,
  selectSummonOutput,
  selectTellrawOutput,
  selectTeleportOutput,
  selectTitleOutput,
  selectXpOutput
} from '../store/selectors'


export interface CommandOutputState extends ProjectPayload {
  pack: VersionPack | null
}

export interface CurrentOutput {
  command: BuildResult
  text: string
  diagnostics: Diagnostic[]
  hasErrors: boolean
}

function usesNbtQuickForm(state: CommandOutputState): boolean {
  return state.pack?.manifest.engine !== 'components' &&
    state.pack?.manifest.engine !== 'legacy' && isNbtQuickSafe(state.activeCommandId)
}

function usesGenericForm(state: CommandOutputState): boolean {
  if (state.activeCommandId === 'chain') return false
  return state.pack?.manifest.engine !== 'components' &&
    (state.pack?.manifest.engine === 'legacy' || !supportsLegacyForm(state.activeCommandId ?? ''))
}

/** 所有预览、状态栏与复制入口使用相同的文档和版本路由。 */
export function getCommandOutput(state: CommandOutputState): BuildResult {
  const { pack, activeCommandId, give, nbtGive, gamemode, damage, rotate, spreadplayers, ride, random, tick, social, summon, setblock, execute, teleport, effect, fill, clone, chain, enchant, xp, tellraw, title, sound, bossbar, scoreboard, particle, world, tag, clear, gamerule, worldborder, team, spawnpoint, worldSpawn, forceload, attribute, automation, itemCommand, dataCommand, loot, generic } = state
  if (!activeCommandId || ['datapack', 'ooc', 'legacy-tools'].includes(activeCommandId)) return { text: '', diagnostics: [] }
  if (activeCommandId !== 'chain' && !pack?.commands.children?.[activeCommandId]) {
    return { text: '', diagnostics: [error('command.unsupported', '当前版本不支持此命令', 'command')] }
  }
  if (usesNbtQuickForm(state)) return buildQuickCommand(pack, activeCommandId, state.quickDrafts[activeCommandId])
  if (usesGenericForm(state)) return selectGenericOutput(pack, { ...generic, root: generic.root ?? activeCommandId })
  if (activeCommandId === 'give') {
    return pack?.manifest.engine === 'nbt'
      ? selectNbtGiveOutput(nbtGive)
      : selectGiveOutput(give, pack?.manifest.gameVersion)
  }
  if (activeCommandId === 'gamemode') return selectGamemodeOutput(gamemode)
  if (activeCommandId === 'damage') return selectDamageOutput(damage)
  if (activeCommandId === 'rotate') return selectRotateOutput(rotate)
  if (activeCommandId === 'spreadplayers') return selectSpreadplayersOutput(spreadplayers)
  if (activeCommandId === 'ride') return selectRideOutput(ride)
  if (activeCommandId === 'random') return selectRandomOutput(random)
  if (activeCommandId === 'tick') return selectTickOutput(tick)
  if (
    activeCommandId === 'say' ||
    activeCommandId === 'msg' ||
    activeCommandId === 'kill' ||
    activeCommandId === 'list' ||
    activeCommandId === 'seed' ||
    activeCommandId === 'me' ||
    activeCommandId === 'kick' ||
    activeCommandId === 'op' ||
    activeCommandId === 'deop'
  ) {
    return selectSocialOutput(social, activeCommandId)
  }
  if (activeCommandId === 'summon') return selectSummonOutput(summon)
  if (activeCommandId === 'setblock') return selectSetblockOutput(setblock)
  if (activeCommandId === 'execute') return selectExecuteOutput(execute)
  if (activeCommandId === 'tp') return selectTeleportOutput(teleport)
  if (activeCommandId === 'effect') return selectEffectOutput(effect)
  if (activeCommandId === 'fill') return selectFillOutput(fill)
  if (activeCommandId === 'clone') return selectCloneOutput(clone)
  if (activeCommandId === 'chain') return selectChainOutput(chain)
  if (activeCommandId === 'enchant') return selectEnchantOutput(enchant)
  if (activeCommandId === 'xp') return selectXpOutput(xp)
  if (activeCommandId === 'tellraw') return selectTellrawOutput(tellraw)
  if (activeCommandId === 'title') return selectTitleOutput(title)
  if (activeCommandId === 'bossbar') return selectBossbarOutput(bossbar)
  if (activeCommandId === 'scoreboard') return selectScoreboardOutput(scoreboard)
  if (activeCommandId === 'particle') {
    return selectParticleOutput(particle, pack?.manifest.engine ?? 'components')
  }
  if (activeCommandId === 'time') return selectTimeOutput(world.time)
  if (activeCommandId === 'weather') return selectWeatherOutput(world.weather)
  if (activeCommandId === 'difficulty') return selectDifficultyOutput(world.difficulty)
  if (activeCommandId === 'tag') return selectTagOutput(tag)
  if (activeCommandId === 'clear') return selectClearOutput(clear)
  if (activeCommandId === 'gamerule') return selectGameruleOutput(gamerule)
  if (activeCommandId === 'worldborder') return selectWorldborderOutput(worldborder)
  if (activeCommandId === 'team') return selectTeamOutput(team)
  if (activeCommandId === 'spawnpoint') return selectSpawnpointOutput(spawnpoint)
  if (activeCommandId === 'setworldspawn') return selectWorldSpawnOutput(worldSpawn)
  if (activeCommandId === 'forceload') return selectForceloadOutput(forceload)
  if (activeCommandId === 'attribute') {
    return selectAttributeOutput(attribute, pack?.manifest.engine ?? 'components')
  }
  if (activeCommandId === 'advancement') return selectAdvancementOutput(automation.advancement)
  if (activeCommandId === 'function') return selectFunctionOutput(automation.function)
  if (activeCommandId === 'schedule') return selectScheduleOutput(automation.schedule)
  if (activeCommandId === 'item') {
    return selectItemCommandOutput(itemCommand, pack?.manifest.engine ?? 'components')
  }
  if (activeCommandId === 'data') return selectDataCommandOutput(dataCommand)
  if (activeCommandId === 'loot') {
    return selectLootOutput(loot, pack?.manifest.engine ?? 'components')
  }
  if (activeCommandId === 'playsound' || activeCommandId === 'stopsound') {
    return selectSoundOutput(sound)
  }
  if (isQuickCommand(activeCommandId)) return buildQuickCommand(pack, activeCommandId, state.quickDrafts[activeCommandId])
  if (!pack) return { text: '', diagnostics: [] }
  return selectGenericOutput(pack, { ...generic, root: generic.root ?? activeCommandId })
}

export function getCurrentOutput(state: CommandOutputState): CurrentOutput {
  const command = getCommandOutput(state)
  if (state.outputMode === 'command') {
    return { command, text: command.text, diagnostics: command.diagnostics, hasErrors: hasErrors(command.diagnostics) }
  }
  const commandBlockResult = buildCommandBlockSetblock(command.text, state.commandBlock)
  const diagnostics = [...command.diagnostics, ...commandBlockResult.diagnostics]
  return { command, text: commandBlockResult.text, diagnostics, hasErrors: hasErrors(diagnostics) }
}

const DRAFT_KEYS: Partial<Record<string, keyof ProjectPayload>> = {
  tp: 'teleport', playsound: 'sound', stopsound: 'sound', time: 'world', weather: 'world', difficulty: 'world',
  setworldspawn: 'worldSpawn', advancement: 'automation', function: 'automation', schedule: 'automation',
  item: 'itemCommand', data: 'dataCommand', say: 'social', msg: 'social', kill: 'social', list: 'social',
  seed: 'social', me: 'social', kick: 'social', op: 'social', deop: 'social'
}

const QUICK_WITH_SPECIALIZED_FORM = new Set(['kill', 'kick', 'op', 'deop', 'say', 'me', 'msg', 'list', 'seed'])

/** 只在当前命令的草稿或输出设置改变时重新构建，界面事件不触发整套输出计算。 */
export function createCurrentOutputSelector(): (state: CommandOutputState) => CurrentOutput {
  let previousInputs: unknown[] = []
  let previousOutput: CurrentOutput | undefined
  return (state) => {
    const id = state.activeCommandId ?? ''
    let draft: unknown
    if (usesNbtQuickForm(state)) draft = state.quickDrafts[id]
    else if (usesGenericForm(state)) draft = state.generic
    else if (isQuickCommand(id) && !QUICK_WITH_SPECIALIZED_FORM.has(id)) draft = state.quickDrafts[id]
    else if (id === 'give') draft = state.pack?.manifest.engine === 'nbt' ? state.nbtGive : state.give
    else if (Object.hasOwn(DRAFT_KEYS, id)) draft = state[DRAFT_KEYS[id]!]
    else if (Object.hasOwn(state, id)) draft = state[id as keyof ProjectPayload]
    else if (isQuickCommand(id)) draft = state.quickDrafts[id]
    else draft = state.generic
    const inputs = [state.pack, id, draft, state.outputMode, state.commandBlock]
    if (previousOutput && inputs.every((value, index) => Object.is(value, previousInputs[index]))) return previousOutput
    previousInputs = inputs
    previousOutput = getCurrentOutput(state)
    return previousOutput
  }
}
