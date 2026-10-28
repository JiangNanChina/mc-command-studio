#!/usr/bin/env node
/** Shared form alignment, Chinese ID labels, and preset manager usability. */
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { _electron as electron } from 'playwright'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const RUN_ID = `${Date.now()}-${process.pid}`
const ARTIFACT_DIR = join(ROOT, 'artifacts', `mcstudio-form-usability-${RUN_ID}`)
const USER_DATA = join(ARTIFACT_DIR, 'user-data')
const execFileAsync = promisify(execFile)
let app
let page
let appPid
const pageErrors = []

function bounded(operation, ms, label) {
  let timer
  return Promise.race([operation, new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
  })]).finally(() => clearTimeout(timer))
}

async function forceKill() {
  if (!appPid) return
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

async function selectVersion(version) {
  if ((await page.locator('.version-current').innerText()).trim() === version) return
  await page.locator('.version-trigger').click()
  await page.locator('.version-search').fill(version)
  const found = await page.evaluate((target) => {
    const option = [...document.querySelectorAll('.version-option')].find(
      (element) => element.querySelector('.version-name')?.textContent === target)
    option?.click()
    return Boolean(option)
  }, version)
  assert.ok(found, `Version ${version} is absent`)
  await page.waitForFunction(
    (target) => document.querySelector('.version-current')?.textContent === target,
    version, { timeout: 20_000 })
}

async function pickCommand(name) {
  await page.getByRole('button', { name: '全部', exact: true }).click()
  await page.locator('#command-search').fill('')
  await page.locator('.command-item').filter({
    has: page.locator('.command-name').filter({ hasText: new RegExp(`^${name}`) })
  }).first().click()
}

async function assertAligned(ids, label) {
  const tops = await page.evaluate((fieldIds) => fieldIds.map((id) => {
    const element = document.getElementById(id)
    return element ? Math.round(element.getBoundingClientRect().top * 10) / 10 : null
  }), ids)
  assert.ok(tops.every((top) => top !== null), `${label}: missing fields (${ids.join(', ')})`)
  const values = tops.filter((top) => top !== null)
  assert.ok(Math.max(...values) - Math.min(...values) <= 1,
    `${label}: inputs are vertically misaligned (${JSON.stringify(tops)})`)
  console.log(`✓ aligned ${label}`)
}

function geometry() {
  return page.evaluate(() => ['.workspace', '.main', '.output'].map((selector) => {
    const element = document.querySelector(selector)
    if (!element) return null
    const rect = element.getBoundingClientRect()
    return [selector, rect.x, rect.y, rect.width, rect.height]
  }))
}

async function checkIdLabel(inputSelector, _previousHelpSelector, id, chinese, label) {
  const input = page.locator(inputSelector)
  await input.waitFor({ state: 'visible' })
  assert.equal(await input.getAttribute('data-value'), id, `${label}: expected stored id ${id}`)
  assert.ok((await input.inputValue()).includes(chinese), `${label}: Chinese must be the input's primary display`)
  await input.click()
  await input.fill(id)
  const option = page.getByRole('option').filter({ has: page.locator(`code:text-is("${id}")`) })
  assert.ok((await option.locator('.localized-id-option-label').innerText()).includes(chinese),
    `${label}: Chinese must be the option's primary display`)
  await option.click()
  assert.ok(id.length > 0, `${label}: expected a real command value`)
  console.log(`✓ ${label}: ${chinese} · ${id}`)
}

async function switchGiveTab(tab) {
  await page.getByRole('tab', { name: new RegExp(`^${tab}(?:\\s*\\d+)?$`) }).click()
}

async function addModernComponent(kind) {
  await page.locator('select[aria-label="添加组件"]').selectOption(kind)
  await page.locator(`.component-card .component-id:text-is("${kind}")`).waitFor({ state: 'visible' })
}

async function capture(width, name) {
  await app.evaluate(({ BrowserWindow }, targetWidth) => {
    const window = BrowserWindow.getAllWindows()[0]
    window?.setMinimumSize(760, 600)
    window?.setSize(targetWidth, 820)
  }, width)
  await page.waitForFunction((target) => window.innerWidth <= target && window.innerWidth >= target - 40, width)
  if (name.startsWith('attributes-')) {
    await page.locator('.attribute-entry').first().scrollIntoViewIfNeeded()
  }
  await page.screenshot({ path: join(ARTIFACT_DIR, name), fullPage: true, animations: 'disabled' })
  console.log(`✓ screenshot ${name}`)
}

async function testPresetManager() {
  await switchGiveTab('属性')
  const bar = page.locator('[data-preset-key="give:modern"]')
  const toolbar = bar.locator('.custom-preset-toolbar')
  const controls = toolbar.locator(':scope > input, :scope > button, :scope > select')
  assert.equal(await controls.count(), 4)
  const positions = await controls.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect()
    return { top: Math.round(rect.top), bottom: Math.round(rect.bottom) }
  }))
  assert.equal(new Set(positions.map((position) => position.top)).size, 1,
    `Preset controls must remain in one row: ${JSON.stringify(positions)}`)

  await bar.locator('input[aria-label="物品方案名称"]').fill('布局回归测试')
  await bar.getByRole('button', { name: '保存物品方案', exact: true }).click()
  const planPicker = bar.locator('select[aria-label="选择物品方案"]')
  await page.locator('#attribute-amount-0-0').fill('8')
  await planPicker.selectOption('')
  await planPicker.selectOption({ label: '布局回归测试' })
  assert.notEqual(await page.locator('#attribute-amount-0-0').inputValue(), '8',
    'Loading a saved preset should restore the saved attribute amount')
  await page.waitForTimeout(200)

  const before = await geometry()
  await bar.getByRole('button', { name: '管理物品方案', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '管理物品方案' })
  await dialog.waitFor({ state: 'visible' })
  await page.screenshot({ path: join(ARTIFACT_DIR, 'preset-manager.png'), fullPage: true, animations: 'disabled' })
  const during = await geometry()
  assert.deepEqual(during, before, 'Preset manager must not resize the underlying workspace')
  const managerPicker = dialog.locator('select[aria-label="管理的物品方案"]')
  await managerPicker.selectOption({ label: '布局回归测试' })
  await dialog.getByLabel('新的物品方案名称').fill('重命名回归测试')
  await dialog.getByRole('button', { name: '重命名', exact: true }).click()
  await managerPicker.selectOption({ label: '重命名回归测试' })
  assert.ok(await managerPicker.locator('option').filter({ hasText: '重命名回归测试' }).count())

  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'detached' })
  const afterEscape = await geometry()
  assert.deepEqual(afterEscape, before, 'Closing manager should restore the same workspace geometry')

  await bar.getByRole('button', { name: '管理物品方案', exact: true }).click()
  const reopened = page.getByRole('dialog', { name: '管理物品方案' })
  await reopened.locator('select[aria-label="管理的物品方案"]').selectOption({ label: '重命名回归测试' })
  await reopened.getByRole('button', { name: '删除方案', exact: true }).click()
  await page.waitForFunction(() => {
    const select = document.querySelector('[role="dialog"] select[aria-label="管理的物品方案"]')
    return select && ![...select.options].some((option) => option.textContent === '重命名回归测试')
  })
  await page.keyboard.press('Escape')
  await reopened.waitFor({ state: 'detached' })
  assert.equal(await planPicker.locator('option').filter({ hasText: '布局回归测试' }).count(), 0,
    'Deleted preset should disappear from the toolbar selector')
  console.log('✓ one-row preset toolbar; save, rename, delete, escape, modal layout')
}

