#!/usr/bin/env node
/**
 * Electron 冒烟测试：启动构建产物，加载数据包，操作 give 表单，截图。
 * 需要先运行 pnpm --filter @mcstudio/desktop build。
 */
import { _electron as electron } from 'playwright'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const APP_DIR = join(ROOT, 'apps/desktop')
const ARTIFACTS = join(ROOT, 'artifacts')
const USER_DATA = join(ARTIFACTS, 'test-userdata')
const DATAPACK_DIR = join(ARTIFACTS, 'datapack')
const APP_VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version

const errors = []
let app

async function main() {
  await mkdir(ARTIFACTS, { recursive: true })
  await rm(USER_DATA, { recursive: true, force: true })
  await rm(DATAPACK_DIR, { recursive: true, force: true })
  const env = {
    ...process.env,
    ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    MCSTUDIO_PACKS_DIR: join(ROOT, 'packs'),
    MCSTUDIO_USER_DATA: USER_DATA,
    MCSTUDIO_TEST_SAVE_DIR: DATAPACK_DIR
  }
  delete env.ELECTRON_RUN_AS_NODE

  app = await electron.launch(
    process.env.MCSTUDIO_E2E_EXE
      ? {
          executablePath: resolve(ROOT, process.env.MCSTUDIO_E2E_EXE),
          args: [],
          env,
          timeout: 60_000
        }
      : {
          args: ['.'],
          cwd: APP_DIR,
          env,
          timeout: 60_000
        }
  )

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

  // 首次启动：更新公告横幅 → 版本历史弹窗
  await page.waitForSelector('.banner.announcement', { timeout: 10_000 })
  const announcementText = await page.locator('.banner.announcement').innerText()
  if (!announcementText.includes(`v${APP_VERSION}`)) {
    throw new Error(`公告横幅版本不正确：${announcementText}`)
  }
  await page.getByRole('button', { name: '查看详情' }).click()
  await page.waitForSelector('.modal', { timeout: 10_000 })
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(ARTIFACTS, 'announcement.png') })
  const modal = page.locator('.modal')
  if ((await modal.getByRole('button', { name: '知道了' }).count()) === 0) {
    throw new Error('公告弹窗缺少“知道了”按钮')
  }
  await modal.getByRole('button', { name: '知道了' }).click()
  await page.waitForSelector('.banner.announcement', { state: 'detached', timeout: 10_000 })

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
  await page.locator('#component-custom_name-text').fill('Excalibur')

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

  // 文本导入：从命令还原 give 表单
  await page.getByRole('button', { name: '从命令导入' }).click()
  await page.waitForSelector('#give-import-text', { timeout: 10_000 })
  await page
    .locator('#give-import-text')
    .fill('/give @s minecraft:diamond_sword[custom_name={text:"Imported",color:"aqua",italic:false}] 1')
  await page.getByRole('button', { name: '解析' }).click()
  await page.getByRole('button', { name: '应用到表单' }).click()
  await page.waitForSelector('#component-custom_name-text', { timeout: 10_000 })
  if ((await page.locator('#component-custom_name-text').inputValue()) !== 'Imported') {
    throw new Error('文本导入没有还原 custom_name')
  }
  if ((await page.locator('.toast-close').count()) > 0) {
    await page.locator('.toast-close').first().click()
  }

  // summon 专用表单
  await page.locator('.command-item', { hasText: '召唤实体' }).first().click()
  await page.waitForSelector('#summon-entity', { timeout: 10_000 })
  await page.locator('#summon-entity').fill('minecraft:armor_stand')
  await page.waitForTimeout(400)
  const summonText = await page.locator('.output-code .cm-content').innerText()
  if (!summonText.includes('summon minecraft:armor_stand ~ ~ ~')) {
    throw new Error(`summon 输出不符合预期：${summonText}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'summon-form.png') })

  // setblock 专用表单 + 方块状态
  await page.locator('.command-item', { hasText: '放置方块' }).first().click()
  await page.waitForSelector('#setblock-x', { timeout: 10_000 })
  await page.getByRole('button', { name: '选择方块' }).click()
  await page.waitForSelector('.modal', { timeout: 10_000 })
  await page.locator('.modal input[placeholder*="搜索方块"]').fill('chest')
  await page.locator('.item-row', { hasText: 'minecraft:chest' }).first().click()
  await page.waitForTimeout(400)
  const blockText = await page.locator('.output-code .cm-content').innerText()
  if (!blockText.includes('setblock ~ ~ ~ minecraft:chest[')) {
    throw new Error(`setblock 输出不符合预期：${blockText}`)
  }
  await page.locator('.main').evaluate((element) => {
    element.scrollTop = 0
  })
  await page.screenshot({ path: join(ARTIFACTS, 'setblock-form.png') })

  // tp 专用表单
  await page.locator('.command-item', { hasText: '传送' }).first().click()
  await page.locator('.hero-id', { hasText: 'tp' }).waitFor({ timeout: 10_000 })
  await page.waitForTimeout(300)
  let tpOutput = await page.locator('.output-code .cm-content').innerText()
  if (!tpOutput.includes('tp @s')) throw new Error(`tp 输出不符合预期：${tpOutput}`)
  await page.locator('.checkline', { hasText: '同时设置朝向' }).locator('input').check()
  await page.waitForSelector('#tp-yaw', { timeout: 10_000 })
  await page.waitForTimeout(300)
  tpOutput = await page.locator('.output-code .cm-content').innerText()
  if (!tpOutput.includes('tp @s ~ ~ ~ 0 0')) {
    throw new Error(`tp 朝向输出不符合预期：${tpOutput}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'tp-form.png') })

  // effect 专用表单
  await page.locator('.command-item', { hasText: '状态效果' }).first().click()
  await page.waitForSelector('#effect-id', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const effectOutput = await page.locator('.output-code .cm-content').innerText()
  if (!effectOutput.includes('effect give @s minecraft:speed 30 0')) {
    throw new Error(`effect 输出不符合预期：${effectOutput}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'effect-form.png') })

  // fill 专用表单
  await page.locator('.command-item', { hasText: '填充区域' }).first().click()
  await page.waitForSelector('#fill-block', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const fillOutput = await page.locator('.output-code .cm-content').innerText()
  if (!fillOutput.includes('fill ~ ~ ~ ~2 ~2 ~2 minecraft:stone')) {
    throw new Error(`fill 输出不符合预期：${fillOutput}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'fill-form.png') })

  // execute 执行链
  await page.locator('.command-item', { hasText: '执行上下文' }).first().click()
  await page.waitForSelector('#execute-run', { timeout: 10_000 })
  await page.getByRole('button', { name: '以执行者身份运行' }).click()
  await page.waitForTimeout(400)
  const executeText = await page.locator('.output-code .cm-content').innerText()
  if (!executeText.includes('execute as @s at @s run say 你好')) {
    throw new Error(`execute 输出不符合预期：${executeText}`)
  }
  await page.locator('.main').evaluate((element) => {
    element.scrollTop = 0
  })
  await page.screenshot({ path: join(ARTIFACTS, 'execute-form.png') })

  // 数据包导出（测试环境跳过系统保存对话框）
  await page.getByRole('button', { name: '导出数据包' }).click()
  await page.waitForSelector('#datapack-namespace', { timeout: 10_000 })
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(ARTIFACTS, 'datapack.png') })
  await page.getByRole('button', { name: '导出 .zip' }).click()
  await page.waitForSelector('text=数据包已导出', { timeout: 20_000 })
  if (!existsSync(join(DATAPACK_DIR, 'mcstudio-main.zip'))) {
    throw new Error('数据包 zip 未生成')
  }

  // 回到 give，切换命令方块
  await page.locator('.command-item', { hasText: '给予物品' }).first().click()
  await page.waitForSelector('#give-count', { timeout: 10_000 })
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
