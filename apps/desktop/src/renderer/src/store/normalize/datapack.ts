// 数据包/函数/数据命令命令的容错归一化。
import {
  createDefaultSpreadplayersOptions,
  createDefaultRandomOptions,
  createDefaultTickOptions,
  createDefaultChainOptions,
  createDefaultAdvancementOptions,
  createDefaultFunctionOptions,
  createDefaultScheduleOptions,
  createDefaultItemOptions,
  createDefaultDataOptions,
  createDefaultLootOptions,
  type ChainBlock,
  type ChainOptions,
  type AdvancementOptions,
  type ScheduleOptions,
  type ItemOptions,
  type SpreadplayersOptions,
  type RandomOptions,
  type TickOptions,
  type DataOptions,
  type LootOptions
} from '@mcstudio/core'
import { normalizePosition, normalizeTextSegment } from './common'
import { defaultDatapackDraft } from '../defaults'
import type { AutomationOptions, DatapackDataFileDraft, DatapackDraft } from '../model'

export function normalizeDatapack(input: Partial<DatapackDraft> | undefined): DatapackDraft {
  const fallback = defaultDatapackDraft()
  if (!input) return fallback
  const functions = Array.isArray(input.functions)
    ? input.functions
        .filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string')
        .map((item, index) => ({
          id: item.id,
          name: item.name,
          commands: typeof item.commands === 'string' ? item.commands : ''
        }))
        .filter((item) => item.name.trim().length > 0)
    : fallback.functions
  const list = functions.length > 0 ? functions : fallback.functions
  const activeFunctionId = list.some((item) => item.id === input.activeFunctionId)
    ? (input.activeFunctionId as string)
    : list[0].id
  const names = new Set(list.map((item) => item.name))
  const dataFiles = Array.isArray(input.dataFiles)
    ? input.dataFiles
        .filter((item) => item && typeof item.id === 'string' && typeof item.type === 'string')
        .map((item) => ({
          id: item.id,
          type: (['advancement', 'predicate', 'loot_table'].includes(item.type)
            ? item.type
            : 'predicate') as DatapackDataFileDraft['type'],
          name: typeof item.name === 'string' ? item.name : 'file',
          content: typeof item.content === 'string' ? item.content : '{}'
        }))
    : []
  return {
    namespace: typeof input.namespace === 'string' ? input.namespace : fallback.namespace,
    description:
      typeof input.description === 'string' ? input.description : fallback.description,
    functions: list,
    activeFunctionId,
    loadFunction:
      typeof input.loadFunction === 'string' && names.has(input.loadFunction)
        ? input.loadFunction
        : '',
    tickFunction:
      typeof input.tickFunction === 'string' && names.has(input.tickFunction)
        ? input.tickFunction
        : '',
    dataFiles,
    activeDataFileId: dataFiles.some((item) => item.id === input.activeDataFileId)
      ? (input.activeDataFileId as string)
      : (dataFiles[0]?.id ?? '')
  }
}

export function normalizeAutomation(input: Partial<AutomationOptions> | undefined): AutomationOptions {
  const advancementFallback = createDefaultAdvancementOptions()
  const functionFallback = createDefaultFunctionOptions()
  const scheduleFallback = createDefaultScheduleOptions()
  const advancementModes: AdvancementOptions['mode'][] = [
    'everything',
    'only',
    'from',
    'through',
    'until'
  ]
  const scheduleModes: ScheduleOptions['mode'][] = ['append', 'replace']
  return {
    advancement: {
      action: input?.advancement?.action === 'revoke' ? 'revoke' : 'grant',
      mode: advancementModes.includes(input?.advancement?.mode as AdvancementOptions['mode'])
        ? (input?.advancement?.mode as AdvancementOptions['mode'])
        : 'only',
      target: input?.advancement?.target?.base
        ? input.advancement.target
        : advancementFallback.target,
      advancement:
        typeof input?.advancement?.advancement === 'string'
          ? input.advancement.advancement
          : advancementFallback.advancement,
      criterion:
        typeof input?.advancement?.criterion === 'string'
          ? input.advancement.criterion
          : ''
    },
    function: {
      name:
        typeof input?.function?.name === 'string'
          ? input.function.name
          : functionFallback.name,
      argumentsEnabled: Boolean(input?.function?.argumentsEnabled),
      arguments:
        typeof input?.function?.arguments === 'string'
          ? input.function.arguments
          : functionFallback.arguments
    },
    schedule: {
      action: input?.schedule?.action === 'clear' ? 'clear' : 'function',
      functionName:
        typeof input?.schedule?.functionName === 'string'
          ? input.schedule.functionName
          : scheduleFallback.functionName,
      time: typeof input?.schedule?.time === 'string' ? input.schedule.time : scheduleFallback.time,
      mode: scheduleModes.includes(input?.schedule?.mode as ScheduleOptions['mode'])
        ? (input?.schedule?.mode as ScheduleOptions['mode'])
        : 'replace'
    }
  }
}

export function normalizeItemCommand(input: Partial<ItemOptions> | undefined): ItemOptions {
  const fallback = createDefaultItemOptions()
  if (!input) return fallback
  return {
    action: input.action === 'modify' ? 'modify' : 'replace',
    targetType: input.targetType === 'block' ? 'block' : 'entity',
    target: input.target?.base ? input.target : fallback.target,
    position: normalizePosition(input.position),
    slot: typeof input.slot === 'string' ? input.slot : fallback.slot,
    item: typeof input.item === 'string' ? input.item : fallback.item,
    count: typeof input.count === 'string' ? input.count : fallback.count,
    modifier: typeof input.modifier === 'string' ? input.modifier : fallback.modifier,
    nbtEnabled: Boolean(input.nbtEnabled),
    nbt: typeof input.nbt === 'string' ? input.nbt : fallback.nbt
  }
}

