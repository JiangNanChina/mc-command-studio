/**
 * Small shared value objects used by command builders.
 *
 * They keep resource locations, numbers and item stacks consistent across
 * modules instead of each builder carrying its own regex or parser.
 */
export interface ResourceLocationUnit {
  namespace: string
  path: string
}

const RESOURCE_LOCATION = /^([a-z0-9_.-]+):([a-z0-9_./-]+)$/

export function parseResourceLocation(
  value: string,
  fallbackNamespace = 'minecraft'
): ResourceLocationUnit | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const candidate = trimmed.includes(':') ? trimmed : `${fallbackNamespace}:${trimmed}`
  const match = RESOURCE_LOCATION.exec(candidate)
  if (!match) return null
  return { namespace: match[1], path: match[2] }
}

export function formatResourceLocation(unit: ResourceLocationUnit): string {
  return `${unit.namespace}:${unit.path}`
}

export function isValidResourceLocation(value: string): boolean {
  return parseResourceLocation(value) !== null
}

export interface NumberConstraints {
  min?: number
  max?: number
  integer?: boolean
}

export interface NumberUnit {
  value: number
  text: string
}

export function parseNumberUnit(
  value: string,
  constraints: NumberConstraints = {}
): NumberUnit | null {
  const trimmed = value.trim()
  if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) return null
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) return null
  if (constraints.integer && !Number.isInteger(parsed)) return null
  if (constraints.min !== undefined && parsed < constraints.min) return null
  if (constraints.max !== undefined && parsed > constraints.max) return null
  return { value: parsed, text: trimmed }
}

export interface ItemStackUnit {
  id: string
  count: number
}

export function parseItemStackUnit(
  id: string,
  count: string | number = 1
): ItemStackUnit | null {
  const location = parseResourceLocation(id)
  const numeric = parseNumberUnit(String(count), { min: 1, max: 99, integer: true })
  if (!location || !numeric) return null
  return { id: formatResourceLocation(location), count: numeric.value }
}

export function itemStackText(stack: ItemStackUnit): string {
  return `${stack.id} ${stack.count}`
}

const SLOT = /^[a-z0-9_.-]+(?:\.[a-z0-9_-]+)*$/

export function isValidSlot(value: string): boolean {
  return SLOT.test(value.trim())
}