async function testOtherChineseForms() {
  await pickCommand('造成伤害')
  await checkIdLabel('#damage-type', '', 'minecraft:generic', '通用伤害', '伤害类型')
  await pickCommand('物品操作')
  await checkIdLabel('#item-slot', '', 'weapon.mainhand', '主手', '物品槽位')
  await page.locator('#item-slot').fill('container.0')
  await page.locator('#item-slot').press('Enter')
  assert.equal(await page.locator('#item-slot').getAttribute('data-value'), 'container.0')
  assert.ok((await page.locator('#item-slot').inputValue()).includes('容器'))
  assert.ok((await page.locator('.output-code .cm-content').innerText()).includes('container.0'))

  await pickCommand('记分板')
  await page.getByRole('button', { name: '创建目标', exact: true }).click()
  await checkIdLabel('#scoreboard-criteria', '', 'dummy', '由命令控制', '计分规则')

  await page.locator('#command-search').fill('配方管理')
  await page.locator('.command-item').filter({ hasText: '配方管理' }).click()
  assert.ok((await page.locator('.hero-title').innerText()).startsWith('配方管理'))
  assert.ok((await page.locator('#quick-recipe-action option:checked').innerText()).includes('给予'))
  assert.ok((await page.locator('.output-code .cm-content').innerText()).includes('recipe give @s minecraft:bread'))
  await page.locator('#command-search').fill('')
  console.log('✓ Chinese damage, item slots, scoreboard criteria, and recipe command form')
}

