#!/usr/bin/env node
/**
 * 26 个别名审计：对比别名版本官方 summary 与基础包的根命令/注册表。
 * 输出差异；差异项应升级为独立包。
 */
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const ROOT = resolve('.')
const PACKS = join(ROOT, 'packs')
const index = JSON.parse(await readFile(join(PACKS, 'index.json'), 'utf8'))
const aliases = index.packs.filter((pack) => pack.aliasOf)

function countTree(root) {
  let literals = 0
  const parsers = new Set()
  const visit = (node) => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'literal') literals += 1
    if (node.parser) parsers.add(node.parser)
    for (const child of Object.values(node.children ?? {})) visit(child)
  }
  visit(root)
  return {
    roots: Object.keys(root.children ?? {}).sort(),
    literals,
    parsers: [...parsers].sort()
  }
}

async function fetchSummary(version, file) {
  const url = `https://cdn.jsdelivr.net/gh/misode/mcmeta@${version}-summary/${file}`
  const response = await fetch(url, { signal: AbortSignal.timeout(45_000) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

async function localFallback(version, baseId, baseTree) {
  const reports = join(ROOT, 'artifacts', `mcreports-${version}`, 'generated', 'reports', 'commands.json')
  try {
    const commands = JSON.parse(await readFile(reports, 'utf8'))
    const tree = countTree(commands)
    const rootDiff =
      tree.roots.length !== baseTree.roots.length ||
      tree.roots.some((root, index) => root !== baseTree.roots[index])
    return {
      id: version,
      base: baseId,
      status: rootDiff || tree.literals !== baseTree.literals ? 'DIFF' : 'same',
      roots: `${tree.roots.length}/${baseTree.roots.length}`,
      literals: `${tree.literals}/${baseTree.literals}`,
      items: 'n/a',
      blocks: 'n/a',
      note: '官方 reports'
    }
  } catch {
    // 1.12 没有数据生成器，退回官方服务端运行时 help 的根命令表。
  }
  const log = join(ROOT, 'artifacts', `mcserver-${version}`, 'out.log')
  try {
    const text = await readFile(log, 'utf8')
    const roots = new Set()
    for (const match of text.matchAll(/: \/([a-z0-9-]+)/g)) roots.add(match[1])
    const sorted = [...roots].sort()
    const rootDiff =
      sorted.length !== baseTree.roots.length ||
      sorted.some((root, index) => root !== baseTree.roots[index])
    return {
      id: version,
      base: baseId,
      status: rootDiff ? 'DIFF' : 'same',
      roots: `${sorted.length}/${baseTree.roots.length}`,
      literals: 'n/a',
      items: 'n/a',
      blocks: 'n/a',
      note: '官方服务端 help'
    }
  } catch {
    return null
  }
}

const baseCache = new Map()
async function baseData(id) {
  if (!baseCache.has(id)) {
    baseCache.set(id, {
      commands: JSON.parse(await readFile(join(PACKS, id, 'commands.json'), 'utf8')),
      registries: JSON.parse(await readFile(join(PACKS, id, 'registries.json'), 'utf8'))
    })
  }
  return baseCache.get(id)
}

const results = []
for (const alias of aliases) {
  const base = await baseData(alias.aliasOf)
  const baseTree = countTree(base.commands)
  try {
    const commands = await fetchSummary(alias.id, 'commands/data.min.json')
    const registries = await fetchSummary(alias.id, 'registries/data.min.json')
    const tree = countTree(commands)
    const rootDiff =
      tree.roots.length !== baseTree.roots.length ||
      tree.roots.some((root, index) => root !== baseTree.roots[index])
    const literalDiff = tree.literals !== baseTree.literals
    const itemDiff = (registries.item?.length ?? 0) !== (base.registries.item?.length ?? 0)
    const blockDiff = (registries.block?.length ?? 0) !== (base.registries.block?.length ?? 0)
    results.push({
      id: alias.id,
      base: alias.aliasOf,
      status: rootDiff || literalDiff || itemDiff || blockDiff ? 'DIFF' : 'same',
      roots: `${tree.roots.length}/${baseTree.roots.length}`,
      literals: `${tree.literals}/${baseTree.literals}`,
      items: `${registries.item?.length ?? 0}/${base.registries.item?.length ?? 0}`,
      blocks: `${registries.block?.length ?? 0}/${base.registries.block?.length ?? 0}`
    })
  } catch (error) {
    const fallback = await localFallback(alias.id, alias.aliasOf, baseTree)
    if (fallback) {
      results.push(fallback)
    } else {
      results.push({ id: alias.id, base: alias.aliasOf, status: 'unavailable', error: error.message })
    }
  }
}

for (const result of results) {
  if (result.status === 'unavailable') {
    console.log(`? ${result.id} -> ${result.base}  无法审计：${result.error}`)
  } else {
    console.log(
      `${result.status === 'same' ? '=' : '!'} ${result.id} -> ${result.base}  ` +
        `roots ${result.roots} literals ${result.literals} items ${result.items} blocks ${result.blocks}`
    )
  }
}
const diffs = results.filter((result) => result.status === 'DIFF')
console.log(`\n合计 ${results.length}，差异 ${diffs.length}，不可用 ${results.filter((r) => r.status === 'unavailable').length}`)
if (diffs.length) console.log(`建议独立：${diffs.map((result) => result.id).join(', ')}`)
