import { error } from './diagnostics'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type GameMode = 'survival' | 'creative' | 'adventure' | 'spectator'

export interface GamemodeOptions {
  mode: GameMode
  target: Selector
}

export const GAME_MODES: { value: GameMode; label: string }[] = [
  { value: 'survival', label: '生存' },
  { value: 'creative', label: '创造' },
  { value: 'adventure', label: '冒险' },
  { value: 'spectator', label: '旁观' }
]

export function createDefaultGamemodeOptions(): GamemodeOptions {
  return { mode: 'creative', target: { base: '@s' } }
}

export function buildGamemodeCommand(options: GamemodeOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)
  if (!target.text.trim()) {
    diagnostics.push(error('gamemode.target', '目标不能为空', 'target'))
  }
  return { text: `gamemode ${options.mode} ${target.text}`, diagnostics }
}
