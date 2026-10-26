#!/usr/bin/env node
/**
 * Electron 冒烟测试：启动构建产物，加载数据包，操作 give 表单，截图。
 * 需要先运行 pnpm --filter @mcstudio/desktop build。
 */
import { _electron as electron } from 'playwright'
import { mkdir, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const APP_DIR = join(ROOT, 'apps/desktop')
const ARTIFACTS = join(ROOT, 'artifacts')
const USER_DATA = join(ARTIFACTS, 'test-userdata')

const errors = []
let app

async function main() {
  await mkdir(ARTIFACTS, { recursive: true })
  await rm(USER_DATA, { recursive: true, force: true })
  const env = {
    ...process.env,
    ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    MCSTUDIO_PACKS_DIR: join(ROOT, 'packs'),
    MCSTUDIO_USER_DATA: USER_DATA
  }
  delete env.ELECTRON_RUN_AS_NODE

  app = await electron.launch({
    args: ['.'],
    cwd: APP_DIR,
    env,
    timeout: 60_000
  })

  const page = await app.firstWindow()
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`renderer: ${message.text()}`)
  })

  await page.waitForSelector('.sidebar', { timeout: 30_000 })
  await page.waitForSelector('.command-item', { timeout: 30_000 })

  const bootError = await page.locator('.empty h2', { hasText: '数据包加载失败' }).count()
  if (bootError > 0) {
    const text = await page.locator('.empty p').first().textContent()
    throw new Error(`数据包加载失败：${text}`)
  }

  await page.screenshot({ path: join(ARTIFACTS, 'welcome.png') })

  // 从侧边栏选择 give
  await page.locator('.command-item', { hasText: '给予物品' }).first().click()
  await page.waitForSelector('#give-count', { timeout: 10_000 })

  // 搜索并选择 diamond_sword
  await page.locator('button', { hasText: '选择物品' }).first().click()
  await page.waitForSelector('.modal', { timeout: 10_000 })
  await page.locator('.modal input[placeholder*="搜索物品"]').fill('diamond_sword')
  await page.locator('.item-row', { hasText: 'minecraft:diamond_sword' }).first().click()
  await page.waitForSelector('#give-count', { timeout: 10_000 })

  // 添加自定义名称组件
  await page.locator('select[aria-label="添加组件"]').selectOption('custom_name')
  await page.locator('#custom-name-text').fill('Excalibur')

  await page.waitForTimeout(600)
  const commandText = await page.locator('.output-code .cm-content').innerText()
  if (!commandText.includes('give @s minecraft:diamond_sword[custom_name=')) {
    throw new Error(`输出不符合预期：${commandText}`)
  }

  await page.locator('.main').evaluate((element) => {
    element.scrollTop = 0
  })
  await page.waitForTimeout(150)
  await page.screenshot({ path: join(ARTIFACTS, 'give-form.png') })

  // 切换命令方块
  await page.locator('.tab', { hasText: '命令方块' }).click()
  await page.waitForTimeout(400)
  const setblockText = await page.locator('.output-code .cm-content').innerText()
  if (!setblockText.includes('setblock 0 64 0 minecraft:command_block')) {
    throw new Error(`命令方块输出不符合预期：${setblockText}`)
  }
  await page.locator('.main').evaluate((element) => {
    element.scrollTop = 0
  })
  await page.waitForTimeout(150)
  await page.screenshot({ path: join(ARTIFACTS, 'command-block.png') })

  // 设置弹窗
  await page.locator('button[title="设置 (Ctrl+,)"]').click()
  await page.waitForSelector('.modal', { timeout: 10_000 })
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(ARTIFACTS, 'settings.png') })
  await page.keyboard.press('Escape')

  const info = await app.evaluate(({ app: electronApp }) => ({
    version: electronApp.getVersion(),
    packaged: electronApp.isPackaged
  }))
  console.log(`✓ Electron 冒烟测试通过（v${info.version}, packaged=${info.packaged}）`)
  console.log(`  截图：${ARTIFACTS}`)
}

main()
  .catch((error) => {
    console.error(`✗ ${error.message}`)
    if (errors.length > 0) {
      console.error('渲染进程错误：')
      for (const message of errors.slice(0, 10)) console.error(`  - ${message}`)
    }
    process.exitCode = 1
  })
  .finally(async () => {
    if (app) {
      await app.close().catch(() => undefined)
    }
  })
