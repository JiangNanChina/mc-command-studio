#!/usr/bin/env node
/**
 * 版本号递增：node tools/release/bump.mjs patch|minor|major
 * 同步更新根 package.json、apps/desktop/package.json 与 CHANGELOG 顶部。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const kind = process.argv[2] ?? 'patch'

const rootPath = join(ROOT, 'package.json')
const appPath = join(ROOT, 'apps/desktop/package.json')
const rootPkg = JSON.parse(readFileSync(rootPath, 'utf8'))
const appPkg = JSON.parse(readFileSync(appPath, 'utf8'))

const [major, minor, patch] = rootPkg.version.split('.').map(Number)
let next
if (kind === 'major') next = `${major + 1}.0.0`
else if (kind === 'minor') next = `${major}.${minor + 1}.0`
else next = `${major}.${minor}.${patch + 1}`

rootPkg.version = next
appPkg.version = next
writeFileSync(rootPath, `${JSON.stringify(rootPkg, null, 2)}\n`, 'utf8')
writeFileSync(appPath, `${JSON.stringify(appPkg, null, 2)}\n`, 'utf8')

const changelogPath = join(ROOT, 'CHANGELOG.md')
try {
  const changelog = readFileSync(changelogPath, 'utf8')
  const date = new Date().toISOString().slice(0, 10)
  const entry = `## [${next}] - ${date}\n\n- 待补充。\n\n`
  const updated = changelog.replace(/^# .*\n\n/, (match) => `${match}${entry}`)
  writeFileSync(changelogPath, updated, 'utf8')
} catch {
  // CHANGELOG 不存在时忽略
}

console.log(`✓ 版本已更新为 ${next}`)
console.log('下一步：')
console.log(`  git add . && git commit -m "release: v${next}"`)
console.log(`  git tag v${next} && git push origin main --tags`)
