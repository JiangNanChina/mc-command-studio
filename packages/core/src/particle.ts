import { containsControlCharacters, resourceId, snbtString } from './escape'
import { error, warn } from './diagnostics'
import { serializePosition, type Position } from './position'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type ParticleOptionMode =
  | 'auto'
  | 'none'
  | 'block'
  | 'dust'
  | 'dust_transition'
  | 'item'
  | 'color'
  | 'rgba'
  | 'raw'

export interface ParticleOptions {
  particle: string
  optionMode: ParticleOptionMode
  block: string
  dustColor: string
  fromColor: string
  toColor: string
  scale: string
  item: string
  effectColor: string
  alpha: string
  power: string
  rawOptions: string
  position: Position
  deltaX: string
  deltaY: string
  deltaZ: string
  speed: string
  count: string
  force: boolean
  viewersEnabled: boolean
  viewers: Selector
}

export function createDefaultParticleOptions(): ParticleOptions {
  return {
    particle: 'minecraft:flame',
    optionMode: 'auto',
    block: 'minecraft:stone',
    dustColor: '#ff5555',
    fromColor: '#ff5555',
    toColor: '#5555ff',
    scale: '1',
    item: 'minecraft:diamond',
    effectColor: '#ff5555',
    alpha: '1',
    power: '1',
    rawOptions: '{}',
    position: { x: '~', y: '~1', z: '~' },
    deltaX: '0',
    deltaY: '0',
    deltaZ: '0',
    speed: '0',
    count: '1',
    force: false,
    viewersEnabled: false,
    viewers: { base: '@a' }
  }
}

const BLOCK_PARTICLES = new Set([
  'block',
  'block_crumble',
  'block_marker',
  'dust_pillar',
  'falling_dust'
])

const RAW_PARTICLES: Record<string, string> = {
  sculk_charge: '{roll:0.0}',
  shriek: '{delay:0}',
  trail: '{target:[0,0,0],color:16777215,duration:20}',
  vibration: '{destination:{type:"block",pos:[0,0,0]},arrival_in_ticks:20}',
  dragon_breath: '{power:1.0}',
  tinted_leaves: '{color:16777215}'
}

export function inferredParticleMode(particle: string): Exclude<ParticleOptionMode, 'auto'> {
  const id = particle.trim().replace(/^minecraft:/, '').split('{')[0]
  if (BLOCK_PARTICLES.has(id)) return 'block'
  if (id === 'dust') return 'dust'
  if (id === 'dust_color_transition') return 'dust_transition'
  if (id === 'item') return 'item'
  if (id === 'entity_effect' || id === 'flash') return 'rgba'
  if (id === 'effect' || id === 'instant_effect') return 'color'
  if (id in RAW_PARTICLES) return 'raw'
  return 'none'
}

export function defaultRawOptions(particle: string): string {
  const id = particle.trim().replace(/^minecraft:/, '').split('{')[0]
  return RAW_PARTICLES[id] ?? '{}'
}

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const value = Number.parseInt(match[1], 16)
  return [
    Math.round(((value >> 16) & 255) / 255 * 1000) / 1000,
    Math.round(((value >> 8) & 255) / 255 * 1000) / 1000,
    Math.round((value & 255) / 255 * 1000) / 1000
  ]
}

function rgbText(rgb: [number, number, number]): string {
  return `[${rgb.join(',')}]`
}

function isNumber(value: string, min: number): boolean {
  return /^-?(?:\d+\.?\d*|\.\d+)$/.test(value.trim()) && Number(value) >= min
}

function legacyParticleArgs(
  options: ParticleOptions,
  mode: Exclude<ParticleOptionMode, 'auto'>,
  diagnostics: Diagnostic[]
): string[] {
  const args: string[] = []
  if (mode === 'block') {
    const block = options.block.trim()
    if (!block) {
      diagnostics.push(error('particle.block', '方块参数不能为空', 'block'))
    } else {
      args.push(block)
    }
  } else if (mode === 'dust' || mode === 'dust_transition') {
    if (!isNumber(options.scale, 0.01)) {
      diagnostics.push(error('particle.scale', 'scale 必须是不小于 0.01 的数字', 'scale'))
    }
    if (mode === 'dust') {
      const rgb = hexToRgb(options.dustColor)
      if (!rgb) {
        diagnostics.push(error('particle.color', '颜色必须是 #RRGGBB', 'dustColor'))
      } else {
        args.push(...rgb.map(String), options.scale.trim())
      }
    } else {
      const from = hexToRgb(options.fromColor)
      const to = hexToRgb(options.toColor)
      if (!from) diagnostics.push(error('particle.from', '起始颜色必须是 #RRGGBB', 'fromColor'))
      if (!to) diagnostics.push(error('particle.to', '结束颜色必须是 #RRGGBB', 'toColor'))
      if (from && to) {
        args.push(...from.map(String), options.scale.trim(), ...to.map(String))
      }
    }
  } else if (mode === 'item') {
    const item = options.item.trim()
    if (!item) {
      diagnostics.push(error('particle.item', '物品参数不能为空', 'item'))
    } else {
      args.push(item)
    }
  } else if (mode === 'color' || mode === 'rgba') {
    const rgb = hexToRgb(options.effectColor)
    if (!rgb) {
      diagnostics.push(error('particle.effectColor', '颜色必须是 #RRGGBB', 'effectColor'))
    } else if (mode === 'rgba') {
      if (!isNumber(options.alpha, 0) || Number(options.alpha) > 1) {
        diagnostics.push(error('particle.alpha', 'alpha 必须在 0–1 之间', 'alpha'))
      }
      args.push(...rgb.map(String), options.alpha.trim())
    } else {
      args.push(...rgb.map(String))
    }
  } else if (mode === 'raw') {
    diagnostics.push(
      error('particle.legacy', '1.20.4 的 particle 使用参数语法，不支持 SNBT 原始参数', 'rawOptions')
    )
  }
  return args
}

