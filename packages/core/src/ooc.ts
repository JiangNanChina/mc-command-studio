import { error, warn } from './diagnostics'
import { commandBlockString, containsControlCharacters } from './escape'
import { LEGACY_DIRECTIONS, type LegacyDirection } from './legacy'
import type { BuildResult, Diagnostic } from './types'

export type OocMode = 'falling-sand' | 'command-block-minecart' | 'command-block'
export type OocLayoutAxis = 'x' | 'y' | 'z'

export interface OocOptions {
  mode: OocMode
  x: string
  y: string
  z: string
  commands: string
  auto: boolean
  conditional: boolean
  facing: LegacyDirection
  layerStep: string
  layoutAxis: OocLayoutAxis
  trackOutput: boolean
}

export const OOC_MODES: { value: OocMode; label: string; hint: string }[] = [
  { value: 'falling-sand', label: '掉落沙 OOC', hint: '一层红石块 + 命令方块链，落地即执行' },
  { value: 'command-block-minecart', label: '命令方块矿车', hint: 'summon commandblock_minecart' },
  { value: 'command-block', label: '命令方块 NBT', hint: 'setblock ... command_block 0 replace' }
]

export function createDefaultOocOptions(): OocOptions {
  return {
    mode: 'falling-sand',
    x: '~',
    y: '~1',
    z: '~',
    commands: '',
    auto: true,
    conditional: false,
    facing: 'up',
    layerStep: '1',
    layoutAxis: 'y',
    trackOutput: false
  }
}

const COORDINATE = /^[~^]?-?\d*(?:\.\d+)?$/

function validateCoordinate(value: string, axis: string, diagnostics: Diagnostic[]): void {
  if (!value.trim()) {
    diagnostics.push(error('ooc.coordinate', `${axis} 坐标不能为空`, axis))
  } else if (!COORDINATE.test(value.trim())) {
    diagnostics.push(error('ooc.coordinate', `${axis} 坐标格式不正确`, axis))
  }
}

function commandLines(source: string): string[] {
  return source
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim().replace(/^\/+/, ''))
    .filter(Boolean)
}

function commandBlockNbt(command: string, options: OocOptions): string {
  return `Command:${commandBlockString(command)},auto:${options.auto ? '1b' : '0b'},conditionMet:0b,powered:1b,TrackOutput:${options.trackOutput ? '1b' : '0b'},UpdateLastExecution:0b`
}

function offsetCoordinate(value: string, offset: number): string {
  if (!offset) return value
  const relative = /^([~^])(-?\d+(?:\.\d+)?)?$/.exec(value.trim())
  if (relative) {
    const base = Number(relative[2] ?? 0) + offset
    return `${relative[1]}${base === 0 ? '' : base}`
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? String(numeric + offset) : value
}

function fallingBlock(
  command: string,
  options: OocOptions,
  passengers: string,
  time: number
): string {
  return `{id:"minecraft:falling_block",Block:"minecraft:command_block",Time:${1 + time}s,TileEntityData:{${commandBlockNbt(command, options)}}${passengers ? `,Passengers:[${passengers}]` : ''}}`
}

export function buildOocCommand(options: OocOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const commands = commandLines(options.commands)
  if (commands.length === 0) {
    diagnostics.push(error('ooc.commands', '请至少填写一条命令', 'commands'))
  }
  for (const [axis, value] of [
    ['X', options.x],
    ['Y', options.y],
    ['Z', options.z]
  ] as const) {
    validateCoordinate(value, axis, diagnostics)
  }
  if (!/^\d+$/.test(options.layerStep.trim())) {
    diagnostics.push(error('ooc.layerStep', '层间距必须是非负整数', 'layerStep'))
  }
  const layerStep = /^\d+$/.test(options.layerStep.trim()) ? Number(options.layerStep) : 0
  for (const command of commands) {
    if (containsControlCharacters(command)) {
      diagnostics.push(warn('ooc.control', '命令中包含不可见控制字符', 'commands'))
      break
    }
  }

  let text = ''
  if (commands.length > 0) {
    if (options.mode === 'command-block') {
      const baseMeta =
        LEGACY_DIRECTIONS.find((direction) => direction.value === options.facing)?.meta ?? 1
      text = commands
        .map((command, index) => {
          const offset = index * layerStep
          const x = options.layoutAxis === 'x' ? offsetCoordinate(options.x, offset) : options.x.trim()
          const y = options.layoutAxis === 'y' ? offsetCoordinate(options.y, offset) : options.y.trim()
          const z = options.layoutAxis === 'z' ? offsetCoordinate(options.z, offset) : options.z.trim()
          // 条件链：第一块保持无条件，后续块加 8 形成 conditional 链。
          const meta = baseMeta + (options.conditional && index > 0 ? 8 : 0)
          return `setblock ${x} ${y} ${z} command_block ${meta} replace {${commandBlockNbt(command, options)}}`
        })
        .join('\n')
    } else if (options.mode === 'command-block-minecart') {
      text = `summon commandblock_minecart ${options.x.trim()} ${options.y.trim()} ${options.z.trim()} {Command:${commandBlockString(commands[0])},TrackOutput:${options.trackOutput ? '1b' : '0b'}}`
      if (commands.length > 1) {
        diagnostics.push(warn('ooc.single', '矿车模式只写入第一条命令；多条请用掉落沙 OOC', 'commands'))
      }
      if (options.conditional) {
        diagnostics.push(warn('ooc.conditional', '矿车模式不支持条件链', 'conditional'))
      }
    } else {
      let passengers = ''
      for (let index = commands.length - 1; index >= 0; index -= 1) {
        passengers = fallingBlock(commands[index], options, passengers, index * layerStep)
      }
      text = `summon minecraft:falling_block ${options.x.trim()} ${options.y.trim()} ${options.z.trim()} {Block:"minecraft:redstone_block",Time:1b,Passengers:[${passengers}]}`
      if (options.conditional) {
        diagnostics.push(
          warn('ooc.conditional', '掉落沙模式不支持条件链；条件仅用于命令方块模式', 'conditional')
        )
      }
    }
  }

  if (text.length > 32500) {
    diagnostics.push(error('ooc.length', '生成结果超过命令方块 32,500 字符上限', 'commands'))
  }
  return { text, diagnostics }
}
