export type PredicateMode = 'single' | 'all_of' | 'any_of'
export type PredicateType =
  | 'random_chance'
  | 'weather_check'
  | 'time_check'
  | 'value_check'
  | 'entity_properties'

export const PREDICATE_TYPES: { value: PredicateType; label: string }[] = [
  { value: 'random_chance', label: '随机概率' },
  { value: 'weather_check', label: '天气检查' },
  { value: 'time_check', label: '时间检查' },
  { value: 'value_check', label: '记分板数值' },
  { value: 'entity_properties', label: '实体状态' }
]

export const ENTITY_FLAGS = [
  'is_on_fire',
  'is_sneaking',
  'is_sprinting',
  'is_swimming',
  'is_baby'
] as const

export type EntityFlag = (typeof ENTITY_FLAGS)[number]

export interface PredicateCondition {
  type: PredicateType
  chance: number
  raining: boolean
  thundering: boolean
  time: number
  valueObjective: string
  valueMin: number
  valueMax: number
  entity: string
  flags: EntityFlag[]
}

export interface PredicateModel {
  mode: PredicateMode
  conditions: PredicateCondition[]
}

const MODES: PredicateMode[] = ['all_of', 'any_of']
const ENTITIES = ['this', 'killer', 'player', 'direct_killer']

function createCondition(type: PredicateType): PredicateCondition {
  return {
    type,
    chance: 0.5,
    raining: true,
    thundering: false,
    time: 0,
    valueObjective: 'kills',
    valueMin: 1,
    valueMax: 5,
    entity: 'this',
    flags: []
  }
}

export function createPredicateCondition(type: PredicateType): PredicateCondition {
  return createCondition(type)
}

export function createPredicateModel(): PredicateModel {
  return {
    mode: 'single',
    conditions: [createCondition('random_chance')]
  }
}

function parseCondition(input: unknown): PredicateCondition | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const record = input as Record<string, unknown>
  if (typeof record.condition !== 'string') return null
  switch (record.condition) {
    case 'minecraft:random_chance': {
      if (Object.keys(record).some((key) => key !== 'condition' && key !== 'chance')) return null
      if (typeof record.chance !== 'number' || record.chance < 0 || record.chance > 1) return null
      return { ...createCondition('random_chance'), chance: record.chance }
    }
    case 'minecraft:weather_check': {
      if (
        Object.keys(record).some(
          (key) => key !== 'condition' && key !== 'raining' && key !== 'thundering'
        )
      ) {
        return null
      }
      if (record.raining !== undefined && typeof record.raining !== 'boolean') return null
      if (record.thundering !== undefined && typeof record.thundering !== 'boolean') return null
      return {
        ...createCondition('weather_check'),
        raining: record.raining !== false,
        thundering: record.thundering === true
      }
    }
    case 'minecraft:time_check': {
      if (Object.keys(record).some((key) => key !== 'condition' && key !== 'value')) return null
      if (typeof record.value !== 'number' || record.value < 0) return null
      return { ...createCondition('time_check'), time: record.value }
    }
    case 'minecraft:value_check': {
      if (Object.keys(record).some((key) => key !== 'condition' && key !== 'value' && key !== 'range')) {
        return null
      }
      const value = record.value
      const range = record.range
      if (!value || typeof value !== 'object' || Array.isArray(value)) return null
      if (!range || typeof range !== 'object' || Array.isArray(range)) return null
      const valueRecord = value as Record<string, unknown>
      const rangeRecord = range as Record<string, unknown>
      const target = valueRecord.target
      if (
        valueRecord.type !== 'minecraft:score' ||
        typeof valueRecord.score !== 'string' ||
        valueRecord.score.trim() === '' ||
        !target ||
        typeof target !== 'object' ||
        Array.isArray(target)
      ) {
        return null
      }
      const targetRecord = target as Record<string, unknown>
      if (targetRecord.type !== 'minecraft:fixed' || targetRecord.name !== 'this') return null
      if (typeof rangeRecord.min !== 'number' || typeof rangeRecord.max !== 'number') return null
      if (rangeRecord.min > rangeRecord.max) return null
      return {
        ...createCondition('value_check'),
        valueObjective: valueRecord.score,
        valueMin: rangeRecord.min,
        valueMax: rangeRecord.max
      }
    }
    case 'minecraft:entity_properties': {
      if (
        Object.keys(record).some(
          (key) => key !== 'condition' && key !== 'entity' && key !== 'predicate'
        )
      ) {
        return null
      }
      if (typeof record.entity !== 'string' || !ENTITIES.includes(record.entity)) return null
      if (!record.predicate || typeof record.predicate !== 'object' || Array.isArray(record.predicate)) {
        return null
      }
      const predicate = record.predicate as Record<string, unknown>
      if (Object.keys(predicate).some((key) => key !== 'flags')) return null
      if (!predicate.flags || typeof predicate.flags !== 'object' || Array.isArray(predicate.flags)) {
        return null
      }
      const flagsRecord = predicate.flags as Record<string, unknown>
      if (Object.keys(flagsRecord).some((key) => !ENTITY_FLAGS.includes(key as EntityFlag))) {
        return null
      }
      const flags = Object.entries(flagsRecord)
        .filter(([, value]) => value === true)
        .map(([key]) => key as EntityFlag)
      if (Object.values(flagsRecord).some((value) => typeof value !== 'boolean')) return null
      return { ...createCondition('entity_properties'), entity: record.entity, flags }
    }
    default:
      return null
  }
}

