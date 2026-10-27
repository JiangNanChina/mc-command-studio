#!/usr/bin/env node
/** 审计全部基础包的旧版本图标与中文名。 */
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const ROOT = resolve('.')
const packIndex = JSON.parse(await readFile(join(ROOT, 'packs/index.json'), 'utf8'))
const icons = JSON.parse(
  await readFile(join(ROOT, 'apps/desktop/src/renderer/src/data/mc-icons.json'), 'utf8')
).icons
const names = JSON.parse(
  await readFile(join(ROOT, 'apps/desktop/src/renderer/src/data/mc-names.json'), 'utf8')
)
const legacy = JSON.parse(
  await readFile(join(ROOT, 'apps/desktop/src/renderer/src/data/legacy-assets.json'), 'utf8')
)

const CATEGORIES = [
  ['items', 'item'],
  ['blocks', 'block'],
  ['entities', 'entity_type'],
  ['enchantments', 'enchantment']
]

function shortId(id) {
  return id.replace(/^minecraft:/, '')
}

function legacyIcon(category, id) {
  if (category === 'entities') {
    if (id.startsWith('tropical_fish.')) return 'tropical_fish'
    if (id.startsWith('villager.')) return 'villager'
  }
  return legacy.icons[category]?.[id] ?? id
}

function legacyName(category, id) {
  const explicit = legacy.names[category]?.[id]
  if (explicit) return explicit
  if (category === 'entities') {
    if (id.startsWith('tropical_fish.')) return '热带鱼'
    if (id.startsWith('villager.')) return '村民'
  }
  return undefined
}

let failures = 0
for (const pack of packIndex.packs.filter((entry) => !entry.aliasOf)) {
  const registries = JSON.parse(
    await readFile(join(ROOT, 'packs', pack.id, 'registries.json'), 'utf8')
  )
  const missing = []
  for (const [category, registryKey] of CATEGORIES) {
    for (const raw of registries[registryKey] ?? []) {
      const id = shortId(raw)
      const icon =
        icons[category]?.[id] ??
        (category === 'entities' && id === 'potion' ? icons.items?.potion : undefined) ??
        icons[category]?.[legacyIcon(category, id)]
      const name = names[category]?.[id] ?? legacyName(category, id)
      if (icon === undefined) missing.push(`${category}/icon:${id}`)
      if (!name) missing.push(`${category}/name:${id}`)
    }
  }
  if (missing.length > 0) {
    failures += missing.length
    console.log(`✗ ${pack.id} 缺失 ${missing.length} 项`)
    for (const item of missing.slice(0, 20)) console.log(`  - ${item}`)
  }
}

if (failures > 0) {
  console.log(`✗ 资源审计失败：${failures} 项缺失`)
  process.exit(1)
}
console.log(`✓ 资源审计通过：45 个基础包的图标与中文名完整`)
