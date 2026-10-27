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
  if ((await modal.getByRole('button', { name: '查看历史版本' }).count()) === 0) {
    throw new Error('公告弹窗缺少“查看历史版本”按钮')
  }
  if ((await modal.locator('.changelog-versions').count()) > 0) {
    throw new Error('公告弹窗不应显示所有版本列表')
  }
  if ((await modal.locator('.changelog-section.known').count()) > 0) {
    throw new Error('公告弹窗不应显示已知问题栏目')
  }
  await modal.getByRole('button', { name: '知道了' }).click()
  await page.waitForSelector('.banner.announcement', { state: 'detached', timeout: 10_000 })
  await page.waitForSelector('.brand-mark img', { timeout: 10_000 })

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
  await page.getByRole('button', { name: '查询字段', exact: true }).click()
  await page.waitForSelector('#bossbar-field', { timeout: 10_000 })
  await page.selectOption('#bossbar-field', 'players')
  await page.waitForTimeout(300)
  const bossbarGet = await page.locator('.output-code .cm-content').innerText()
  if (!bossbarGet.includes('bossbar get mcstudio:boss players')) {
    throw new Error(`bossbar 查询输出不符合预期：${bossbarGet}`)
  }
  await page.getByRole('button', { name: '列出全部', exact: true }).click()
  await page.waitForTimeout(300)
  const bossbarList = await page.locator('.output-code .cm-content').innerText()
  if (!bossbarList.includes('bossbar list')) {
    throw new Error(`bossbar 列表输出不符合预期：${bossbarList}`)
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

  // 世界控制：time / weather / difficulty
  await page.locator('.command-item', { hasText: 'time' }).first().click()
  await page.waitForSelector('#world-tab-time', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const timeOutput = await page.locator('.output-code .cm-content').innerText()
  if (!timeOutput.includes('time set day')) {
    throw new Error(`time 输出不符合预期：${timeOutput}`)
  }
  await page.locator('#world-tab-weather').click()
  await page.waitForTimeout(300)
  const weatherOutput = await page.locator('.output-code .cm-content').innerText()
  if (!weatherOutput.includes('weather clear')) {
    throw new Error(`weather 输出不符合预期：${weatherOutput}`)
  }
  await page.getByLabel('指定持续时间').check()
  await page.fill('#weather-seconds', '6000')
  await page.waitForTimeout(300)
  const weatherDuration = await page.locator('.output-code .cm-content').innerText()
  if (!weatherDuration.includes('weather clear 6000')) {
    throw new Error(`weather 持续时间输出不符合预期：${weatherDuration}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'world-form.png') })
  await page.locator('#world-tab-difficulty').click()
  await page.waitForSelector('#difficulty-hard', { timeout: 10_000 })
  await page.locator('#difficulty-hard').click()
  await page.waitForTimeout(300)
  const difficultyOutput = await page.locator('.output-code .cm-content').innerText()
  if (!difficultyOutput.includes('difficulty hard')) {
    throw new Error(`difficulty 输出不符合预期：${difficultyOutput}`)
  }

  // tag 实体标签
  await page.locator('.command-item', { hasText: '实体标签' }).first().click()
  await page.waitForSelector('#tag-name', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const tagOutput = await page.locator('.output-code .cm-content').innerText()
  if (!tagOutput.includes('tag @s add mcstudio.tag')) {
    throw new Error(`tag 输出不符合预期：${tagOutput}`)
  }
  await page.getByRole('button', { name: '查询', exact: true }).click()
  await page.waitForTimeout(300)
  const tagList = await page.locator('.output-code .cm-content').innerText()
  if (!tagList.includes('tag @s list')) {
    throw new Error(`tag 查询输出不符合预期：${tagList}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'tag-form.png') })

  // clear 清除物品
  await page.locator('.command-item', { hasText: '清除物品' }).first().click()
  await page.waitForTimeout(300)
  const clearAll = await page.locator('.output-code .cm-content').innerText()
  if (!clearAll.includes('clear @s')) {
    throw new Error(`clear 全部物品输出不符合预期：${clearAll}`)
  }
  await page.getByRole('button', { name: '指定物品', exact: true }).click()
  await page.getByRole('button', { name: '选择物品', exact: true }).click()
  await page.waitForSelector('.mc-grid', { timeout: 10_000 })
  await page.locator('.modal input[placeholder*="搜索中文名"]').fill('钻石')
  await page.waitForTimeout(300)
  await page
    .locator('.mc-tile')
    .filter({ has: page.locator('.mc-tile-name', { hasText: /^钻石$/ }) })
    .first()
    .click()
  await page.getByLabel('限制最大清除数量').check()
  await page.fill('#clear-max-count', '5')
  await page.waitForTimeout(300)
  const clearDiamond = await page.locator('.output-code .cm-content').innerText()
  if (!clearDiamond.includes('clear @s minecraft:diamond 5')) {
    throw new Error(`clear 指定物品输出不符合预期：${clearDiamond}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'clear-form.png') })

  // gamerule 游戏规则
  await page.locator('.command-item', { hasText: '游戏规则' }).first().click()
  await page.waitForSelector('.gamerule-selected', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const gameruleOutput = await page.locator('.output-code .cm-content').innerText()
  if (!gameruleOutput.includes('gamerule keep_inventory false')) {
    throw new Error(`gamerule 输出不符合预期：${gameruleOutput}`)
  }
  await page.getByRole('button', { name: '开启 true' }).click()
  await page.waitForTimeout(200)
  const gameruleTrue = await page.locator('.output-code .cm-content').innerText()
  if (!gameruleTrue.includes('gamerule keep_inventory true')) {
    throw new Error(`gamerule 开关输出不符合预期：${gameruleTrue}`)
  }
  await page.getByRole('button', { name: '选择规则' }).click()
  await page.waitForSelector('.gamerule-grid', { timeout: 10_000 })
  await page.locator('.modal input[placeholder*="游戏规则"]').fill('随机刻')
  await page.waitForTimeout(300)
  await page.locator('.gamerule-tile', { hasText: '随机刻' }).first().click()
  await page.waitForSelector('#gamerule-value', { timeout: 10_000 })
  await page.fill('#gamerule-value', '3')
  await page.waitForTimeout(300)
  const gameruleInt = await page.locator('.output-code .cm-content').innerText()
  if (!gameruleInt.includes('gamerule random_tick_speed 3')) {
    throw new Error(`gamerule 整数输出不符合预期：${gameruleInt}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'gamerule-form.png') })

  // worldborder 世界边界
  await page.locator('.command-item', { hasText: '世界边界' }).first().click()
  await page.waitForSelector('#worldborder-distance', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const borderSet = await page.locator('.output-code .cm-content').innerText()
  if (!borderSet.includes('worldborder set 1000')) {
    throw new Error(`worldborder 设置输出不符合预期：${borderSet}`)
  }
  await page.getByRole('button', { name: '扩展/收缩', exact: true }).click()
  await page.getByLabel('指定过渡时间').check()
  await page.fill('#worldborder-time', '10s')
  await page.waitForTimeout(300)
  const borderAdd = await page.locator('.output-code .cm-content').innerText()
  if (!borderAdd.includes('worldborder add 1000 10s')) {
    throw new Error(`worldborder 过渡输出不符合预期：${borderAdd}`)
  }
  await page.getByRole('button', { name: '设置中心', exact: true }).click()
  await page.fill('#worldborder-x', '100')
  await page.fill('#worldborder-z', '-200')
  await page.waitForTimeout(300)
  const borderCenter = await page.locator('.output-code .cm-content').innerText()
  if (!borderCenter.includes('worldborder center 100 -200')) {
    throw new Error(`worldborder 中心输出不符合预期：${borderCenter}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'worldborder-form.png') })
  await page.getByRole('button', { name: '查询尺寸', exact: true }).click()
  await page.waitForTimeout(200)
  const borderGet = await page.locator('.output-code .cm-content').innerText()
  if (!borderGet.includes('worldborder get')) {
    throw new Error(`worldborder 查询输出不符合预期：${borderGet}`)
  }

  // team 队伍
  await page.locator('.command-item', { hasText: '队伍' }).first().click()
  await page.waitForSelector('#team-name', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const teamCreate = await page.locator('.output-code .cm-content').innerText()
  if (!teamCreate.includes('team add red_team "红队"')) {
    throw new Error(`team 创建输出不符合预期：${teamCreate}`)
  }
  if (!teamCreate.includes('team modify red_team friendlyFire false')) {
    throw new Error(`team 选项输出不符合预期：${teamCreate}`)
  }
  const teamTextCard = page.locator('.card').filter({ hasText: '队伍前缀与后缀' })
  await teamTextCard.getByRole('button', { name: /添加文本片段/ }).first().click()
  await teamTextCard.locator('.text-segment input.input').first().fill('[RED]')
  await page.waitForTimeout(300)
  const teamPrefix = await page.locator('.output-code .cm-content').innerText()
  if (!teamPrefix.includes('team modify red_team prefix {"text":"[RED]"}')) {
    throw new Error(`team 前缀输出不符合预期：${teamPrefix}`)
  }
  await page.getByLabel('使用高级文本组件显示名').check()
  const teamMainCard = page.locator('.card').filter({ has: page.locator('#team-name') })
  await teamMainCard.getByRole('button', { name: /添加文本片段/ }).first().click()
  await teamMainCard.locator('.text-segment input.input').first().fill('红队')
  await page.waitForTimeout(300)
  const teamDisplay = await page.locator('.output-code .cm-content').innerText()
  if (!teamDisplay.includes('team add red_team {"text":"红队"}')) {
    throw new Error(`team 高级显示名输出不符合预期：${teamDisplay}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'team-form.png') })
  await page.getByRole('button', { name: '加入队伍', exact: true }).click()
  await page.waitForTimeout(300)
  const teamJoin = await page.locator('.output-code .cm-content').innerText()
  if (!teamJoin.includes('team join red_team @a')) {
    throw new Error(`team 加入输出不符合预期：${teamJoin}`)
  }
  await page.getByRole('button', { name: '离开队伍', exact: true }).click()
  await page.waitForTimeout(300)
  const teamLeave = await page.locator('.output-code .cm-content').innerText()
  if (!teamLeave.includes('team leave @a')) {
    throw new Error(`team 离开输出不符合预期：${teamLeave}`)
  }
  await page.getByRole('button', { name: '创建队伍', exact: true }).click()

  // spawnpoint / setworldspawn / forceload
  await page.locator('.command-item', { hasText: 'spawnpoint' }).first().click()
  await page.waitForSelector('#spawn-tab-spawnpoint', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const spawnOutput = await page.locator('.output-code .cm-content').innerText()
  if (!spawnOutput.includes('spawnpoint @s ~ ~ ~')) {
    throw new Error(`spawnpoint 输出不符合预期：${spawnOutput}`)
  }
  await page.getByLabel('指定重生朝向').check()
  await page.fill('#spawn-yaw', '90')
  await page.waitForTimeout(300)
  const spawnAngle = await page.locator('.output-code .cm-content').innerText()
  if (!spawnAngle.includes('spawnpoint @s ~ ~ ~ 90 0')) {
    throw new Error(`spawnpoint 朝向输出不符合预期：${spawnAngle}`)
  }
  await page.locator('#spawn-tab-setworldspawn').click()
  await page.waitForTimeout(300)
  const worldSpawnOutput = await page.locator('.output-code .cm-content').innerText()
  if (!worldSpawnOutput.includes('setworldspawn 0 64 0')) {
    throw new Error(`setworldspawn 输出不符合预期：${worldSpawnOutput}`)
  }
  await page.locator('#spawn-tab-forceload').click()
  await page.waitForSelector('#forceload-from-x', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const forceloadOutput = await page.locator('.output-code .cm-content').innerText()
  if (!forceloadOutput.includes('forceload add 0 0')) {
    throw new Error(`forceload 输出不符合预期：${forceloadOutput}`)
  }
  await page.getByLabel('指定结束坐标（矩形区域）').check()
  await page.fill('#forceload-to-x', '2')
  await page.fill('#forceload-to-z', '3')
  await page.waitForTimeout(300)
  const forceloadArea = await page.locator('.output-code .cm-content').innerText()
  if (!forceloadArea.includes('forceload add 0 0 2 3')) {
    throw new Error(`forceload 区域输出不符合预期：${forceloadArea}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'worldsettings-form.png') })
  await page.getByRole('button', { name: '移除全部', exact: true }).click()
  await page.waitForTimeout(200)
  const forceloadAll = await page.locator('.output-code .cm-content').innerText()
  if (!forceloadAll.includes('forceload remove all')) {
    throw new Error(`forceload 移除全部输出不符合预期：${forceloadAll}`)
  }

  // attribute 实体属性
  await page.locator('.command-item', { hasText: '实体属性' }).first().click()
  await page.waitForSelector('.attribute-selected', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const attributeGet = await page.locator('.output-code .cm-content').innerText()
  if (!attributeGet.includes('attribute @s minecraft:max_health get')) {
    throw new Error(`attribute 查询输出不符合预期：${attributeGet}`)
  }
  await page.getByRole('button', { name: '设置基础值', exact: true }).click()
  await page.fill('#attribute-value', '30')
  await page.waitForTimeout(300)
  const attributeSet = await page.locator('.output-code .cm-content').innerText()
  if (!attributeSet.includes('attribute @s minecraft:max_health base set 30')) {
    throw new Error(`attribute 设置输出不符合预期：${attributeSet}`)
  }
  await page.getByRole('button', { name: '添加修饰符', exact: true }).click()
  await page.fill('#attribute-modifier-id', 'mcstudio:bonus')
  await page.fill('#attribute-modifier-value', '5')
  await page.waitForTimeout(300)
  const attributeModifier = await page.locator('.output-code .cm-content').innerText()
  if (!attributeModifier.includes('modifier add mcstudio:bonus 5 add_value')) {
    throw new Error(`attribute 修饰符输出不符合预期：${attributeModifier}`)
  }
  await page.locator('.attribute-selected').click()
  await page.waitForSelector('.attribute-grid', { timeout: 10_000 })
  await page.locator('.modal input[placeholder*="属性"]').fill('movement_speed')
  await page.waitForTimeout(300)
  await page.locator('.attribute-tile', { hasText: 'minecraft:movement_speed' }).first().click()
  await page.waitForTimeout(300)
  const attributePick = await page.locator('.output-code .cm-content').innerText()
  if (!attributePick.includes('minecraft:movement_speed')) {
    throw new Error(`attribute 选择属性输出不符合预期：${attributePick}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'attribute-form.png') })

  // advancement / function / schedule
  await page.locator('.command-item', { hasText: '进度' }).first().click()
  await page.waitForSelector('#advancement-id', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const advancementOutput = await page.locator('.output-code .cm-content').innerText()
  if (!advancementOutput.includes('advancement grant @s only minecraft:story/root')) {
    throw new Error(`advancement 输出不符合预期：${advancementOutput}`)
  }
  await page.getByRole('button', { name: '收回', exact: true }).click()
  await page.waitForTimeout(200)
  const advancementRevoke = await page.locator('.output-code .cm-content').innerText()
  if (!advancementRevoke.includes('advancement revoke @s only')) {
    throw new Error(`advancement 收回输出不符合预期：${advancementRevoke}`)
  }
  await page.getByRole('button', { name: '全部进度', exact: true }).click()
  await page.waitForTimeout(200)
  const advancementAll = await page.locator('.output-code .cm-content').innerText()
  if (!advancementAll.includes('advancement revoke @s everything')) {
    throw new Error(`advancement 全部输出不符合预期：${advancementAll}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'advancement-form.png') })

  await page.locator('.command-item', { hasText: 'function' }).first().click()
  await page.waitForSelector('#function-name', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const functionOutput = await page.locator('.output-code .cm-content').innerText()
  if (!functionOutput.includes('function mcstudio:main')) {
    throw new Error(`function 输出不符合预期：${functionOutput}`)
  }
  await page.getByLabel('传入宏参数（SNBT）').check()
  await page.fill('#function-arguments', '{"name":"Steve"}')
  await page.waitForTimeout(300)
  const functionArgs = await page.locator('.output-code .cm-content').innerText()
  if (!functionArgs.includes('function mcstudio:main {"name":"Steve"}')) {
    throw new Error(`function 参数输出不符合预期：${functionArgs}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'function-form.png') })

  await page.locator('.command-item', { hasText: '计划任务' }).first().click()
  await page.waitForSelector('#schedule-function', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const scheduleOutput = await page.locator('.output-code .cm-content').innerText()
  if (!scheduleOutput.includes('schedule function mcstudio:main 1s replace')) {
    throw new Error(`schedule 输出不符合预期：${scheduleOutput}`)
  }
  await page.fill('#schedule-time', '20t')
  await page.waitForTimeout(300)
  const scheduleTime = await page.locator('.output-code .cm-content').innerText()
  if (!scheduleTime.includes('schedule function mcstudio:main 20t replace')) {
    throw new Error(`schedule 时间输出不符合预期：${scheduleTime}`)
  }
  await page.getByRole('button', { name: '清除计划', exact: true }).click()
  await page.waitForTimeout(200)
  const scheduleClear = await page.locator('.output-code .cm-content').innerText()
  if (!scheduleClear.includes('schedule clear mcstudio:main')) {
    throw new Error(`schedule 清除输出不符合预期：${scheduleClear}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'schedule-form.png') })

  // item 槽位替换/修饰符
  await page.locator('.command-item', { hasText: '物品操作' }).first().click()
  await page.waitForSelector('#item-slot', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const itemReplace = await page.locator('.output-code .cm-content').innerText()
  if (!itemReplace.includes('item replace entity @s weapon.mainhand with minecraft:diamond_sword 1')) {
    throw new Error(`item 替换输出不符合预期：${itemReplace}`)
  }
  await page.getByRole('button', { name: '方块容器', exact: true }).click()
  await page.fill('#item-slot', 'container.0')
  await page.getByRole('button', { name: '选择物品', exact: true }).click()
  await page.waitForSelector('.mc-grid', { timeout: 10_000 })
  await page.locator('.modal input[placeholder*="搜索中文名"]').fill('苹果')
  await page.waitForTimeout(300)
  await page
    .locator('.mc-tile')
    .filter({ has: page.locator('.mc-tile-name', { hasText: /^苹果$/ }) })
    .first()
    .click()
  await page.fill('#item-count', '5')
  await page.waitForTimeout(300)
  const itemBlock = await page.locator('.output-code .cm-content').innerText()
  if (!itemBlock.includes('item replace block 0 64 0 container.0 with minecraft:apple 5')) {
    throw new Error(`item 方块容器输出不符合预期：${itemBlock}`)
  }
  await page.getByRole('button', { name: '应用修饰符', exact: true }).click()
  await page.waitForTimeout(300)
  const itemModify = await page.locator('.output-code .cm-content').innerText()
  if (!itemModify.includes('item modify block 0 64 0 container.0 mcstudio:bonus')) {
    throw new Error(`item 修饰符输出不符合预期：${itemModify}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'item-form.png') })

  // data NBT
  await page.locator('.command-item', { hasText: 'NBT 数据' }).first().click()
  await page.waitForSelector('#data-path', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const dataGet = await page.locator('.output-code .cm-content').innerText()
  if (!dataGet.includes('data get entity @s Health')) {
    throw new Error(`data 查询输出不符合预期：${dataGet}`)
  }
  await page.getByRole('button', { name: '合并', exact: true }).click()
  await page.waitForSelector('#data-nbt', { timeout: 10_000 })
  await page.fill('#data-nbt', '{Health:20}')
  await page.waitForTimeout(300)
  const dataMerge = await page.locator('.output-code .cm-content').innerText()
  if (!dataMerge.includes('data merge entity @s {Health:20}')) {
    throw new Error(`data 合并输出不符合预期：${dataMerge}`)
  }
  await page.getByRole('button', { name: '删除路径', exact: true }).click()
  await page.waitForSelector('#data-path', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const dataRemove = await page.locator('.output-code .cm-content').innerText()
  if (!dataRemove.includes('data remove entity @s Health')) {
    throw new Error(`data 删除输出不符合预期：${dataRemove}`)
  }
  await page.getByRole('button', { name: '修改路径', exact: true }).click()
  await page.waitForSelector('#data-modify-operation', { timeout: 10_000 })
  await page.selectOption('#data-modify-operation', 'set')
  await page.fill('#data-nbt', '{id:"minecraft:stone"}')
  await page.waitForTimeout(300)
  const dataModify = await page.locator('.output-code .cm-content').innerText()
  if (!dataModify.includes('data modify entity @s Health set value {id:"minecraft:stone"}')) {
    throw new Error(`data 修改输出不符合预期：${dataModify}`)
  }
  await page.getByLabel('从其他 NBT 来源复制（from）').check()
  await page.getByRole('button', { name: '来源：命令存储', exact: true }).click()
  await page.fill('#data-from-storage', 'mcstudio:data')
  await page.fill('#data-from-path', 'item')
  await page.waitForTimeout(300)
  const dataFrom = await page.locator('.output-code .cm-content').innerText()
  if (!dataFrom.includes('data modify entity @s Health set from storage mcstudio:data item')) {
    throw new Error(`data from 输出不符合预期：${dataFrom}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'data-form.png') })

  // loot 战利品表
  await page.locator('.command-item', { hasText: '战利品' }).first().click()
  await page.waitForSelector('#loot-table', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const lootGive = await page.locator('.output-code .cm-content').innerText()
  if (!lootGive.includes('loot give @s loot minecraft:chests/simple_dungeon')) {
    throw new Error(`loot 给予输出不符合预期：${lootGive}`)
  }
  await page.getByRole('button', { name: '生成掉落物', exact: true }).click()
  await page.waitForTimeout(300)
  const lootSpawn = await page.locator('.output-code .cm-content').innerText()
  if (!lootSpawn.includes('loot spawn ~ ~ ~ loot minecraft:chests/simple_dungeon')) {
    throw new Error(`loot 生成输出不符合预期：${lootSpawn}`)
  }
  await page.getByRole('button', { name: '插入容器', exact: true }).click()
  await page.waitForSelector('#loot-slot', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const lootInsert = await page.locator('.output-code .cm-content').innerText()
  if (!lootInsert.includes('loot insert ~ ~ ~ loot minecraft:chests/simple_dungeon container.0')) {
    throw new Error(`loot 插入输出不符合预期：${lootInsert}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'loot-form.png') })

  // scoreboard 可视化
  await page.locator('.command-item', { hasText: '记分板' }).first().click()
  await page.waitForSelector('#scoreboard-objective', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const scoreboardOutput = await page.locator('.output-code .cm-content').innerText()
  if (!scoreboardOutput.includes('scoreboard objectives add kills dummy "击杀数"')) {
    throw new Error(`scoreboard 输出不符合预期：${scoreboardOutput}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'scoreboard-form.png') })
  await page.getByRole('button', { name: '修改目标' }).click()
  await page.waitForSelector('#scoreboard-modify-field', { timeout: 10_000 })
  await page.selectOption('#scoreboard-modify-field', 'displayname')
  await page.fill('#scoreboard-modify-name', '击杀数')
  await page.waitForTimeout(300)
  const scoreboardModify = await page.locator('.output-code .cm-content').innerText()
  if (!scoreboardModify.includes('scoreboard objectives modify kills displayname "击杀数"')) {
    throw new Error(`scoreboard 修改输出不符合预期：${scoreboardModify}`)
  }
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
  await page.getByRole('button', { name: '撤销', exact: true }).click()
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
  await page.getByRole('button', { name: '谓词', exact: true }).click()
  await page.waitForSelector('#predicate-type-0', { timeout: 10_000 })
  await page.selectOption('#predicate-type-0', 'random_chance')
  await page.fill('#predicate-chance-0', '0.25')
  await page.waitForTimeout(300)
  const predicateContent = await page.inputValue('#datapack-data-content')
  if (!predicateContent.includes('0.25')) {
    throw new Error('谓词结构化编辑未写回概率')
  }
  await page.selectOption('#predicate-type-0', 'value_check')
  await page.waitForSelector('#predicate-value-objective-0', { timeout: 10_000 })
  await page.fill('#predicate-value-objective-0', 'kills')
  await page.fill('#predicate-value-min-0', '2')
  await page.fill('#predicate-value-max-0', '8')
  await page.waitForTimeout(300)
  const valueCheckContent = await page.inputValue('#datapack-data-content')
  if (
    !valueCheckContent.includes('minecraft:value_check') ||
    !valueCheckContent.includes('"score": "kills"') ||
    !valueCheckContent.includes('"min": 2')
  ) {
    throw new Error(`value_check 谓词未正确写回：${valueCheckContent}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'datapack-predicate.png') })
  await page.getByRole('button', { name: '进度', exact: true }).click()
  await page.waitForSelector('#advancement-structured-title', { timeout: 10_000 })
  await page.fill('#advancement-structured-title', '测试进度')
  await page.waitForTimeout(300)
  const advancementContent = await page.inputValue('#datapack-data-content')
  if (!advancementContent.includes('测试进度')) {
    throw new Error('进度结构化编辑未写回标题')
  }
  await page.screenshot({ path: join(ARTIFACTS, 'datapack-advancement.png') })
  await page.getByRole('button', { name: '战利品表', exact: true }).click()
  await page.waitForSelector('#loot-structured-type', { timeout: 10_000 })
  const lootType = await page.inputValue('#loot-structured-type')
  if (lootType !== 'minecraft:chest') {
    throw new Error(`战利品表结构化类型不符合预期：${lootType}`)
  }
  await page.getByRole('button', { name: '添加掉落物', exact: true }).click()
  await page.waitForSelector('.mc-grid', { timeout: 10_000 })
  await page.locator('.modal input[placeholder*="搜索中文名"]').fill('苹果')
  await page.waitForTimeout(300)
  await page
    .locator('.mc-tile')
    .filter({ has: page.locator('.mc-tile-name', { hasText: /^苹果$/ }) })
    .first()
    .click()
  await page.waitForTimeout(300)
  const lootContent = await page.inputValue('#datapack-data-content')
  if (!lootContent.includes('minecraft:apple')) {
    throw new Error('战利品表结构化编辑未写回 apple')
  }
  await page.locator('#loot-structured-type').scrollIntoViewIfNeeded()
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

  // gamemode / damage / rotate
  await page.locator('.tab').filter({ hasText: /^\s*命令\s*$/ }).click()
  await page.locator('.command-item', { hasText: '游戏模式' }).first().click()
  await page.waitForTimeout(300)
  const gamemodeOutput = await page.locator('.output-code .cm-content').innerText()
  if (!gamemodeOutput.includes('gamemode creative @s')) {
    throw new Error(`gamemode 输出不符合预期：${gamemodeOutput}`)
  }
  await page.locator('.command-item', { hasText: '造成伤害' }).first().click()
  await page.waitForSelector('#damage-amount', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const damageOutput = await page.locator('.output-code .cm-content').innerText()
  if (!damageOutput.includes('damage @s 5 minecraft:generic')) {
    throw new Error(`damage 输出不符合预期：${damageOutput}`)
  }
  await page.locator('.command-item', { hasText: '旋转实体' }).first().click()
  await page.waitForSelector('#rotate-yaw', { timeout: 10_000 })
  await page.fill('#rotate-yaw', '90')
  await page.fill('#rotate-pitch', '0')
  await page.waitForTimeout(300)
  const rotateOutput = await page.locator('.output-code .cm-content').innerText()
  if (!rotateOutput.includes('rotate @s 90 0')) {
    throw new Error(`rotate 输出不符合预期：${rotateOutput}`)
  }
  await page.locator('.command-item', { hasText: '分散玩家' }).first().click()
  await page.waitForSelector('#spread-center-x', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const spreadOutput = await page.locator('.output-code .cm-content').innerText()
  if (!spreadOutput.includes('spreadplayers 0 0 10 50 true @a')) {
    throw new Error(`spreadplayers 输出不符合预期：${spreadOutput}`)
  }
  await page.locator('.command-item', { hasText: '骑乘' }).first().click()
  await page.getByRole('button', { name: '骑上坐骑', exact: true }).waitFor()
  await page.waitForTimeout(300)
  const rideOutput = await page.locator('.output-code .cm-content').innerText()
  if (!rideOutput.includes('ride @s mount @e[type=minecraft:horse]')) {
    throw new Error(`ride 输出不符合预期：${rideOutput}`)
  }
  await page.locator('.command-item', { hasText: '随机数' }).first().click()
  await page.waitForSelector('#random-range', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const randomOutput = await page.locator('.output-code .cm-content').innerText()
  if (!randomOutput.includes('random value 1..6')) {
    throw new Error(`random 输出不符合预期：${randomOutput}`)
  }
  await page.locator('.command-item', { hasText: '游戏刻控制' }).first().click()
  await page.getByRole('button', { name: '设置速率', exact: true }).click()
  await page.waitForSelector('#tick-rate', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const tickOutput = await page.locator('.output-code .cm-content').innerText()
  if (!tickOutput.includes('tick rate 20')) {
    throw new Error(`tick 输出不符合预期：${tickOutput}`)
  }
  await page.locator('.command-item', { hasText: '广播消息' }).first().click()
  await page.waitForSelector('#social-message', { timeout: 10_000 })
  await page.fill('#social-message', '欢迎来到服务器')
  await page.waitForTimeout(300)
  const sayOutput = await page.locator('.output-code .cm-content').innerText()
  if (!sayOutput.includes('say 欢迎来到服务器')) {
    throw new Error(`say 输出不符合预期：${sayOutput}`)
  }
  await page.locator('.command-item', { hasText: '玩家列表' }).first().click()
  await page.getByLabel('同时显示玩家 UUID（list uuids）').check()
  await page.waitForTimeout(300)
  const listOutput = await page.locator('.output-code .cm-content').innerText()
  if (!listOutput.includes('list uuids')) {
    throw new Error(`list 输出不符合预期：${listOutput}`)
  }
  await page.locator('.command-item', { hasText: '查看种子' }).first().click()
  await page.waitForTimeout(300)
  const seedOutput = await page.locator('.output-code .cm-content').innerText()
  if (!seedOutput.trim().endsWith('seed')) {
    throw new Error(`seed 输出不符合预期：${seedOutput}`)
  }
  await page.locator('.command-item', { hasText: '动作消息' }).first().click()
  await page.waitForSelector('#social-message', { timeout: 10_000 })
  await page.fill('#social-message', '正在建造')
  await page.waitForTimeout(300)
  const meOutput = await page.locator('.output-code .cm-content').innerText()
  if (!meOutput.includes('me 正在建造')) {
    throw new Error(`me 输出不符合预期：${meOutput}`)
  }
  await page.locator('.command-item', { hasText: '踢出玩家' }).first().click()
  await page.waitForSelector('#social-reason', { timeout: 10_000 })
  await page.fill('#social-reason', '请遵守规则')
  await page.waitForTimeout(300)
  const kickOutput = await page.locator('.output-code .cm-content').innerText()
  if (!kickOutput.includes('kick @a 请遵守规则')) {
    throw new Error(`kick 输出不符合预期：${kickOutput}`)
  }
  await page.locator('.command-item', { hasText: '授予管理员' }).first().click()
  await page.waitForTimeout(300)
  const opOutput = await page.locator('.output-code .cm-content').innerText()
  if (!opOutput.includes('op @a')) {
    throw new Error(`op 输出不符合预期：${opOutput}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'social-commands.png') })

  // 模板库
  await page.getByRole('button', { name: '模板', exact: true }).click()
  await page.waitForSelector('.template-card', { timeout: 10_000 })
  await page.locator('.template-card', { hasText: '新手礼包' }).click()
  await page.waitForSelector('#give-count', { timeout: 10_000 })
  const templateCount = await page.inputValue('#give-count')
  if (templateCount !== '16') {
    throw new Error(`模板礼包数量不符合预期：${templateCount}`)
  }
  const templateOutput = await page.locator('.output-code .cm-content').innerText()
  if (!templateOutput.includes('minecraft:bread')) {
    throw new Error(`模板礼包输出不符合预期：${templateOutput}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'templates.png') })

  // 跨版本模板：1.20.4 NBT 剑
  await page.getByRole('button', { name: '模板', exact: true }).click()
  await page.locator('.template-card', { hasText: '1.20.4 NBT 剑' }).click()
  await page.waitForSelector('#nbt-give-count', { timeout: 15_000 })
  await page.waitForFunction(
    () => document.querySelector('#pack-select')?.value === '1.20.4',
    { timeout: 15_000 }
  )
  const nbtTemplateOutput = await page.locator('.output-code .cm-content').innerText()
  if (
    !nbtTemplateOutput.includes('旧版剑') ||
    !nbtTemplateOutput.includes('Enchantments:[{id:"minecraft:sharpness",lvl:5}]') ||
    !nbtTemplateOutput.includes('Unbreakable:1b')
  ) {
    throw new Error(`1.20.4 NBT 模板输出不符合预期：${nbtTemplateOutput}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'templates-nbt.png') })

  // 多版本数据包切换
  const packOptions = await page.locator('#pack-select option').allTextContents()
  if (
    !packOptions.includes('1.21.1') ||
    !packOptions.includes('1.20.4') ||
    !packOptions.includes('1.20.3') ||
    !packOptions.includes('1.19.4') ||
    !packOptions.includes('1.18.2') ||
    !packOptions.includes('1.16.5') ||
    !packOptions.includes('1.15.2') ||
    !packOptions.includes('1.14.4') ||
    !packOptions.includes('1.13.2') ||
    !packOptions.includes('1.12.2') ||
    !packOptions.includes('26.3')
  ) {
    throw new Error(`版本选项不符合预期：${packOptions.join(', ')}`)
  }
  await page.selectOption('#pack-select', '1.21.1')
  await page.waitForSelector('.version-notice', { timeout: 15_000 })
  const pack121 = await page.locator('.pack-count').innerText()
  if (!pack121.includes('83')) {
    throw new Error(`1.21.1 命令数量不符合预期：${pack121}`)
  }
  await page.locator('.command-item', { hasText: '游戏规则' }).first().click()
  await page.waitForSelector('.gamerule-selected', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const gamerule121 = await page.locator('.output-code .cm-content').innerText()
  if (!/gamerule [A-Za-z0-9_]+ (true|false|-?\d+)/.test(gamerule121)) {
    throw new Error(`1.21.1 gamerule 输出不符合预期：${gamerule121}`)
  }
  await page.locator('.command-item', { hasText: '填充区域' }).first().click()
  await page.waitForSelector('#fill-mode', { timeout: 10_000 })
  if ((await page.locator('#fill-mode option[value="strict"]').count()) !== 0) {
    throw new Error('1.21.1 不应显示 fill strict 选项')
  }
  await page.locator('.command-item', { hasText: '粒子效果' }).first().click()
  await page.waitForSelector('#particle-mode', { timeout: 10_000 })
  const particleHint = await page.locator('.card-hint', { hasText: '种粒子' }).innerText()
  if (!particleHint.includes('109')) {
    throw new Error(`1.21.1 粒子数量不符合预期：${particleHint}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'pack-1.21.1.png') })
  await page.selectOption('#pack-select', '1.20.3')
  await page.waitForTimeout(500)
  const pack1203 = await page.locator('.pack-count').innerText()
  if (!pack1203.includes('82')) {
    throw new Error(`1.20.3 命令数量不符合预期：${pack1203}`)
  }
  await page.selectOption('#pack-select', '1.19.4')
  await page.waitForTimeout(500)
  const pack1194 = await page.locator('.pack-count').innerText()
  if (!pack1194.includes('79')) {
    throw new Error(`1.19.4 命令数量不符合预期：${pack1194}`)
  }
  const notice1194 = await page.locator('.version-notice').innerText()
  if (!notice1194.includes('NBT')) {
    throw new Error(`1.19.4 NBT 提示不符合预期：${notice1194}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'pack-1.19.4.png') })
  await page.selectOption('#pack-select', '1.18.2')
  await page.waitForTimeout(500)
  const pack1182 = await page.locator('.pack-count').innerText()
  if (!pack1182.includes('77')) {
    throw new Error(`1.18.2 命令数量不符合预期：${pack1182}`)
  }
  await page.selectOption('#pack-select', '1.16.5')
  await page.waitForTimeout(500)
  const pack1165 = await page.locator('.pack-count').innerText()
  if (!pack1165.includes('74')) {
    throw new Error(`1.16.5 命令数量不符合预期：${pack1165}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'pack-1.16.5.png') })
  await page.selectOption('#pack-select', '1.15.2')
  await page.waitForTimeout(500)
  const pack1152 = await page.locator('.pack-count').innerText()
  if (!pack1152.includes('72')) {
    throw new Error(`1.15.2 命令数量不符合预期：${pack1152}`)
  }
  await page.selectOption('#pack-select', '1.14.4')
  await page.waitForTimeout(500)
  const pack1144 = await page.locator('.pack-count').innerText()
  if (!pack1144.includes('71')) {
    throw new Error(`1.14.4 命令数量不符合预期：${pack1144}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'pack-1.14.4.png') })
  await page.selectOption('#pack-select', '1.13.2')
  await page.waitForTimeout(500)
  const pack1132 = await page.locator('.pack-count').innerText()
  if (!pack1132.includes('67')) {
    throw new Error(`1.13.2 命令数量不符合预期：${pack1132}`)
  }
  const notice1132 = await page.locator('.version-notice').innerText()
  if (!notice1132.includes('NBT')) {
    throw new Error(`1.13.2 NBT 提示不符合预期：${notice1132}`)
  }
  await page.locator('.command-item', { hasText: '粒子效果' }).first().click()
  await page.waitForSelector('#particle-mode', { timeout: 10_000 })
  const particle1132 = await page.locator('.card-hint', { hasText: '种粒子' }).innerText()
  if (!particle1132.includes('48')) {
    throw new Error(`1.13.2 粒子数量不符合预期：${particle1132}`)
  }
  await page.selectOption('#pack-select', '1.12.2')
  await page.waitForTimeout(500)
  const pack1122 = await page.locator('.pack-count').innerText()
  if (!pack1122.includes('53')) {
    throw new Error(`1.12.2 命令数量不符合预期：${pack1122}`)
  }
  await page.getByRole('button', { name: /OOC 生成器/ }).click()
  await page.waitForSelector('#ooc-commands', { timeout: 10_000 })
  await page.fill('#ooc-commands', 'say one\nsay two')
  await page.waitForTimeout(300)
  const oocOutput = await page.locator('#ooc-output').innerText()
  if (!oocOutput.includes('summon minecraft:falling_block') || !oocOutput.includes('say two')) {
    throw new Error(`OOC 输出不符合预期：${oocOutput}`)
  }
  await page.selectOption('#ooc-mode', 'command-block')
  await page.selectOption('#ooc-facing', 'east')
  await page.fill('#ooc-commands', 'say directed')
  await page.waitForTimeout(300)
  const oocDirected = await page.locator('#ooc-output').innerText()
  if (!oocDirected.includes('command_block 5 replace') || !oocDirected.includes('say directed')) {
    throw new Error(`OOC 方向输出不符合预期：${oocDirected}`)
  }
  await page.fill('#ooc-layer-step', '2')
  await page.fill('#ooc-commands', 'say one\nsay two')
  await page.waitForTimeout(300)
  const oocLayered = await page.locator('#ooc-output').innerText()
  if (!oocLayered.includes('~3') || oocLayered.split('\n').length !== 2) {
    throw new Error(`OOC 多层布局不符合预期：${oocLayered}`)
  }
  await page.selectOption('#ooc-layout-axis', 'x')
  await page.getByLabel('条件命令方块').check()
  await page.waitForTimeout(300)
  const oocChain = await page.locator('#ooc-output').innerText()
  if (!oocChain.includes('command_block 13') || !oocChain.includes('~1')) {
    throw new Error(`OOC 条件链不符合预期：${oocChain}`)
  }
  await page.selectOption('#ooc-secondary-axis', 'y')
  await page.fill('#ooc-layer-step', '1')
  await page.fill('#ooc-commands', 'say a\nsay b\nsay c\nsay d')
  await page.waitForTimeout(300)
  const oocGrid = await page.locator('#ooc-output').innerText()
  if (!oocGrid.includes('~ ~2') || !oocGrid.includes('~1 ~1')) {
    throw new Error(`OOC 双轴网格不符合预期：${oocGrid}`)
  }
  await page.getByRole('button', { name: /1.12.2 旧版工具/ }).click()
  await page.waitForSelector('#legacy-testfor-target', { timeout: 10_000 })
  await page.fill('#legacy-testfor-nbt', '{Health:10f}')
  await page.waitForTimeout(300)
  const legacyTestfor = await page.locator('#legacy-output').innerText()
  if (!legacyTestfor.includes('testfor @a {Health:10f}')) {
    throw new Error(`1.12.2 testfor 输出不符合预期：${legacyTestfor}`)
  }
  await page.getByRole('button', { name: 'blockdata', exact: true }).click()
  await page.waitForSelector('#legacy-blockdata-preset', { timeout: 10_000 })
  await page.selectOption('#legacy-blockdata-preset', '0')
  await page.waitForTimeout(300)
  const legacyBlockdata = await page.locator('#legacy-output').innerText()
  if (!legacyBlockdata.includes('blockdata') || !legacyBlockdata.includes('Lock:"mcstudio"')) {
    throw new Error(`1.12.2 blockdata 预设不符合预期：${legacyBlockdata}`)
  }
  await page.selectOption('#legacy-blockdata-preset', '6')
  await page.waitForTimeout(300)
  const legacyBanner = await page.locator('#legacy-output').innerText()
  if (!legacyBanner.includes('Patterns')) {
    throw new Error(`1.12.2 旗帜预设不符合预期：${legacyBanner}`)
  }
  await page.getByRole('button', { name: 'entitydata', exact: true }).click()
  await page.waitForSelector('#legacy-entitydata-preset', { timeout: 10_000 })
  await page.selectOption('#legacy-entitydata-preset', '8')
  await page.waitForTimeout(300)
  const legacyTrade = await page.locator('#legacy-output').innerText()
  if (!legacyTrade.includes('Offers') || !legacyTrade.includes('Recipes')) {
    throw new Error(`1.12.2 村民交易预设不符合预期：${legacyTrade}`)
  }
  await page.getByRole('button', { name: 'replaceitem', exact: true }).click()
  await page.waitForSelector('#legacy-replaceitem-preset', { timeout: 10_000 })
  await page.selectOption('#legacy-replaceitem-preset', '0')
  await page.waitForTimeout(300)
  const legacyBook = await page.locator('#legacy-output').innerText()
  if (!legacyBook.includes('title:"MC Studio"') || !legacyBook.includes('pages')) {
    throw new Error(`1.12.2 成书预设不符合预期：${legacyBook}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'ooc-1.12.2.png') })
  await page.selectOption('#pack-select', '1.20.4')
  await page.waitForTimeout(500)
  const pack1204 = await page.locator('.pack-count').innerText()
  if (!pack1204.includes('82')) {
    throw new Error(`1.20.4 命令数量不符合预期：${pack1204}`)
  }
  const notice1204 = await page.locator('.version-notice').innerText()
  if (!notice1204.includes('NBT')) {
    throw new Error(`1.20.4 树模式提示不符合预期：${notice1204}`)
  }
  await page.locator('.tab').filter({ hasText: /^\s*命令\s*$/ }).click()
  await page.locator('.command-item', { hasText: '给予物品' }).first().click()
  await page.waitForSelector('#nbt-give-count', { timeout: 10_000 })
  await page.fill('#nbt-give-name', '旧版剑')
  await page.getByRole('button', { name: '添加附魔', exact: true }).click()
  await page.waitForTimeout(400)
  const nbtGiveOutput = await page.locator('.output-code .cm-content').innerText()
  if (
    !nbtGiveOutput.includes('display:{Name:') ||
    !nbtGiveOutput.includes('Enchantments:[') ||
    !nbtGiveOutput.includes('minecraft:sharpness') ||
    !nbtGiveOutput.includes('旧版剑')
  ) {
    throw new Error(`1.20.4 NBT give 输出不符合预期：${nbtGiveOutput}`)
  }
  if ((await page.locator('#give-count').count()) !== 0) {
    throw new Error('1.20.4 不应显示 26.3 give 表单')
  }
  await page.locator('.command-item', { hasText: '召唤实体' }).first().click()
  await page.waitForSelector('#summon-x', { timeout: 10_000 })
  await page.fill('#summon-x', '0')
  await page.fill('#summon-y', '64')
  await page.fill('#summon-z', '0')
  await page.waitForTimeout(300)
  const summonNbtOutput = await page.locator('.output-code .cm-content').innerText()
  if (!/summon minecraft:[a-z0-9_]+ 0 64 0/.test(summonNbtOutput)) {
    throw new Error(`1.20.4 summon 输出不符合预期：${summonNbtOutput}`)
  }
  await page.getByRole('button', { name: '无声展示', exact: true }).click()
  await page.waitForTimeout(300)
  const summonPreset = await page.locator('.output-code .cm-content').innerText()
  if (!summonPreset.includes('NoAI:1b') || !summonPreset.includes('Silent:1b')) {
    throw new Error(`1.20.4 summon 预设不符合预期：${summonPreset}`)
  }
  await page.locator('.command-item', { hasText: '物品操作' }).first().click()
  await page.waitForSelector('#item-slot', { timeout: 10_000 })
  await page.getByRole('button', { name: '替换物品', exact: true }).click()
  await page.getByLabel('追加 NBT（1.20.4）').check()
  await page.fill('#item-nbt', '{display:{Name:\'{"text":"旧剑"}\'}}')
  await page.waitForTimeout(300)
  const itemNbtOutput = await page.locator('.output-code .cm-content').innerText()
  if (!/item replace (entity|block).* with minecraft:[a-z0-9_]+{display:{Name:/.test(itemNbtOutput)) {
    throw new Error(`1.20.4 item NBT 输出不符合预期：${itemNbtOutput}`)
  }
  await page.locator('.command-item', { hasText: '战利品' }).first().click()
  await page.waitForSelector('#loot-table', { timeout: 10_000 })
  await page.getByRole('button', { name: '插入容器', exact: true }).click()
  await page.waitForTimeout(300)
  const lootInsert1204 = await page.locator('.output-code .cm-content').innerText()
  if (!/loot insert .* loot minecraft:chests\/simple_dungeon$/.test(lootInsert1204)) {
    throw new Error(`1.20.4 loot insert 输出不符合预期：${lootInsert1204}`)
  }
  await page.locator('.command-item', { hasText: '游戏规则' }).first().click()
  await page.waitForSelector('.gamerule-selected', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const gamerule1204 = await page.locator('.output-code .cm-content').innerText()
  if (!/gamerule [A-Za-z0-9_]+ (true|false|-?\d+)/.test(gamerule1204)) {
    throw new Error(`1.20.4 gamerule 输出不符合预期：${gamerule1204}`)
  }
  await page.locator('.command-item', { hasText: '实体属性' }).first().click()
  await page.waitForSelector('.attribute-selected', { timeout: 10_000 })
  await page.getByRole('button', { name: '添加修饰符', exact: true }).click()
  await page.waitForSelector('#attribute-modifier-uuid', { timeout: 10_000 })
  await page.waitForTimeout(300)
  const attribute1204 = await page.locator('.output-code .cm-content').innerText()
  if (
    !attribute1204.includes('modifier add') ||
    !attribute1204.includes('00000000-0000-0000-0000-000000000001')
  ) {
    throw new Error(`1.20.4 attribute 输出不符合预期：${attribute1204}`)
  }
  await page.locator('.command-item', { hasText: '粒子效果' }).first().click()
  await page.waitForSelector('#particle-mode', { timeout: 10_000 })
  await page.selectOption('#particle-mode', 'dust')
  await page.waitForTimeout(300)
  const particle1204 = await page.locator('.output-code .cm-content').innerText()
  if (
    !particle1204.startsWith('particle minecraft:') ||
    !particle1204.includes('~ ~1 ~') ||
    particle1204.includes('{')
  ) {
    throw new Error(`1.20.4 particle 旧语法不符合预期：${particle1204}`)
  }
  await page.screenshot({ path: join(ARTIFACTS, 'pack-1.20.4.png') })
  await page.selectOption('#pack-select', '26.3')
  await page.waitForSelector('.version-notice', { state: 'detached', timeout: 15_000 })
  const pack26 = await page.locator('.pack-count').innerText()
  if (!pack26.includes('94')) {
    throw new Error(`26.3 命令数量不符合预期：${pack26}`)
  }
  await page.locator('.command-item', { hasText: '给予物品' }).first().click()
  await page.waitForSelector('#give-count', { timeout: 10_000 })

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
