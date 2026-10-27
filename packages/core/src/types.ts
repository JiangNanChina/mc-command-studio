/** 命令树节点（来自 Minecraft 数据生成器的 commands.json） */
export interface CommandNodeData {
  type: 'root' | 'literal' | 'argument'
  children?: Record<string, CommandNodeData>
  parser?: string
  properties?: Record<string, unknown>
  executable?: boolean
  redirect?: string | CommandNodeData
  permissions?: CommandPermissionNode
}

export interface CommandPermissionNode {
  type: string
  permission?: {
    type: string
    level?: string
  }
}

export type CommandTree = CommandNodeData & { type: 'root' }

export interface PackSource {
  name: string
  url: string
  sha256: string
}

export interface PackCounts {
  roots: number
  literals: number
  parsers: number
  items: number
  blocks: number
  enchantments: number
  entities: number
}

export interface PackManifest {
  schemaVersion: number
  id: string
  gameVersion: string
  dataVersion: number
  packFormat: number
  engine?: 'components' | 'nbt' | 'legacy'
  type: 'release' | 'snapshot'
  generatedAt: string
  sources: PackSource[]
  files: Record<string, string>
  counts: PackCounts
  aliasOf?: string
}

/** 注册表：registry 名称 -> 去命名空间的 ID 列表 */
export type Registries = Record<string, string[]>

/**
 * 方块状态数据。
 * 每个方块的第一个元素是完整属性表，第二个元素是默认属性值。
 */
export type BlockStates = Record<string, [Record<string, string | string[]>, Record<string, string>]>

/** 单个物品的默认组件值 */
export type ItemComponentDefaults = Record<string, Record<string, unknown>>

export interface VersionPack {
  manifest: PackManifest
  commands: CommandTree
  registries: Registries
  blocks: BlockStates
  itemComponents: ItemComponentDefaults
}

export type Severity = 'error' | 'warn' | 'info'

export interface Diagnostic {
  severity: Severity
  code: string
  message: string
  field?: string
}

export interface BuildResult {
  text: string
  diagnostics: Diagnostic[]
}
