#!/usr/bin/env node
/** 为 10 个版本特定表单生成逐版本截图。 */
import { _electron as electron } from 'playwright'
import { mkdir, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const ROOT = resolve('.')
const OUT = join(ROOT, 'artifacts/quick-shots')
const USER_DATA = join(ROOT, 'artifacts/quick-shots-userdata')

const CASES = [
  ['1.19.4', 'place'],
  ['1.20.5', 'transfer'],
  ['1.21.5', 'test'],
  ['1.21.6', 'dialog'],
  ['1.21.6', 'waypoint'],
  ['1.21.11', 'stopwatch'],
  ['26.1', 'swing'],
  ['26.1', 'fetchprofile'],
  ['26.3', 'compute'],
  ['26.3', 'posteffect']
]

await rm(OUT, { recursive: true, force: true })
await rm(USER_DATA, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })

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

for (const [version, form] of CASES) {
  await selectVersion(version)
  await page.getByRole('button', { name: '全部', exact: true }).click().catch(() => {})
  await page.fill('#command-search', '')
  await page.waitForTimeout(250)
  const clicked = await page.evaluate((target) => {
    const button = [...document.querySelectorAll('.command-item')].find((element) => {
      const id = element.querySelector('.command-id')?.textContent?.trim() ?? ''
      const name = element.querySelector('.command-name')?.textContent?.trim() ?? ''
      return id === target || name === target || name.startsWith(target)
    })
    button?.click()
    return Boolean(button)
  }, form)
  if (!clicked) throw new Error(`找不到命令 ${form}`)
  await page.waitForFunction(
    (target) => document.querySelector('.hero-id')?.textContent === target,
    form
  )
  await page.waitForTimeout(250)
  await page.screenshot({ path: join(OUT, `${version}-${form}.png`) })
  console.log(`✓ ${version}/${form}`)
}

await app.close()
console.log(`✓ 10 个版本表单截图完成：${OUT}`)
