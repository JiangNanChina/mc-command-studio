#!/usr/bin/env node
/**
 * 构建版本数据包。
 *
 * 数据来自 misode/mcmeta 的 summary tag（由官方数据生成器产出）：
 *   commands / registries / blocks / item_components / versions
 *
 * 用法：
 *   node tools/pipeline/build-pack.mjs --version 26.3
 *   node tools/pipeline/build-pack.mjs --version 26.3 --force
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const PACKS_DIR = join(ROOT, 'packs')

const FILES = {
  commands: 'commands/data.min.json',
  registries: 'registries/data.min.json',
  blocks: 'blocks/data.min.json',
  itemComponents: 'item_components/data.min.json',
  versions: 'versions/data.json'
}

function parseArgs(argv) {
  const args = { version: '26.3', force: false, source: 'mcmeta' }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--version') args.version = argv[++i]
    else if (arg === '--force') args.force = true
    else if (arg === '--source') args.source = argv[++i]
  }
  if (!args.version) throw new Error('--version 不能为空')
  return args
}

async function fetchJson(url, label) {
  let lastError
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(60_000),
        headers: { 'cache-control': 'no-cache' }
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const buffer = Buffer.from(await response.arrayBuffer())
      const json = JSON.parse(buffer.toString('utf8'))
      return { json, buffer, url, label }
    } catch (error) {
      lastError = error
      if (attempt < 3) await new Promise((resolveDelay) => setTimeout(resolveDelay, 1200 * attempt))
    }
  }
  throw new Error(`下载 ${label} 失败：${lastError?.message ?? lastError}\n  ${url}`)
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

function countTree(root) {
  let literals = 0
  const parsers = new Set()
  const visit = (node) => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'literal') literals += 1
    if (node.parser) parsers.add(node.parser)
    for (const child of Object.values(node.children ?? {})) visit(child)
  }
  for (const child of Object.values(root.children ?? {})) visit(child)
  return {
    roots: Object.keys(root.children ?? {}).length,
    literals,
    parsers: parsers.size
  }
}

async function writeJsonAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true })
  const temp = `${path}.tmp`
  await writeFile(temp, `${JSON.stringify(value)}\n`, 'utf8')
  await rename(temp, path)
}

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const packDir = join(PACKS_DIR, args.version)
  const manifestPath = join(packDir, 'manifest.json')

  if (!args.force && (await exists(manifestPath))) {
    console.log(`✓ 数据包 ${args.version} 已存在，跳过（使用 --force 重建）`)
    return
  }

  const base = `https://cdn.jsdelivr.net/gh/misode/mcmeta@${args.version}-summary`
  console.log(`→ 构建数据包 ${args.version}`)
  console.log(`  源：${base}`)

  const [versions, commands, registries, blocks, itemComponents] = await Promise.all([
    fetchJson(`${base}/${FILES.versions}`, 'versions'),
    fetchJson(`${base}/${FILES.commands}`, 'commands'),
    fetchJson(`${base}/${FILES.registries}`, 'registries'),
    fetchJson(`${base}/${FILES.blocks}`, 'blocks'),
    fetchJson(`${base}/${FILES.itemComponents}`, 'item_components')
  ])

  const versionEntry = Array.isArray(versions.json)
    ? versions.json.find((entry) => entry.id === args.version)
    : undefined
  if (!versionEntry) {
    throw new Error(`versions 数据里找不到版本 ${args.version}`)
  }

  const stats = countTree(commands.json)
  const items = registries.json.item?.length ?? 0
  const blockCount = blocks.json ? Object.keys(blocks.json).length : 0
  const enchantments = registries.json.enchantment?.length ?? 0
  const entities = registries.json.entity_type?.length ?? 0

  if (stats.roots < 10 || items < 100 || blockCount < 100) {
    throw new Error(`数据校验失败：roots=${stats.roots} items=${items} blocks=${blockCount}`)
  }

  await mkdir(packDir, { recursive: true })
  const payload = {
    commands: commands.json,
    registries: registries.json,
    blocks: blocks.json,
    item_components: itemComponents.json
  }

  await writeJsonAtomic(join(packDir, 'commands.json'), payload.commands)
  await writeJsonAtomic(join(packDir, 'registries.json'), payload.registries)
  await writeJsonAtomic(join(packDir, 'blocks.json'), payload.blocks)
  await writeJsonAtomic(join(packDir, 'item-components.json'), payload.item_components)

  const manifest = {
    schemaVersion: 1,
    id: args.version,
    gameVersion: versionEntry.id,
    dataVersion: versionEntry.data_version ?? 0,
    packFormat: versionEntry.data_pack_version ?? 0,
    type: versionEntry.type === 'release' ? 'release' : 'snapshot',
    generatedAt: new Date().toISOString(),
    sources: [
      { name: 'commands', url: commands.url, sha256: sha256(commands.buffer) },
      { name: 'registries', url: registries.url, sha256: sha256(registries.buffer) },
      { name: 'blocks', url: blocks.url, sha256: sha256(blocks.buffer) },
      { name: 'item_components', url: itemComponents.url, sha256: sha256(itemComponents.buffer) },
      { name: 'versions', url: versions.url, sha256: sha256(versions.buffer) }
    ],
    files: {
      commands: 'commands.json',
      registries: 'registries.json',
      blocks: 'blocks.json',
      itemComponents: 'item-components.json'
    },
    counts: {
      roots: stats.roots,
      literals: stats.literals,
      parsers: stats.parsers,
      items,
      blocks: blockCount,
      enchantments,
      entities
    }
  }

  await writeJsonAtomic(manifestPath, manifest)
  await updateIndex(args.version, manifest)

  console.log(`✓ ${args.version} 数据包完成`)
  console.log(
    `  根命令 ${stats.roots} · 字面量 ${stats.literals} · 参数类型 ${stats.parsers} · 物品 ${items} · 方块 ${blockCount}`
  )
  console.log(`  输出：${packDir}`)
}

async function updateIndex(version, manifest) {
  const indexPath = join(PACKS_DIR, 'index.json')
  let index = { schemaVersion: 1, updatedAt: '', packs: [] }
  if (await exists(indexPath)) {
    try {
      index = await readJson(indexPath)
    } catch {
      // 损坏的索引直接重建
    }
  }
  const packs = (index.packs ?? []).filter((entry) => entry.id !== version)
  packs.push({
    id: version,
    gameVersion: manifest.gameVersion,
    dataVersion: manifest.dataVersion,
    packFormat: manifest.packFormat,
    type: manifest.type,
    builtAt: manifest.generatedAt,
    manifest: `${version}/manifest.json`
  })
  packs.sort((a, b) => (a.id < b.id ? 1 : -1))
  await writeJsonAtomic(indexPath, {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    packs
  })
}

main().catch((error) => {
  console.error(`✗ ${error?.message ?? error}`)
  process.exitCode = 1
})
