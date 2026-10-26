import { error, warn } from './diagnostics'
import { commandBlockString, containsControlCharacters } from './escape'
import type { BuildResult, Diagnostic } from './types'

export type BlockFacing = 'up' | 'down' | 'north' | 'south' | 'east' | 'west'

export interface CommandBlockOptions {
  x: string
  y: string
  z: string
  facing: BlockFacing
  conditional: boolean
  auto: boolean
  powered: boolean
  trackOutput: boolean
}

export const BLOCK_FACINGS: { value: BlockFacing; label: string }[] = [
  { value: 'up', label: '上' },
  { value: 'down', label: '下' },
  { value: 'north', label: '北' },
  { value: 'south', label: '南' },
  { value: 'east', label: '东' },
  { value: 'west', label: '西' }
]

export function createDefaultCommandBlockOptions(): CommandBlockOptions {
  return {
    x: '0',
    y: '64',
    z: '0',
    facing: 'up',
    conditional: false,
    auto: false,
    powered: true,
    trackOutput: false
  }
}

const COORDINATE = /^[~^]?-?\d*(?:\.\d+)?$/

function validateCoordinate(value: string, axis: string, diagnostics: Diagnostic[]): void {
  if (!value.trim()) {
    diagnostics.push(error('commandblock.coordinate', `${axis} 坐标不能为空`, axis))
    return
  }
  if (!COORDINATE.test(value.trim())) {
    diagnostics.push(
      error('commandblock.coordinate', `${axis} 坐标格式不正确（示例：0、~、~1.5、^）`, axis)
    )
  }
}

/** 命令方块实体的 NBT（不含外层大括号）。 */
export function buildCommandBlockNbt(
  command: string,
  options: Pick<CommandBlockOptions, 'auto' | 'powered' | 'trackOutput'>
): string {
  const auto = options.auto ? '1b' : '0b'
  const powered = options.powered ? '1b' : '0b'
  const trackOutput = options.trackOutput ? '1b' : '0b'
  return `Command:${commandBlockString(command)},auto:${auto},conditionMet:0b,powered:${powered},TrackOutput:${trackOutput},UpdateLastExecution:0b`
}

/** 生成把命令写入命令方块的 /setblock 命令。 */
export function buildCommandBlockSetblock(command: string, options: CommandBlockOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const trimmed = command.trim()

  if (!trimmed) {
    diagnostics.push(error('commandblock.command', '命令不能为空', 'command'))
    return { text: '', diagnostics }
  }
  if (/[\r\n]/.test(command)) {
    diagnostics.push(
      error('commandblock.newline', '命令方块中的命令不能包含换行符', 'command')
    )
  }
  if (containsControlCharacters(command)) {
    diagnostics.push(
      warn('commandblock.control', '命令中包含不可见控制字符，可能导致解析失败', 'command')
    )
  }

  validateCoordinate(options.x, 'X', diagnostics)
  validateCoordinate(options.y, 'Y', diagnostics)
  validateCoordinate(options.z, 'Z', diagnostics)

  const state = `facing=${options.facing}${options.conditional ? ',conditional=true' : ''}`
  const nbt = buildCommandBlockNbt(command, options)
  const text = `setblock ${options.x.trim()} ${options.y.trim()} ${options.z.trim()} minecraft:command_block[${state}]{${nbt}}`

  if (text.length > 32500) {
    diagnostics.push(error('commandblock.length', '命令超过命令方块 32,500 字符上限', 'command'))
  }

  return { text, diagnostics }
}

export function describeCommandBlock(options: CommandBlockOptions): string {
  const parts = [BLOCK_FACINGS.find((item) => item.value === options.facing)?.label ?? options.facing]
  parts.push(options.conditional ? '有条件' : '无条件')
  parts.push(options.auto ? '保持开启' : '需要红石')
  return parts.join(' · ')
}