async function main() {
  await mkdir(USER_DATA, { recursive: true })
  const env = {
    ...process.env,
    ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    MCSTUDIO_USER_DATA: USER_DATA
  }
  delete env.ELECTRON_RUN_AS_NODE
  const sandboxArgs = process.env.MCSTUDIO_E2E_NO_SANDBOX === '1' ? ['--no-sandbox'] : []
  if (process.env.MCSTUDIO_E2E_EXE) delete env.MCSTUDIO_PACKS_DIR
  else env.MCSTUDIO_PACKS_DIR = join(ROOT, 'packs')

  app = await electron.launch(process.env.MCSTUDIO_E2E_EXE ? {
    executablePath: resolve(ROOT, process.env.MCSTUDIO_E2E_EXE),
    args: sandboxArgs, env, timeout: 45_000
  } : {
    args: [...sandboxArgs, '.'], cwd: join(ROOT, 'apps/desktop'), env, timeout: 45_000
  })
  appPid = app.process().pid
  page = await app.firstWindow()
  page.setDefaultTimeout(10_000)
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.waitForSelector('.sidebar', { timeout: 30_000 })
  const details = page.getByRole('button', { name: '查看详情', exact: true })
  if (await details.count()) {
    await details.click()
    const announcement = page.getByRole('dialog', { name: '更新公告' })
    await announcement.getByRole('button', { name: '知道了', exact: true }).click()
    await announcement.waitFor({ state: 'detached' })
  }

  await selectVersion('26.3')
  await pickCommand('给予物品')
  await page.waitForSelector('#give-count')
  await switchGiveTab('属性')
  await addModernComponent('attribute_modifiers')
  await checkIdLabel('[aria-label="属性 ID"]', '#attribute-name-0-0',
    'minecraft:attack_damage', '攻击伤害', '现代属性')
  await assertAligned(['attribute-id-0-0', 'attribute-type-0-0'], 'modern attribute row')
  await assertAligned(['attribute-amount-0-0', 'attribute-operation-0-0', 'attribute-slot-0-0'], 'modern modifier controls')
  assert.ok((await page.locator('#attribute-slot-0-0 option:checked').innerText()).includes('主手'))
  assert.ok((await page.locator('#attribute-id-help-0').innerText()).includes('命名空间'))
  await capture(1280, 'attributes-1280.png')

  await switchGiveTab('附魔')
  await addModernComponent('enchantments')
  await checkIdLabel('[aria-label="附魔 ID"]', '#enchantment-name-0-0',
    'minecraft:sharpness', '锋利', '现代附魔')

  await switchGiveTab('特殊物品')
  await addModernComponent('potion_contents')
  await checkIdLabel('[aria-label="基础药水 ID"]', '#potion-name-0',
    'minecraft:water', '水瓶', '现代药水')
  await addModernComponent('block_entity_data')
  await checkIdLabel('[aria-label="生成实体 ID"]', '#spawner-entity-name-1',
    'minecraft:zombie', '僵尸', '现代刷怪笼')
  await capture(1280, 'give-modern-1280.png')
  await testPresetManager()
  await capture(980, 'give-modern-980.png')

  await page.getByRole('button', { name: '编辑选择器', exact: true }).click()
  const selectorDialog = page.getByRole('dialog', { name: '编辑目标选择器' })
  await selectorDialog.waitFor({ state: 'visible' })
  await assertAligned(['selector-name', 'selector-type'], 'selector name/type row')
  await assertAligned(['selector-level', 'selector-gamemode', 'selector-limit'], 'selector limits row')
  await page.keyboard.press('Escape')
  await selectorDialog.waitFor({ state: 'detached' })

  await pickCommand('召唤实体')
  await page.waitForSelector('#summon-x')
  await assertAligned(['summon-x', 'summon-y', 'summon-z'], 'summon coordinates')
  await testOtherChineseForms()

  await selectVersion('1.20.4')
  await pickCommand('给予物品')
  await page.waitForSelector('#nbt-give-count')
  await switchGiveTab('属性')
  await page.getByRole('button', { name: '添加属性', exact: true }).click()
  await checkIdLabel('#nbt-attribute-type-0', '#nbt-attribute-name-0',
    'minecraft:generic.attack_damage', '攻击伤害', 'NBT 属性')
  await assertAligned(['nbt-attribute-type-0', 'nbt-attribute-modifier-name-0'], 'NBT attribute row')
  await switchGiveTab('附魔')
  await page.getByRole('button', { name: '添加附魔', exact: true }).click()
  await checkIdLabel('#nbt-enchant-id-0', '#nbt-enchant-name-0',
    'minecraft:sharpness', '锋利', 'NBT 附魔')
  await switchGiveTab('特殊物品')
  await page.locator('#nbt-potion-id').fill('minecraft:water')
  await page.locator('#nbt-potion-id').press('Enter')
  await checkIdLabel('#nbt-potion-id', '#nbt-potion-name',
    'minecraft:water', '水瓶', 'NBT 药水')
  await page.locator('#nbt-spawner-entity').fill('minecraft:zombie')
  await page.locator('#nbt-spawner-entity').press('Enter')
  await checkIdLabel('#nbt-spawner-entity', '#nbt-spawner-entity-name',
    'minecraft:zombie', '僵尸', 'NBT 刷怪笼实体')
  await capture(1280, 'give-nbt-1280.png')
  await capture(980, 'give-nbt-980.png')

  await selectVersion('1.12.2')
  await page.locator('.command-item').filter({ hasText: '1.12.2 旧版工具' }).click()
  await page.locator('.legacy-group-tab').filter({ hasText: '基础命令' }).click()
  await page.locator('.legacy-tool-option').filter({ has: page.locator('code:text-is("/teleport")') }).click()
  await page.waitForSelector('#legacy-tp-x')
  await assertAligned(['legacy-tp-x', 'legacy-tp-y', 'legacy-tp-z'], 'legacy teleport coordinates')
  await capture(1280, 'legacy-1280.png')
  await capture(980, 'legacy-980.png')

  assert.deepEqual(pageErrors, [], `Renderer errors: ${pageErrors.join('; ')}`)
  console.log(`✓ Form usability checks passed. Artifacts: ${ARTIFACT_DIR}`)
}

const watchdog = setTimeout(() => {
  console.error('Form usability smoke timed out after 180s')
  void forceKill().finally(() => process.exit(1))
}, 180_000)
watchdog.unref()
try {
  await main()
} catch (error) {
  process.exitCode = 1
  console.error(error instanceof Error ? error.stack : String(error))
  if (page) await bounded(page.screenshot({
    path: join(ARTIFACT_DIR, 'failure.png'), fullPage: true
  }), 3_000, 'failure screenshot').catch(() => undefined)
} finally {
  await closeApp()
  clearTimeout(watchdog)
}
