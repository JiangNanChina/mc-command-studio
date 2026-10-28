import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { finalizePackMetadata, readJson, verifyPack } from './lib/pack-files.mjs'

async function fixture(context) {
  const directory = await mkdtemp(join(tmpdir(), 'mcstudio-pack-contract-'))
  context.after(() => rm(directory, { recursive: true, force: true }))
  const base = join(directory, '1.20.5')
  await mkdir(base)
  const payload = {
    'commands.json': { type: 'root', children: { give: { type: 'literal', executable: true } } },
    'registries.json': { item: ['stone'], block: ['stone'], entity_type: ['pig'], enchantment: ['sharpness'] },
    'blocks.json': { stone: [{}, {}] },
    'item-components.json': { stone: [{ type: 'minecraft:max_stack_size', value: 64 }] }
  }
  for (const [file, json] of Object.entries(payload)) await writeFile(join(base, file), JSON.stringify(json))
  const manifest = {
    schemaVersion: 1, id: '1.20.5', gameVersion: '1.20.5', dataVersion: 1, packFormat: 41,
    engine: 'components', type: 'release', generatedAt: '2026-01-01T00:00:00.000Z',
    sources: [{ name: 'fixture', url: 'local://fixture', sha256: 'a'.repeat(64) }],
    files: { commands: 'commands.json', registries: 'registries.json', blocks: 'blocks.json', itemComponents: 'item-components.json' },
    counts: { roots: 1, literals: 1, parsers: 0, items: 1, blocks: 1, enchantments: 1, entities: 1 }
  }
  const path = join(base, 'manifest.json')
  await writeFile(path, JSON.stringify(manifest))
  return { directory, base, path, manifest }
}

test('explicit migration normalizes historical arrays and verification stays read-only', async (context) => {
  const { base, path } = await fixture(context)
  const original = await readFile(path, 'utf8')
  await assert.rejects(verifyPack(path), /缺少 fileHashes/)
  assert.equal(await readFile(path, 'utf8'), original)
  await finalizePackMetadata(path)
  assert.deepEqual(await readJson(join(base, 'item-components.json')), { stone: { 'minecraft:max_stack_size': 64 } })
  const { manifest } = await verifyPack(path)
  assert.notEqual(manifest.fileHashes.commands, manifest.sources[0].sha256)
  const signed = await readFile(path, 'utf8')
  await finalizePackMetadata(path)
  assert.equal(await readFile(path, 'utf8'), signed)
})

test('changed bytes, corrupt JSON and forged counts fail without replacing the baseline', async (context) => {
  const { base, path } = await fixture(context)
  await finalizePackMetadata(path)
  const baseline = await readFile(path, 'utf8')
  const command = await readFile(join(base, 'commands.json'))
  await writeFile(join(base, 'commands.json'), `${command.toString()} `)
  await assert.rejects(verifyPack(path), /SHA-256/)
  await assert.rejects(finalizePackMetadata(path), /SHA-256/)
  assert.equal(await readFile(path, 'utf8'), baseline)
  await writeFile(join(base, 'commands.json'), '{broken')
  await assert.rejects(verifyPack(path), /commands.json/)
  await writeFile(join(base, 'commands.json'), command)
  const manifest = JSON.parse(baseline)
  manifest.counts.roots = 100
  await writeFile(path, JSON.stringify(manifest))
  await assert.rejects(verifyPack(path), /counts.roots/)
})

test('aliases use base files and reject nested aliases or a different hash baseline', async (context) => {
  const { directory, path, manifest } = await fixture(context)
  await finalizePackMetadata(path)
  const aliasDirectory = join(directory, '1.20.6')
  const aliasPath = join(aliasDirectory, 'manifest.json')
  await mkdir(aliasDirectory)
  await writeFile(aliasPath, JSON.stringify({ ...manifest, id: '1.20.6', gameVersion: '1.20.6', aliasOf: '1.20.5' }))
  await finalizePackMetadata(aliasPath)
  const alias = (await verifyPack(aliasPath)).manifest
  assert.equal(alias.aliasOf, '1.20.5')
  alias.fileHashes.commands = 'c'.repeat(64)
  await writeFile(aliasPath, JSON.stringify(alias))
  await assert.rejects(verifyPack(aliasPath), /SHA-256/)
  const base = await readJson(path)
  base.aliasOf = '1.20.6'
  await writeFile(path, JSON.stringify(base))
  await assert.rejects(verifyPack(aliasPath), /别名不能指向另一个别名/)
})
