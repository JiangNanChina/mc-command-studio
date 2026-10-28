#!/usr/bin/env node
/** Localized resource comboboxes retain real IDs across modern and NBT item forms. */
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { _electron as electron } from 'playwright'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const RUN_ID = `${Date.now()}-${process.pid}`
const ARTIFACT_DIR = join(ROOT, 'artifacts', `mcstudio-chinese-first-${RUN_ID}`)
const USER_DATA = join(ARTIFACT_DIR, 'user-data')
const execFileAsync = promisify(execFile)
const pageErrors = []
const checked = []
let app
let page
let appPid

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

async function pickGive() {
  await page.getByRole('button', { name: '全部', exact: true }).click()
  await page.locator('#command-search').fill('')
  await page.locator('.command-item').filter({ hasText: '给予物品' }).first().click()
}

async function switchGiveTab(tab) {
  await page.getByRole('tab', { name: new RegExp(`^${tab}(?:\\s*\\d+)?$`) }).click()
}

async function addModernComponent(kind) {
  await page.locator('select[aria-label="添加组件"]').selectOption(kind)
  await page.locator(`.component-card .component-id:text-is("${kind}")`).waitFor({ state: 'visible' })
}

async function output() {
  return (await page.locator('.output-code .cm-content').innerText()).trim()
}

async function expectOutputId(id, label) {
  await page.waitForFunction((expected) => {
    const text = document.querySelector('.output-code .cm-content')?.textContent ?? ''
    return text.includes(expected)
  }, id)
  const text = await output()
  assert.ok(text.includes(id), `${label}: output lost resource ID ${id}: ${text}`)
  assert.ok(!text.includes('完全不存在的中文查询'), `${label}: Chinese query leaked into command output`)
}

async function expectValue(input, id, chinese, label) {
  await page.waitForFunction(({ selector, expected }) => document.querySelector(selector)?.getAttribute('data-value') === expected,
    { selector: `#${await input.getAttribute('id')}`, expected: id })
  assert.equal(await input.getAttribute('data-value'), id, `${label}: model ID changed`)
  const display = await input.inputValue()
  if (chinese) assert.ok(display.includes(chinese), `${label}: expected Chinese display ${chinese}, got ${display}`)
  assert.ok(id === '' || display !== id, `${label}: input must lead with Chinese instead of the raw resource ID`)
  if (id) assert.ok((await input.getAttribute('title')).includes(id), `${label}: title must retain the real ID`)
}

function listbox() {
  return page.getByRole('listbox', { name: '生成实体 ID选项', exact: true })
}

async function expectClosed(input, label) {
  await page.waitForFunction((selector) => document.querySelector(selector)?.getAttribute('aria-expanded') === 'false',
    `#${await input.getAttribute('id')}`)
  assert.equal(await page.locator('.localized-id-popup').count(), 0, `${label}: popup did not close`)
}

async function resizeWindow(width, height = 820) {
  await app.evaluate(({ BrowserWindow }, dimensions) => {
    const window = BrowserWindow.getAllWindows()[0]
    window?.setMinimumSize(760, 600)
    window?.setSize(dimensions.width, dimensions.height)
  }, { width, height })
  await page.waitForFunction((target) => window.innerWidth <= target && window.innerWidth >= target - 40, width)
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))
}

async function assertPopupGeometry(input, label) {
  const inputId = await input.getAttribute('id')
  await page.waitForFunction((targetId) => {
    const input = document.getElementById(targetId)
    const popup = document.getElementById(input?.getAttribute('aria-controls') ?? '')?.closest('.localized-id-popup')
    if (!input || !popup) return false
    const field = input.getBoundingClientRect()
    const rect = popup.getBoundingClientRect()
    return Math.abs(rect.top - field.bottom - 5) <= 2 || Math.abs(rect.bottom - field.top + 5) <= 2
  }, inputId).catch(async (error) => {
    const state = await page.evaluate((targetId) => {
      const field = document.getElementById(targetId)
      const popup = document.getElementById(field?.getAttribute('aria-controls') ?? '')?.closest('.localized-id-popup')
      return {
        input: field?.getBoundingClientRect().toJSON(),
        popup: popup?.getBoundingClientRect().toJSON(),
        expanded: field?.getAttribute('aria-expanded'),
        active: document.activeElement?.id,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      }
    }, inputId)
    throw new Error(`${label}: popup geometry did not settle: ${JSON.stringify(state)}`, { cause: error })
  })
  const geometry = await page.evaluate((targetId) => {
    const input = document.getElementById(targetId)
    const popup = document.getElementById(input?.getAttribute('aria-controls') ?? '')?.closest('.localized-id-popup')
    const rect = popup.getBoundingClientRect()
    return {
      inputHeight: input.getBoundingClientRect().height,
      left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom,
      width: rect.width, height: rect.height,
      viewportWidth: window.innerWidth, viewportHeight: window.innerHeight,
      portalIsBodyChild: popup.parentElement === document.body
    }
  }, inputId)
  assert.equal(geometry.inputHeight, 36, `${label}: shared field changed the 36px control height`)
  assert.ok(geometry.portalIsBodyChild, `${label}: popup must use the body portal`)
  assert.ok(geometry.left >= 0 && geometry.top >= 0, `${label}: popup starts outside viewport: ${JSON.stringify(geometry)}`)
  assert.ok(geometry.right <= geometry.viewportWidth + 1 && geometry.bottom <= geometry.viewportHeight + 1,
    `${label}: popup extends outside viewport: ${JSON.stringify(geometry)}`)
  assert.ok(geometry.width > 0 && geometry.height > 0, `${label}: popup has no visible area`)
  return geometry
}

