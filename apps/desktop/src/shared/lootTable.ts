export interface LootTableEntry {
  id: string
  weight: number
  minCount: number
  maxCount: number
}

export interface LootTableModel {
  type: string
  minRolls: number
  maxRolls: number
  bonusRolls: number
  entries: LootTableEntry[]
}

interface NumberRange {
  min: number
  max: number
}

function readNumber(input: unknown): NumberRange | null {
  if (typeof input === 'number' && Number.isFinite(input) && input >= 0) {
    return { min: input, max: input }
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const record = input as Record<string, unknown>
  if (
    record.type !== undefined &&
    record.type !== 'minecraft:uniform' &&
    record.type !== 'minecraft:constant'
  ) {
    return null
  }
  if (typeof record.min === 'number' && typeof record.max === 'number') {
    if (record.min < 0 || record.max < record.min) return null
    return { min: record.min, max: record.max }
  }
  if (typeof record.value === 'number') return { min: record.value, max: record.value }
  return null
}

function readCount(entry: Record<string, unknown>): NumberRange | null {
  if (entry.functions === undefined) return { min: 1, max: 1 }
  if (!Array.isArray(entry.functions) || entry.functions.length !== 1) return null
  const fn = entry.functions[0]
  if (!fn || typeof fn !== 'object' || Array.isArray(fn)) return null
  const record = fn as Record<string, unknown>
  if (record.function !== 'minecraft:set_count') return null
  return readNumber(record.count)
}

/**
 * Parse the simple single-pool item loot table produced by the template/builder.
 * Returns null for multi-pool / conditions / non-item entries so the UI can fall
 * back to raw JSON instead of silently dropping fields.
 */
export function parseLootTable(content: string): LootTableModel | null {
  let root: unknown
  try {
    root = JSON.parse(content)
  } catch {
    return null
  }
  if (!root || typeof root !== 'object' || Array.isArray(root)) return null
  const record = root as Record<string, unknown>
  if (typeof record.type !== 'string') return null
  if (!Array.isArray(record.pools) || record.pools.length !== 1) return null
  const pool = record.pools[0]
  if (!pool || typeof pool !== 'object' || Array.isArray(pool)) return null
  const poolRecord = pool as Record<string, unknown>
  const poolKeys = Object.keys(poolRecord)
  if (poolKeys.some((key) => !['rolls', 'bonus_rolls', 'entries'].includes(key))) return null
  const rolls = readNumber(poolRecord.rolls ?? 1)
  const bonus = poolRecord.bonus_rolls === undefined ? { min: 0, max: 0 } : readNumber(poolRecord.bonus_rolls)
  if (!rolls || !bonus || bonus.min !== bonus.max) return null
  if (!Array.isArray(poolRecord.entries) || poolRecord.entries.length === 0) return null
  if (poolRecord.entries.length > 64) return null

  const entries: LootTableEntry[] = []
  for (const raw of poolRecord.entries) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
    const entry = raw as Record<string, unknown>
    if (Object.keys(entry).some((key) => !['type', 'name', 'weight', 'functions'].includes(key))) {
      return null
    }
    if (entry.type !== undefined && entry.type !== 'minecraft:item') return null
    if (typeof entry.name !== 'string' || !entry.name) return null
    const weight =
      entry.weight === undefined
        ? 1
        : typeof entry.weight === 'number' && entry.weight > 0
          ? entry.weight
          : null
    if (weight === null) return null
    const count = readCount(entry)
    if (!count) return null
    entries.push({
      id: entry.name,
      weight,
      minCount: count.min,
      maxCount: count.max
    })
  }

  return {
    type: record.type,
    minRolls: rolls.min,
    maxRolls: rolls.max,
    bonusRolls: bonus.min,
    entries
  }
}

function numberProvider(min: number, max: number): number | Record<string, number | string> {
  if (min === max) return min
  return { type: 'minecraft:uniform', min, max }
}

export function serializeLootTable(model: LootTableModel): string {
  const entries = model.entries.map((entry) => {
    const result: Record<string, unknown> = {
      type: 'minecraft:item',
      name: entry.id
    }
    if (entry.weight !== 1) result.weight = entry.weight
    if (entry.minCount !== 1 || entry.maxCount !== 1) {
      result.functions = [
        {
          function: 'minecraft:set_count',
          count: numberProvider(entry.minCount, entry.maxCount)
        }
      ]
    }
    return result
  })
  const pool: Record<string, unknown> = {
    rolls: numberProvider(model.minRolls, model.maxRolls),
    entries
  }
  if (model.bonusRolls > 0) pool.bonus_rolls = model.bonusRolls
  return `${JSON.stringify({ type: model.type, pools: [pool] }, null, 2)}\n`
}

export function createLootTableModel(): LootTableModel {
  return {
    type: 'minecraft:chest',
    minRolls: 1,
    maxRolls: 1,
    bonusRolls: 0,
    entries: [
      {
        id: 'minecraft:diamond',
        weight: 1,
        minCount: 1,
        maxCount: 1
      }
    ]
  }
}
