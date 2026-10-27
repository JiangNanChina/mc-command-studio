#!/usr/bin/env node
/**
 * 构建仅本地使用的测试版安装包。
 *
 * 用法：
 *   node tools/test/build-test.mjs [version]
 *   默认版本：0.5.1-test.1
 *
 * 产物：release-test/
 * 更新源：http://127.0.0.1:8123/updates/
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, resolve } from 'node:path'

const ROOT = resolve('.')
const DESKTOP = join(ROOT, 'apps', 'desktop')
const PKG = join(DESKTOP, 'package.json')
const version = process.argv[2] ?? '0.5.1-test.1'

if (!/^\d+\.\d+\.\d+-test\.\d+$/.test(version)) {
  console.error('测试版版本号必须形如 0.5.1-test.1')
  process.exit(1)
}

const original = readFileSync(PKG, 'utf8')
const data = JSON.parse(original)
const previous = data.version
data.version = version
writeFileSync(PKG, JSON.stringify(data, null, 2) + '\n')
mkdirSync(join(ROOT, 'release-test'), { recursive: true })

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env
  })
  if (result.status !== 0) throw new Error(`${command} 退出码 ${result.status}`)
}

try {
  console.log(`构建测试版 ${version}（原版本 ${previous}）`)
  run('pnpm', ['--filter', '@mcstudio/desktop', 'exec', 'electron-vite', 'build'])
  run('pnpm', [
    '--filter',
    '@mcstudio/desktop',
    'exec',
    'electron-builder',
    '--config',
    'electron-builder.test.yml',
    '--win',
    '--publish',
    'never'
  ])
  console.log('测试版构建完成：release-test/')
  console.log('启动本地更新源：pnpm test:serve')
} finally {
  writeFileSync(PKG, original)
  console.log(`已恢复版本号 ${previous}`)
}
