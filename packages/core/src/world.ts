import { error } from './diagnostics'
import type { BuildResult, Diagnostic } from './types'

export type TimeAction = 'set' | 'add' | 'query'
export type TimePreset =
  | 'day'
  | 'noon'
  | 'night'
  | 'midnight'
  | 'sunrise'
  | 'sunset'
  | 'custom'
export type TimeQuery = 'day' | 'daytime' | 'gametime'
export type WeatherType = 'clear' | 'rain' | 'thunder'
export type DifficultyLevel = 'peaceful' | 'easy' | 'normal' | 'hard'

export interface TimeOptions {
  action: TimeAction
  preset: TimePreset
  customTicks: string
  query: TimeQuery
}

export interface WeatherOptions {
  type: WeatherType
  durationEnabled: boolean
  seconds: string
}

export interface DifficultyOptions {
  level: DifficultyLevel
}

export interface WorldOptions {
  time: TimeOptions
  weather: WeatherOptions
  difficulty: DifficultyOptions
}

export const TIME_PRESETS: { value: TimePreset; label: string }[] = [
  { value: 'day', label: '白天' },
  { value: 'noon', label: '正午' },
  { value: 'night', label: '夜晚' },
  { value: 'midnight', label: '午夜' },
  { value: 'sunrise', label: '日出' },
  { value: 'sunset', label: '日落' },
  { value: 'custom', label: '自定义' }
]

export const WEATHER_TYPES: { value: WeatherType; label: string }[] = [
  { value: 'clear', label: '晴天' },
  { value: 'rain', label: '下雨' },
  { value: 'thunder', label: '雷暴' }
]

export const DIFFICULTIES: { value: DifficultyLevel; label: string }[] = [
  { value: 'peaceful', label: '和平' },
  { value: 'easy', label: '简单' },
  { value: 'normal', label: '普通' },
  { value: 'hard', label: '困难' }
]

export function createDefaultWorldOptions(): WorldOptions {
  return {
    time: { action: 'set', preset: 'day', customTicks: '1000', query: 'daytime' },
    weather: { type: 'clear', durationEnabled: false, seconds: '6000' },
    difficulty: { level: 'normal' }
  }
}

export function buildTimeCommand(options: TimeOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (options.action === 'query') {
    return { text: `time query ${options.query}`, diagnostics }
  }
  let value: string = options.preset
  if (options.preset === 'custom') {
    if (!/^\d+$/.test(options.customTicks.trim())) {
      diagnostics.push(error('time.ticks', '自定义时间必须是非负整数 tick', 'customTicks'))
    }
    value = options.customTicks.trim()
  }
  return { text: `time ${options.action} ${value}`, diagnostics }
}

export function buildWeatherCommand(options: WeatherOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (options.durationEnabled) {
    if (!/^\d+$/.test(options.seconds.trim()) || Number(options.seconds) < 1) {
      diagnostics.push(error('weather.duration', '持续时间必须是大于 0 的整数秒', 'seconds'))
    }
    return {
      text: `weather ${options.type} ${options.seconds.trim()}`,
      diagnostics
    }
  }
  return { text: `weather ${options.type}`, diagnostics }
}

export function buildDifficultyCommand(options: DifficultyOptions): BuildResult {
  return { text: `difficulty ${options.level}`, diagnostics: [] }
}
