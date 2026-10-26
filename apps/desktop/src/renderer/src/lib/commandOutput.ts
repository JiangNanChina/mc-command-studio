import {
  buildSetblockCommand,
  hasErrors,
  type BuildResult,
  type CommandBlockOptions,
  type Diagnostic,
  type GiveOptions,
  type VersionPack
} from '@mcstudio/core'
import {
  selectGenericOutput,
  selectGiveOutput,
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
  generic: GenericDraft
): BuildResult {
  if (!activeCommandId) return { text: '', diagnostics: [] }
  if (activeCommandId === 'give') return selectGiveOutput(give)
  if (!pack) return { text: '', diagnostics: [] }
  return selectGenericOutput(pack, { ...generic, root: generic.root ?? activeCommandId })
}

export function getCurrentOutput(
  pack: VersionPack | null,
  activeCommandId: string | null,
  give: GiveOptions,
  generic: GenericDraft,
  outputMode: OutputMode,
  commandBlock: CommandBlockOptions
): CurrentOutput {
  const command = getCommandOutput(pack, activeCommandId, give, generic)
  if (outputMode === 'command') {
    return {
      command,
      text: command.text,
      diagnostics: command.diagnostics,
      hasErrors: hasErrors(command.diagnostics)
    }
  }

  const setblock = buildSetblockCommand(command.text, commandBlock)
  const diagnostics = [...command.diagnostics, ...setblock.diagnostics]
  return {
    command,
    text: setblock.text,
    diagnostics,
    hasErrors: hasErrors(diagnostics)
  }
}
