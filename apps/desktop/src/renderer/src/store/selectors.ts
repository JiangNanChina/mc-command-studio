// 输出命令选择器：只依赖 core 构建器与类型，不依赖 Zustand。
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
  buildLootCommand,
  buildSoundCommand,
  buildSummonCommand,
  buildTeleportCommand,
  buildTellrawCommand,
  buildTitleCommand,
  buildXpCommand,
  serializeGeneric,
  type BossbarOptions,
  type BuildResult,
  type ChainOptions,
  type CloneOptions,
  type CommandNodeData,
  type EffectOptions,
  type EnchantOptions,
  type ExecuteOptions,
  type FillOptions,
  type GenericStep,
  type GiveOptions,
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
  type SetblockOptions,
  type SoundOptions,
  type SummonOptions,
  type TeleportOptions,
  type TellrawOptions,
  type TitleOptions,
  type VersionPack,
  type XpOptions
} from '@mcstudio/core'
import type { GenericDraft } from './model'

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

export function selectGiveOutput(give: GiveOptions, gameVersion?: string): BuildResult {
  return buildGiveCommand(give, gameVersion)
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

export function selectSpreadplayersOutput(spreadplayers: SpreadplayersOptions): BuildResult {
  return buildSpreadplayersCommand(spreadplayers)
}

export function selectRideOutput(ride: RideOptions): BuildResult {
  return buildRideCommand(ride)
}

export function selectRandomOutput(random: RandomOptions): BuildResult {
  return buildRandomCommand(random)
}

export function selectTickOutput(tick: TickOptions): BuildResult {
  return buildTickCommand(tick)
}

export function selectSocialOutput(social: SocialOptions, id: string): BuildResult {
  if (id === 'msg') return buildMsgCommand(social.target, social.message)
  if (id === 'kill') return buildKillCommand(social.target)
  if (id === 'list') return buildListCommand(social.uuids)
  if (id === 'seed') return buildSeedCommand()
  if (id === 'me') return buildMeCommand(social.message)
  if (id === 'kick') return buildKickCommand(social.target, social.reason)
  if (id === 'op') return buildOpCommand(social.target, true)
  if (id === 'deop') return buildOpCommand(social.target, false)
  return buildSayCommand(social.message)
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

export function selectParticleOutput(
  particle: ParticleOptions,
  engine: 'components' | 'nbt' | 'legacy' = 'components'
): BuildResult {
  return buildParticleCommand(particle, engine)
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

export function selectAttributeOutput(
  attribute: AttributeOptions,
  engine: 'components' | 'nbt' | 'legacy' = 'components'
): BuildResult {
  return buildAttributeCommand(attribute, engine)
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
