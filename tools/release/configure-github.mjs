#!/usr/bin/env node
/**
 * 一次性配置 GitHub 发布信息：
 *   node tools/release/configure-github.mjs <owner> [repo]
 *
 * 会替换 electron-builder.yml、关于页、帮助菜单里的 REPLACE_ME 占位符。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const owner = process.argv[2]
const repo = process.argv[3] ?? 'mc-command-studio'

if (!owner || !/^[A-Za-z0-9_.-]+$/.test(owner)) {
  console.error('用法：node tools/release/configure-github.mjs <GitHub 用户名或组织> [仓库名]')
  process.exit(1)
}
if (!/^[A-Za-z0-9_.-]+$/.test(repo)) {
  console.error('仓库名只能包含字母、数字、点、下划线和连字符')
  process.exit(1)
}

const base = `https://github.com/${owner}/${repo}`

function replaceFile(relative, replacements) {
  const path = join(ROOT, relative)
  let text = readFileSync(path, 'utf8')
  for (const [pattern, value] of replacements) {
    text = text.replace(pattern, value)
  }
  writeFileSync(path, text, 'utf8')
  console.log(`✓ ${relative}`)
}

replaceFile('apps/desktop/electron-builder.yml', [
  [/owner: .*/g, `owner: ${owner}`],
  [/repo: .*/g, `repo: ${repo}`]
])

replaceFile('apps/desktop/src/renderer/src/components/AboutDialog.tsx', [
  [/https:\/\/github\.com\/REPLACE_ME\/mc-command-studio\/releases/g, `${base}/releases`],
  [/https:\/\/github\.com\/REPLACE_ME\/mc-command-studio/g, base]
])

replaceFile('apps/desktop/src/main/menu.ts', [
  [/https:\/\/github\.com\/REPLACE_ME\/mc-command-studio\/releases/g, `${base}/releases`]
])

replaceFile('README.md', [
  [/https:\/\/github\.com\/REPLACE_ME\/mc-command-studio/g, base]
])

console.log(`\n已配置为 ${base}`)
console.log('下一步：')
console.log('  1. pnpm typecheck && pnpm test')
console.log('  2. 配置签名 secrets（CSC_LINK / CSC_KEY_PASSWORD）')
console.log('  3. pnpm release:patch')
console.log('  4. git add . && git commit -m "release: v0.1.1" && git tag v0.1.1')
console.log('  5. git push origin main --tags，等待 Release workflow 产出 draft')