async function testEntityCombobox(input, prefix) {
  await input.waitFor({ state: 'visible' })
  await expectValue(input, 'minecraft:zombie', '僵尸', `${prefix} initial Chinese label`)
  assert.equal(await input.getAttribute('role'), 'combobox')
  assert.equal(await input.getAttribute('aria-autocomplete'), 'list')

  await input.click()
  const initialOptions = await listbox().getByRole('option').count()
  assert.ok(initialOptions > 10 && initialOptions <= 80,
    `${prefix}: opening a selected value must show the full first page, not only the selected match`)
  const controls = await input.getAttribute('aria-controls')
  assert.equal(await listbox().getAttribute('id'), controls, `${prefix}: aria-controls is disconnected`)
  assert.ok((await page.locator('.localized-id-current').innerText()).includes('minecraft:zombie'))

  await input.fill('骷髅')
  const skeletonOption = listbox().getByRole('option').filter({ has: page.locator('[class="localized-id-option-label"]', { hasText: /^骷髅$/ }) })
  await skeletonOption.waitFor({ state: 'visible' })
  assert.equal(await skeletonOption.getAttribute('data-value'), 'minecraft:skeleton')
  assert.equal(await input.getAttribute('data-value'), 'minecraft:zombie', `${prefix}: filtering must not mutate the model`)
  await skeletonOption.click()
  await expectValue(input, 'minecraft:skeleton', '骷髅', `${prefix} Chinese option selection`)
  await expectOutputId('minecraft:skeleton', prefix)
  await expectClosed(input, prefix)

  await input.click()
  assert.ok(await listbox().getByRole('option').count() > 10, `${prefix}: reopening kept the selected-value filter`)
  await input.fill('minecraft:creeper')
  await listbox().locator('[role="option"][data-value="minecraft:creeper"]').waitFor({ state: 'visible' })
  await input.press('ArrowDown')
  const activeId = await input.getAttribute('aria-activedescendant')
  assert.ok(activeId, `${prefix}: keyboard navigation did not expose an active option`)
  assert.equal(await page.locator(`[id="${activeId}"]`).getAttribute('data-value'), 'minecraft:creeper')
  await input.press('Enter')
  await expectValue(input, 'minecraft:creeper', '苦力怕', `${prefix} ID search and keyboard selection`)
  await expectOutputId('minecraft:creeper', prefix)

  const beforeUnselectedSearch = await output()
  await input.fill('完全不存在的中文查询')
  await input.press('Tab')
  await expectValue(input, 'minecraft:creeper', '苦力怕', `${prefix} unselected Chinese search`)
  await expectClosed(input, prefix)
  assert.equal(await output(), beforeUnselectedSearch, `${prefix}: unmatched Chinese query changed the command`)

  await input.fill('骷髅')
  await input.press('Enter')
  await expectValue(input, 'minecraft:creeper', '苦力怕', `${prefix} Chinese Enter without explicit selection`)
  assert.equal(await output(), beforeUnselectedSearch)

  const customId = `test_pack:${prefix}_clockwork_golem`
  await input.fill(customId)
  await input.press('Enter')
  await expectValue(input, customId, '自定义', `${prefix} custom namespaced ID`)
  await expectOutputId(customId, prefix)

  const customBlurId = `test_pack:${prefix}_clockwork_golem_blur`
  await input.fill(customBlurId)
  await input.press('Tab')
  await expectValue(input, customBlurId, '自定义', `${prefix} custom ID committed on blur`)
  await expectOutputId(customBlurId, prefix)
  const beforeEscape = await output()
  await input.fill('minecraft:zombie')
  await input.press('Escape')
  await expectValue(input, customBlurId, '自定义', `${prefix} Escape preserves previous ID`)
  assert.equal(await output(), beforeEscape)
  await expectClosed(input, prefix)

  await input.fill('')
  await input.press('Tab')
  await expectValue(input, '', '', `${prefix} clear value`)
  assert.equal(await input.inputValue(), '')
  await input.fill('僵尸')
  await listbox().locator('[role="option"][data-value="minecraft:zombie"]').click()
  await expectValue(input, 'minecraft:zombie', '僵尸', `${prefix} restore valid ID`)
  await expectOutputId('minecraft:zombie', prefix)

  await resizeWindow(1280)
  await input.scrollIntoViewIfNeeded()
  await input.click()
  const wideGeometry = await assertPopupGeometry(input, `${prefix} wide popup`)
  await resizeWindow(980, 740)
  const remainedOpenDuringResize = await input.getAttribute('aria-expanded') === 'true'
  // Native window resizing can move focus or momentarily scroll this field off screen.
  // Restore the same field before inspecting its own portal instead of a neighbor's popup.
  if (!remainedOpenDuringResize) {
    await input.scrollIntoViewIfNeeded()
    await input.click()
  }
  const narrowGeometry = await assertPopupGeometry(input, `${prefix} narrow popup`)
  await input.evaluate((element) => element.scrollIntoView({ block: 'end' }))
  const scrolledGeometry = await assertPopupGeometry(input, `${prefix} popup scroll tracking`)
  await page.screenshot({ path: join(ARTIFACT_DIR, `${prefix}-popup-980.png`), fullPage: true, animations: 'disabled' })
  await page.locator('.main h1').click()
  await expectClosed(input, `${prefix} outside click`)

  checked.push({ prefix, initialOptions, value: await input.getAttribute('data-value'),
    wideGeometry, remainedOpenDuringResize, narrowGeometry, scrolledGeometry, output: await output() })
  console.log(`✓ ${prefix}: Chinese labels, IDs, search, keyboard, custom input, clear, blur, Escape and popup bounds`)
}

