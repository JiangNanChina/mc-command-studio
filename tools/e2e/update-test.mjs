#!/usr/bin/env node
/**
 * 本地自动更新验收：安装 0.1.0 → 通过本地 generic 源升级到 0.1.1。
 *
 * 前置：
 *   - 已把 0.1.0 安装到 artifacts/update-run（脚本会自动查找 exe）
 *   - release/update-feed 含 0.1.1 的 latest.yml / Setup / blockmap
 *   - node tools/release/mock-update-server.mjs release/update-feed 8123
 */
import { _electron as electron } from 'playwright'
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { mkdir, readFile, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const INSTALL_ROOT = join(ROOT, 'artifacts/update-run')
const USER_DATA = join(ROOT, 'artifacts/update-userdata')
const FEED = 'http://127.0.0.1:8123/updates/'
const EXE_NAME = 'MC Command Studio.exe'

function findExe(directory = INSTALL_ROOT, depth = 0) {
  if (!existsSync(directory) || depth > 3) return null
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isFile() && entry.name === EXE_NAME) return path
    if (entry.isDirectory()) {
      const found = findExe(path, depth + 1)
      if (found) return found
    }
  }
  return null
}

function productVersion(exe) {
  const output = execFileSync(
    'powershell.exe',
    ['-NoProfile', '-Command', `(Get-Item '${exe}').VersionInfo.ProductVersion`],
    { encoding: 'utf8' }
  )
  return output.trim()
}

async function waitForVersion(expected, timeoutMs = 90_000) {
  const started = Date.now()
  let exe = findExe()
  let version = exe ? productVersion(exe) : ''
  while (Date.now() - started < timeoutMs) {
    exe = findExe()
    if (exe) {
      try {
        version = productVersion(exe)
        if (version.startsWith(expected)) return { exe, version }
      } catch {
        // 安装中 exe 可能被替换
      }
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 2000))
  }
  return { exe, version }
}

async function main() {
  const initial = findExe()
  if (!initial) {
    throw new Error(`找不到已安装的 0.1.0（${INSTALL_ROOT}）。请先安装 0.1.0。`)
  }
  const before = productVersion(initial)
  if (!before.startsWith('0.1.0')) throw new Error(`安装目录版本应为 0.1.0，实际 ${before}`)
  if (!existsSync(join(ROOT, 'release/update-feed/latest.yml'))) {
    throw new Error('release/update-feed 未准备')
  }

  await rm(USER_DATA, { recursive: true, force: true })
  await mkdir(USER_DATA, { recursive: true })

  const env = {
    ...process.env,
    MCSTUDIO_UPDATE_URL: FEED,
    MCSTUDIO_USER_DATA: USER_DATA,
    ELECTRON_DISABLE_SECURITY_WARNINGS: 'true'
  }
  delete env.ELECTRON_RUN_AS_NODE

  const app = await electron.launch({
    executablePath: initial,
    args: [],
    env,
    timeout: 60_000
  })
  let installed = false
  try {
    const page = await app.firstWindow()
    await page.waitForSelector('.sidebar', { timeout: 30_000 })
    await page.screenshot({ path: join(ROOT, 'artifacts/update-0.1.0.png') })

    await page.locator('button[title="设置 (Ctrl+,)"]').click()
    await page.waitForSelector('.modal', { timeout: 10_000 })
    const modal = page.locator('.modal')
    await modal.getByRole('button', { name: /检查更新/ }).click()

    await page.waitForSelector('text=发现新版本', { timeout: 30_000 })
    await page.screenshot({ path: join(ROOT, 'artifacts/update-available.png') })
    await page.keyboard.press('Escape')
    await page.waitForSelector('.banner.update', { timeout: 10_000 })

    await page.getByRole('button', { name: /下载更新/ }).click()
    await page.waitForSelector('text=已下载完成', { timeout: 180_000 })
    await page.screenshot({ path: join(ROOT, 'artifacts/update-downloaded.png') })

    const exit = new Promise((resolveExit) => {
      app.process().once('exit', resolveExit)
    })
    await page.getByRole('button', { name: /重启并安装/ }).click()
    await Promise.race([exit, new Promise((resolveTimeout) => setTimeout(resolveTimeout, 60_000))])
    installed = true
  } finally {
    if (!installed) await app.close().catch(() => undefined)
  }

  const after = await waitForVersion('0.1.1')
  if (!after.version?.startsWith('0.1.1')) {
    let logTail = ''
    try {
      logTail = await readFile(join(USER_DATA, 'logs/main.log'), 'utf8')
      logTail = logTail.split(/\r?\n/).slice(-40).join('\n')
    } catch {
      logTail = '（无日志）'
    }
    throw new Error(`升级失败：${after.version || '未知'}\n${logTail}`)
  }

  console.log(`✓ 自动更新验收通过：${before} → ${after.version}`)
  console.log(`  安装位置：${after.exe}`)
  console.log('  截图：artifacts/update-available.png / update-downloaded.png')
}

main().catch((error) => {
  console.error(`✗ ${error.message}`)
  process.exitCode = 1
})
