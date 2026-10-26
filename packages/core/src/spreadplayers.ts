import { error } from './diagnostics'
import { serializeSelector, type Selector } from './selector'
import { parseNumberUnit } from './units'
import type { BuildResult, Diagnostic } from './types'

export interface SpreadplayersOptions {
  centerX: string
  centerZ: string
  spreadDistance: string
  maxRange: string
  underEnabled: boolean
  maxHeight: string
  respectTeams: boolean
  targets: Selector
}

export function createDefaultSpreadplayersOptions(): SpreadplayersOptions {
  return {
    centerX: '0',
    centerZ: '0',
    spreadDistance: '10',
    maxRange: '50',
    underEnabled: false,
    maxHeight: '320',
    respectTeams: true,
    targets: { base: '@a' }
  }
}

export function buildSpreadplayersCommand(options: SpreadplayersOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  if (!parseNumberUnit(options.centerX)) {
    diagnostics.push(error('spreadplayers.centerX', '中心 X 必须是数字', 'centerX'))
  }
  if (!parseNumberUnit(options.centerZ)) {
    diagnostics.push(error('spreadplayers.centerZ', '中心 Z 必须是数字', 'centerZ'))
  }
  if (!parseNumberUnit(options.spreadDistance, { min: 0 })) {
    diagnostics.push(error('spreadplayers.distance', '分散距离必须是非负数字', 'distance'))
  }
  if (!parseNumberUnit(options.maxRange, { min: 1 })) {
    diagnostics.push(error('spreadplayers.range', '最大范围必须至少为 1', 'range'))
  }
  if (options.underEnabled && !parseNumberUnit(options.maxHeight, { min: -64, max: 320, integer: true })) {
    diagnostics.push(error('spreadplayers.height', '最大高度必须是 -64–320 的整数', 'height'))
  }
  const targets = serializeSelector(options.targets)
  diagnostics.push(...targets.diagnostics)

  const parts = [
    'spreadplayers',
    `${options.centerX.trim()} ${options.centerZ.trim()}`,
    options.spreadDistance.trim(),
    options.maxRange.trim()
  ]
  if (options.underEnabled) {
    parts.push('under', options.maxHeight.trim())
  }
  parts.push(options.respectTeams ? 'true' : 'false', targets.text)
  return { text: parts.join(' '), diagnostics }
}
