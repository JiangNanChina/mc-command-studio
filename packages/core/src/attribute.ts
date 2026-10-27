import { error } from './diagnostics'
import { resourceId } from './escape'
import { serializeSelector, type Selector } from './selector'
import { isValidResourceLocation, parseNumberUnit } from './units'
import type { BuildResult, Diagnostic } from './types'

export type AttributeAction =
  | 'get'
  | 'base-get'
  | 'base-set'
  | 'base-reset'
  | 'modifier-add'
  | 'modifier-remove'
  | 'modifier-value'

export type AttributeOperation = 'add_value' | 'add_multiplied_base' | 'add_multiplied_total'

export interface AttributeOptions {
  action: AttributeAction
  target: Selector
  attribute: string
  value: string
  scaleEnabled: boolean
  scale: string
  modifierId: string
  modifierUuid: string
  modifierName: string
  modifierValue: string
  operation: AttributeOperation
}

export const ATTRIBUTE_OPERATIONS: { value: AttributeOperation; label: string }[] = [
  { value: 'add_value', label: '加算 +' },
  { value: 'add_multiplied_base', label: '基础值乘算' },
  { value: 'add_multiplied_total', label: '总值乘算' }
]

export function createDefaultAttributeOptions(): AttributeOptions {
  return {
    action: 'get',
    target: { base: '@s' },
    attribute: 'minecraft:max_health',
    value: '20',
    scaleEnabled: false,
    scale: '1',
    modifierId: 'mcstudio:bonus',
    modifierUuid: '00000000-0000-0000-0000-000000000001',
    modifierName: 'MC Studio Bonus',
    modifierValue: '2',
    operation: 'add_value'
  }
}

function isNumber(value: string): boolean {
  return parseNumberUnit(value) !== null
}

function isResource(value: string): boolean {
  return isValidResourceLocation(value)
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const LEGACY_OPERATIONS: Record<AttributeOperation, string> = {
  add_value: 'add',
  add_multiplied_base: 'multiply_base',
  add_multiplied_total: 'multiply'
}

export function buildAttributeCommand(
  options: AttributeOptions,
  engine: 'components' | 'nbt' | 'legacy' = 'components'
): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)
  const attribute = resourceId(options.attribute.trim())
  if (!isResource(attribute)) {
    diagnostics.push(error('attribute.id', '属性 ID 必须是 namespace:path 格式', 'attribute'))
  }

  const value = options.value.trim()
  if (options.action === 'base-set' && !isNumber(value)) {
    diagnostics.push(error('attribute.value', '基础值必须是数字', 'value'))
  }
  if (options.scaleEnabled && !isNumber(options.scale)) {
    diagnostics.push(error('attribute.scale', 'scale 必须是数字', 'scale'))
  }

  if (engine === 'nbt') {
    const base = ['attribute', target.text, attribute]
    if (options.action === 'base-reset') {
      diagnostics.push(
        error('attribute.reset', '1.20.4 不支持 attribute base reset', 'action')
      )
      return { text: base.join(' '), diagnostics }
    }
    if (options.action === 'base-set') {
      base.push('base', 'set', value)
      return { text: base.join(' '), diagnostics }
    }
    if (options.action === 'base-get' || options.action === 'get') {
      if (options.action === 'base-get') base.push('base')
      base.push('get')
      if (options.scaleEnabled) base.push(options.scale.trim())
      return { text: base.join(' '), diagnostics }
    }

    if (!UUID.test(options.modifierUuid.trim())) {
      diagnostics.push(error('attribute.uuid', '1.20.4 修饰符 UUID 格式不正确', 'modifierUuid'))
    }
    if (!options.modifierName.trim()) {
      diagnostics.push(error('attribute.name', '1.20.4 修饰符名称不能为空', 'modifierName'))
    }
    if (options.action === 'modifier-value') {
      base.push('modifier', 'value', 'get', options.modifierUuid.trim())
      if (options.scaleEnabled) base.push(options.scale.trim())
      return { text: base.join(' '), diagnostics }
    }
    if (options.action === 'modifier-add') {
      if (!isNumber(options.modifierValue)) {
        diagnostics.push(error('attribute.modifierValue', '修饰符值必须是数字', 'modifierValue'))
      }
      base.push(
        'modifier',
        'add',
        options.modifierUuid.trim(),
        options.modifierName.trim(),
        options.modifierValue.trim(),
        LEGACY_OPERATIONS[options.operation]
      )
      return { text: base.join(' '), diagnostics }
    }
    base.push('modifier', 'remove', options.modifierUuid.trim())
    return { text: base.join(' '), diagnostics }
  }

  const base = ['attribute', target.text, attribute]
  if (options.action === 'get' || options.action === 'base-get' || options.action === 'modifier-value') {
    if (options.action === 'base-get') base.push('base')
    if (options.action === 'modifier-value') {
      if (!isResource(options.modifierId.trim())) {
        diagnostics.push(error('attribute.modifier', '修饰符 ID 必须是 namespace:path', 'modifierId'))
      }
      base.push('modifier', 'value', 'get', options.modifierId.trim())
    } else {
      base.push('get')
    }
    if (options.scaleEnabled) base.push(options.scale.trim())
    return { text: base.join(' '), diagnostics }
  }

  if (options.action === 'base-set') {
    base.push('base', 'set', value)
    return { text: base.join(' '), diagnostics }
  }
  if (options.action === 'base-reset') {
    base.push('base', 'reset')
    return { text: base.join(' '), diagnostics }
  }

  if (!isResource(options.modifierId.trim())) {
    diagnostics.push(error('attribute.modifier', '修饰符 ID 必须是 namespace:path', 'modifierId'))
  }
  if (options.action === 'modifier-add') {
    if (!isNumber(options.modifierValue)) {
      diagnostics.push(error('attribute.modifierValue', '修饰符值必须是数字', 'modifierValue'))
    }
    base.push(
      'modifier',
      'add',
      options.modifierId.trim(),
      options.modifierValue.trim(),
      options.operation
    )
  } else {
    base.push('modifier', 'remove', options.modifierId.trim())
  }
  return { text: base.join(' '), diagnostics }
}
