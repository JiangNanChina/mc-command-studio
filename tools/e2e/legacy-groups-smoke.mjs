#!/usr/bin/env node
/** 1.12.2 分组表单冒烟。 */
import { _electron as electron } from 'playwright'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { join, resolve } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const ARTIFACT_DIR = join(ROOT, 'artifacts', `legacy-groups-${randomUUID()}`)
const USER_DATA = join(ARTIFACT_DIR, 'user-data')
const execFileAsync = promisify(execFile)
const pageErrors = []
const checked = []
let app
let page
let appPid

const env = {
  ...process.env,
  MCSTUDIO_PACKS_DIR: join(ROOT, 'packs'),
  MCSTUDIO_USER_DATA: USER_DATA
}
delete env.ELECTRON_RUN_AS_NODE
if (process.env.MCSTUDIO_E2E_EXE) delete env.MCSTUDIO_PACKS_DIR
const sandboxArgs = process.env.MCSTUDIO_E2E_NO_SANDBOX === '1' ? ['--no-sandbox'] : []

function bounded(operation, ms, label) {
  let timer
  return Promise.race([operation, new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
  })]).finally(() => clearTimeout(timer))
}

async function forceKill() {
  if (!appPid) return
  // Only the process launched with this run's isolated user-data directory is owned here.
  if (process.platform === 'win32') {
    await execFileAsync('taskkill', ['/PID', String(appPid), '/T', '/F'], {
      timeout: 5_000, windowsHide: true
    }).catch(() => undefined)
  } else {
    try { process.kill(appPid, 'SIGKILL') } catch { /* Already exited. */ }
  }
}

async function closeApp() {
  if (!app) return
  await bounded(app.evaluate(({ app: electronApp }) => electronApp.exit(0)), 3_000, 'app.exit')
    .catch(() => undefined)
  await bounded(app.close(), 5_000, 'app.close').catch(forceKill)
  await forceKill()
}

async function switchGiveTab(name) {
  await page.getByRole('tab', { name: new RegExp(`^${name}(?:\\s*\\d+)?$`) }).click()
}

async function setResourceId(input, value) {
  await input.fill(value)
  await input.press('Enter')
  const selector = `#${await input.getAttribute('id')}`
  await page.waitForFunction(({ selector, value }) => document.querySelector(selector)?.getAttribute('data-value') === value,
    { selector, value })
  assert.equal(await input.getAttribute('data-value'), value)
}

async function savePlan(name) {
  await page.getByRole('textbox', { name: '物品方案名称', exact: true }).fill(name)
  await page.getByRole('button', { name: '保存物品方案', exact: true }).click()
  await page.getByRole('combobox', { name: '选择物品方案', exact: true })
    .locator('option').filter({ hasText: name }).waitFor({ state: 'attached' })
}

async function loadPlan(name) {
  const select = page.getByRole('combobox', { name: '选择物品方案', exact: true })
  if (await select.inputValue() === name) await select.selectOption('')
  await select.selectOption({ label: name })
}

async function addModernComponent(kind) {
  await page.locator('select[aria-label="添加组件"]').selectOption(kind)
  if (kind === 'item_tags') {
    await page.locator('#item-tags-0').waitFor({ state: 'visible' })
    return
  }
  await page.locator(`.component-card .component-id:text-is("${kind}")`).waitFor({ state: 'visible' })
}

const CASES = [
  ['基础命令', 'sound', 'playsound minecraft:entity.player.levelup'],
  ['基础命令', 'teleport', 'tp @s ~ ~ ~'],
  ['玩家与实体', 'admin', 'kick @p'],
  ['基础命令', 'world', 'time set day'],
  ['基础命令', 'simple', 'list'],
  ['基础命令', 'gamemode', 'gamemode creative @p'],
  ['世界控制', 'block', 'setblock ~ ~ ~ minecraft:stone 0 replace'],
  ['基础命令', 'misc', 'function namespace:function']
]

async function selectVersion(page, version) {
  if ((await page.locator('.version-current').innerText()).trim() === version) return
  await page.locator('.version-trigger').click()
  await page.locator('.version-search').fill(version)
  const clicked = await page.evaluate((target) => {
    const option = [...document.querySelectorAll('.version-option')].find(
      (element) => element.querySelector('.version-name')?.textContent === target
    )
    option?.click()
    return Boolean(option)
  }, version)
  if (!clicked) throw new Error(`找不到版本：${version}`)
  await page.waitForFunction(
    (target) => document.querySelector('.version-trigger .version-current')?.textContent === target,
    version
  )
}

