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
  type SetblockOptions,
  type ScoreboardOptions,
  type ParticleOptions,
  type WorldOptions,
  type TagOptions,
  type ClearOptions,
  type GameruleOptions,
  type WorldborderOptions,
  type SoundOptions,
  type SummonOptions,
  type TeleportOptions,
  type TellrawOptions,
  type TitleOptions,
  type VersionPack,
  type XpOptions
} from '@mcstudio/core'
import {
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
  generic: GenericDraft
): BuildResult {
  if (!activeCommandId) return { text: '', diagnostics: [] }
  if (activeCommandId === 'give') return selectGiveOutput(give)
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
  if (activeCommandId === 'particle') return selectParticleOutput(particle)
  if (activeCommandId === 'time') return selectTimeOutput(world.time)
  if (activeCommandId === 'weather') return selectWeatherOutput(world.weather)
  if (activeCommandId === 'difficulty') return selectDifficultyOutput(world.difficulty)
  if (activeCommandId === 'tag') return selectTagOutput(tag)
  if (activeCommandId === 'clear') return selectClearOutput(clear)
  if (activeCommandId === 'gamerule') return selectGameruleOutput(gamerule)
  if (activeCommandId === 'worldborder') return selectWorldborderOutput(worldborder)
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
  generic: GenericDraft,
  outputMode: OutputMode,
  commandBlock: CommandBlockOptions
): CurrentOutput {
  const command = getCommandOutput(
    pack,
    activeCommandId,
    give,
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
