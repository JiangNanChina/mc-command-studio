import { containsControlCharacters, resourceId } from './escape'
import { error, warn } from './diagnostics'
import { isBalancedCompound, serializePosition, type Position } from './position'
import type { BuildResult, Diagnostic } from './types'

export interface SummonOptions {
  entity: string
  usePosition: boolean
  position: Position
  nbt: string
}

export function createDefaultSummonOptions(): SummonOptions {
  return {
    entity: 'minecraft:zombie',
    usePosition: true,
    position: { x: '~', y: '~', z: '~' },
    nbt: ''
  }
}

/** 生成 /summon 命令。NBT 需要坐标参数，因此未启用坐标时忽略 NBT。 */
export function buildSummonCommand(options: SummonOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const rawEntity = options.entity.trim()
  if (!rawEntity) {
    diagnostics.push(error('summon.entity', '实体 ID 不能为空', 'entity'))
    return { text: '', diagnostics }
  }
  const entity = resourceId(rawEntity)
  if (!/^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(entity)) {
    diagnostics.push(error('summon.entity', `实体 ID “${entity}” 格式不正确`, 'entity'))
  }

  let text = `summon ${entity}`
  const nbt = options.nbt.trim()

  if (options.usePosition) {
    const position = serializePosition(options.position)
    diagnostics.push(...position.diagnostics)
    text += ` ${position.text}`
    if (nbt) {
      if (!isBalancedCompound(nbt)) {
        diagnostics.push(error('summon.nbt', 'NBT 必须是完整的 {…} 复合标签', 'nbt'))
      }
      text += ` ${nbt}`
    }
  } else if (nbt) {
    diagnostics.push(
      warn('summon.nbt.position', 'NBT 需要坐标参数；已忽略 NBT，或请开启“指定坐标”。', 'nbt')
    )
  }

  if (text.length > 32500) {
    diagnostics.push(error('summon.length', '命令超过 32,500 字符上限', 'command'))
  }
  if (containsControlCharacters(text)) {
    diagnostics.push(warn('summon.control', '命令中包含不可见控制字符，可能导致解析失败'))
  }

  return { text, diagnostics }
}
