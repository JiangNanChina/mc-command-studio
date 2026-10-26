import { error } from './diagnostics'
import type { BuildResult, Diagnostic } from './types'

export interface Position {
  x: string
  y: string
  z: string
}

export function createDefaultPosition(): Position {
  return { x: '~', y: '~', z: '~' }
}

const COORDINATE = /^[~^]?-?\d*(?:\.\d+)?$/

export function validateCoordinate(value: string, axis: string, diagnostics: Diagnostic[]): void {
  if (!value.trim()) {
    diagnostics.push(error('position.empty', `${axis} 坐标不能为空`, axis))
    return
  }
  if (!COORDINATE.test(value.trim())) {
    diagnostics.push(
      error('position.format', `${axis} 坐标格式不正确（示例：0、~、~1.5、^）`, axis)
    )
  }
}

export function serializePosition(position: Position, diagnostics?: Diagnostic[]): BuildResult {
  const messages: Diagnostic[] = []
  validateCoordinate(position.x, 'x', messages)
  validateCoordinate(position.y, 'y', messages)
  validateCoordinate(position.z, 'z', messages)
  diagnostics?.push(...messages)
  return {
    text: `${position.x.trim()} ${position.y.trim()} ${position.z.trim()}`,
    diagnostics: messages
  }
}

/** 简单的 SNBT 复合标签括号检查。 */
export function isBalancedCompound(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return false
  let depth = 0
  let quoted = false
  let quoteChar = ''
  for (let i = 0; i < trimmed.length; i += 1) {
    const char = trimmed[i]
    if (quoted) {
      if (char === '\\') i += 1
      else if (char === quoteChar) quoted = false
      continue
    }
    if (char === '"' || char === "'") {
      quoted = true
      quoteChar = char
    } else if (char === '{' || char === '[') {
      depth += 1
    } else if (char === '}' || char === ']') {
      depth -= 1
      if (depth < 0) return false
    }
  }
  return depth === 0
}