export function parsePredicate(content: string): PredicateModel | null {
  let root: unknown
  try {
    root = JSON.parse(content)
  } catch {
    return null
  }
  if (!root || typeof root !== 'object' || Array.isArray(root)) return null
  const record = root as Record<string, unknown>
  if (record.condition === 'minecraft:all_of' || record.condition === 'minecraft:any_of') {
    if (Object.keys(record).some((key) => key !== 'condition' && key !== 'terms')) return null
    if (!Array.isArray(record.terms) || record.terms.length === 0 || record.terms.length > 32) {
      return null
    }
    const conditions: PredicateCondition[] = []
    for (const term of record.terms) {
      const parsed = parseCondition(term)
      if (!parsed) return null
      conditions.push(parsed)
    }
    return {
      mode: record.condition === 'minecraft:all_of' ? 'all_of' : 'any_of',
      conditions
    }
  }
  const single = parseCondition(root)
  if (!single) return null
  return { mode: 'single', conditions: [single] }
}

function serializeCondition(condition: PredicateCondition): Record<string, unknown> {
  switch (condition.type) {
    case 'random_chance':
      return { condition: 'minecraft:random_chance', chance: condition.chance }
    case 'weather_check':
      return {
        condition: 'minecraft:weather_check',
        raining: condition.raining,
        thundering: condition.thundering
      }
    case 'time_check':
      return { condition: 'minecraft:time_check', value: condition.time }
    case 'value_check':
      return {
        condition: 'minecraft:value_check',
        value: {
          type: 'minecraft:score',
          target: { type: 'minecraft:fixed', name: 'this' },
          score: condition.valueObjective
        },
        range: { min: condition.valueMin, max: condition.valueMax }
      }
    default:
      return {
        condition: 'minecraft:entity_properties',
        entity: condition.entity,
        predicate: {
          flags: Object.fromEntries(
            condition.flags.map((flag) => [flag, true])
          )
        }
      }
  }
}

export function serializePredicate(model: PredicateModel): string {
  const conditions = model.conditions
  if (conditions.length === 1) {
    return `${JSON.stringify(serializeCondition(conditions[0]), null, 2)}\n`
  }
  return `${JSON.stringify(
    {
      condition: model.mode === 'any_of' ? 'minecraft:any_of' : 'minecraft:all_of',
      terms: conditions.map(serializeCondition)
    },
    null,
    2
  )}\n`
}

export function predicateMode(model: PredicateModel): PredicateMode {
  if (model.conditions.length <= 1) return 'single'
  return model.mode === 'any_of' ? 'any_of' : 'all_of'
}

export function updatePredicateMode(model: PredicateModel, mode: PredicateMode): PredicateModel {
  return { ...model, mode: mode === 'any_of' ? 'any_of' : mode === 'all_of' ? 'all_of' : 'single' }
}
