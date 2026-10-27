#!/usr/bin/env node
/** 更新 UI E2E：启动当前构建版本，指向更高版本（9.9.9）的 mock 源，验证更新横幅。 */
import { _electron as electron } from 'playwright'
import { spawn } from 'node:child_process'
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const ROOT = resolve('.')
const EXE = join(ROOT, 'release/win-unpacked/MC Command Studio.exe')
const FEED = join(ROOT, 'artifacts/update-ui-feed')
const SERVER = join(ROOT, 'tools/release/mock-update-server.mjs')
const PORT = 8125
const USER_DATA = join(ROOT, 'artifacts/update-ui-userdata')

await rm(FEED, { recursive: true, force: true })
await rm(USER_DATA, { recursive: true, force: true })
await mkdir(FEED, { recursive: true })
await mkdir(USER_DATA, { recursive: true })

const PKG = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'))
const INSTALLER = `MC-Command-Studio-Setup-${PKG.version}.exe`

await copyFile(join(ROOT, 'release', INSTALLER), join(FEED, INSTALLER))
const latest = await readFile(join(ROOT, 'release/latest.yml'), 'utf8')
await writeFile(join(FEED, 'latest.yml'), latest.replace(/^version: .+$/m, 'version: 9.9.9'))

const server = spawn(process.execPath, [SERVER, FEED, String(PORT)], {
  cwd: ROOT,
  stdio: 'ignore'
})
await new Promise((resolveDelay) => setTimeout(resolveDelay, 800))

const env = {
  ...process.env,
  MCSTUDIO_USER_DATA: USER_DATA,
  MCSTUDIO_UPDATE_URL: `http://127.0.0.1:${PORT}/updates/`
}
delete env.ELECTRON_RUN_AS_NODE

let app
try {
  app = await electron.launch({ executablePath: EXE, env, timeout: 60_000 })
  const page = await app.firstWindow()
  await page.waitForSelector('.sidebar', { timeout: 30_000 })
  await page.evaluate(() => window.mcstudio.updater.check(true))
  await page.waitForFunction(
    () => document.querySelector('.banner.update')?.textContent?.includes('发现新版本 v9.9.9'),
    { timeout: 30_000 }
  )
  const text = await page.locator('.banner.update').innerText()
  if (!text.includes('下载更新') || !text.includes('跳过此版本')) {
    throw new Error(`更新横幅按钮不完整：${text}`)
  }
  await page.screenshot({ path: join(ROOT, 'artifacts/update-ui.png') })
  console.log('✓ 更新 UI E2E 通过：发现新版本、下载/跳过按钮可见')
} finally {
  await app?.close().catch(() => {})
  server.kill()
}
