#!/usr/bin/env node
/**
 * 生成 1.12–26.3 的完整正式版目录。
 * 主要版本有独立数据包，补丁版通过 aliasOf 复用最近的基础包。
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve('.')
const PACKS = join(ROOT, 'packs')
let VERSIONS
try {
  VERSIONS = JSON.parse(await readFile(join(ROOT, 'artifacts/versions.json'), 'utf8'))
} catch {
  const response = await fetch(
    'https://cdn.jsdelivr.net/gh/misode/mcmeta@26.3-summary/versions/data.json'
  )
  if (!response.ok) throw new Error(`下载版本元数据失败：HTTP ${response.status}`)
  VERSIONS = await response.json()
}

const RANGE_START = '1.12'
const RANGE_END = '26.3'

const BASE = {
  '1.12': '1.12.2',
  '1.12.1': '1.12.2',
  '1.12.2': '1.12.2',
  '1.13': '1.13.2',
  '1.13.1': '1.13.2',
  '1.13.2': '1.13.2',
  '1.14': '1.14.4',
  '1.14.1': '1.14.4',
  '1.14.2': '1.14.4',
  '1.14.3': '1.14.4',
  '1.14.4': '1.14.4',
  '1.15': '1.15.2',
  '1.15.1': '1.15.2',
  '1.15.2': '1.15.2',
  '1.16': '1.16.5',
  '1.16.1': '1.16.5',
  '1.16.2': '1.16.5',
  '1.16.3': '1.16.5',
  '1.16.4': '1.16.5',
  '1.16.5': '1.16.5',
  '1.17': '1.17.1',
  '1.17.1': '1.17.1',
  '1.18': '1.18.2',
  '1.18.1': '1.18.2',
  '1.18.2': '1.18.2',
  '1.19': '1.19.4',
  '1.19.1': '1.19.4',
  '1.19.2': '1.19.4',
  '1.19.3': '1.19.4',
  '1.19.4': '1.19.4',
  '1.20': '1.20.4',
  '1.20.1': '1.20.4',
  '1.20.2': '1.20.4',
  '1.20.3': '1.20.3',
  '1.20.4': '1.20.4',
  '1.20.5': '1.20.5',
  '1.20.6': '1.20.5',
  '1.21': '1.21.1',
  '1.21.1': '1.21.1',
  '1.21.2': '1.21.2',
  '1.21.3': '1.21.2',
  '1.21.4': '1.21.4',
  '1.21.5': '1.21.5',
  '1.21.6': '1.21.6',
  '1.21.7': '1.21.6',
  '1.21.8': '1.21.6',
  '1.21.9': '1.21.9',
  '1.21.10': '1.21.10',
  '1.21.11': '1.21.11',
  '26.1': '26.1',
  '26.1.1': '26.1',
  '26.1.2': '26.1',
  '26.2': '26.2',
  '26.3': '26.3'
}

const META_FALLBACK = {
  '1.12': { data_version: 1139, data_pack_version: 3 },
  '1.12.1': { data_version: 1241, data_pack_version: 3 },
  '1.13': { data_version: 1519, data_pack_version: 4 },
  '1.13.1': { data_version: 1620, data_pack_version: 4 }
}

function compareVersion(a, b) {
  const left = a.split('.').map(Number)
  const right = b.split('.').map(Number)
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

const releaseIds = Object.keys(BASE).sort(compareVersion)

const packs = []
for (const id of releaseIds) {
  const base = BASE[id]
  if (!base) continue
  const baseManifestPath = join(PACKS, base, 'manifest.json')
  if (!existsSync(baseManifestPath)) {
    console.warn(`! 跳过 ${id}：缺少基础包 ${base}`)
    continue
  }
  const meta = VERSIONS.find((entry) => entry.id === id) ?? META_FALLBACK[id] ?? {}
  const baseManifest = JSON.parse(await readFile(baseManifestPath, 'utf8'))
  const isReal = id === base
  let manifest = baseManifest
  if (!isReal) {
    manifest = {
      ...baseManifest,
      id,
      gameVersion: id,
      dataVersion: meta.data_version ?? baseManifest.dataVersion,
      packFormat: meta.data_pack_version ?? baseManifest.packFormat,
      type: 'release',
      generatedAt: new Date().toISOString(),
      aliasOf: base,
      sources: [
        {
          name: 'alias',
          url: `local://packs/${base}`,
          sha256: baseManifest.sources?.[0]?.sha256 ?? ''
        }
      ]
    }
    await mkdir(join(PACKS, id), { recursive: true })
    await writeFile(join(PACKS, id, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  }
  packs.push({
    id,
    gameVersion: id,
    dataVersion: meta.data_version ?? manifest.dataVersion,
    packFormat: meta.data_pack_version ?? manifest.packFormat,
    engine: manifest.engine,
    type: 'release',
    builtAt: manifest.generatedAt,
    ...(isReal ? {} : { aliasOf: base })
  })
}

await writeFile(
  join(PACKS, 'index.json'),
  `${JSON.stringify({ schemaVersion: 1, updatedAt: new Date().toISOString(), packs })}\n`
)
console.log(`✓ 版本目录 ${packs.length} 个（基础包 ${packs.filter((p) => !p.aliasOf).length}，别名 ${packs.filter((p) => p.aliasOf).length}）`)
console.log(packs.map((p) => p.gameVersion).join(' '))
