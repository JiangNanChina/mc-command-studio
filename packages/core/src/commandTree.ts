import { error, warn } from './diagnostics'
import type { BuildResult, CommandNodeData, CommandTree, Diagnostic } from './types'

export interface CommandRoot {
  name: string
  node: CommandNodeData
}

export interface GenericStep {
  /** 参数节点在父节点 children 中的键；字面量节点输出该键 */
  name: string
  node: CommandNodeData
  value?: string
}

export interface ParserInfo {
  label: string
  hint: string
  placeholder: string
}

const PARSER_INFO: Record<string, ParserInfo> = {
  'brigadier:integer': { label: '整数', hint: '例：1、-5、64', placeholder: '整数' },
  'brigadier:long': { label: '长整数', hint: '例：100000', placeholder: '长整数' },
  'brigadier:double': { label: '小数', hint: '例：1.5、-0.25', placeholder: '小数' },
  'brigadier:float': { label: '小数', hint: '例：1.5、-0.25', placeholder: '小数' },
  'brigadier:bool': { label: '布尔值', hint: 'true 或 false', placeholder: 'true / false' },
  'brigadier:string': { label: '文本', hint: '按命令要求填写文本', placeholder: '文本' },
  'minecraft:entity': {
    label: '实体/选择器',
    hint: '玩家名或 @s/@p/@a/@r/@e[@e…]',
    placeholder: '@s'
  },
  'minecraft:game_profile': { label: '玩家', hint: '玩家名或选择器', placeholder: '@a' },
  'minecraft:block_pos': {
    label: '方块坐标',
    hint: '例：0 64 0、~ ~1 ~、^ ^ ^',
    placeholder: '~ ~ ~'
  },
  'minecraft:column_pos': { label: '列坐标', hint: '例：0 0、~ ~', placeholder: '~ ~' },
  'minecraft:vec3': { label: '三维坐标', hint: '例：0.5 64 0.5', placeholder: '~ ~ ~' },
  'minecraft:vec2': { label: '二维坐标', hint: '例：0 0', placeholder: '~ ~' },
  'minecraft:rotation': { label: '旋转角度', hint: '例：0 0', placeholder: '0 0' },
  'minecraft:entity_anchor': { label: '实体锚点', hint: 'eyes 或 feet', placeholder: 'eyes' },
  'minecraft:swizzle': { label: '坐标轴', hint: '例：x、xy、xyz', placeholder: 'xyz' },
  'minecraft:heightmap': {
    label: '高度图',
    hint: 'world_surface / motion_blocking 等',
    placeholder: 'world_surface'
  },
  'minecraft:resource_location': {
    label: '资源 ID',
    hint: '例：minecraft:diamond_sword',
    placeholder: 'minecraft:…'
  },
  'minecraft:resource_key': { label: '资源键', hint: '注册表中的 ID', placeholder: 'minecraft:…' },
  'minecraft:resource': { label: '资源', hint: '注册表中的 ID 或标签', placeholder: 'minecraft:…' },
  'minecraft:resource_or_tag': {
    label: '资源/标签',
    hint: 'ID 或 #标签',
    placeholder: 'minecraft:… / #minecraft:…'
  },
  'minecraft:resource_or_tag_key': {
    label: '资源/标签键',
    hint: 'ID 或 #标签',
    placeholder: 'minecraft:…'
  },
  'minecraft:resource_selector': {
    label: '资源选择',
    hint: '资源 ID',
    placeholder: 'minecraft:…'
  },
  'minecraft:dimension': {
    label: '维度',
    hint: 'minecraft:overworld / the_nether / the_end',
    placeholder: 'minecraft:overworld'
  },
  'minecraft:gamemode': {
    label: '游戏模式',
    hint: 'survival / creative / adventure / spectator',
    placeholder: 'survival'
  },
  'minecraft:objective': { label: '记分板目标', hint: '目标名', placeholder: 'objective' },
  'minecraft:objective_criteria': {
    label: '记分板准则',
    hint: '例：dummy、minecraft.mined:minecraft.stone',
    placeholder: 'dummy'
  },
  'minecraft:team': { label: '队伍', hint: '队伍名', placeholder: 'team' },
  'minecraft:team_color': { label: '队伍颜色', hint: 'red / blue / gold …', placeholder: 'red' },
  'minecraft:scoreboard_slot': { label: '显示位置', hint: 'sidebar / list / below_name', placeholder: 'sidebar' },
  'minecraft:operation': { label: '运算', hint: '+=、-=、*=、/=、%=、=、<、>、><', placeholder: '+=' },
  'minecraft:slot_source': { label: '槽位来源', hint: '例：container.0、weapon.mainhand', placeholder: 'container.0' },
  'minecraft:item_slot': { label: '槽位', hint: '例：0、weapon.mainhand、armor.head', placeholder: '0' },
  'minecraft:item_stack': {
    label: '物品',
    hint: '例：minecraft:diamond_sword[minecraft:custom_name={text:"剑"}]',
    placeholder: 'minecraft:…'
  },
  'minecraft:block_state': { label: '方块状态', hint: '例：minecraft:stone、oak_stairs[facing=north]', placeholder: 'minecraft:stone' },
  'minecraft:block_predicate': { label: '方块谓词', hint: '例：#minecraft:logs、stone[axis=y]', placeholder: '#minecraft:logs' },
  'minecraft:item_predicate': { label: '物品谓词', hint: '例：#minecraft:swords、diamond_sword', placeholder: '#minecraft:swords' },
  'minecraft:nbt_tag': { label: 'NBT 标签', hint: '例：{CustomName:"…"}', placeholder: '{…}' },
  'minecraft:nbt_compound_tag': { label: 'NBT 复合标签', hint: '必须是一个完整的 {…}', placeholder: '{…}' },
  'minecraft:nbt_path': { label: 'NBT 路径', hint: '例：Inventory[0].id', placeholder: 'path.to.tag' },
  'minecraft:component': { label: '文本组件', hint: '例：{text:"你好",color:"gold"}', placeholder: '{text:"…"}' },
  'minecraft:style': { label: '文本样式', hint: '例：{color:"gold",bold:true}', placeholder: '{…}' },
  'minecraft:message': { label: '消息', hint: '纯文本或文本组件', placeholder: '消息' },
  'minecraft:particle': { label: '粒子', hint: '例：minecraft:flame', placeholder: 'minecraft:flame' },
  'minecraft:time': { label: '时间', hint: '例：100、5s、1d', placeholder: '100' },
  'minecraft:int_range': { label: '整数范围', hint: '例：1..10、..5、5..', placeholder: '1..10' },
  'minecraft:float_range': { label: '小数范围', hint: '例：0.0..1.0', placeholder: '0.0..1.0' },
  'minecraft:uuid': { label: 'UUID', hint: '标准 UUID', placeholder: '00000000-0000-0000-0000-000000000000' },
  'minecraft:hex_color': { label: '颜色', hint: '例：#ffaa00', placeholder: '#ffaa00' },
  'minecraft:loot_table': { label: '战利品表', hint: '例：minecraft:chests/simple_dungeon', placeholder: 'minecraft:…' },
  'minecraft:loot_modifier': { label: '战利品修饰器', hint: '资源 ID', placeholder: 'minecraft:…' },
  'minecraft:loot_predicate': { label: '战利品谓词', hint: '资源 ID', placeholder: 'minecraft:…' },
  'minecraft:function': { label: '函数', hint: '例：namespace:path', placeholder: 'namespace:path' },
  'minecraft:feature': { label: '地物', hint: '资源 ID', placeholder: 'minecraft:…' },
  'minecraft:dialog': { label: '对话框', hint: '资源 ID', placeholder: 'minecraft:…' },
  'minecraft:template_mirror': { label: '镜像', hint: 'none / left_right / front_back', placeholder: 'none' },
  'minecraft:template_rotation': { label: '旋转', hint: 'none / clockwise_90 / 180 / counterclockwise_90', placeholder: 'none' },
  'minecraft:swing_animation': { label: '挥手动画', hint: 'none / whisper / ...', placeholder: 'none' },
  'minecraft:context_int_provider': { label: '整数上下文', hint: '例：1、{…}', placeholder: '1' },
  'minecraft:context_float_provider': { label: '小数上下文', hint: '例：1.0、{…}', placeholder: '1.0' },
  'minecraft:score_holder': { label: '分数持有者', hint: '* 或选择器', placeholder: '*' }
}

