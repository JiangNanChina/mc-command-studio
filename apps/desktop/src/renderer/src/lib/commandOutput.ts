import {
  buildCommandBlockSetblock,
  hasErrors,
  type BuildResult,
  type CommandBlockOptions,
  type Diagnostic,
  type ExecuteOptions,
  type GiveOptions,
  type SetblockOptions,
  type SummonOptions,
  type VersionPack
} from '@mcstudio/core'
import {
  selectExecuteOutput,
  selectGenericOutput,
  selectGiveOutput,
  selectSetblockOutput,
  selectSummonOutput,
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
  generic: GenericDraft
): BuildResult {
  if (!activeCommandId) return { text: '', diagnostics: [] }
  if (activeCommandId === 'give') return selectGiveOutput(give)
  if (activeCommandId === 'summon') return selectSummonOutput(summon)
  if (activeCommandId === 'setblock') return selectSetblockOutput(setblock)
  if (activeCommandId === 'execute') return selectExecuteOutput(execute)
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
  generic: GenericDraft,
  outputMode: OutputMode,
  commandBlock: CommandBlockOptions
): CurrentOutput {
  const command = getCommandOutput(pack, activeCommandId, give, summon, setblock, execute, generic)
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
