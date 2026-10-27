import {
  buildCommandBlockSetblock,
  hasErrors,
  type BuildResult,
  type BossbarOptions,
  type ChainOptions,
  type CloneOptions,
  type CommandBlockOptions,
  type Diagnostic,
  type EffectOptions,
  type EnchantOptions,
  type ExecuteOptions,
  type FillOptions,
  type GiveOptions,
  type NbtGiveOptions,
  type GamemodeOptions,
  type DamageOptions,
  type RotateOptions,
  type SpreadplayersOptions,
  type RideOptions,
  type RandomOptions,
  type TickOptions,
  type SocialOptions,
  type SetblockOptions,
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
  type ItemOptions,
  type DataOptions,
  type LootOptions,
  type SoundOptions,
  type SummonOptions,
  type TeleportOptions,
  type TellrawOptions,
  type TitleOptions,
  type VersionPack,
  type XpOptions
} from '@mcstudio/core'
import type { AutomationOptions } from '../store'
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
  selectXpOutput,
  type GenericDraft,
  type OutputMode
} from '../store'

export interface CurrentOutput {
  command: BuildResult
  text: string
  diagnostics: Diagnostic[]
  hasErrors: boolean
}

export function getCommandOutput(
  pack: VersionPack | null,
  activeCommandId: string | null,
  give: GiveOptions,
  nbtGive: NbtGiveOptions,
  gamemode: GamemodeOptions,
  damage: DamageOptions,
  rotate: RotateOptions,
  spreadplayers: SpreadplayersOptions,
  ride: RideOptions,
  random: RandomOptions,
  tick: TickOptions,
  social: SocialOptions,
  summon: SummonOptions,
  setblock: SetblockOptions,
  execute: ExecuteOptions,
  teleport: TeleportOptions,
  effect: EffectOptions,
  fill: FillOptions,
  clone: CloneOptions,
  chain: ChainOptions,
  enchant: EnchantOptions,
  xp: XpOptions,
  tellraw: TellrawOptions,
  title: TitleOptions,
  sound: SoundOptions,
  bossbar: BossbarOptions,
  scoreboard: ScoreboardOptions,
  particle: ParticleOptions,
  world: WorldOptions,
  tag: TagOptions,
  clear: ClearOptions,
  gamerule: GameruleOptions,
  worldborder: WorldborderOptions,
  team: TeamOptions,
  spawnpoint: SpawnpointOptions,
  worldSpawn: WorldSpawnOptions,
  forceload: ForceloadOptions,
  attribute: AttributeOptions,
  automation: AutomationOptions,
  itemCommand: ItemOptions,
  dataCommand: DataOptions,
  loot: LootOptions,
  generic: GenericDraft
): BuildResult {
  if (!activeCommandId) return { text: '', diagnostics: [] }
  if (activeCommandId === 'give') {
    return pack?.manifest.engine === 'nbt'
      ? selectNbtGiveOutput(nbtGive)
      : selectGiveOutput(give)
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
  if (!pack) return { text: '', diagnostics: [] }
  return selectGenericOutput(pack, { ...generic, root: generic.root ?? activeCommandId })
}

export function getCurrentOutput(
  pack: VersionPack | null,
  activeCommandId: string | null,
  give: GiveOptions,
  nbtGive: NbtGiveOptions,
  gamemode: GamemodeOptions,
  damage: DamageOptions,
  rotate: RotateOptions,
  spreadplayers: SpreadplayersOptions,
  ride: RideOptions,
  random: RandomOptions,
  tick: TickOptions,
  social: SocialOptions,
  summon: SummonOptions,
  setblock: SetblockOptions,
  execute: ExecuteOptions,
  teleport: TeleportOptions,
  effect: EffectOptions,
  fill: FillOptions,
  clone: CloneOptions,
  chain: ChainOptions,
  enchant: EnchantOptions,
  xp: XpOptions,
  tellraw: TellrawOptions,
  title: TitleOptions,
  sound: SoundOptions,
  bossbar: BossbarOptions,
  scoreboard: ScoreboardOptions,
  particle: ParticleOptions,
  world: WorldOptions,
  tag: TagOptions,
  clear: ClearOptions,
  gamerule: GameruleOptions,
  worldborder: WorldborderOptions,
  team: TeamOptions,
  spawnpoint: SpawnpointOptions,
  worldSpawn: WorldSpawnOptions,
  forceload: ForceloadOptions,
  attribute: AttributeOptions,
  automation: AutomationOptions,
  itemCommand: ItemOptions,
  dataCommand: DataOptions,
  loot: LootOptions,
  generic: GenericDraft,
  outputMode: OutputMode,
  commandBlock: CommandBlockOptions
): CurrentOutput {
  const command = getCommandOutput(
    pack,
    activeCommandId,
    give,
    nbtGive,
    gamemode,
    damage,
    rotate,
    spreadplayers,
    ride,
    random,
    tick,
    social,
    summon,
    setblock,
    execute,
    teleport,
    effect,
    fill,
    clone,
    chain,
    enchant,
    xp,
    tellraw,
    title,
    sound,
    bossbar,
    scoreboard,
    particle,
    world,
    tag,
    clear,
    gamerule,
    worldborder,
    team,
    spawnpoint,
    worldSpawn,
    forceload,
    attribute,
    automation,
    itemCommand,
    dataCommand,
    loot,
    generic
  )
  if (outputMode === 'command') {
    return {
      command,
      text: command.text,
      diagnostics: command.diagnostics,
      hasErrors: hasErrors(command.diagnostics)
    }
  }

  const commandBlockResult = buildCommandBlockSetblock(command.text, commandBlock)
  const diagnostics = [...command.diagnostics, ...commandBlockResult.diagnostics]
  return {
    command,
    text: commandBlockResult.text,
    diagnostics,
    hasErrors: hasErrors(diagnostics)
  }
}