export function describeParser(parser: string | undefined): ParserInfo {
  if (!parser) return { label: '参数', hint: '按命令要求填写', placeholder: '' }
  return (
    PARSER_INFO[parser] ?? {
      label: parser,
      hint: '该参数类型暂无专用编辑器，请按命令语法填写',
      placeholder: ''
    }
  )
}

export function getRoots(tree: CommandTree): CommandRoot[] {
  const children = tree.children ?? {}
  return Object.entries(children)
    .map(([name, node]) => ({ name, node }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getChildren(node: CommandNodeData): { name: string; node: CommandNodeData }[] {
  const children = node.children ?? {}
  return Object.entries(children).map(([name, child]) => ({ name, node: child }))
}

export function isExecutable(node: CommandNodeData): boolean {
  return node.executable === true
}

export function hasChildren(node: CommandNodeData): boolean {
  return Object.keys(node.children ?? {}).length > 0
}

export function isArgument(node: CommandNodeData): boolean {
  return node.type === 'argument'
}

export function isLiteral(node: CommandNodeData): boolean {
  return node.type === 'literal'
}

export function getNodeAt(
  tree: CommandTree,
  names: string[]
): CommandNodeData | undefined {
  let current: CommandNodeData | undefined = tree
  for (const name of names) {
    current = current?.children?.[name]
    if (!current) return undefined
  }
  return current
}

export function serializeGeneric(rootName: string, steps: GenericStep[]): BuildResult {
  const diagnostics: Diagnostic[] = []
  const tokens = [rootName]

  for (const step of steps) {
    if (step.node.type === 'literal') {
      tokens.push(step.name)
      continue
    }
    const value = step.value ?? ''
    if (!value.trim()) {
      diagnostics.push(error('generic.empty', `参数 ${step.name} 不能为空`, step.name))
    } else {
      diagnostics.push(...validateRawArgument(step.node.parser, value, step.node.properties, step.name))
      tokens.push(value.trim())
    }
  }

  const text = tokens.join(' ')
  if (text.length > 32500) {
    diagnostics.push(error('generic.length', '命令超过 32,500 字符上限', 'command'))
  }
  return { text, diagnostics }
}

const COORD = /^[~^]?-?\d*(?:\.\d+)?$/
const INTEGER = /^-?\d+$/
const DECIMAL = /^-?\d+(?:\.\d+)?$/
const RESOURCE = /^#?[a-z0-9_.-]+(?::[a-z0-9_./-]+)?$/
const RANGE = /^(?:-?\d+(?:\.\d+)?)?\.\.(?:-?\d+(?:\.\d+)?)?$|^-?\d+(?:\.\d+)?$/

function isBalanced(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return false
  let depth = 0
  let quoted = false
  let quoteChar = ''
  for (let i = 0; i < trimmed.length; i += 1) {
    const char = trimmed[i]
    if (quoted) {
      if (char === '\\') i += 1
      else if (char === quoteChar) quoted = false
      continue
    }
    if (char === '"' || char === "'") {
      quoted = true
      quoteChar = char
    } else if (char === '{' || char === '[') depth += 1
    else if (char === '}' || char === ']') {
      depth -= 1
      if (depth < 0) return false
    }
  }
  return depth === 0
}

/** 通用参数的基础校验：只做格式检查，不连接游戏。 */
export function validateRawArgument(
  parser: string | undefined,
  value: string,
  properties: Record<string, unknown> | undefined,
  field: string
): Diagnostic[] {
  const diagnostics: Diagnostic[] = []
  const text = value.trim()
  if (!text) return diagnostics

  const integerCheck = (): void => {
    if (!INTEGER.test(text)) {
      diagnostics.push(error('arg.integer', '必须是整数', field))
      return
    }
    const min = typeof properties?.min === 'number' ? properties.min : undefined
    const max = typeof properties?.max === 'number' ? properties.max : undefined
    const parsed = Number(text)
    if (min !== undefined && parsed < min) {
      diagnostics.push(error('arg.min', `不能小于 ${min}`, field))
    }
    if (max !== undefined && parsed > max) {
      diagnostics.push(error('arg.max', `不能大于 ${max}`, field))
    }
  }

  switch (parser) {
    case 'brigadier:integer':
    case 'brigadier:long':
      integerCheck()
      break
    case 'brigadier:double':
    case 'brigadier:float':
      if (!DECIMAL.test(text)) diagnostics.push(error('arg.number', '必须是数字', field))
      break
    case 'brigadier:bool':
      if (text !== 'true' && text !== 'false') {
        diagnostics.push(error('arg.bool', '必须是 true 或 false', field))
      }
      break
    case 'minecraft:block_pos':
    case 'minecraft:vec3': {
      const parts = text.split(/\s+/)
      if (parts.length !== 3 || !parts.every((part) => COORD.test(part))) {
        diagnostics.push(error('arg.vec3', '需要 3 个坐标，例：~ ~1 ~', field))
      }
      break
    }
    case 'minecraft:column_pos':
    case 'minecraft:vec2': {
      const parts = text.split(/\s+/)
      if (parts.length !== 2 || !parts.every((part) => COORD.test(part))) {
        diagnostics.push(error('arg.vec2', '需要 2 个坐标，例：~ ~', field))
      }
      break
    }
    case 'minecraft:rotation': {
      const parts = text.split(/\s+/)
      if (parts.length !== 2 || !parts.every((part) => DECIMAL.test(part))) {
        diagnostics.push(error('arg.rotation', '需要 2 个数字，例：0 0', field))
      }
      break
    }
    case 'minecraft:resource_location':
    case 'minecraft:resource_key':
    case 'minecraft:resource':
    case 'minecraft:resource_or_tag':
    case 'minecraft:resource_or_tag_key':
    case 'minecraft:resource_selector':
    case 'minecraft:dimension':
    case 'minecraft:function':
    case 'minecraft:feature':
    case 'minecraft:dialog':
    case 'minecraft:loot_table':
    case 'minecraft:loot_modifier':
    case 'minecraft:loot_predicate': {
      if (!RESOURCE.test(text)) {
        diagnostics.push(error('arg.resource', '资源 ID 格式不正确', field))
      }
      break
    }
    case 'minecraft:int_range':
    case 'minecraft:float_range': {
      if (!RANGE.test(text)) {
        diagnostics.push(error('arg.range', '范围格式不正确，例：1..10', field))
      }
      break
    }
    case 'minecraft:time': {
      if (!/^-?\d+(?:\.\d+)?[tsd]?$/.test(text)) {
        diagnostics.push(error('arg.time', '时间格式不正确，例：100、5s、1d', field))
      }
      break
    }
    case 'minecraft:hex_color': {
      if (!/^#[0-9a-fA-F]{6}$/.test(text)) {
        diagnostics.push(error('arg.color', '颜色必须是 #RRGGBB', field))
      }
      break
    }
    case 'minecraft:uuid': {
      if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(text)) {
        diagnostics.push(error('arg.uuid', 'UUID 格式不正确', field))
      }
      break
    }
    case 'minecraft:nbt_tag':
    case 'minecraft:nbt_compound_tag': {
      if (!isBalanced(text)) {
        diagnostics.push(error('arg.nbt', 'NBT 必须是一个完整的 {…}', field))
      }
      break
    }
    case 'minecraft:block_state':
    case 'minecraft:block_predicate':
    case 'minecraft:item_predicate':
    case 'minecraft:item_stack': {
      if (!/^#?[a-z0-9_.-]+(?::[a-z0-9_./-]+)?/.test(text)) {
        diagnostics.push(error('arg.id', '必须以资源 ID 开头', field))
      }
      break
    }
    case 'minecraft:gamemode': {
      if (!['survival', 'creative', 'adventure', 'spectator'].includes(text)) {
        diagnostics.push(warn('arg.gamemode', '常见值为 survival/creative/adventure/spectator', field))
      }
      break
    }
    default:
      break
  }

  return diagnostics
}

export interface TreeStats {
  roots: number
  literals: number
  parsers: number
}

export function collectStats(tree: CommandTree): TreeStats {
  const parsers = new Set<string>()
  let literals = 0

  const visit = (node: CommandNodeData): void => {
    if (node.type === 'literal') literals += 1
    if (node.parser) parsers.add(node.parser)
    for (const child of Object.values(node.children ?? {})) visit(child)
  }

  for (const child of Object.values(tree.children ?? {})) visit(child)
  return {
    roots: Object.keys(tree.children ?? {}).length,
    literals,
    parsers: parsers.size
  }
}

export function permissionLabel(node: CommandNodeData): string {
  const level = node.permissions?.permission?.level
  switch (level) {
    case 'gamemasters':
      return '需要管理员权限'
    case 'admins':
      return '需要管理员权限'
    case 'moderators':
      return '需要管理员权限'
    case 'all':
      return '所有玩家可用'
    default:
      return ''
  }
}
