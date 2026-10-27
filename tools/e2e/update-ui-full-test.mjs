#!/usr/bin/env node
/** 完整更新 UI E2E：test.3 点击下载 -> 重新载入 -> 安装为 test.4。 */
import { _electron as electron } from 'playwright'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve('.')
const EXE = join(ROOT, 'artifacts/test-app/MC 指令工坊 测试版.exe')
const USER_DATA = join(ROOT, 'artifacts/test-app-userdata')
if (!existsSync(EXE)) throw new Error(`找不到测试版：${EXE}`)

const env = {
  ...process.env,
  MCSTUDIO_USER_DATA: USER_DATA,
  MCSTUDIO_UPDATE_URL: 'http://127.0.0.1:8123/updates/'
}
delete env.ELECTRON_RUN_AS_NODE

async function launch() {
  const app = await electron.launch({ executablePath: EXE, env, timeout: 60_000 })
  const page = await app.firstWindow()
  await page.waitForSelector('.sidebar', { timeout: 30_000 })
  return { app, page }
}

const before = await launch()
const infoBefore = await before.page.evaluate(() => window.mcstudio.app.info())
console.log(`before=${infoBefore.version}`)
await before.page.evaluate(() => window.mcstudio.updater.check(true))
await before.page.waitForFunction(
  () => document.querySelector('.banner.update')?.textContent?.includes('发现新版本 v0.5.1-test.4'),
  { timeout: 30_000 }
)
await before.page.getByRole('button', { name: '下载更新', exact: true }).click()
await before.page.waitForFunction(
  () => document.querySelector('.banner.update')?.textContent?.includes('已下载完成'),
  { timeout: 180_000 }
)
await before.page.getByRole('button', { name: '重新载入', exact: true }).click()
await new Promise((resolveDelay) => setTimeout(resolveDelay, 15_000))
await before.app.close().catch(() => {})

const after = await launch()
const infoAfter = await after.page.evaluate(() => window.mcstudio.app.info())
console.log(`after=${infoAfter.version}`)
await after.app.close()
if (!infoAfter.version.startsWith('0.5.1-test.4')) {
  throw new Error(`更新后版本不是 test.4：${infoAfter.version}`)
}
console.log('✓ 更新 UI 完整 E2E 通过：下载 → 重新载入 → 安装 → test.4')
