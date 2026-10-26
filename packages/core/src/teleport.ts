import { containsControlCharacters } from './escape'
import { error, warn } from './diagnostics'
import { serializePosition, type Position } from './position'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type TeleportDestination =
  | { mode: 'position'; position: Position }
  | { mode: 'entity'; target: Selector }

export interface TeleportOptions {
  target: Selector
  destination: TeleportDestination
  rotate: boolean
  yaw: string
  pitch: string
}

export function createDefaultTeleportOptions(): TeleportOptions {
  return {
    target: { base: '@s' },
    destination: { mode: 'position', position: { x: '~', y: '~', z: '~' } },
    rotate: false,
    yaw: '0',
    pitch: '0'
  }
}

function isNumber(value: string): boolean {
  return /^-?(?:\d+\.?\d*|\.\d+)$/.test(value.trim())
}

export function buildTeleportCommand(options: TeleportOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)

  const parts = ['tp', target.text]
  if (options.destination.mode === 'entity') {
    const destination = serializeSelector(options.destination.target)
    diagnostics.push(...destination.diagnostics)
    parts.push(destination.text)
    if (options.rotate) {
      diagnostics.push(warn('tp.rotate.entity', '传送目标是实体时不支持同时设置朝向，已忽略'))
    }
  } else {
    const position = serializePosition(options.destination.position)
    diagnostics.push(...position.diagnostics)
    parts.push(position.text)
    if (options.rotate) {
      if (!isNumber(options.yaw) || !isNumber(options.pitch)) {
        diagnostics.push(error('tp.rotation', '偏航和俯仰必须是数字', 'rotation'))
      }
      parts.push(options.yaw.trim() || '0', options.pitch.trim() || '0')
    }
  }

  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (containsControlCharacters(text)) {
    diagnostics.push(warn('tp.control', '命令中包含不可见控制字符'))
  }
  return { text, diagnostics }
}
