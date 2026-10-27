#!/usr/bin/env node
/** 54 个正式版的版本矩阵校验：基础包可加载，别名能解析到基础包。 */
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const ROOT = resolve('.')
const PACKS = join(ROOT, 'packs')
const index = JSON.parse(await readFile(join(PACKS, 'index.json'), 'utf8'))
const errors = []

for (const entry of index.packs) {
  const sourceId = entry.aliasOf ?? entry.id
  try {
    const manifest = JSON.parse(
      await readFile(join(PACKS, sourceId, 'manifest.json'), 'utf8')
    )
    const commands = JSON.parse(
      await readFile(join(PACKS, sourceId, 'commands.json'), 'utf8')
    )
    const registries = JSON.parse(
      await readFile(join(PACKS, sourceId, 'registries.json'), 'utf8')
    )
    const blocks = JSON.parse(
      await readFile(join(PACKS, sourceId, 'blocks.json'), 'utf8')
    )
    const roots = Object.keys(commands.children ?? {}).length
    if (roots < 50) errors.push(`${entry.id} 根命令过少：${roots}`)
    if (!Array.isArray(registries.item) || registries.item.length === 0) {
      errors.push(`${entry.id} 缺少物品注册表`)
    }
    if (!Array.isArray(registries.block) || registries.block.length === 0) {
      errors.push(`${entry.id} 缺少方块注册表`)
    }
    if (!blocks || typeof blocks !== 'object') errors.push(`${entry.id} 方块状态无效`)
    if (manifest.engine !== entry.engine) errors.push(`${entry.id} 引擎不一致`)
  } catch (error) {
    errors.push(`${entry.id} 加载失败：${error.message}`)
  }
}

if (errors.length) {
  console.error('✗ 版本矩阵校验失败：')
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}
console.log(
  `✓ 版本矩阵通过：${index.packs.length} 个版本（${index.packs.filter((p) => !p.aliasOf).length} 基础 / ${index.packs.filter((p) => p.aliasOf).length} 别名）`
)
