import { z } from 'zod'
import { collectStats } from './commandTree'
import { compareVersions } from './version'
import type {
  BlockStates,
  CommandTree,
  ItemComponentDefaults,
  PackManifest,
  PackCounts,
  Registries,
  VersionPack
} from './types'

export const PACK_FILES = {
  commands: 'commands.json',
  registries: 'registries.json',
  blocks: 'blocks.json',
  itemComponents: 'item-components.json'
} as const

export type PackFileKey = keyof typeof PACK_FILES
export const PACK_FILE_KEYS = Object.keys(PACK_FILES) as PackFileKey[]
const safeIdSchema = z.string().regex(/^[0-9A-Za-z._-]+$/).refine((value) => value !== '.' && value !== '..')
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)
const engineSchema = z.enum(['components', 'nbt', 'legacy'])
const fileNameSchema = z.string().regex(/^[0-9A-Za-z._-]+\.json$/)
const packFilesSchema = z.object({
  commands: fileNameSchema,
  registries: fileNameSchema,
  blocks: fileNameSchema,
  itemComponents: fileNameSchema
})
const packHashesSchema = z.object({
  commands: sha256Schema,
  registries: sha256Schema,
  blocks: sha256Schema,
  itemComponents: sha256Schema
})

const packSourceSchema = z.object({
  name: z.string(),
  url: z.string(),
  sha256: sha256Schema
})

const packCountsSchema = z.object({
  roots: z.number().int().nonnegative(),
  literals: z.number().int().nonnegative(),
  parsers: z.number().int().nonnegative(),
  items: z.number().int().nonnegative(),
  blocks: z.number().int().nonnegative(),
  enchantments: z.number().int().nonnegative(),
  entities: z.number().int().nonnegative()
})

export const packManifestSchema = z.object({
  schemaVersion: z.literal(1),
  id: safeIdSchema,
  gameVersion: z.string().min(1),
  dataVersion: z.number().int(),
  packFormat: z.number().int(),
  engine: engineSchema.optional(),
  type: z.enum(['release', 'snapshot']),
  generatedAt: z.string(),
  sources: z.array(packSourceSchema),
  files: packFilesSchema,
  fileHashes: packHashesSchema.optional(),
  counts: packCountsSchema,
  aliasOf: safeIdSchema.optional()
})

export const packIndexSchema = z.object({
  schemaVersion: z.literal(1),
  updatedAt: z.string(),
  packs: z.array(z.object({
    id: safeIdSchema,
    gameVersion: z.string().min(1),
    dataVersion: z.number().int(),
    packFormat: z.number().int(),
    engine: engineSchema.optional(),
    type: z.enum(['release', 'snapshot']),
    builtAt: z.string(),
    aliasOf: safeIdSchema.optional(),
    manifest: z.string().optional()
  })).superRefine((entries, context) => {
    const ids = new Set<string>()
    entries.forEach((entry, index) => {
      if (ids.has(entry.id)) context.addIssue({ code: 'custom', path: [index, 'id'], message: '版本 ID 重复' })
      ids.add(entry.id)
    })
  })
})

const registriesSchema = z.record(z.string(), z.array(z.string()))

const blockStatesSchema = z.record(
  z.string(),
  z.tuple([
    z.record(z.string(), z.union([z.string(), z.array(z.string())])),
    z.record(z.string(), z.string())
  ])
)

const legacyItemComponentsSchema = z.array(z.object({
  type: z.string().min(1),
  value: z.unknown()
})).superRefine((entries, context) => {
  const ids = new Set<string>()
  entries.forEach((entry, index) => {
    if (ids.has(entry.type)) context.addIssue({ code: 'custom', path: [index, 'type'], message: '物品组件 ID 重复' })
    ids.add(entry.type)
  })
}).transform((entries) => Object.fromEntries(entries.map((entry) => [entry.type, entry.value])))

const itemComponentsSchema = z.record(z.string(), z.union([
  z.record(z.string(), z.unknown()),
  legacyItemComponentsSchema
]))

const commandNodeSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    type: z.enum(['root', 'literal', 'argument']),
    children: z.record(z.string(), commandNodeSchema).optional(),
    parser: z.string().optional(),
    properties: z.record(z.string(), z.unknown()).optional(),
    executable: z.boolean().optional(),
    redirect: z.unknown().optional(),
    permissions: z.unknown().optional()
  })
)

