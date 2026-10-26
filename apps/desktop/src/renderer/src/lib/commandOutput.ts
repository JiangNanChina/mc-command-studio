import {
  buildCommandBlockSetblock,
  hasErrors,
  type BuildResult,
  type ChainOptions,
  type CloneOptions,
  type CommandBlockOptions,
  type Diagnostic,
  type EffectOptions,
  type ExecuteOptions,
  type FillOptions,
  type GiveOptions,
  type SetblockOptions,
  type SummonOptions,
  type TeleportOptions,
  type VersionPack
} from '@mcstudio/core'
import {
  selectChainOutput,
  selectCloneOutput,
  selectEffectOutput,
  selectExecuteOutput,
  selectFillOutput,
  selectGenericOutput,
  selectGiveOutput,
  selectSetblockOutput,
  selectSummonOutput,
  selectTeleportOutput,
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
