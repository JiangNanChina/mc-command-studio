#!/usr/bin/env node
/** 校验 26.3 根命令是否都有专用表单或快捷表单路由。 */
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const ROOT = resolve('.')
const app = await readFile(
  join(ROOT, 'apps/desktop/src/renderer/src/App.tsx'),
  'utf8'
)
const quick = await readFile(
  join(ROOT, 'apps/desktop/src/renderer/src/components/QuickCommandForm.tsx'),
  'utf8'
)
const commands = JSON.parse(
  await readFile(join(ROOT, 'packs/26.3/commands.json'), 'utf8')
)

const covered = new Set(
  [...app.matchAll(/activeCommandId === '([^']+)'/g)].map((match) => match[1])
)
for (const match of quick.matchAll(/^  (?:'([^']+)'|([a-z0-9-]+)): \{/gm)) {
  covered.add(match[1] ?? match[2])
}

const roots = Object.keys(commands.children ?? {})
const missing = roots.filter((root) => !covered.has(root))
if (missing.length) {
  console.error(`✗ 可视化覆盖不足：${roots.length - missing.length} / ${roots.length}`)
  console.error(`  未覆盖：${missing.join(', ')}`)
  process.exit(1)
}
console.log(`✓ 可视化覆盖：${roots.length} / ${roots.length}`)
