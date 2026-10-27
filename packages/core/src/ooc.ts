import { error, warn } from './diagnostics'
import { commandBlockString, containsControlCharacters } from './escape'
import type { BuildResult, Diagnostic } from './types'

export type OocMode = 'falling-sand' | 'command-block-minecart' | 'command-block'

export interface OocOptions {
  mode: OocMode
  x: string
  y: string
  z: string
  commands: string
  auto: boolean
  conditional: boolean
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

function fallingBlock(command: string, options: OocOptions, passengers: string): string {
  return `{id:"minecraft:falling_block",Block:"minecraft:command_block",Time:1b,TileEntityData:{${commandBlockNbt(command, options)}}${passengers ? `,Passengers:[${passengers}]` : ''}}`
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
  for (const command of commands) {
    if (containsControlCharacters(command)) {
      diagnostics.push(warn('ooc.control', '命令中包含不可见控制字符', 'commands'))
      break
    }
  }

  let text = ''
  if (commands.length > 0) {
    if (options.mode === 'command-block') {
      text = `setblock ${options.x.trim()} ${options.y.trim()} ${options.z.trim()} command_block 0 replace {${commandBlockNbt(commands[0], options)}}`
      if (commands.length > 1) {
        diagnostics.push(warn('ooc.single', '命令方块模式只写入第一条命令；多条请用掉落沙 OOC', 'commands'))
      }
    } else if (options.mode === 'command-block-minecart') {
      text = `summon commandblock_minecart ${options.x.trim()} ${options.y.trim()} ${options.z.trim()} {Command:${commandBlockString(commands[0])},TrackOutput:${options.trackOutput ? '1b' : '0b'}}`
      if (commands.length > 1) {
        diagnostics.push(warn('ooc.single', '矿车模式只写入第一条命令；多条请用掉落沙 OOC', 'commands'))
      }
    } else {
      let passengers = ''
      for (let index = commands.length - 1; index >= 0; index -= 1) {
        passengers = fallingBlock(commands[index], options, passengers)
      }
      text = `summon minecraft:falling_block ${options.x.trim()} ${options.y.trim()} ${options.z.trim()} {Block:"minecraft:redstone_block",Time:1b,Passengers:[${passengers}]}`
    }
  }

  if (text.length > 32500) {
    diagnostics.push(error('ooc.length', '生成结果超过命令方块 32,500 字符上限', 'commands'))
  }
  return { text, diagnostics }
}