export function buildParticleCommand(
  options: ParticleOptions,
  engine: 'components' | 'nbt' | 'legacy' = 'components'
): BuildResult {
  const diagnostics: Diagnostic[] = []
  const mode =
    options.optionMode === 'auto' ? inferredParticleMode(options.particle) : options.optionMode
  const particle = resourceId(options.particle.trim())
  const legacy = engine === 'nbt'
  let name = particle
  let optionArgs: string[] = []

  if (legacy) {
    optionArgs = legacyParticleArgs(options, mode, diagnostics)
  } else if (mode === 'block') {
    name += `{block_state:${snbtString(resourceId(options.block))}}`
  } else if (mode === 'dust' || mode === 'dust_transition') {
    if (!isNumber(options.scale, 0.01)) {
      diagnostics.push(error('particle.scale', 'scale 必须是不小于 0.01 的数字', 'scale'))
    }
    if (mode === 'dust') {
      const rgb = hexToRgb(options.dustColor)
      if (!rgb) {
        diagnostics.push(error('particle.color', '颜色必须是 #RRGGBB', 'dustColor'))
      } else {
        name += `{color:${rgbText(rgb)},scale:${options.scale.trim()}}`
      }
    } else {
      const from = hexToRgb(options.fromColor)
      const to = hexToRgb(options.toColor)
      if (!from) diagnostics.push(error('particle.from', '起始颜色必须是 #RRGGBB', 'fromColor'))
      if (!to) diagnostics.push(error('particle.to', '结束颜色必须是 #RRGGBB', 'toColor'))
      if (from && to) {
        name += `{from_color:${rgbText(from)},to_color:${rgbText(to)},scale:${options.scale.trim()}}`
      }
    }
  } else if (mode === 'item') {
    name += `{item:${snbtString(resourceId(options.item))}}`
  } else if (mode === 'color' || mode === 'rgba') {
    const rgb = hexToRgb(options.effectColor)
    if (!rgb) {
      diagnostics.push(error('particle.effectColor', '颜色必须是 #RRGGBB', 'effectColor'))
    } else {
      if (mode === 'rgba') {
        if (!isNumber(options.alpha, 0) || Number(options.alpha) > 1) {
          diagnostics.push(error('particle.alpha', 'alpha 必须在 0–1 之间', 'alpha'))
        }
        name += `{color:[${rgb.join(',')},${options.alpha.trim()}]}`
      } else {
        name += `{color:${rgbText(rgb)},power:${options.power.trim()}}`
      }
    }
  } else if (mode === 'raw') {
    const raw = options.rawOptions.trim()
    if (!raw.startsWith('{') || !raw.endsWith('}')) {
      diagnostics.push(error('particle.raw', '原始参数必须是 { ... } 形式的 SNBT', 'rawOptions'))
    } else {
      name += raw
    }
  }

  if (!options.particle.trim()) {
    diagnostics.push(error('particle.id', '请选择粒子类型', 'particle'))
  }

  const position = serializePosition(options.position)
  diagnostics.push(...position.diagnostics)

  for (const [key, value, min] of [
    ['deltaX', options.deltaX, -Infinity],
    ['deltaY', options.deltaY, -Infinity],
    ['deltaZ', options.deltaZ, -Infinity]
  ] as [string, string, number][]) {
    if (!isNumber(value, min)) {
      diagnostics.push(error(`particle.${key}`, 'delta 必须是数字', key))
    }
  }
  if (!isNumber(options.speed, 0)) {
    diagnostics.push(error('particle.speed', 'speed 必须是不小于 0 的数字', 'speed'))
  }
  if (!/^\d+$/.test(options.count.trim())) {
    diagnostics.push(error('particle.count', 'count 必须是非负整数', 'count'))
  }

  const parts = [
    'particle',
    name,
    ...optionArgs,
    position.text,
    options.deltaX.trim(),
    options.deltaY.trim(),
    options.deltaZ.trim(),
    options.speed.trim(),
    options.count.trim(),
    options.force ? 'force' : 'normal'
  ]

  if (options.viewersEnabled) {
    const viewers = serializeSelector(options.viewers)
    diagnostics.push(...viewers.diagnostics)
    parts.push(viewers.text)
  }

  const text = parts.join(' ')
  if (containsControlCharacters(text)) {
    diagnostics.push(warn('particle.control', '命令中包含不可见控制字符'))
  }
  return { text, diagnostics }
}
