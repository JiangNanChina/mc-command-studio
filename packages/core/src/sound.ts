import { containsControlCharacters, resourceId } from './escape'
import { error, warn } from './diagnostics'
import { serializePosition, type Position } from './position'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type SoundAction = 'play' | 'stop'

export type SoundSource =
  | 'master'
  | 'music'
  | 'record'
  | 'weather'
  | 'block'
  | 'hostile'
  | 'neutral'
  | 'player'
  | 'ambient'
  | 'voice'

export type StopMode = 'all' | 'source' | 'sound'

export interface SoundOptions {
  action: SoundAction
  target: Selector
  sound: string
  source: SoundSource
  position: Position
  volume: string
  pitch: string
  minVolume: string
  stopMode: StopMode
}

export const SOUND_SOURCES: { value: SoundSource; label: string }[] = [
  { value: 'master', label: '主音量' },
  { value: 'music', label: '音乐' },
  { value: 'record', label: '唱片机' },
  { value: 'weather', label: '天气' },
  { value: 'block', label: '方块' },
  { value: 'hostile', label: '敌对生物' },
  { value: 'neutral', label: '中立生物' },
  { value: 'player', label: '玩家' },
  { value: 'ambient', label: '环境' },
  { value: 'voice', label: '语音' }
]

export function createDefaultSoundOptions(): SoundOptions {
  return {
    action: 'play',
    target: { base: '@s' },
    sound: 'minecraft:ui.button.click',
    source: 'master',
    position: { x: '~', y: '~', z: '~' },
    volume: '1',
    pitch: '1',
    minVolume: '0',
    stopMode: 'all'
  }
}

function isNumber(value: string): boolean {
  return /^-?(?:\d+\.?\d*|\.\d+)$/.test(value.trim())
}

export function buildSoundCommand(options: SoundOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)
  const sound = resourceId(options.sound.trim())

  if (options.action === 'stop') {
    const parts = ['stopsound', target.text]
    if (options.stopMode === 'source' || options.stopMode === 'sound') {
      parts.push(options.source)
    }
    if (options.stopMode === 'sound') {
      if (!options.sound.trim()) {
        diagnostics.push(error('sound.stop', '请选择要停止的声音', 'sound'))
      }
      parts.push(sound)
    }
    return finish(parts, diagnostics)
  }

  if (!options.sound.trim()) {
    diagnostics.push(error('sound.id', '请选择或填写声音 ID', 'sound'))
  }
  const position = serializePosition(options.position)
  diagnostics.push(...position.diagnostics)

  for (const [name, value, min] of [
    ['volume', options.volume, 0],
    ['pitch', options.pitch, 0.1],
    ['minVolume', options.minVolume, 0]
  ] as [string, string, number][]) {
    if (!isNumber(value) || Number(value) < min) {
      diagnostics.push(error(`sound.${name}`, `${name} 必须是不小于 ${min} 的数字`, name))
    }
  }

  const parts = [
    'playsound',
    sound,
    options.source,
    target.text,
    position.text,
    options.volume.trim(),
    options.pitch.trim(),
    options.minVolume.trim()
  ]
  return finish(parts, diagnostics)
}

function finish(parts: string[], diagnostics: Diagnostic[]): BuildResult {
  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (containsControlCharacters(text)) {
    diagnostics.push(warn('sound.control', '命令中包含不可见控制字符'))
  }
  return { text, diagnostics }
}
