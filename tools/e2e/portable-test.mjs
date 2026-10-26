#!/usr/bin/env node
/**
 * 便携版模式验收：通过 PORTABLE_EXECUTABLE_DIR 模拟便携版启动，
 * 确认自动更新被禁用并提示手动下载。
 */
import { _electron as electron } from 'playwright'
import { mkdir, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const EXE = join(ROOT, 'release/win-unpacked/MC Command Studio.exe')
const USER_DATA = join(ROOT, 'artifacts/portable-userdata')

async function main() {
  await rm(USER_DATA, { recursive: true, force: true })
  await mkdir(USER_DATA, { recursive: true })
  const env = {
    ...process.env,
    PORTABLE_EXECUTABLE_DIR: join(ROOT, 'release'),
    MCSTUDIO_USER_DATA: USER_DATA,
    ELECTRON_DISABLE_SECURITY_WARNINGS: 'true'
  }
  delete env.ELECTRON_RUN_AS_NODE

  const app = await electron.launch({ executablePath: EXE, args: [], env, timeout: 60_000 })
  try {
    const page = await app.firstWindow()
    await page.waitForSelector('.sidebar', { timeout: 30_000 })
    await page.locator('button[title="设置 (Ctrl+,)"]').click()
    await page.waitForSelector('.modal', { timeout: 10_000 })
    await page.waitForSelector('text=便携版不支持自动更新', { timeout: 10_000 })
    await page.waitForTimeout(300)
    await page.screenshot({ path: join(ROOT, 'artifacts/portable.png') })
    console.log('✓ 便携版模式验收通过：自动更新已禁用并提示手动下载')
  } finally {
    await app.close().catch(() => undefined)
  }
}

main().catch((error) => {
  console.error(`✗ ${error.message}`)
  process.exitCode = 1
})
