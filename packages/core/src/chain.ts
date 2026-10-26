import { commandBlockString, containsControlCharacters } from './escape'
import { error, warn } from './diagnostics'
import type { BlockFacing } from './commandBlock'
import type { BuildResult, Diagnostic } from './types'

export type ChainBlockKind = 'impulse' | 'chain' | 'repeating'

export interface ChainBlock {
  id: string
  command: string
  kind: ChainBlockKind
  conditional: boolean
  auto: boolean
}

export interface ChainOptions {
  origin: { x: string; y: string; z: string }
  direction: BlockFacing
  blocks: ChainBlock[]
}

export function createDefaultChainOptions(): ChainOptions {
  return {
    origin: { x: '0', y: '64', z: '0' },
    direction: 'east',
    blocks: [
      {
        id: 'chain-1',
        command: 'say 你好',
        kind: 'impulse',
        conditional: false,
        auto: false
      },
      {
        id: 'chain-2',
        command: 'give @p minecraft:stone 1',
        kind: 'chain',
        conditional: false,
        auto: true
      }
    ]
  }
}

export function createChainBlock(index: number, kind: ChainBlockKind = 'chain'): ChainBlock {
  return {
    id: `chain-${Date.now()}-${index}`,
    command: '',
    kind,
    conditional: false,
    auto: kind !== 'impulse'
  }
}

const BLOCK_IDS: Record<ChainBlockKind, string> = {
  impulse: 'minecraft:command_block',
  chain: 'minecraft:chain_command_block',
  repeating: 'minecraft:repeating_command_block'
}

const DIRECTION_VECTOR: Record<BlockFacing, { axis: 'x' | 'y' | 'z'; delta: -1 | 1 }> = {
  east: { axis: 'x', delta: 1 },
  west: { axis: 'x', delta: -1 },
  south: { axis: 'z', delta: 1 },
  north: { axis: 'z', delta: -1 },
  up: { axis: 'y', delta: 1 },
  down: { axis: 'y', delta: -1 }
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 1000) / 1000)
}

function offsetCoordinate(
  raw: string,
  axis: string,
  delta: number,
  diagnostics: Diagnostic[]
): string {
  const value = raw.trim()
  if (!value) {
    diagnostics.push(error('chain.coordinate', `${axis} 坐标不能为空`, axis.toLowerCase()))
    return '0'
  }
  if (value.startsWith('^')) {
    diagnostics.push(
      error('chain.local', '命令方块链暂不支持 ^ 局部坐标，请使用绝对坐标或 ~ 相对坐标', axis.toLowerCase())
    )
    return value
  }
  if (value.startsWith('~')) {
    const number = value.slice(1) === '' ? 0 : Number(value.slice(1))
    if (!Number.isFinite(number)) {
      diagnostics.push(error('chain.coordinate', `${axis} 坐标格式不正确`, axis.toLowerCase()))
      return value
    }
    if (delta === 0) return value
    const result = number + delta
    return result === 0 ? '~' : `~${formatNumber(result)}`
  }
  const number = Number(value)
  if (!Number.isFinite(number)) {
    diagnostics.push(error('chain.coordinate', `${axis} 坐标格式不正确`, axis.toLowerCase()))
    return value
  }
  return formatNumber(number + delta)
}

function blockNbt(block: ChainBlock): string {
  const auto = block.auto ? '1b' : '0b'
  return `Command:${commandBlockString(block.command.trim())},auto:${auto},conditionMet:0b,powered:0b,TrackOutput:0b,UpdateLastExecution:0b`
}

/** 生成整条命令方块链的 /setblock 命令，每行一个。 */
export function buildChainCommands(options: ChainOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const vector = DIRECTION_VECTOR[options.direction]

  if (options.blocks.length === 0) {
    diagnostics.push(error('chain.empty', '至少添加一个命令方块', 'blocks'))
    return { text: '', diagnostics }
  }
  if (options.blocks.length > 64) {
    diagnostics.push(error('chain.limit', '单条链最多 64 个命令方块', 'blocks'))
  }

  const lines: string[] = []
  options.blocks.forEach((block, index) => {
    const command = block.command.trim()
    if (!command) {
      diagnostics.push(error('chain.command', `第 ${index + 1} 个命令方块没有命令`, 'command'))
    }
    if (/[\r\n]/.test(block.command)) {
      diagnostics.push(
        error('chain.newline', `第 ${index + 1} 个命令方块包含换行符`, 'command')
      )
    }
    if (containsControlCharacters(block.command)) {
      diagnostics.push(warn('chain.control', `第 ${index + 1} 个命令方块包含控制字符`))
    }

    const delta = vector.delta * index
    const x = offsetCoordinate(options.origin.x, 'X', vector.axis === 'x' ? delta : 0, diagnostics)
    const y = offsetCoordinate(options.origin.y, 'Y', vector.axis === 'y' ? delta : 0, diagnostics)
    const z = offsetCoordinate(options.origin.z, 'Z', vector.axis === 'z' ? delta : 0, diagnostics)

    const blockId = BLOCK_IDS[block.kind]
    const state = `facing=${options.direction}${block.conditional ? ',conditional=true' : ''}`
    lines.push(`setblock ${x} ${y} ${z} ${blockId}[${state}]{${blockNbt(block)}}`)
  })

  const text = lines.join('\n')
  if (text.length > 32500) {
    diagnostics.push(warn('chain.length', '整链命令超过 32,500 字符，聊天栏无法一次执行'))
  }
  return { text, diagnostics }
}

export const CHAIN_KIND_LABELS: Record<ChainBlockKind, string> = {
  impulse: '脉冲 command_block',
  chain: '连锁 chain_command_block',
  repeating: '循环 repeating_command_block'
}
