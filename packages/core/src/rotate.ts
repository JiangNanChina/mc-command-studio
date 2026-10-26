import { error } from './diagnostics'
import { serializePosition, type Position } from './position'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type RotateMode = 'rotation' | 'facingLocation' | 'facingEntity'
export type FacingAnchor = 'feet' | 'eyes'

export interface RotateOptions {
  target: Selector
  mode: RotateMode
  yaw: string
  pitch: string
  position: Position
  facingTarget: Selector
  anchor: FacingAnchor
}

export function createDefaultRotateOptions(): RotateOptions {
  return {
    target: { base: '@s' },
    mode: 'rotation',
    yaw: '0',
    pitch: '0',
    position: { x: '~', y: '~', z: '~' },
    facingTarget: { base: '@s' },
    anchor: 'eyes'
  }
}

function numberOrRelative(value: string): boolean {
  return /^~?-?(?:\d+\.?\d*|\.\d+)$/.test(value.trim())
}

export function buildRotateCommand(options: RotateOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)
  if (!target.text.trim()) {
    diagnostics.push(error('rotate.target', '目标不能为空', 'target'))
  }
  const parts = ['rotate', target.text]
  if (options.mode === 'rotation') {
    if (!numberOrRelative(options.yaw)) {
      diagnostics.push(error('rotate.yaw', '偏航角必须是数字或 ~数字', 'yaw'))
    }
    if (!numberOrRelative(options.pitch)) {
      diagnostics.push(error('rotate.pitch', '俯仰角必须是数字或 ~数字', 'pitch'))
    }
    parts.push(options.yaw.trim(), options.pitch.trim())
  } else if (options.mode === 'facingLocation') {
    const position = serializePosition(options.position)
    diagnostics.push(...position.diagnostics)
    parts.push('facing', position.text)
  } else {
    const facing = serializeSelector(options.facingTarget)
    diagnostics.push(...facing.diagnostics)
    parts.push('facing', 'entity', facing.text, options.anchor)
  }
  return { text: parts.join(' '), diagnostics }
}
