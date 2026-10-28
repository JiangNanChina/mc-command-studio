#!/usr/bin/env node
/** 分类模板冒烟：构建 desktop 后运行；MCSTUDIO_E2E_EXE 可指定测试包 exe。 */
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { _electron as electron } from 'playwright'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const RUN_ID = `${Date.now()}-${process.pid}`
const ARTIFACT_DIR = join(ROOT, 'artifacts', `mcstudio-template-smoke-${RUN_ID}`)
const USER_DATA = join(ARTIFACT_DIR, 'user-data')
const DATAPACK_DIR = join(ARTIFACT_DIR, 'datapack')
const execFileAsync = promisify(execFile)

// 与用户截图逐项核对，避免仅验证目录非空而遗漏条目。
const GROUPS = [
  ['JSON 相关', [
    ['json-sign', '告示牌'], ['json-book', '成书（命令书）'],
    ['json-tellraw', '聊天消息（tellraw）'], ['json-title', '屏幕标题（title）']
  ]],
  ['特殊 NBT 物品/方块', [
    ['nbt-spawner', '刷怪箱'], ['nbt-spawn-egg', '刷怪蛋'], ['nbt-firework', '烟花火箭'],
    ['nbt-flower-pot', '花盆'], ['nbt-head', '头颅'], ['nbt-shield', '盾牌'],
    ['nbt-enchanted-book', '附魔书'], ['nbt-end-portal', '末地传送门方块'],
    ['nbt-hopper', '漏斗'], ['nbt-furnace', '熔炉'], ['nbt-brewing-stand', '酿造台']
  ]],
  ['复合物品/方块', [
    ['complex-command-block', '命令方块'], ['complex-chest', '箱子'],
    ['complex-leather-armor', '皮革装备'], ['complex-banner', '旗帜'], ['complex-potion', '药水']
  ]],
  ['特殊 NBT 实体', [
    ['entity-dropped-item', '掉落的物品'], ['entity-falling-block', '下落的方块'],
    ['entity-area-effect-cloud', '效果区域云'], ['entity-villager', '村民'],
    ['entity-armor-stand', '盔甲架'], ['entity-experience-orb', '经验球'],
    ['entity-squid', '鱿鱼'], ['entity-silverfish', '蠹虫'], ['entity-chicken', '鸡'],
    ['entity-rabbit', '兔子'], ['entity-sheep', '羊'], ['entity-creeper', '爬行者'],
    ['entity-evoker', '唤魔者'], ['entity-evoker-fangs', '唤魔者的尖牙'], ['entity-ghast', '恶魂'],
    ['entity-enderman', '末影人'], ['entity-endermite', '末影螨'], ['entity-shulker', '潜影贝'],
    ['entity-shulker-bullet', '潜影贝的子弹'], ['entity-ender-dragon', '末影龙'],
    ['entity-item-frame', '物品展示框'], ['entity-painting', '画'], ['entity-tnt', '点燃的 TNT'],
    ['entity-firework', '烟花火箭（实体）']
  ]],
  ['复合实体', [
    ['complex-zombie', '僵尸'], ['complex-slime', '史莱姆'], ['complex-projectile', '弹射物'],
    ['complex-mount', '坐骑'], ['complex-pet', '宠物'], ['complex-summoned', '召唤物'],
    ['complex-minecart', '矿车']
  ]]
]
const errors = []
const checked = []
let app
let page
let appPid

