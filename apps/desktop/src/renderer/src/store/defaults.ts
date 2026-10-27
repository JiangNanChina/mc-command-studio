import type { ExecuteClause, ItemComponent } from '@mcstudio/core'
import type { DatapackDataFileDraft, DatapackDraft, GenericDraft } from './model'

export const DATAPACK_FILE_TEMPLATES: Record<DatapackDataFileDraft['type'], { name: string; content: string }> = {
  predicate: {
    name: 'is_sneaking',
    content: JSON.stringify(
      {
        condition: 'minecraft:entity_properties',
        entity: 'this',
        predicate: { flags: { is_sneaking: true } }
      },
      null,
      2
    )
  },
  loot_table: {
    name: 'reward',
    content: JSON.stringify(
      {
        type: 'minecraft:chest',
        pools: [
          {
            rolls: 1,
            entries: [{ type: 'minecraft:item', name: 'minecraft:diamond' }]
          }
        ]
      },
      null,
      2
    )
  },
  advancement: {
    name: 'root',
    content: JSON.stringify(
      {
        display: {
          icon: { id: 'minecraft:stone' },
          title: { text: '示例进度' },
          description: { text: '在数据包工作区中编辑。' },
          frame: 'task',
          show_toast: true,
          announce_to_chat: true,
          hidden: false
        },
        criteria: { requirement: { trigger: 'minecraft:impossible' } }
      },
      null,
      2
    )
  }
}

export function defaultDatapackDraft(): DatapackDraft {
  return {
    namespace: 'mcstudio',
    description: 'MC 指令工坊数据包',
    functions: [{ id: 'main', name: 'main', commands: 'say 你好' }],
    activeFunctionId: 'main',
    loadFunction: '',
    tickFunction: '',
    dataFiles: [],
    activeDataFileId: ''
  }
}

export function emptyGeneric(): GenericDraft {
  return { root: null, steps: [] }
}

export function defaultComponent(kind: ItemComponent['kind']): ItemComponent {
  switch (kind) {
    case 'custom_name':
    case 'item_name':
      return { kind, text: '', color: '', italic: false }
    case 'lore':
      return { kind, lines: [{ text: '', color: '', italic: false }] }
    case 'enchantments':
      return { kind, entries: [{ id: 'minecraft:sharpness', level: 1 }] }
    case 'unbreakable':
      return { kind }
    case 'max_stack_size':
      return { kind, value: 64 }
    case 'max_damage':
      return { kind, value: 1000 }
    case 'damage':
      return { kind, value: 0 }
    case 'rarity':
      return { kind, value: 'common' }
    case 'enchantment_glint_override':
      return { kind, value: true }
    case 'custom_model_data':
    case 'custom_data':
      return { kind, raw: '' }
    case 'raw':
      return { kind, id: 'minecraft:tooltip_display', value: '{}' }
  }
}

export function newClauseId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `clause-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

export function defaultExecuteClause(kind: ExecuteClause['kind']): ExecuteClause {
  const id = newClauseId()
  switch (kind) {
    case 'as':
    case 'at':
      return { id, kind, selector: { base: '@s' } }
    case 'positioned':
    case 'facing':
      return { id, kind, position: { x: '~', y: '~', z: '~' } }
    case 'align':
      return { id, kind, axes: 'xyz' }
    case 'anchored':
      return { id, kind, anchor: 'eyes' }
    case 'rotated':
      return { id, kind, yaw: '0', pitch: '0' }
    case 'in':
      return { id, kind, dimension: 'minecraft:overworld' }
    case 'if':
    case 'unless':
      return { id, kind, condition: { type: 'entity', selector: { base: '@e' } } }
    case 'store':
      return { id, kind, mode: 'result', target: '@s', objective: 'result' }
    case 'raw':
      return { id, kind, text: '' }
  }
}

