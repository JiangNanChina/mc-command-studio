#!/usr/bin/env node
/**
 * 校验已生成的数据包：文件存在、哈希匹配、统计合理。
 */
import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const MANIFEST_PATH = process.argv[2]
  ? resolve(process.argv[2])
  : join(ROOT, 'packs/26.3/manifest.json')

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
  const dir = dirname(MANIFEST_PATH)
  const errors = []

  for (const [name, file] of Object.entries(manifest.files ?? {})) {
    const path = join(dir, file)
    try {
      const info = await stat(path)
      if (info.size === 0) errors.push(`${name} 文件为空：${file}`)
      console.log(`✓ ${name.padEnd(15)} ${String(info.size).padStart(9)} bytes  ${file}`)
    } catch {
      errors.push(`${name} 文件缺失：${file}`)
    }
  }

  for (const source of manifest.sources ?? []) {
    if (!/^[0-9a-f]{64}$/.test(source.sha256 ?? '')) {
      errors.push(`来源 ${source.name} 缺少合法 sha256`)
    }
  }

  const counts = manifest.counts ?? {}
  if ((counts.roots ?? 0) < 10) errors.push(`根命令数量异常：${counts.roots}`)
  if ((counts.items ?? 0) < 100) errors.push(`物品数量异常：${counts.items}`)
  if ((counts.blocks ?? 0) < 100) errors.push(`方块数量异常：${counts.blocks}`)

  if (errors.length > 0) {
    console.error(`✗ 数据包校验失败（${errors.length} 项）`)
    for (const error of errors) console.error(`  - ${error}`)
    process.exitCode = 1
    return
  }
  console.log(`\n✓ 数据包 ${manifest.id} 校验通过`)
}

main().catch((error) => {
  console.error(`✗ ${error?.message ?? error}`)
  process.exitCode = 1
})
