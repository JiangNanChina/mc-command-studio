#!/usr/bin/env node
/** Build/verify catalog bases with bounded subprocesses, then regenerate aliases once. */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPackContract, readJson } from './lib/pack-files.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const { parsePackIndex } = await loadPackContract()
const index = parsePackIndex(await readJson(join(root, 'packs/index.json')))
const force = process.argv.includes('--force')
const bases = index.packs.filter((entry) => !entry.aliasOf)

function run(script, args = []) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(process.execPath, [join(root, 'tools/pipeline', script), ...args], { cwd: root, stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolveRun() : reject(new Error(`${script} exited with ${code}`)))
  })
}

// 1.12/1.13 were generated from official local reports and are checked-in historical fixtures.
// Rebuilding them needs their dedicated converter inputs, so generic --force must not overwrite them.
for (const entry of bases) {
  const manifest = join(root, 'packs', entry.id, 'manifest.json')
  if (/^1\.(12|13)(\.|$)/.test(entry.id)) {
    if (!existsSync(manifest)) throw new Error(`历史数据包 ${entry.id} 缺失：请恢复版本库中的 packs/${entry.id}，或运行对应的官方报告转换脚本`)
    await run('verify-pack.mjs', [manifest])
  } else {
    await run('build-pack.mjs', ['--version', entry.id, ...(force ? ['--force'] : [])])
  }
}
await run('build-version-catalog.mjs')