function parseFile<T>(schema: z.ZodType<T>, input: unknown, file: string): T {
  const result = schema.safeParse(input)
  if (!result.success) {
    throw new Error(`${file}: ${result.error.issues.slice(0, 3).map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`).join('; ')}`)
  }
  return result.data
}

export function parsePackManifest(input: unknown): PackManifest {
  const manifest = parseFile(packManifestSchema, input, 'manifest.json')
  const engine = manifest.engine ?? (compareVersions(manifest.gameVersion, '1.13') < 0
    ? 'legacy'
    : compareVersions(manifest.gameVersion, '1.20.5') < 0 ? 'nbt' : 'components')
  return { ...manifest, engine }
}

export function parsePackIndex(input: unknown): z.infer<typeof packIndexSchema> {
  return parseFile(packIndexSchema, input, 'index.json')
}

export function parseCommands(input: unknown): CommandTree {
  const parsed = parseFile(commandNodeSchema, input, 'commands.json') as CommandTree
  if (parsed.type !== 'root') {
    throw new Error('commands.json 的根节点类型必须是 root')
  }
  return parsed
}

export function parseRegistries(input: unknown): Registries {
  return parseFile(registriesSchema, input, 'registries.json')
}

export function parseBlockStates(input: unknown): BlockStates {
  return parseFile(blockStatesSchema, input, 'blocks.json')
}

export function parseItemComponents(input: unknown): ItemComponentDefaults {
  return parseFile(itemComponentsSchema, input, 'item-components.json')
}

export interface PackInput {
  manifest: unknown
  commands: unknown
  registries: unknown
  blocks: unknown
  itemComponents: unknown
}

export function createVersionPack(input: PackInput): VersionPack {
  return {
    manifest: parsePackManifest(input.manifest),
    commands: parseCommands(input.commands),
    registries: parseRegistries(input.registries),
    blocks: parseBlockStates(input.blocks),
    itemComponents: parseItemComponents(input.itemComponents)
  }
}

export function collectPackCounts(pack: Omit<VersionPack, 'manifest'>): PackCounts {
  return {
    ...collectStats(pack.commands),
    items: pack.registries.item?.length ?? 0,
    blocks: Object.keys(pack.blocks).length,
    enchantments: pack.registries.enchantment?.length ?? 0,
    entities: pack.registries.entity_type?.length ?? 0
  }
}

export function assertPackCounts(pack: VersionPack): void {
  const actual = collectPackCounts(pack)
  for (const key of Object.keys(actual) as (keyof PackCounts)[]) {
    if (pack.manifest.counts[key] !== actual[key]) {
      throw new Error(`manifest.json: counts.${key} 应为 ${actual[key]}，实际 ${pack.manifest.counts[key]}`)
    }
  }
}

/** The caller computes hashes from file bytes; this function only verifies, never re-signs. */
export function assertPackFileHashes(
  manifest: PackManifest,
  actual: Record<string, string>,
  baseManifest?: PackManifest
): void {
  if (!manifest.fileHashes) {
    throw new Error('manifest.json: 缺少 fileHashes，请显式运行数据包元数据迁移或重新构建')
  }
  for (const key of PACK_FILE_KEYS) {
    if (manifest.fileHashes[key] !== actual[key]) {
      throw new Error(`${manifest.files[key]}: SHA-256 校验失败`)
    }
    if (baseManifest && (manifest.fileHashes[key] !== baseManifest.fileHashes?.[key] || manifest.files[key] !== baseManifest.files[key])) {
      throw new Error(`manifest.json: 别名 ${manifest.id} 的 ${key} 与基础包不一致`)
    }
  }
}

export function getRegistry(registries: Registries, name: string): string[] {
  return registries[name] ?? []
}

export function pickRegistries(
  registries: Registries,
  keys: string[] = ['item', 'block', 'entity_type', 'enchantment', 'mob_effect', 'attribute', 'particle_type']
): Registries {
  const result: Registries = {}
  for (const key of keys) {
    if (registries[key]) result[key] = registries[key]
  }
  return result
}

export function formatPackVersion(manifest: PackManifest): string {
  return `${manifest.gameVersion}（数据包 ${manifest.packFormat}）`
}
