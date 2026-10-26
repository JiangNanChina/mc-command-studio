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
  await page.locator('.modal input[placeholder*="搜索中文名"]').fill('钻石剑')
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(ARTIFACTS, 'item-picker.png') })
  await page.locator('.mc-tile', { hasText: 'diamond_sword' }).first().click()
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
  await page.locator('.hero-id', { hasText: 'summon' }).waitFor({ timeout: 10_000 })
  await page.getByRole('button', { name: '选择实体' }).click()
  await page.locator('.modal input[placeholder*="搜索中文名"]').fill('盔甲架')
  await page.locator('.mc-tile', { hasText: 'armor_stand' }).first().click()
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
  await page.locator('.modal input[placeholder*="搜索中文名"]').fill('箱子')
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(ARTIFACTS, 'block-picker.png') })
  await page.locator('.mc-tile', { hasText: 'chest' }).first().click()
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
  await page.waitForSelector('#effect-amplifier', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const effectOutput = await page.locator('.output-code .cm-content').innerText()
  if (!effectOutput.includes('effect give @s minecraft:speed 30 0')) {
    throw new Error(`effect 输出不符合预期：${effectOutput}`)
  }
  await page.locator('.checkline', { hasText: '永久效果' }).locator('input').check()
  await page.waitForTimeout(300)
  const permanentEffect = await page.locator('.output-code .cm-content').innerText()
  if (!permanentEffect.includes('effect give @s minecraft:speed infinite 0')) {
    throw new Error(`永久 effect 输出不符合预期：${permanentEffect}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'effect-form.png') })

  // fill 专用表单
  await page.locator('.command-item', { hasText: '填充区域' }).first().click()
  await page.waitForSelector('.hero-id', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const fillOutput = await page.locator('.output-code .cm-content').innerText()
  if (!fillOutput.includes('fill ~ ~ ~ ~2 ~2 ~2 minecraft:stone')) {
    throw new Error(`fill 输出不符合预期：${fillOutput}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'fill-form.png') })

  // enchant / xp 专用表单
  await page.locator('.command-item', { hasText: 'enchant' }).first().click()
  await page.waitForSelector('#enchant-level', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const enchantOutput = await page.locator('.output-code .cm-content').innerText()
  if (!enchantOutput.includes('enchant @s minecraft:sharpness 1')) {
    throw new Error(`enchant 输出不符合预期：${enchantOutput}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'enchant-form.png') })

  await page.locator('.command-item', { hasText: '经验' }).first().click()
  await page.waitForSelector('#xp-amount', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const xpOutput = await page.locator('.output-code .cm-content').innerText()
  if (!xpOutput.includes('xp add @s 100')) {
    throw new Error(`xp 输出不符合预期：${xpOutput}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'xp-form.png') })

  // tellraw / title 可视化文本
  await page.locator('.command-item', { hasText: '富文本消息' }).first().click()
  await page.waitForSelector('.text-segment', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const tellrawOutput = await page.locator('.output-code .cm-content').innerText()
  if (!tellrawOutput.includes('tellraw @a {"text":"文本"}')) {
    throw new Error(`tellraw 输出不符合预期：${tellrawOutput}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'tellraw-form.png') })

  await page.locator('.command-item', { hasText: '标题' }).first().click()
  await page.waitForSelector('.text-segment', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const titleOutput = await page.locator('.output-code .cm-content').innerText()
  if (!titleOutput.includes('title @a title {"text":"文本"}')) {
    throw new Error(`title 输出不符合预期：${titleOutput}`)
  }
  await page.locator('.checkline', { hasText: '同时设置淡入' }).locator('input').check()
  await page.waitForSelector('#title-stay', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const titleTimes = await page.locator('.output-code .cm-content').innerText()
  if (!titleTimes.includes('title @a times 10 70 20')) {
    throw new Error(`title times 输出不符合预期：${titleTimes}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'title-form.png') })

  // playsound / stopsound 可视化
  await page.locator('.command-item', { hasText: '播放声音' }).first().click()
  await page.waitForSelector('#sound-volume', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const soundOutput = await page.locator('.output-code .cm-content').innerText()
  if (!soundOutput.includes('playsound minecraft:ui.button.click master @s ~ ~ ~ 1 1 0')) {
    throw new Error(`playsound 输出不符合预期：${soundOutput}`)
  }
  await page.getByRole('button', { name: '选择声音' }).click()
  await page.waitForSelector('.mc-grid', { timeout: 10_000 })
  await page.locator('.modal input[placeholder*="搜索中文名"]').fill('箱子')
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(ARTIFACTS, 'sound-picker.png') })
  await page.locator('.mc-tile', { hasText: 'block.chest.open' }).first().click()
  await page.waitForTimeout(300)
  const soundChest = await page.locator('.output-code .cm-content').innerText()
  if (!soundChest.includes('playsound minecraft:block.chest.open')) {
    throw new Error(`playsound 选择声音不符合预期：${soundChest}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'sound-form.png') })

  await page.locator('.command-item', { hasText: '停止声音' }).first().click()
  await page.locator('.hero-id', { hasText: 'stopsound' }).waitFor({ timeout: 10_000 })
  await page.waitForTimeout(300)
  const stopOutput = await page.locator('.output-code .cm-content').innerText()
  if (!stopOutput.includes('stopsound @s')) {
    throw new Error(`stopsound 输出不符合预期：${stopOutput}`)
  }
  await page.getByRole('button', { name: '指定来源' }).click()
  await page.waitForSelector('#stop-source', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const stopSource = await page.locator('.output-code .cm-content').innerText()
  if (!stopSource.includes('stopsound @s master')) {
    throw new Error(`stopsound 来源输出不符合预期：${stopSource}`)
  }

  // bossbar 可视化
  await page.locator('.command-item', { hasText: 'BOSS 栏' }).first().click()
  await page.waitForSelector('#bossbar-id', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const bossbarOutput = await page.locator('.output-code .cm-content').innerText()
  if (!bossbarOutput.includes('bossbar add mcstudio:boss "BOSS"')) {
    throw new Error(`bossbar 输出不符合预期：${bossbarOutput}`)
  }
  if (!bossbarOutput.includes('bossbar set mcstudio:boss color red')) {
    throw new Error(`bossbar 颜色输出不符合预期：${bossbarOutput}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'bossbar-form.png') })
  await page.getByRole('button', { name: '移除', exact: true }).click()
  await page.waitForTimeout(300)
  const bossbarRemove = await page.locator('.output-code .cm-content').innerText()
  if (!bossbarRemove.includes('bossbar remove mcstudio:boss')) {
    throw new Error(`bossbar 移除输出不符合预期：${bossbarRemove}`)
  }
  await page.getByRole('button', { name: '创建并配置' }).click()

  // particle 可视化（dust SNBT 参数）
  await page.locator('.command-item', { hasText: '粒子效果' }).first().click()
  await page.waitForSelector('#particle-mode', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const particleOutput = await page.locator('.output-code .cm-content').innerText()
  if (!particleOutput.includes('particle minecraft:flame ~ ~1 ~ 0 0 0 0 1 normal')) {
    throw new Error(`particle 输出不符合预期：${particleOutput}`)
  }
  await page.getByRole('button', { name: '选择粒子' }).click()
  await page.waitForSelector('.mc-grid', { timeout: 10_000 })
  await page.locator('.modal input[placeholder*="粒子"]').fill('红石尘')
  await page.waitForTimeout(300)
  await page.locator('.mc-tile', { hasText: '红石尘' }).first().click()
  await page.waitForSelector('#particle-scale', { timeout: 10_000 })
  await page.fill('#particle-scale', '2')
  await page.waitForTimeout(300)
  const particleDust = await page.locator('.output-code .cm-content').innerText()
  if (!particleDust.includes('particle minecraft:dust{color:[1,0.333,0.333],scale:2}')) {
    throw new Error(`particle dust 输出不符合预期：${particleDust}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'particle-form.png') })

  // scoreboard 可视化
  await page.locator('.command-item', { hasText: '记分板' }).first().click()
  await page.waitForSelector('#scoreboard-objective', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const scoreboardOutput = await page.locator('.output-code .cm-content').innerText()
  if (!scoreboardOutput.includes('scoreboard objectives add kills dummy "击杀数"')) {
    throw new Error(`scoreboard 输出不符合预期：${scoreboardOutput}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'scoreboard-form.png') })
  await page.getByRole('button', { name: '设置分数' }).click()
  await page.waitForSelector('#scoreboard-score', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const scoreboardSet = await page.locator('.output-code .cm-content').innerText()
  if (!scoreboardSet.includes('scoreboard players set @s kills 0')) {
    throw new Error(`scoreboard 设置分数输出不符合预期：${scoreboardSet}`)
  }
  await page.getByRole('button', { name: '分数运算' }).click()
  await page.waitForSelector('#scoreboard-operation', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const scoreboardOp = await page.locator('.output-code .cm-content').innerText()
  if (!scoreboardOp.includes('scoreboard players operation @s kills =')) {
    throw new Error(`scoreboard 运算输出不符合预期：${scoreboardOp}`)
  }

  // clone 专用表单 + 撤销/重做
  await page.locator('.command-item', { hasText: '复制区域' }).first().click()
  await page.waitForSelector('#clone-mode', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const cloneOutput = await page.locator('.output-code .cm-content').innerText()
  if (!cloneOutput.includes('clone ~ ~ ~ ~2 ~2 ~2 ~ ~ ~')) {
    throw new Error(`clone 输出不符合预期：${cloneOutput}`)
  }
  await page.waitForTimeout(700)
  await page.selectOption('#clone-move', 'force')
  await page.waitForTimeout(300)
  const forcedClone = await page.locator('.output-code .cm-content').innerText()
  if (!forcedClone.includes(' force')) throw new Error(`clone force 输出不符合预期：${forcedClone}`)
  await page.getByRole('button', { name: '撤销' }).click()
  await page.waitForTimeout(300)
  const undoneClone = await page.locator('.output-code .cm-content').innerText()
  if (undoneClone.includes(' force')) throw new Error(`撤销后仍包含 force：${undoneClone}`)
  await page.getByRole('button', { name: '重做' }).click()
  await page.waitForTimeout(300)
  const redoneClone = await page.locator('.output-code .cm-content').innerText()
  if (!redoneClone.includes(' force')) throw new Error(`重做后缺少 force：${redoneClone}`)
  await page.screenshot({ path: join(ARTIFACTS, 'clone-form.png') })

  // 命令方块链
  await page.locator('.command-item', { hasText: '命令方块链' }).first().click()
  await page.waitForSelector('#chain-direction', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const chainOutput = await page.locator('.output-code .cm-content').innerText()
  if (!chainOutput.includes('setblock 0 64 0 minecraft:command_block')) {
    throw new Error(`命令方块链输出不符合预期：${chainOutput}`)
  }
  if (!chainOutput.includes('setblock 1 64 0 minecraft:chain_command_block')) {
    throw new Error(`命令方块链缺少连锁块：${chainOutput}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'chain-form.png') })

  // 独立数据包工作区
  await page.locator('.command-item', { hasText: '数据包工作区' }).first().click()
  await page.waitForSelector('#datapack-namespace', { timeout: 10_000 })
  await page.locator('.datapack-functions').getByRole('button', { name: '新建' }).click()
  await page.fill('#datapack-function-name', 'lib/init')
  await page.fill('#datapack-commands', 'scoreboard objectives add kills dummy')
  await page.selectOption('#datapack-load', 'lib/init')
  await page.selectOption('#datapack-tick', 'main')
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(ARTIFACTS, 'datapack.png') })
  await page.getByRole('button', { name: '导出数据包 .zip' }).click()
  await page.waitForSelector('text=数据包已导出', { timeout: 20_000 })
  if (!existsSync(join(DATAPACK_DIR, 'mcstudio-datapack.zip'))) {
    throw new Error('数据包工作区 zip 未生成')
  }

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
