#!/usr/bin/env node
/**
 * Electron 45 不再提供 postinstall，需要手动确保运行时二进制存在。
 * pnpm 安装依赖后执行：pnpm setup:electron
 */
import { existsSync, readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const PNPM_DIR = join(ROOT, 'node_modules/.pnpm')

if (!existsSync(PNPM_DIR)) {
  console.log('未找到 node_modules，请先运行 pnpm install。')
  process.exit(0)
}

const electronDir = readdirSync(PNPM_DIR)
  .filter((name) => name.startsWith('electron@'))
  .map((name) => join(PNPM_DIR, name, 'node_modules/electron'))
  .find((path) => existsSync(join(path, 'install.js')))

if (!electronDir) {
  console.log('未找到 electron 包，跳过。')
  process.exit(0)
}

const pathFile = join(electronDir, 'path.txt')
if (existsSync(pathFile)) {
  console.log(`✓ Electron 运行时已安装（${pathFile}）`)
  process.exit(0)
}

console.log('→ 下载 Electron 运行时（首次安装约 100 MB）…')
if (process.env.ELECTRON_MIRROR) {
  console.log(`  镜像：${process.env.ELECTRON_MIRROR}`)
}
const result = spawnSync(process.execPath, [join(electronDir, 'install.js')], {
  stdio: 'inherit',
  env: process.env
})
process.exit(result.status ?? 1)
