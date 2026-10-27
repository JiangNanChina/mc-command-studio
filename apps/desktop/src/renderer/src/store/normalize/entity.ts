// 实体/传送/execute 类命令命令的容错归一化。
import {
  createDefaultDamageOptions,
  createDefaultRotateOptions,
  createDefaultRideOptions,
  createDefaultExecuteOptions,
  createDefaultTagOptions,
  createDefaultAttributeOptions,
  createDefaultSummonOptions,
  createDefaultTeleportOptions,
  type ExecuteClause,
  type ExecuteOptions,
  type TagOptions,
  type AttributeOptions,
  type DamageOptions,
  type RotateOptions,
  type RideOptions,
  type SummonOptions,
  type TeleportDestination,
  type TeleportOptions
} from '@mcstudio/core'
import { normalizePosition, normalizeTextSegment } from './common'
import { defaultExecuteClause } from '../defaults'

export function normalizeSummon(input: Partial<SummonOptions> | undefined): SummonOptions {
  const fallback = createDefaultSummonOptions()
  if (!input) return fallback
  return {
    entity: typeof input.entity === 'string' ? input.entity : fallback.entity,
    usePosition: input.usePosition !== false,
    position: normalizePosition(input.position),
    nbt: typeof input.nbt === 'string' ? input.nbt : ''
  }
}

export function normalizeTeleport(input: Partial<TeleportOptions> | undefined): TeleportOptions {
  const fallback = createDefaultTeleportOptions()
  if (!input) return fallback
  const destination: TeleportDestination =
    input.destination?.mode === 'entity' && input.destination.target?.base
      ? { mode: 'entity', target: input.destination.target }
      : {
          mode: 'position',
          position: normalizePosition(
            input.destination?.mode === 'position' ? input.destination.position : undefined
          )
        }
  return {
    target: input.target?.base ? input.target : fallback.target,
    destination,
    rotate: Boolean(input.rotate),
    yaw: typeof input.yaw === 'string' ? input.yaw : fallback.yaw,
    pitch: typeof input.pitch === 'string' ? input.pitch : fallback.pitch
  }
}

export function normalizeRotate(input: Partial<RotateOptions> | undefined): RotateOptions {
  const fallback = createDefaultRotateOptions()
  if (!input) return fallback
  const modes: RotateOptions['mode'][] = ['rotation', 'facingLocation', 'facingEntity']
  return {
    target: input.target?.base ? input.target : fallback.target,
    mode: modes.includes(input.mode as RotateOptions['mode'])
      ? (input.mode as RotateOptions['mode'])
      : 'rotation',
    yaw: typeof input.yaw === 'string' ? input.yaw : fallback.yaw,
    pitch: typeof input.pitch === 'string' ? input.pitch : fallback.pitch,
    position: normalizePosition(input.position),
    facingTarget: input.facingTarget?.base ? input.facingTarget : fallback.facingTarget,
    anchor: input.anchor === 'feet' ? 'feet' : 'eyes'
  }
}

export function normalizeDamage(input: Partial<DamageOptions> | undefined): DamageOptions {
  const fallback = createDefaultDamageOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    amount: typeof input.amount === 'string' ? input.amount : fallback.amount,
    damageType: typeof input.damageType === 'string' ? input.damageType : fallback.damageType,
    source:
      input.source === 'at' || input.source === 'by' ? input.source : 'none',
    position: normalizePosition(input.position),
    sourceEntity: input.sourceEntity?.base ? input.sourceEntity : fallback.sourceEntity,
    causeEntity: input.causeEntity?.base ? input.causeEntity : fallback.causeEntity
  }
}

export function normalizeRide(input: Partial<RideOptions> | undefined): RideOptions {
  const fallback = createDefaultRideOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    action: input.action === 'dismount' ? 'dismount' : 'mount',
    vehicle: input.vehicle?.base ? input.vehicle : fallback.vehicle
  }
}

export function normalizeExecute(input: Partial<ExecuteOptions> | undefined): ExecuteOptions {
  if (!input) return createDefaultExecuteOptions()
  const clauses = Array.isArray(input.clauses)
    ? (input.clauses.filter(
        (clause) => clause && typeof clause.id === 'string' && typeof clause.kind === 'string'
      ) as ExecuteClause[])
    : []
  return {
    clauses,
    run: typeof input.run === 'string' ? input.run : ''
  }
}

export function normalizeAttribute(input: Partial<AttributeOptions> | undefined): AttributeOptions {
  const fallback = createDefaultAttributeOptions()
  if (!input) return fallback
  const actions: AttributeOptions['action'][] = [
    'get',
    'base-get',
    'base-set',
    'base-reset',
    'modifier-add',
    'modifier-remove',
    'modifier-value'
  ]
  const operations: AttributeOptions['operation'][] = [
    'add_value',
    'add_multiplied_base',
    'add_multiplied_total'
  ]
  return {
    action: actions.includes(input.action as AttributeOptions['action'])
      ? (input.action as AttributeOptions['action'])
      : 'get',
    target: input.target?.base ? input.target : fallback.target,
    attribute: typeof input.attribute === 'string' ? input.attribute : fallback.attribute,
    value: typeof input.value === 'string' ? input.value : fallback.value,
    scaleEnabled: Boolean(input.scaleEnabled),
    scale: typeof input.scale === 'string' ? input.scale : fallback.scale,
    modifierId:
      typeof input.modifierId === 'string' ? input.modifierId : fallback.modifierId,
    modifierUuid:
      typeof input.modifierUuid === 'string' ? input.modifierUuid : fallback.modifierUuid,
    modifierName:
      typeof input.modifierName === 'string' ? input.modifierName : fallback.modifierName,
    modifierValue:
      typeof input.modifierValue === 'string' ? input.modifierValue : fallback.modifierValue,
    operation: operations.includes(input.operation as AttributeOptions['operation'])
      ? (input.operation as AttributeOptions['operation'])
      : 'add_value'
  }
}

export function normalizeTag(input: Partial<TagOptions> | undefined): TagOptions {
  const fallback = createDefaultTagOptions()
  if (!input) return fallback
  return {
    action:
      input.action === 'remove' || input.action === 'list' ? input.action : 'add',
    target: input.target?.base ? input.target : fallback.target,
    name: typeof input.name === 'string' ? input.name : fallback.name
  }
}