async function main() {
await mkdir(USER_DATA, { recursive: true })
app = await electron.launch(process.env.MCSTUDIO_E2E_EXE ? {
  executablePath: resolve(ROOT, process.env.MCSTUDIO_E2E_EXE),
  args: sandboxArgs, env, timeout: 60_000
} : {
  args: [...sandboxArgs, '.'],
  cwd: join(ROOT, 'apps/desktop'),
  env,
  timeout: 60_000
})
appPid = app.process().pid
page = await app.firstWindow()
page.setDefaultTimeout(10_000)
page.on('pageerror', (error) => pageErrors.push(error.message))
await page.waitForSelector('.sidebar', { timeout: 30_000 })
const details = page.getByRole('button', { name: '查看详情', exact: true })
if (await details.count()) {
  await details.click()
  const announcement = page.getByRole('dialog', { name: '更新公告', exact: true })
  await announcement.getByRole('button', { name: '知道了', exact: true }).click()
  await announcement.waitFor({ state: 'detached' })
}
await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.setSize(1080, 760))

await selectVersion(page, '1.12.2')
await page.locator('.command-item', { hasText: '旧版工具' }).first().click()
await page.waitForSelector('#legacy-output', { timeout: 15_000 })

for (const [category, tab, expected] of CASES) {
  await page.locator('.legacy-group-tab').filter({ hasText: category }).click()
  await page.locator('.legacy-tool-option').filter({
    has: page.locator(`code:text-is("/${tab}")`)
  }).click()
  await page.waitForFunction((expected) => document.querySelector('#legacy-output')?.textContent?.includes(expected), expected)
  const output = await page.locator('#legacy-output').innerText()
  if (!output.includes(expected)) {
    throw new Error(`1.12.2 ${tab} 输出不符合预期：${output}`)
  }
  console.log(`✓ ${tab}`)
  checked.push({ legacyGroup: category, command: tab, output })
}

const basicCommandIds = await page.locator('.legacy-tools-grid code').allTextContents()
const expectedBasicCommands = [
  '/gamemode', '/gamerule', '/world', '/misc', '/sound', '/simple',
  '/tellraw', '/teleport', '/xp', '/achievement', '/advancement'
]
if (!expectedBasicCommands.every((id) => basicCommandIds.includes(id))) {
  throw new Error(`基础命令分组缺少入口：${expectedBasicCommands.filter((id) => !basicCommandIds.includes(id)).join(', ')}`)
}

const layout = await page.locator('.legacy-command-nav').evaluate((nav) => {
  const buttons = [...nav.querySelectorAll('.legacy-group-tab')]
  return {
    navWidth: nav.clientWidth,
    navScrollWidth: nav.scrollWidth,
    overflowingButtons: buttons.filter((button) => button.scrollWidth > button.clientWidth + 1).length
  }
})
if (layout.navScrollWidth > layout.navWidth + 1 || layout.overflowingButtons > 0) {
  throw new Error(`旧版工具类别导航发生横向溢出：${JSON.stringify(layout)}`)
}
const screenshotPath = join(ARTIFACT_DIR, 'legacy-groups.png')
await page.screenshot({ path: screenshotPath, fullPage: true })
console.log(`✓ 界面截图：${screenshotPath}`)

