import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PACK_FILES, type PackFileKey, type PackManifest } from '@mcstudio/core'

vi.mock('electron', () => ({ app: { isPackaged: false, getAppPath: () => process.cwd() } }))

import { listPacks, loadPack } from './packs'

let fixtureRoot: string

beforeEach(async () => {
  fixtureRoot = await mkdtemp(join(tmpdir(), 'mcstudio-packs-'))
  vi.stubEnv('MCSTUDIO_PACKS_DIR', fixtureRoot)
})

afterEach(async () => {
  vi.unstubAllEnvs()
  await rm(fixtureRoot, { recursive: true, force: true })
})

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, JSON.stringify(value), 'utf8')
}

async function createBase(id = '1.20.4', overrides: Partial<PackManifest> = {}): Promise<PackManifest> {
  const directory = join(fixtureRoot, id)
  await mkdir(directory)
  const payload: Record<PackFileKey, unknown> = {
    commands: { type: 'root', children: { give: { type: 'literal', executable: true } } },
    registries: { item: ['stone'], block: ['stone'], enchantment: ['sharpness'], entity_type: ['pig'] },
    blocks: { stone: [{}, {}] },
    // The runtime loader must accept historical reports and normalize their component lists.
    itemComponents: { stone: [{ type: 'minecraft:max_stack_size', value: 64 }] }
  }
  const fileHashes: Record<string, string> = {}
  for (const key of Object.keys(PACK_FILES) as PackFileKey[]) {
    const bytes = JSON.stringify(payload[key])
    await writeFile(join(directory, PACK_FILES[key]), bytes)
    fileHashes[key] = createHash('sha256').update(bytes).digest('hex')
  }
  const manifest: PackManifest = {
    schemaVersion: 1, id, gameVersion: id, dataVersion: 1, packFormat: 26, engine: 'nbt',
    type: 'release', generatedAt: '2026-10-28T00:00:00.000Z',
    sources: [{ name: 'fixture', url: 'local://fixture', sha256: 'a'.repeat(64) }],
    files: PACK_FILES, fileHashes,
    counts: { roots: 1, literals: 1, parsers: 0, items: 1, blocks: 1, enchantments: 1, entities: 1 },
    ...overrides
  }
  await writeJson(join(directory, 'manifest.json'), manifest)
  return manifest
}

async function createAlias(base: PackManifest, id = '1.20.3'): Promise<PackManifest> {
  await mkdir(join(fixtureRoot, id))
  const manifest = { ...base, id, gameVersion: id, aliasOf: base.id }
  await writeJson(join(fixtureRoot, id, 'manifest.json'), manifest)
  return manifest
}

function summary(manifest: PackManifest): Record<string, unknown> {
  return {
    id: manifest.id, gameVersion: manifest.gameVersion, dataVersion: manifest.dataVersion,
    packFormat: manifest.packFormat, engine: manifest.engine, type: manifest.type,
    builtAt: manifest.generatedAt,
    ...(manifest.aliasOf ? { aliasOf: manifest.aliasOf } : {})
  }
}

