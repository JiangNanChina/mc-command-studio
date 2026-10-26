#!/usr/bin/env node
/**
 * 校验 tag 与 package.json 版本一致，避免发布错版本。
 * 用法：node tools/release/verify-version.mjs v0.1.0
 *       GITHUB_REF_NAME=v0.1.0 node tools/release/verify-version.mjs
 */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')

const rootPkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const appPkg = JSON.parse(readFileSync(join(ROOT, 'apps/desktop/package.json'), 'utf8'))

const errors = []
if (rootPkg.version !== appPkg.version) {
  errors.push(`根 package.json (${rootPkg.version}) 与 apps/desktop (${appPkg.version}) 版本不一致`)
}

const tag = process.argv[2] ?? process.env.GITHUB_REF_NAME ?? ''
if (tag) {
  const normalized = tag.replace(/^v/i, '')
  if (normalized !== rootPkg.version) {
    errors.push(`tag ${tag} 与 package.json 版本 ${rootPkg.version} 不一致`)
  }
}

const required = [
  'apps/desktop/out/main/index.js',
  'apps/desktop/out/preload/index.js',
  'apps/desktop/out/renderer/index.html',
  'release/latest.yml'
]
for (const file of required) {
  try {
    readFileSync(join(ROOT, file))
  } catch {
    errors.push(`构建产物缺失：${file}`)
  }
}

if (errors.length > 0) {
  console.error('✗ 发布校验失败：')
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

console.log(`✓ 发布校验通过：v${rootPkg.version}${tag ? `（tag ${tag}）` : ''}`)