function bounded(operation, timeoutMs, label) {
  let timer
  return Promise.race([operation, new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} 超过 ${timeoutMs}ms`)), timeoutMs)
  })]).finally(() => clearTimeout(timer))
}

async function forceKill() {
  if (!appPid) return
  if (process.platform === 'win32') {
    await execFileAsync('taskkill', ['/PID', String(appPid), '/T', '/F'], {
      timeout: 5_000, windowsHide: true
    }).catch(() => undefined)
  } else {
    try { process.kill(appPid, 'SIGKILL') } catch { /* 已退出。 */ }
  }
}

async function closeApp() {
  if (!app) return
  // 绕过测试草稿的保存确认，并为 Playwright 关闭设置上限。
  await bounded(app.evaluate(({ app: electronApp }) => electronApp.exit(0)), 3_000, '退出测试应用')
    .catch(() => undefined)
  await bounded(app.close(), 5_000, '关闭 Playwright 会话').catch(forceKill)
  await forceKill()
}

async function selectVersion(version) {
  if ((await page.locator('.version-current').innerText()).trim() === version) return
  await page.locator('.version-trigger').click()
  await page.locator('.version-search').fill(version)
  const selected = await page.evaluate((target) => {
    const option = [...document.querySelectorAll('.version-option')].find(
      (element) => element.querySelector('.version-name')?.textContent === target)
    option?.click()
    return Boolean(option)
  }, version)
  assert.ok(selected, `版本列表中没有 ${version}`)
  await page.waitForFunction(
    (target) => document.querySelector('.version-current')?.textContent === target,
    version, { timeout: 20_000 })
  await page.getByRole('button', { name: GROUPS[0][0], exact: true }).waitFor({ state: 'visible' })
}

async function openCategory(category) {
  await page.locator('#command-search').fill('')
  const button = page.getByRole('button', { name: category, exact: true })
  await button.click()
  assert.equal(await button.getAttribute('aria-pressed'), 'true', `${category} 没有选中状态`)
}

async function output() {
  return (await page.locator('.output-code .cm-content').innerText()).trim()
}

async function openTemplate(id, name) {
  await page.locator(`.template-command[data-template-id="${id}"]`).click()
  await page.locator('#template-data').waitFor({ state: 'visible' })
  await page.waitForFunction(
    (expected) => document.querySelector('.main h1')?.textContent?.includes(expected), name)
  if (await page.locator('#template-resource').count()) {
    assert.ok((await page.locator('#template-resource').inputValue()).trim(), `${id} 资源 ID 为空`)
  }
  await page.waitForFunction(
    () => Boolean(document.querySelector('.output-code .cm-content')?.textContent?.trim()))
  return output()
}

async function expectOutput(patterns, label) {
  await page.waitForFunction((sources) => {
    const text = document.querySelector('.output-code .cm-content')?.textContent ?? ''
    return sources.every(([source, flags]) => new RegExp(source, flags).test(text))
  }, patterns.map((pattern) => [pattern.source, pattern.flags]), { timeout: 10_000 })
    .catch(async () => { throw new Error(`${label} 输出不符合预期：${await output()}`) })
  assert.equal(await page.locator('.diagnostics .diag.error').count(), 0, `${label} 出现错误诊断`)
  const command = await output()
  checked.push({ label, command })
  console.log(`✓ ${label}: ${command.slice(0, 130)}`)
}

async function assertNoHorizontalOverflow(label) {
  const layout = await page.evaluate(() => [
    'html', 'body', '.app', '.workspace', '.sidebar', '.categories', '.main', '.main .content'
  ].flatMap((selector) => {
    const element = document.querySelector(selector)
    if (!element || !element.clientWidth || getComputedStyle(element).display === 'none') return []
    return element.scrollWidth > element.clientWidth + 2
      ? [{ selector, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }] : []
  }))
  assert.deepEqual(layout, [], `${label} 横向溢出：${JSON.stringify(layout)}`)
  const coordinateTops = await page.locator('.template-page .grid-3 > .field').evaluateAll((fields) =>
    fields.map((field) => field.getBoundingClientRect().top))
  if (coordinateTops.length === 3) {
    assert.ok(Math.max(...coordinateTops) - Math.min(...coordinateTops) <= 1,
      `${label} 坐标字段未对齐：${JSON.stringify(coordinateTops)}`)
  }
}

async function main() {
  await mkdir(USER_DATA, { recursive: true })
  await mkdir(DATAPACK_DIR, { recursive: true })
  const env = {
    ...process.env, ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    MCSTUDIO_USER_DATA: USER_DATA, MCSTUDIO_TEST_SAVE_DIR: DATAPACK_DIR
  }
  delete env.ELECTRON_RUN_AS_NODE
  const sandboxArgs = process.env.MCSTUDIO_E2E_NO_SANDBOX === '1' ? ['--no-sandbox'] : []
  if (process.env.MCSTUDIO_E2E_EXE) delete env.MCSTUDIO_PACKS_DIR
  else env.MCSTUDIO_PACKS_DIR = join(ROOT, 'packs')
  app = await electron.launch(process.env.MCSTUDIO_E2E_EXE ? {
    executablePath: resolve(ROOT, process.env.MCSTUDIO_E2E_EXE), args: sandboxArgs, env, timeout: 45_000
  } : {
    args: [...sandboxArgs, '.'], cwd: join(ROOT, 'apps/desktop'), env, timeout: 45_000
  })
  appPid = app.process().pid
  page = await app.firstWindow()
  const runtime = await app.evaluate(({ app: electronApp }) => ({
    name: electronApp.getName(), version: electronApp.getVersion(),
    isPackaged: electronApp.isPackaged, userData: electronApp.getPath('userData')
  }))
  page.setDefaultTimeout(10_000)
  page.on('pageerror', (error) => errors.push(error.message))
  await page.waitForSelector('.sidebar', { timeout: 30_000 })
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.setSize(1280, 850))
  const announcement = page.locator('.banner.announcement')
  if (await announcement.count()) {
    const details = announcement.getByRole('button', { name: '查看详情', exact: true })
    if (await details.count()) {
      await details.click()
      await page.getByRole('dialog', { name: '更新公告' }).getByRole('button', { name: '知道了', exact: true }).click()
    }
  }
  if (process.env.MCSTUDIO_E2E_EXE) {
    assert.equal(runtime.isPackaged, true, '应测试已打包应用')
    if (process.env.MCSTUDIO_E2E_EXPECTED_VERSION) {
      assert.equal(runtime.version, process.env.MCSTUDIO_E2E_EXPECTED_VERSION.replace(/^v/, ''), '测试包版本不符')
    }
    const bundled = await page.evaluate(async () => (await window.mcstudio.app.info()).packDir)
    const expected = await app.evaluate(() => `${process.resourcesPath}/packs`.replace(/\\/g, '/'))
    assert.equal(bundled.replace(/\\/g, '/'), expected, '测试包必须使用包内资源')
  }

  await selectVersion('26.3')
  let total = 0
  for (const [category, entries] of GROUPS) {
    await openCategory(category)
    const ids = await page.locator('.template-command').evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute('data-template-id')))
    assert.deepEqual(ids, entries.map(([id]) => id), `${category} 的入口与截图不一致`)
    for (const [id, name] of entries) {
      const button = page.locator(`.template-command[data-template-id="${id}"]`)
      assert.ok((await button.innerText()).includes(name), `${id} 缺少中文名称`)
      assert.equal(await button.locator('.mc-icon').count(), 1, `${id} 缺少目录图标`)
      assert.equal(await button.locator('.mc-icon-fallback').count(), 0, `${id} 图标回退为文字`)
      await openTemplate(id, name)
      assert.equal(await page.locator('.diagnostics .diag.error').count(), 0, `${id} 默认模板出现错误`)
      total += 1
    }
  }
  assert.equal(total, 51, '应包含截图中的 51 个模板入口')
  console.log(`✓ 五个分类、${total} 个入口及像素图标均可打开`)

  await openCategory('特殊 NBT 实体')
  await page.locator('#command-search').fill('蠹虫')
  await page.waitForFunction(() => document.querySelectorAll('.template-command').length === 1)
  assert.equal(await page.locator('.template-command').getAttribute('data-template-id'), 'entity-silverfish')
  await page.locator('#command-search').fill('不存在的模板test')
  await page.waitForFunction(() => document.querySelectorAll('.template-command').length === 0)
  assert.ok((await page.locator('.list-empty').innerText()).includes('没有匹配'))
  await page.locator('#command-search').fill('')
  console.log('✓ 中文搜索及无结果状态')

  // 每个引擎均由目录进入独立模板表单，不能落入空通用构建器。
  for (const version of ['1.12.2', '1.20.4', '26.3']) {
    await selectVersion(version)
    await openCategory('特殊 NBT 物品/方块')
    await openTemplate('nbt-spawner', '刷怪箱')
    await page.locator('#template-target').fill('@p')
    await page.locator('#template-count').fill('2')
    await expectOutput([
      /^give @p minecraft:(?:mob_spawner|spawner)/, /(?:BlockEntityTag|block_entity_data)/,
      /minecraft:zombie/, /\s2(?:\s|$)/
    ], `${version} 刷怪箱`)
    if (version === '26.3') assert.ok(!(await output()).includes('custom_data='), '现代刷怪箱必须使用功能组件')
    await openCategory('复合物品/方块')
    await openTemplate('complex-potion', '药水')
    await expectOutput([
      /^give /, /minecraft:potion/, /(?:potion_contents|Potion:)/, /minecraft:strong_healing/
    ], `${version} 药水`)
    await openCategory('特殊 NBT 实体')
    await openTemplate('entity-silverfish', '蠹虫')
    await page.locator('#template-x').fill('12')
    await page.locator('#template-y').fill('64')
    await page.locator('#template-z').fill('-5')
    await expectOutput([/^summon minecraft:silverfish 12 64 -5/, /PersistenceRequired:1b/], `${version} 实体坐标`)
    await openCategory('JSON 相关')
    await openTemplate('json-sign', '告示牌')
    await expectOutput([/^setblock /, /minecraft:(?:standing_sign|oak_sign|sign)/, /(?:Text1|front_text)/], `${version} 告示牌`)
    await page.screenshot({ path: join(ARTIFACT_DIR, `templates-${version}.png`), fullPage: true })
  }
  await openCategory('复合实体')
  await openTemplate('complex-slime', '史莱姆')
  await page.locator('#template-data').fill('{Size:2,PersistenceRequired:1b}')
  await expectOutput([/^summon minecraft:slime /, /Size:2/], '编辑模板数据实时更新')

  // 正式窗口最小宽度为 1080；测试时临时降低限制来验证 980px 适配。
  await app.evaluate(({ BrowserWindow }) => {
    const window = BrowserWindow.getAllWindows()[0]
    window?.setMinimumSize(760, 600)
    window?.setSize(980, 720)
  })
  await page.waitForFunction(() => window.innerWidth <= 980)
  for (const [category, entries] of GROUPS) {
    await openCategory(category)
    await openTemplate(...entries[0])
    await assertNoHorizontalOverflow(`980px ${category}`)
  }
  await page.screenshot({ path: join(ARTIFACT_DIR, 'templates-narrow.png'), fullPage: true })
  assert.deepEqual(errors, [], `渲染进程错误：${errors.join('; ')}`)
  await writeFile(join(ARTIFACT_DIR, 'result.json'), JSON.stringify({
    passed: true, executable: process.env.MCSTUDIO_E2E_EXE ?? 'development build',
    entries: total, runtime, checked, artifactDir: ARTIFACT_DIR
  }, null, 2), 'utf8')
  console.log(`✓ 分类模板端到端测试通过；截图与结果：${ARTIFACT_DIR}`)
}

const watchdog = setTimeout(() => {
  console.error('✗ 分类模板测试超过 180 秒，终止本次测试进程')
  void forceKill().finally(() => process.exit(1))
}, 180_000)
watchdog.unref()
try {
  await main()
} catch (error) {
  process.exitCode = 1
  console.error(`✗ ${error instanceof Error ? error.stack : String(error)}`)
  if (page) await bounded(page.screenshot({
    path: join(ARTIFACT_DIR, 'failure.png'), fullPage: true
  }), 3_000, '保存失败截图').catch(() => undefined)
} finally {
  await closeApp()
  clearTimeout(watchdog)
}
