#!/usr/bin/env node
/** 对新增独立包做 UI 版本矩阵冒烟。 */
import { _electron as electron } from 'playwright'
import { rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const USER_DATA = join(ROOT, 'artifacts', 'matrix-userdata')

const CASES = [
  ['1.13', '66'],
  ['1.12.2', '64'],
  ['1.14', '71'],
  ['1.14.1', '71'],
  ['1.14.2', '71'],
  ['1.14.3', '71'],
  ['1.15', '72'],
  ['1.15.1', '72'],
  ['1.16', '74'],
  ['1.16.1', '74'],
  ['1.18', '76'],
  ['1.18.1', '76'],
  ['1.19', '76'],
  ['1.19.1', '76'],
  ['1.19.2', '76'],
  ['1.19.3', '77'],
  ['1.20', '80'],
  ['1.20.1', '80']
]

await rm(USER_DATA, { recursive: true, force: true })
const env = {
  ...process.env,
  MCSTUDIO_PACKS_DIR: join(ROOT, 'packs'),
  MCSTUDIO_USER_DATA: USER_DATA
}
delete env.ELECTRON_RUN_AS_NODE

const app = await electron.launch({
  args: ['.'],
  cwd: join(ROOT, 'apps/desktop'),
  env,
  timeout: 60_000
})
const page = await app.firstWindow()
await page.waitForSelector('.sidebar', { timeout: 30_000 })
await page.waitForSelector('.command-item', { timeout: 30_000 })

for (const [version, roots] of CASES) {
  await page.locator('.version-trigger').click()
  await page.locator('.version-search').fill(version)
  const clicked = await page.evaluate((target) => {
    const option = [...document.querySelectorAll('.version-option')].find(
      (element) => element.querySelector('.version-name')?.textContent === target
    )
    option?.click()
    return Boolean(option)
  }, version)
  if (!clicked) throw new Error(`找不到版本 ${version}`)
  await page.waitForFunction(
    (target) => document.querySelector('.version-trigger .version-current')?.textContent === target,
    version
  )
  await page.waitForTimeout(250)
  const count = await page.locator('.pack-count').innerText()
  if (!count.includes(`${roots} 命令`)) {
    throw new Error(`${version} 根命令不符：期望 ${roots}，实际 ${count}`)
  }
  console.log(`✓ ${version} ${roots}`)
}

await app.evaluate(({ app: electronApp }) => electronApp.exit(0)).catch(() => undefined)
await app.close()
console.log(`✓ 版本矩阵冒烟通过（${CASES.length} 个版本）`)
