#!/usr/bin/env node
/** 1.12.2 分组表单冒烟。 */
import { _electron as electron } from 'playwright'
import { join, resolve } from 'node:path'
import { rm } from 'node:fs/promises'

const ROOT = resolve('.')
const USER_DATA = join(ROOT, 'artifacts/legacy-groups-userdata')
await rm(USER_DATA, { recursive: true, force: true })

const env = {
  ...process.env,
  MCSTUDIO_PACKS_DIR: join(ROOT, 'packs'),
  MCSTUDIO_USER_DATA: USER_DATA
}
delete env.ELECTRON_RUN_AS_NODE

const CASES = [
  ['sound', 'playsound minecraft:entity.player.levelup'],
  ['teleport', 'tp @s ~ ~ ~'],
  ['admin', 'kick @p'],
  ['world', 'time set day'],
  ['simple', 'list'],
  ['gamemode', 'gamemode creative @p'],
  ['block', 'setblock ~ ~ ~ minecraft:stone 0 replace'],
  ['misc', 'function namespace:function']
]

const app = await electron.launch({
  args: ['.'],
  cwd: join(ROOT, 'apps/desktop'),
  env,
  timeout: 60_000
})
const page = await app.firstWindow()
await page.waitForSelector('.sidebar', { timeout: 30_000 })

await page.locator('.version-trigger').click()
await page.locator('.version-search').fill('1.12.2')
const clickedVersion = await page.evaluate(() => {
  const option = [...document.querySelectorAll('.version-option')].find(
    (element) => element.querySelector('.version-name')?.textContent === '1.12.2'
  )
  option?.click()
  return Boolean(option)
})
if (!clickedVersion) throw new Error('找不到 1.12.2')
await page.waitForTimeout(500)
await page.locator('.command-item', { hasText: '旧版工具' }).first().click()
await page.waitForSelector('#legacy-output', { timeout: 15_000 })

for (const [tab, expected] of CASES) {
  await page.getByRole('button', { name: tab, exact: true }).click()
  await page.waitForTimeout(200)
  const output = await page.locator('#legacy-output').innerText()
  if (!output.includes(expected)) {
    throw new Error(`1.12.2 ${tab} 输出不符合预期：${output}`)
  }
  console.log(`✓ ${tab}`)
}

await app.close()
console.log('✓ 1.12.2 分组表单冒烟通过')