await selectVersion(page, '1.20.4')
await page.locator('.command-item', { hasText: '给予物品' }).first().click()
await page.waitForSelector('#nbt-give-count', { timeout: 10_000 })
await page.locator('#nbt-give-name').fill('可保存物品')
await page.locator('#nbt-give-damage').fill('7')
await page.locator('#nbt-give-tags').fill('  mcstudio:gift  \n\n')
await switchGiveTab('属性')
await page.getByRole('button', { name: '添加属性' }).click()
await setResourceId(page.locator('#nbt-attribute-type-0'), 'minecraft:generic.attack_damage')
await switchGiveTab('特殊物品')
await setResourceId(page.locator('#nbt-potion-id'), 'minecraft:strong_healing')
await setResourceId(page.locator('#nbt-spawner-entity'), 'minecraft:zombie')
await page.locator('label').filter({ hasText: '当前延迟' }).locator('input').fill('-1')
await savePlan('NBT 方案回归')
await switchGiveTab('基础')
await page.locator('#nbt-give-name').fill('临时名称')
await loadPlan('NBT 方案回归')
if ((await page.locator('#nbt-give-name').inputValue()) !== '可保存物品'
  || (await page.locator('#nbt-give-tags').inputValue()) !== 'mcstudio:gift') {
  throw new Error('NBT 物品方案未完整恢复基础设置')
}
assert.equal(await page.locator('#nbt-give-damage').inputValue(), '7', 'NBT 物品方案未恢复耐久')
await switchGiveTab('属性')
assert.equal(await page.locator('#nbt-attribute-type-0').getAttribute('data-value'), 'minecraft:generic.attack_damage', 'NBT 物品方案未恢复属性')
await switchGiveTab('特殊物品')
if ((await page.locator('#nbt-potion-id').getAttribute('data-value')) !== 'minecraft:strong_healing'
  || (await page.locator('label').filter({ hasText: '当前延迟' }).locator('input').inputValue()) !== '-1') {
  throw new Error('NBT 物品方案未完整恢复特殊设置')
}
assert.equal(await page.locator('#nbt-spawner-entity').getAttribute('data-value'), 'minecraft:zombie', 'NBT 物品方案未恢复生成实体')
checked.push({ version: '1.20.4', preset: 'NBT 方案回归', output: await page.locator('.output-code .cm-content').innerText() })
console.log('✓ NBT 物品方案保存、载入与特殊设置')

await selectVersion(page, '1.21.5')
await page.waitForSelector('#give-count', { timeout: 15_000 })
await switchGiveTab('基础')
await addModernComponent('item_tags')
await page.locator('#item-tags-0').fill('mcstudio:modern_reward\n\n')
await savePlan('现代方案回归')
await page.locator('#item-tags-0').fill('mcstudio:temporary')
await loadPlan('现代方案回归')
if ((await page.locator('#item-tags-0').inputValue()) !== 'mcstudio:modern_reward') {
  throw new Error('现代物品方案未恢复物品标签')
}
await switchGiveTab('属性')
await addModernComponent('attribute_modifiers')
await setResourceId(page.locator('input[id^="attribute-type-"]').first(), 'minecraft:burning_time')
await switchGiveTab('特殊物品')
await addModernComponent('potion_contents')
await setResourceId(page.locator('input[id^="potion-id-"]'), 'minecraft:strong_healing')
await addModernComponent('block_entity_data')
await page.locator('input[id^="spawner-delay-"]').fill('-1')
await page.waitForFunction(() => document.querySelector('.output-code .cm-content')?.textContent?.includes('Delay:-1s'))
const modernOutput = await page.locator('.output-code .cm-content').innerText()
if (!modernOutput.includes('attribute_modifiers=') || !modernOutput.includes('potion_contents=')
  || !modernOutput.includes('block_entity_data=') || !modernOutput.includes('Delay:-1s')) {
  throw new Error(`现代物品特殊组件输出不完整：${modernOutput}`)
}
const giveScreenshot = join(ARTIFACT_DIR, 'give-special.png')
await page.screenshot({ path: giveScreenshot, fullPage: true })
console.log(`✓ 现代物品方案与特殊组件：${giveScreenshot}`)

assert.deepEqual(pageErrors, [], `Renderer errors: ${pageErrors.join('; ')}`)
checked.push({ version: '1.21.5', preset: '现代方案回归', output: modernOutput, legacyLayout: layout })
await writeFile(join(ARTIFACT_DIR, 'results.json'), JSON.stringify(checked, null, 2))
console.log(`✓ 1.12.2 分组表单冒烟通过。产物：${ARTIFACT_DIR}`)
}

const watchdog = setTimeout(() => {
  console.error('Legacy groups smoke timed out after 180s')
  void forceKill().finally(() => process.exit(1))
}, 180_000)
watchdog.unref()
try {
  await main()
} catch (error) {
  process.exitCode = 1
  console.error(error instanceof Error ? error.stack : String(error))
  if (page) await bounded(page.screenshot({ path: join(ARTIFACT_DIR, 'failure.png'), fullPage: true }),
    3_000, 'failure screenshot').catch(() => undefined)
} finally {
  await closeApp()
  clearTimeout(watchdog)
}