export function normalizeDataCommand(input: Partial<DataOptions> | undefined): DataOptions {
  const fallback = createDefaultDataOptions()
  if (!input) return fallback
  const operations: DataOptions['modifyOperation'][] = [
    'set',
    'merge',
    'append',
    'prepend',
    'insert',
    'remove'
  ]
  return {
    action:
      input.action === 'merge' || input.action === 'remove' || input.action === 'modify'
        ? input.action
        : 'get',
    targetType:
      input.targetType === 'block' || input.targetType === 'storage'
        ? input.targetType
        : 'entity',
    target: input.target?.base ? input.target : fallback.target,
    position: normalizePosition(input.position),
    storage: typeof input.storage === 'string' ? input.storage : fallback.storage,
    path: typeof input.path === 'string' ? input.path : fallback.path,
    scaleEnabled: Boolean(input.scaleEnabled),
    scale: typeof input.scale === 'string' ? input.scale : fallback.scale,
    nbt: typeof input.nbt === 'string' ? input.nbt : fallback.nbt,
    modifyOperation: operations.includes(input.modifyOperation as DataOptions['modifyOperation'])
      ? (input.modifyOperation as DataOptions['modifyOperation'])
      : 'set',
    index: typeof input.index === 'string' ? input.index : fallback.index,
    fromEnabled: Boolean(input.fromEnabled),
    fromTargetType:
      input.fromTargetType === 'block' || input.fromTargetType === 'storage'
        ? input.fromTargetType
        : 'entity',
    fromTarget: input.fromTarget?.base ? input.fromTarget : fallback.fromTarget,
    fromPosition: normalizePosition(input.fromPosition),
    fromStorage:
      typeof input.fromStorage === 'string' ? input.fromStorage : fallback.fromStorage,
    fromPath: typeof input.fromPath === 'string' ? input.fromPath : fallback.fromPath
  }
}

export function normalizeLoot(input: Partial<LootOptions> | undefined): LootOptions {
  const fallback = createDefaultLootOptions()
  if (!input) return fallback
  return {
    action:
      input.action === 'insert' ||
      input.action === 'spawn' ||
      input.action === 'replace'
        ? input.action
        : 'give',
    target: input.target?.base ? input.target : fallback.target,
    position: normalizePosition(input.position),
    lootTable: typeof input.lootTable === 'string' ? input.lootTable : fallback.lootTable,
    slot: typeof input.slot === 'string' ? input.slot : fallback.slot,
    replaceTargetType: input.replaceTargetType === 'entity' ? 'entity' : 'block',
    count: typeof input.count === 'string' ? input.count : fallback.count
  }
}

export function normalizeChain(input: Partial<ChainOptions> | undefined): ChainOptions {
  const fallback = createDefaultChainOptions()
  if (!input) return fallback
  const directions: ChainOptions['direction'][] = [
    'up',
    'down',
    'north',
    'south',
    'east',
    'west'
  ]
  const kinds: ChainBlock['kind'][] = ['impulse', 'chain', 'repeating']
  const blocks = Array.isArray(input.blocks)
    ? input.blocks
        .filter((block) => block && typeof block.id === 'string')
        .map((block) => ({
          id: block.id,
          command: typeof block.command === 'string' ? block.command : '',
          kind: kinds.includes(block.kind as ChainBlock['kind'])
            ? (block.kind as ChainBlock['kind'])
            : 'chain',
          conditional: Boolean(block.conditional),
          auto: Boolean(block.auto)
        }))
    : fallback.blocks
  return {
    origin: normalizePosition(input.origin),
    direction: directions.includes(input.direction as ChainOptions['direction'])
      ? (input.direction as ChainOptions['direction'])
      : 'east',
    blocks
  }
}

export function normalizeRandom(input: Partial<RandomOptions> | undefined): RandomOptions {
  const fallback = createDefaultRandomOptions()
  if (!input) return fallback
  return {
    mode: input.mode === 'roll' ? 'roll' : 'value',
    range: typeof input.range === 'string' ? input.range : fallback.range,
    sequence: typeof input.sequence === 'string' ? input.sequence : fallback.sequence
  }
}

export function normalizeTick(input: Partial<TickOptions> | undefined): TickOptions {
  const fallback = createDefaultTickOptions()
  if (!input) return fallback
  const actions: TickOptions['action'][] = [
    'freeze',
    'unfreeze',
    'sprint',
    'sprintStop',
    'rate',
    'step',
    'stepStop'
  ]
  return {
    action: actions.includes(input.action as TickOptions['action'])
      ? (input.action as TickOptions['action'])
      : 'freeze',
    rate: typeof input.rate === 'string' ? input.rate : fallback.rate,
    time: typeof input.time === 'string' ? input.time : fallback.time
  }
}

export function normalizeSpreadplayers(
  input: Partial<SpreadplayersOptions> | undefined
): SpreadplayersOptions {
  const fallback = createDefaultSpreadplayersOptions()
  if (!input) return fallback
  return {
    centerX: typeof input.centerX === 'string' ? input.centerX : fallback.centerX,
    centerZ: typeof input.centerZ === 'string' ? input.centerZ : fallback.centerZ,
    spreadDistance:
      typeof input.spreadDistance === 'string' ? input.spreadDistance : fallback.spreadDistance,
    maxRange: typeof input.maxRange === 'string' ? input.maxRange : fallback.maxRange,
    underEnabled: Boolean(input.underEnabled),
    maxHeight: typeof input.maxHeight === 'string' ? input.maxHeight : fallback.maxHeight,
    respectTeams: input.respectTeams !== false,
    targets: input.targets?.base ? input.targets : fallback.targets
  }
}
