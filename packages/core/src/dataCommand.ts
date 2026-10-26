import { error } from './diagnostics'
import { isValidResourceLocation } from './units'
import { serializePosition, type Position } from './position'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type DataAction = 'get' | 'merge' | 'remove'
export type DataTargetType = 'entity' | 'block' | 'storage'

export interface DataOptions {
  action: DataAction
  targetType: DataTargetType
  target: Selector
  position: Position
  storage: string
  path: string
  scaleEnabled: boolean
  scale: string
  nbt: string
}

export function createDefaultDataOptions(): DataOptions {
  return {
    action: 'get',
    targetType: 'entity',
    target: { base: '@s' },
    position: { x: '~', y: '~', z: '~' },
    storage: 'mcstudio:data',
    path: 'Health',
    scaleEnabled: false,
    scale: '1',
    nbt: '{}'
  }
}

function isNumber(value: string): boolean {
  return /^-?(?:\d+\.?\d*|\.\d+)$/.test(value.trim())
}

export function buildDataCommand(options: DataOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const parts = ['data', options.action, options.targetType]

  if (options.targetType === 'entity') {
    const target = serializeSelector(options.target)
    diagnostics.push(...target.diagnostics)
    parts.push(target.text)
  } else if (options.targetType === 'block') {
    const position = serializePosition(options.position)
    diagnostics.push(...position.diagnostics)
    parts.push(position.text)
  } else {
    if (!isValidResourceLocation(options.storage)) {
      diagnostics.push(error('data.storage', '存储 ID 必须是 namespace:path', 'storage'))
    }
    parts.push(options.storage.trim())
  }

  const path = options.path.trim()
  if (options.action === 'merge') {
    const nbt = options.nbt.trim()
    if (!nbt.startsWith('{') || !nbt.endsWith('}')) {
      diagnostics.push(error('data.nbt', '合并内容必须是 { ... } 形式的 SNBT', 'nbt'))
    }
    parts.push(nbt)
    return { text: parts.join(' '), diagnostics }
  }

  if (!path) {
    diagnostics.push(error('data.path', 'NBT 路径不能为空', 'path'))
  }
  parts.push(path)

  if (options.action === 'get' && options.scaleEnabled) {
    if (!isNumber(options.scale)) {
      diagnostics.push(error('data.scale', 'scale 必须是数字', 'scale'))
    }
    parts.push(options.scale.trim())
  }

  return { text: parts.join(' '), diagnostics }
}