describe('runtime version pack loading', () => {
  it('loads real base files, preserves engine and normalizes historical components', async () => {
    await createBase()
    const result = await loadPack('1.20.4')
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.error)
    expect(result.pack.manifest.engine).toBe('nbt')
    expect(result.pack.itemComponents).toEqual({ stone: { 'minecraft:max_stack_size': 64 } })
    expect(result.pack.commands.children?.give.executable).toBe(true)
  })

  it('loads an alias from its base files while keeping the selected game version', async () => {
    const base = await createBase()
    await createAlias(base)
    const result = await loadPack('1.20.3')
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.error)
    expect(result.pack.manifest).toMatchObject({ id: '1.20.3', gameVersion: '1.20.3', aliasOf: '1.20.4', engine: 'nbt' })
    expect(result.pack.registries.item).toEqual(['stone'])
  })

  it('rejects changed bytes and keeps the trusted hash baseline intact', async () => {
    await createBase()
    const manifestPath = join(fixtureRoot, '1.20.4/manifest.json')
    const baseline = await readFile(manifestPath, 'utf8')
    const commandsPath = join(fixtureRoot, '1.20.4/commands.json')
    await writeFile(commandsPath, `${await readFile(commandsPath, 'utf8')} `)
    expect(await loadPack('1.20.4')).toMatchObject({ ok: false, error: expect.stringContaining('commands.json: SHA-256') })
    expect(await readFile(manifestPath, 'utf8')).toBe(baseline)
  })

  it('reports malformed manifest and payload schema fields even with matching file hashes', async () => {
    const manifest = await createBase()
    const path = join(fixtureRoot, '1.20.4/manifest.json')
    await writeJson(path, { ...manifest, engine: 'invalid' })
    expect(await loadPack('1.20.4')).toMatchObject({ ok: false, error: expect.stringContaining('manifest.json: engine') })
    const payload = JSON.stringify({ item: [42] })
    await writeFile(join(fixtureRoot, '1.20.4/registries.json'), payload)
    await writeJson(path, { ...manifest, fileHashes: { ...manifest.fileHashes, registries: createHash('sha256').update(payload).digest('hex') } })
    expect(await loadPack('1.20.4')).toMatchObject({ ok: false, error: expect.stringContaining('registries.json: item.0') })
  })

  it('rejects false counts and aliases with a different integrity baseline', async () => {
    const base = await createBase()
    await writeJson(join(fixtureRoot, '1.20.4/manifest.json'), { ...base, counts: { ...base.counts, roots: 99 } })
    expect(await loadPack('1.20.4')).toMatchObject({ ok: false, error: expect.stringContaining('counts.roots') })
    await writeJson(join(fixtureRoot, '1.20.4/manifest.json'), base)
    const alias = await createAlias(base)
    await writeJson(join(fixtureRoot, '1.20.3/manifest.json'), { ...alias, fileHashes: { ...alias.fileHashes, blocks: 'b'.repeat(64) } })
    expect(await loadPack('1.20.3')).toMatchObject({ ok: false, error: expect.stringContaining('SHA-256') })
  })

  it('returns actionable errors for a missing version or alias target', async () => {
    expect(await loadPack('missing')).toMatchObject({ ok: false, error: expect.stringContaining('找不到数据包 missing') })
    const base = await createBase()
    const alias = await createAlias(base)
    await writeJson(join(fixtureRoot, '1.20.3/manifest.json'), { ...alias, aliasOf: 'missing' })
    expect(await loadPack('1.20.3')).toMatchObject({ ok: false, error: expect.stringContaining('missing'), packDir: join(fixtureRoot, '1.20.3') })
  })

  it('rejects self references and circular aliases without following them recursively', async () => {
    const base = await createBase()
    const alias = await createAlias(base)
    await writeJson(join(fixtureRoot, '1.20.3/manifest.json'), { ...alias, aliasOf: alias.id })
    expect(await loadPack('1.20.3')).toMatchObject({ ok: false, error: expect.stringContaining('别名不能指向自身') })
    await writeJson(join(fixtureRoot, '1.20.3/manifest.json'), alias)
    await writeJson(join(fixtureRoot, '1.20.4/manifest.json'), { ...base, aliasOf: alias.id })
    expect(await loadPack('1.20.3')).toMatchObject({ ok: false, error: expect.stringContaining('别名不能指向另一个别名') })
  })

  it.each(['.', '..', '../1.20.4', '..\\1.20.4', 'D:\\packs'])('rejects unsafe pack ID %s', async (id) => {
    expect(await loadPack(id)).toMatchObject({ ok: false, error: expect.stringContaining('数据包 ID 不合法') })
  })

  it('rejects unsafe alias paths through the manifest contract', async () => {
    const base = await createBase()
    await writeJson(join(fixtureRoot, '1.20.4/manifest.json'), { ...base, aliasOf: '..' })
    expect(await loadPack('1.20.4')).toMatchObject({ ok: false, error: expect.stringContaining('aliasOf') })
  })
})

describe('runtime version catalog', () => {
  it('reads a valid index and retains engine and alias metadata', async () => {
    const base = await createBase()
    const alias = await createAlias(base)
    await writeJson(join(fixtureRoot, 'index.json'), { schemaVersion: 1, updatedAt: '', packs: [summary(base), summary(alias)] })
    expect(await listPacks()).toEqual([summary(base), summary(alias)])
  })

  it('rejects malformed index fields instead of silently falling back to directory scanning', async () => {
    await createBase()
    await writeJson(join(fixtureRoot, 'index.json'), { schemaVersion: 1, updatedAt: '', packs: [{ id: null }] })
    await expect(listPacks()).rejects.toThrow('index.json: packs.0.id')
    await writeFile(join(fixtureRoot, 'index.json'), '{broken')
    await expect(listPacks()).rejects.toThrow('index.json: JSON 格式错误')
  })

  it('discovers base and alias manifests only when the index is absent', async () => {
    const base = await createBase()
    const alias = await createAlias(base)
    expect(await listPacks()).toEqual(expect.arrayContaining([summary(base), summary(alias)]))
  })
})
