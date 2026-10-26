import { error } from './diagnostics'
import { serializePosition, type Position } from './position'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export interface SpawnpointOptions {
  target: Selector
  position: Position
  angleEnabled: boolean
  yaw: string
  pitch: string
}

export interface WorldSpawnOptions {
  position: Position
  angleEnabled: boolean
  yaw: string
  pitch: string
}

export type ForceloadAction = 'add' | 'remove' | 'remove-all' | 'query'

export interface ForceloadOptions {
  action: ForceloadAction
  fromX: string
  fromZ: string
  toEnabled: boolean
  toX: string
  toZ: string
}

export function createDefaultSpawnpointOptions(): SpawnpointOptions {
  return {
    target: { base: '@s' },
    position: { x: '~', y: '~', z: '~' },
    angleEnabled: false,
    yaw: '0',
    pitch: '0'
  }
}

export function createDefaultWorldSpawnOptions(): WorldSpawnOptions {
  return {
    position: { x: '0', y: '64', z: '0' },
    angleEnabled: false,
    yaw: '0',
    pitch: '0'
  }
}

export function createDefaultForceloadOptions(): ForceloadOptions {
  return {
    action: 'add',
    fromX: '0',
    fromZ: '0',
    toEnabled: false,
    toX: '1',
    toZ: '1'
  }
}

function isInteger(value: string): boolean {
  return /^-?\d+$/.test(value.trim())
}

function isAngle(value: string): boolean {
  return /^-?(?:\d+\.?\d*|\.\d+)$/.test(value.trim())
}

function angleDiagnostics(options: {
  angleEnabled: boolean
  yaw: string
  pitch: string
}): Diagnostic[] {
  if (!options.angleEnabled) return []
  const diagnostics: Diagnostic[] = []
  if (!isAngle(options.yaw)) diagnostics.push(error('spawn.yaw', 'yaw 必须是数字', 'yaw'))
  if (!isAngle(options.pitch)) {
    diagnostics.push(error('spawn.pitch', 'pitch 必须是数字', 'pitch'))
  }
  return diagnostics
}

export function buildSpawnpointCommand(options: SpawnpointOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  const position = serializePosition(options.position)
  diagnostics.push(...target.diagnostics, ...position.diagnostics)
  diagnostics.push(...angleDiagnostics(options))
  const parts = ['spawnpoint', target.text, position.text]
  if (options.angleEnabled) parts.push(options.yaw.trim(), options.pitch.trim())
  return { text: parts.join(' '), diagnostics }
}

export function buildWorldSpawnCommand(options: WorldSpawnOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const position = serializePosition(options.position)
  diagnostics.push(...position.diagnostics)
  diagnostics.push(...angleDiagnostics(options))
  const parts = ['setworldspawn', position.text]
  if (options.angleEnabled) parts.push(options.yaw.trim(), options.pitch.trim())
  return { text: parts.join(' '), diagnostics }
}

export function buildForceloadCommand(options: ForceloadOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (options.action === 'remove-all') {
    return { text: 'forceload remove all', diagnostics }
  }

  const pair = (x: string, z: string, label: string): string | null => {
    if (!isInteger(x) || !isInteger(z)) {
      diagnostics.push(error(`forceload.${label}`, `${label} 坐标必须是整数`, label))
      return null
    }
    return `${x.trim()} ${z.trim()}`
  }

  if (options.action === 'query') {
    const from = pair(options.fromX, options.fromZ, 'from')
    return { text: from ? `forceload query ${from}` : 'forceload query', diagnostics }
  }

  const from = pair(options.fromX, options.fromZ, 'from')
  let command = `forceload ${options.action}`
  if (from) command += ` ${from}`
  if (options.toEnabled) {
    const to = pair(options.toX, options.toZ, 'to')
    if (to) command += ` ${to}`
  }
  return { text: command, diagnostics }
}
