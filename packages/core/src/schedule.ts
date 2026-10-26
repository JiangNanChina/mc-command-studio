import { error } from './diagnostics'
import { resourceId } from './escape'
import { isValidResourceLocation } from './units'
import type { BuildResult, Diagnostic } from './types'

export type ScheduleAction = 'function' | 'clear'
export type ScheduleMode = 'append' | 'replace'

export interface ScheduleOptions {
  action: ScheduleAction
  functionName: string
  time: string
  mode: ScheduleMode
}

export function createDefaultScheduleOptions(): ScheduleOptions {
  return {
    action: 'function',
    functionName: 'mcstudio:main',
    time: '1s',
    mode: 'replace'
  }
}

export function buildScheduleCommand(options: ScheduleOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const name = resourceId(options.functionName.trim())
  if (!isValidResourceLocation(name)) {
    diagnostics.push(error('schedule.function', '函数名必须是 namespace:path 格式', 'functionName'))
  }

  if (options.action === 'clear') {
    return { text: `schedule clear ${name}`, diagnostics }
  }

  const time = options.time.trim()
  if (!/^\d+(?:\.\d+)?[tsd]?$/.test(time)) {
    diagnostics.push(error('schedule.time', '时间格式应为 10、10s、10t 或 10d', 'time'))
  }
  return {
    text: `schedule function ${name} ${time} ${options.mode}`,
    diagnostics
  }
}
