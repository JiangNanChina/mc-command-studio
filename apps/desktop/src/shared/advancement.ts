export type AdvancementFrame = 'task' | 'goal' | 'challenge'

export interface AdvancementCriterion {
  name: string
  trigger: string
}

export interface AdvancementModel {
  parent: string
  displayEnabled: boolean
  icon: string
  title: string
  description: string
  frame: AdvancementFrame
  showToast: boolean
  announceToChat: boolean
  hidden: boolean
  criteria: AdvancementCriterion[]
}

export const ADVANCEMENT_TRIGGERS = [
  'minecraft:impossible',
  'minecraft:inventory_changed',
  'minecraft:tick',
  'minecraft:player_killed_entity',
  'minecraft:entity_killed_player',
  'minecraft:consume_item',
  'minecraft:placed_block',
  'minecraft:location',
  'minecraft:villager_trade',
  'minecraft:recipe_unlocked',
  'minecraft:effects_changed',
  'minecraft:used_ender_eye',
  'minecraft:bred_animals',
  'minecraft:cured_zombie_villager',
  'minecraft:fall_from_height',
  'minecraft:ride_entity_in_lava',
  'minecraft:kill_mob_near_sculk_catalyst',
  'minecraft:allay_drop_item_on_block'
]

const FRAMES: AdvancementFrame[] = ['task', 'goal', 'challenge']

function readText(input: unknown): string | null {
  if (typeof input === 'string') return input
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const record = input as Record<string, unknown>
  if (Object.keys(record).some((key) => key !== 'text')) return null
  return typeof record.text === 'string' ? record.text : null
}

export function parseAdvancement(content: string): AdvancementModel | null {
  let root: unknown
  try {
    root = JSON.parse(content)
  } catch {
    return null
  }
  if (!root || typeof root !== 'object' || Array.isArray(root)) return null
  const record = root as Record<string, unknown>
  if (Object.keys(record).some((key) => !['parent', 'display', 'criteria'].includes(key))) {
    return null
  }
  if (record.parent !== undefined && typeof record.parent !== 'string') return null

  let displayEnabled = false
  let icon = 'minecraft:stone'
  let title = ''
  let description = ''
  let frame: AdvancementFrame = 'task'
  let showToast = true
  let announceToChat = true
  let hidden = false

  if (record.display !== undefined) {
    if (!record.display || typeof record.display !== 'object' || Array.isArray(record.display)) {
      return null
    }
    const display = record.display as Record<string, unknown>
    if (
      Object.keys(display).some(
        (key) =>
          ![
            'icon',
            'title',
            'description',
            'frame',
            'show_toast',
            'announce_to_chat',
            'hidden'
          ].includes(key)
      )
    ) {
      return null
    }
    if (!display.icon || typeof display.icon !== 'object' || Array.isArray(display.icon)) {
      return null
    }
    const iconRecord = display.icon as Record<string, unknown>
    if (Object.keys(iconRecord).some((key) => key !== 'id')) return null
    if (typeof iconRecord.id !== 'string') return null
    const titleValue = readText(display.title)
    const descriptionValue = readText(display.description)
    if (titleValue === null || descriptionValue === null) return null
    if (typeof display.frame !== 'string' || !FRAMES.includes(display.frame as AdvancementFrame)) {
      return null
    }
    if (
      display.show_toast !== undefined &&
      typeof display.show_toast !== 'boolean'
    ) {
      return null
    }
    if (
      display.announce_to_chat !== undefined &&
      typeof display.announce_to_chat !== 'boolean'
    ) {
      return null
    }
    if (display.hidden !== undefined && typeof display.hidden !== 'boolean') return null

    displayEnabled = true
    icon = iconRecord.id
    title = titleValue
    description = descriptionValue
    frame = display.frame as AdvancementFrame
    showToast = display.show_toast !== false
    announceToChat = display.announce_to_chat !== false
    hidden = display.hidden === true
  }

  if (!record.criteria || typeof record.criteria !== 'object' || Array.isArray(record.criteria)) {
    return null
  }
  const criteriaRecord = record.criteria as Record<string, unknown>
  const criteria: AdvancementCriterion[] = []
  for (const [name, raw] of Object.entries(criteriaRecord)) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
    const criterion = raw as Record<string, unknown>
    if (Object.keys(criterion).some((key) => key !== 'trigger')) return null
    if (typeof criterion.trigger !== 'string') return null
    criteria.push({ name, trigger: criterion.trigger })
  }
  if (criteria.length === 0 || criteria.length > 32) return null

  return {
    parent: typeof record.parent === 'string' ? record.parent : '',
    displayEnabled,
    icon,
    title,
    description,
    frame,
    showToast,
    announceToChat,
    hidden,
    criteria
  }
}

export function serializeAdvancement(model: AdvancementModel): string {
  const result: Record<string, unknown> = {}
  if (model.parent.trim()) result.parent = model.parent.trim()
  if (model.displayEnabled) {
    result.display = {
      icon: { id: model.icon },
      title: { text: model.title },
      description: { text: model.description },
      frame: model.frame,
      show_toast: model.showToast,
      announce_to_chat: model.announceToChat,
      hidden: model.hidden
    }
  }
  result.criteria = Object.fromEntries(
    model.criteria.map((criterion) => [
      criterion.name,
      { trigger: criterion.trigger }
    ])
  )
  return `${JSON.stringify(result, null, 2)}\n`
}

export function createAdvancementModel(): AdvancementModel {
  return {
    parent: '',
    displayEnabled: true,
    icon: 'minecraft:stone',
    title: '示例进度',
    description: '在数据包工作区中编辑。',
    frame: 'task',
    showToast: true,
    announceToChat: true,
    hidden: false,
    criteria: [{ name: 'requirement', trigger: 'minecraft:impossible' }]
  }
}
