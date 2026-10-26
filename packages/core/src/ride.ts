import { error } from './diagnostics'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type RideAction = 'mount' | 'dismount'

export interface RideOptions {
  target: Selector
  action: RideAction
  vehicle: Selector
}

export function createDefaultRideOptions(): RideOptions {
  return {
    target: { base: '@s' },
    action: 'mount',
    vehicle: { base: '@e', type: 'minecraft:horse' }
  }
}

export function buildRideCommand(options: RideOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)
  if (options.action === 'dismount') {
    return { text: `ride ${target.text} dismount`, diagnostics }
  }
  const vehicle = serializeSelector(options.vehicle)
  diagnostics.push(...vehicle.diagnostics)
  if (!vehicle.text.trim()) {
    diagnostics.push(error('ride.vehicle', '坐骑目标不能为空', 'vehicle'))
  }
  return { text: `ride ${target.text} mount ${vehicle.text}`, diagnostics }
}
