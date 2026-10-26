import { error } from './diagnostics'
import type { BuildResult, Diagnostic } from './types'

export type WorldborderAction =
  | 'set'
  | 'add'
  | 'center'
  | 'damage-amount'
  | 'damage-buffer'
  | 'warning-distance'
  | 'warning-time'
  | 'get'

export interface WorldborderOptions {
  action: WorldborderAction
  distance: string
  timeEnabled: boolean
  time: string
  x: string
  z: string
  value: string
}

export const WORLDBORDER_ACTIONS: { value: WorldborderAction; label: string; group: string }[] = [
  { value: 'set', label: '设置尺寸', group: '尺寸' },
  { value: 'add', label: '扩展/收缩', group: '尺寸' },
  { value: 'center', label: '设置中心', group: '尺寸' },
  { value: 'damage-amount', label: '伤害/格', group: '伤害' },
  { value: 'damage-buffer', label: '伤害缓冲', group: '伤害' },
  { value: 'warning-distance', label: '警告距离', group: '警告' },
  { value: 'warning-time', label: '警告时间', group: '警告' },
  { value: 'get', label: '查询尺寸', group: '查询' }
]

export function createDefaultWorldborderOptions(): WorldborderOptions {
  return {
    action: 'set',
    distance: '1000',
    timeEnabled: false,
    time: '10s',
    x: '0',
    z: '0',
    value: '0.2'
  }
}

function isDouble(value: string, min: number, max = Infinity): boolean {
  return (
    /^-?(?:\d+\.?\d*|\.\d+)$/.test(value.trim()) &&
    Number(value) >= min &&
    Number(value) <= max
  )
}

function isTime(value: string): boolean {
  return /^\d+(?:\.\d+)?[tsd]?$/.test(value.trim())
}

export function buildWorldborderCommand(options: WorldborderOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const timeSuffix =
    options.timeEnabled && (options.action === 'set' || options.action === 'add')
      ? options.time.trim()
      : ''
  if (timeSuffix && !isTime(timeSuffix)) {
    diagnostics.push(error('worldborder.time', '时间格式应为 10、10s、10t 或 10d', 'time'))
  }

  switch (options.action) {
    case 'set':
    case 'add': {
      if (!isDouble(options.distance, -59_999_968, 59_999_968)) {
        diagnostics.push(error('worldborder.distance', '尺寸必须是有效数字', 'distance'))
      }
      const parts = ['worldborder', options.action, options.distance.trim()]
      if (timeSuffix) parts.push(timeSuffix)
      return { text: parts.join(' '), diagnostics }
    }
    case 'center': {
      if (!isDouble(options.x, -30_000_000, 30_000_000)) {
        diagnostics.push(error('worldborder.x', '中心 X 必须是有效数字', 'x'))
      }
      if (!isDouble(options.z, -30_000_000, 30_000_000)) {
        diagnostics.push(error('worldborder.z', '中心 Z 必须是有效数字', 'z'))
      }
      return { text: `worldborder center ${options.x.trim()} ${options.z.trim()}`, diagnostics }
    }
    case 'damage-amount':
    case 'damage-buffer': {
      if (!isDouble(options.value, 0)) {
        diagnostics.push(error('worldborder.value', '伤害值必须是不小于 0 的数字', 'value'))
      }
      return {
        text: `worldborder damage ${options.action === 'damage-amount' ? 'amount' : 'buffer'} ${options.value.trim()}`,
        diagnostics
      }
    }
    case 'warning-distance': {
      if (!/^\d+$/.test(options.value.trim())) {
        diagnostics.push(error('worldborder.value', '警告距离必须是非负整数', 'value'))
      }
      return { text: `worldborder warning distance ${options.value.trim()}`, diagnostics }
    }
    case 'warning-time': {
      if (!isTime(options.value)) {
        diagnostics.push(error('worldborder.value', '警告时间格式应为 10、10s、10t 或 10d', 'value'))
      }
      return { text: `worldborder warning time ${options.value.trim()}`, diagnostics }
    }
    default:
      return { text: 'worldborder get', diagnostics }
  }
}
