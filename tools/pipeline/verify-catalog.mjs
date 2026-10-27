#!/usr/bin/env node
/** 校验 1.12–26.3 版本目录、基础包与别名完整性。 */
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const ROOT = resolve('.')
const PACKS = join(ROOT, 'packs')
const index = JSON.parse(await readFile(join(PACKS, 'index.json'), 'utf8'))
const errors = []

if (!Array.isArray(index.packs) || index.packs.length !== 54) {
  errors.push(`版本数量应为 54，实际 ${index.packs?.length ?? 0}`)
}
const ids = new Set()
for (const entry of index.packs ?? []) {
  if (ids.has(entry.id)) errors.push(`重复版本 ${entry.id}`)
  ids.add(entry.id)
  const manifestPath = join(PACKS, entry.id, 'manifest.json')
  if (!existsSync(manifestPath)) {
    errors.push(`${entry.id} 缺少 manifest.json`)
    continue
  }
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  if (manifest.id !== entry.id) errors.push(`${entry.id} manifest id 不一致`)
  if (manifest.dataVersion !== entry.dataVersion) {
    errors.push(`${entry.id} dataVersion 不一致`)
  }
  if (manifest.packFormat !== entry.packFormat) {
    errors.push(`${entry.id} packFormat 不一致`)
  }
  if (!entry.aliasOf) {
    for (const file of ['commands.json', 'registries.json', 'blocks.json', 'item-components.json']) {
      if (!existsSync(join(PACKS, entry.id, file))) errors.push(`${entry.id} 缺少 ${file}`)
    }
    continue
  }
  if (entry.aliasOf === entry.id) errors.push(`${entry.id} 不能指向自身`)
  const baseManifest = join(PACKS, entry.aliasOf, 'manifest.json')
  if (!existsSync(baseManifest)) {
    errors.push(`${entry.id} 的别名目标不存在：${entry.aliasOf}`)
    continue
  }
  const base = JSON.parse(await readFile(baseManifest, 'utf8'))
  if (base.aliasOf) errors.push(`${entry.id} 的别名目标仍是别名：${entry.aliasOf}`)
  if (base.engine !== entry.engine) errors.push(`${entry.id} 引擎与基础包不一致`)
}

if (index.packs?.[0]?.id !== '1.12') errors.push('首个版本应为 1.12')
if (index.packs?.at(-1)?.id !== '26.3') errors.push('末个版本应为 26.3')

if (errors.length) {
  console.error('✗ 版本目录校验失败：')
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}
console.log(
  `✓ 版本目录校验通过：${index.packs.length} 个版本（基础包 ${index.packs.filter((p) => !p.aliasOf).length}，别名 ${index.packs.filter((p) => p.aliasOf).length}）`
)
