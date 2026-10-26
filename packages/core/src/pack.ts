import { z } from 'zod'
import type {
  BlockStates,
  CommandTree,
  ItemComponentDefaults,
  PackManifest,
  Registries,
  VersionPack
} from './types'

const packSourceSchema = z.object({
  name: z.string(),
  url: z.string(),
  sha256: z.string()
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
  schemaVersion: z.number().int().positive(),
  id: z.string().min(1),
  gameVersion: z.string().min(1),
  dataVersion: z.number().int(),
  packFormat: z.number().int(),
  type: z.enum(['release', 'snapshot']),
  generatedAt: z.string(),
  sources: z.array(packSourceSchema),
  files: z.record(z.string(), z.string()),
  counts: packCountsSchema
})

const registriesSchema = z.record(z.string(), z.array(z.string()))

const blockStatesSchema = z.record(
  z.string(),
  z.tuple([
    z.record(z.string(), z.union([z.string(), z.array(z.string())])),
    z.record(z.string(), z.string())
  ])
)

const itemComponentsSchema = z.record(z.string(), z.record(z.string(), z.unknown()))

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

export function parsePackManifest(input: unknown): PackManifest {
  return packManifestSchema.parse(input) as PackManifest
}

export function parseCommands(input: unknown): CommandTree {
  const parsed = commandNodeSchema.parse(input) as CommandTree
  if (parsed.type !== 'root') {
    throw new Error('commands.json 的根节点类型必须是 root')
  }
  return parsed
}

export function parseRegistries(input: unknown): Registries {
  return registriesSchema.parse(input) as Registries
}

export function parseBlockStates(input: unknown): BlockStates {
  return blockStatesSchema.parse(input) as BlockStates
}

export function parseItemComponents(input: unknown): ItemComponentDefaults {
  return itemComponentsSchema.parse(input) as ItemComponentDefaults
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
