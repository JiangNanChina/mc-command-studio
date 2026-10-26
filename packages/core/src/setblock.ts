import { containsControlCharacters, resourceId } from './escape'
import { error, warn } from './diagnostics'
import { isBalancedCompound, serializePosition, type Position } from './position'
import type { BuildResult, Diagnostic } from './types'

export type SetblockMode = 'replace' | 'destroy' | 'keep' | 'strict'

export interface BlockStateValue {
  id: string
  states: Record<string, string>
  nbt: string
}

export interface SetblockOptions {
  position: Position
  block: BlockStateValue
  mode: SetblockMode
}

export function createDefaultBlockState(): BlockStateValue {
  return { id: 'minecraft:stone', states: {}, nbt: '' }
}

export function createDefaultSetblockOptions(): SetblockOptions {
  return {
    position: { x: '~', y: '~', z: '~' },
    block: createDefaultBlockState(),
    mode: 'replace'
  }
}

const STATE_PART = /^[a-z0-9_]+$/

export function serializeBlockState(block: BlockStateValue): BuildResult {
  const diagnostics: Diagnostic[] = []
  const rawId = block.id.trim()
  if (!rawId) {
    diagnostics.push(error('setblock.block', '方块 ID 不能为空', 'block'))
    return { text: 'minecraft:stone', diagnostics }
  }
  const id = resourceId(rawId)
  if (!/^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(id)) {
    diagnostics.push(error('setblock.block', `方块 ID “${id}” 格式不正确`, 'block'))
  }

  const stateParts: string[] = []
  for (const [key, value] of Object.entries(block.states).sort(([a], [b]) => a.localeCompare(b))) {
    if (!STATE_PART.test(key)) {
      diagnostics.push(error('setblock.state', `方块属性名 “${key}” 不合法`, 'states'))
      continue
    }
    if (!value.trim()) {
      diagnostics.push(error('setblock.state', `方块属性 ${key} 的值不能为空`, 'states'))
      continue
    }
    stateParts.push(`${key}=${value.trim()}`)
  }

  const stateText = stateParts.length > 0 ? `[${stateParts.join(',')}]` : ''
  const nbt = block.nbt.trim()
  if (nbt) {
    if (!isBalancedCompound(nbt)) {
      diagnostics.push(error('setblock.nbt', '方块 NBT 必须是完整的 {…} 复合标签', 'nbt'))
    }
  }
  return { text: `${id}${stateText}${nbt}`, diagnostics }
}

/** 生成 /setblock 命令。 */
export function buildSetblockCommand(options: SetblockOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const position = serializePosition(options.position)
  diagnostics.push(...position.diagnostics)
  const block = serializeBlockState(options.block)
  diagnostics.push(...block.diagnostics)

  const mode = options.mode === 'replace' ? '' : ` ${options.mode}`
  const text = `setblock ${position.text} ${block.text}${mode}`.trim()

  if (text.length > 32500) {
    diagnostics.push(error('setblock.length', '命令超过 32,500 字符上限', 'command'))
  }
  if (containsControlCharacters(text)) {
    diagnostics.push(warn('setblock.control', '命令中包含不可见控制字符，可能导致解析失败'))
  }
  return { text, diagnostics }
}