async function main() {
  await mkdir(USER_DATA, { recursive: true })
  const env = { ...process.env, ELECTRON_DISABLE_SECURITY_WARNINGS: 'true', MCSTUDIO_USER_DATA: USER_DATA }
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
  await resizeWindow(1380)
  await selectVersion('26.3')
  await pickGive()
  await page.waitForSelector('#give-count')
  await switchGiveTab('特殊物品')
  await addModernComponent('block_entity_data')
  await testEntityCombobox(page.getByRole('combobox', { name: '生成实体 ID', exact: true }), 'modern')

  await resizeWindow(1380)
  await selectVersion('1.20.4')
  await pickGive()
  await page.waitForSelector('#nbt-give-count')
  await switchGiveTab('特殊物品')
  const nbtEntity = page.locator('#nbt-spawner-entity')
  await nbtEntity.fill('minecraft:zombie')
  await nbtEntity.press('Enter')
  await testEntityCombobox(nbtEntity, 'nbt')

  await resizeWindow(1380)
  await selectVersion('1.13.2')
  await pickGive()
  await page.waitForSelector('#nbt-give-count')
  await switchGiveTab('属性')
  const addAttribute = page.getByRole('button', { name: '添加属性', exact: true })
  await addAttribute.click()
  const attackAttribute = page.locator('#nbt-attribute-type-0')
  await attackAttribute.fill('generic.attackDamage')
  await attackAttribute.press('Enter')
  await page.waitForFunction(() => document.querySelector('#nbt-attribute-type-0')?.getAttribute('data-value')
    === 'generic.attackDamage')
  assert.ok((await attackAttribute.inputValue()).includes('攻击伤害'), '1.13.2 camelCase attribute should show its Chinese label')

  await addAttribute.click()
  const jumpAttribute = page.locator('#nbt-attribute-type-1')
  await jumpAttribute.fill('horse.jumpStrength')
  await jumpAttribute.press('Tab')
  await page.waitForFunction(() => document.querySelector('#nbt-attribute-type-1')?.getAttribute('data-value')
    === 'horse.jumpStrength')
  assert.ok((await jumpAttribute.inputValue()).includes('跳跃力度'), '1.13.2 Tab commit should keep the Chinese label')
  const legacyAttributeOutput = await output()
  assert.ok(legacyAttributeOutput.includes('AttributeName:"generic.attackDamage"'),
    `1.13.2 Enter input lost its camelCase command ID: ${legacyAttributeOutput}`)
  assert.ok(legacyAttributeOutput.includes('AttributeName:"horse.jumpStrength"'),
    `1.13.2 Tab input lost its camelCase command ID: ${legacyAttributeOutput}`)
  checked.push({ prefix: 'legacy-attributes-1.13.2', values: [
    await attackAttribute.getAttribute('data-value'), await jumpAttribute.getAttribute('data-value')
  ], output: legacyAttributeOutput })
  console.log('✓ 1.13.2 legacy camelCase attributes: Enter, Tab and command output')

  assert.deepEqual(pageErrors, [], `Renderer errors: ${pageErrors.join('; ')}`)
  await writeFile(join(ARTIFACT_DIR, 'results.json'), JSON.stringify(checked, null, 2))
  console.log(`✓ Chinese-first smoke passed. Artifacts: ${ARTIFACT_DIR}`)
}

const watchdog = setTimeout(() => {
  console.error('Chinese-first smoke timed out after 180s')
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
