#!/usr/bin/env node
/** 10 个版本特定快捷表单的逐版本 UI 冒烟。 */
import { _electron as electron } from 'playwright'
import { rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const USER_DATA = join(ROOT, 'artifacts', 'quick-matrix-userdata')

const CASES = [
  ['1.19.4', 'place', 'place structure'],
  ['26.3', 'place', 'place structure'],
  ['1.20.5', 'transfer', 'transfer localhost 25565 @a'],
  ['26.3', 'transfer', 'transfer localhost 25565 @a'],
  ['1.21.5', 'test', 'test run @e'],
  ['26.3', 'test', 'test run @e'],
  ['1.21.6', 'dialog', 'dialog show @s'],
  ['26.3', 'dialog', 'dialog show @s'],
  ['1.21.6', 'waypoint', 'waypoint list'],
  ['26.3', 'waypoint', 'waypoint list'],
  ['1.21.11', 'stopwatch', 'stopwatch create timer'],
  ['26.3', 'stopwatch', 'stopwatch create timer'],
  ['26.1', 'swing', 'swing @s mainhand'],
  ['26.3', 'swing', 'swing @s mainhand'],
  ['26.1', 'fetchprofile', 'fetchprofile name Steve'],
  ['26.3', 'fetchprofile', 'fetchprofile name Steve'],
  ['26.3', 'compute', 'compute default float minecraft:brewing/speed_default'],
  ['26.3', 'posteffect', 'posteffect add @s minecraft:invert']
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

async function selectVersion(version) {
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
}

for (const [version, form, expected] of CASES) {
  await selectVersion(version)
  await page.getByRole('button', { name: '全部', exact: true }).click().catch(() => {})
  await page.fill('#command-search', '')
  await page.waitForTimeout(300)
  const clickedItem = await page.evaluate((target) => {
    const button = [...document.querySelectorAll('.command-item')].find((element) => {
      const id = element.querySelector('.command-id')?.textContent?.trim() ?? ''
      const name = element.querySelector('.command-name')?.textContent?.trim() ?? ''
      return id === target || name === target || name.startsWith(target)
    })
    button?.click()
    return Boolean(button)
  }, form)
  if (!clickedItem) throw new Error(`找不到命令 ${form}`)
  await page.waitForFunction(
    (target) => document.querySelector('.hero-id')?.textContent === target,
    form
  )
  await page.waitForTimeout(250)
  const output = await page.locator('.output-code .cm-content').innerText()
  if (!output.startsWith(expected)) {
    throw new Error(`${version}/${form} 输出不符：期望 ${expected}，实际 ${output}`)
  }
  console.log(`✓ ${version} ${form}`)
}

await app.close()
console.log(`✓ 版本特定快捷表单 UI 冒烟通过（${CASES.length} 个用例）`)
