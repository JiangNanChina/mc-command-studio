#!/usr/bin/env node
/** Real Electron regression: recovery, project round-trip, version output, and safe exit. */
import { _electron as electron } from 'playwright'
import { mkdir, rename, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyPackagedAssets } from './packaged-assets.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const APP_DIR = join(ROOT, 'apps/desktop')
const ARTIFACTS = join(ROOT, 'artifacts', 'persistence')
const USER_DATA = join(ARTIFACTS, 'user-data')
const PROJECT = join(ARTIFACTS, 'roundtrip.mcstudio')
let application
const errors = []

async function selectCommand(page, id) {
  await page.locator('#command-search').fill('')
  await page.locator('.command-item').filter({
    has: page.locator('.command-id', { hasText: new RegExp(`^${id}$`) })
  }).first().click()
  await page.waitForFunction((value) => document.querySelector('.hero-id')?.textContent === value, id)
}

async function selectVersion(page, version) {
  await page.locator('.version-trigger').click()
  await page.locator('.version-search').fill(version)
  await page.locator('.version-option').filter({
    has: page.locator('.version-name', { hasText: new RegExp(`^${version.replaceAll('.', '\\.')}$`) })
  }).click()
  await page.waitForFunction((value) =>
    document.querySelector('.version-current')?.textContent === value, version)
}

async function output(page) {
  return (await page.locator('.output-code .cm-content').innerText()).trim()
}

async function assertOutput(page, expected) {
  await page.waitForFunction((text) =>
    document.querySelector('.output-code .cm-content')?.textContent?.trim() === text, expected)
  await application.evaluate(({ clipboard }) => clipboard.writeText('e2e-pending'))
  await page.keyboard.press('Control+Enter')
  await page.waitForFunction(async (text) => {
    await window.mcstudio.app.info()
    return document.querySelector('.statusbar')?.textContent?.includes(`${text.length} 字符`)
  }, expected)
  const copied = await application.evaluate(async ({ clipboard }, text) => {
    const deadline = Date.now() + 5_000
    while (clipboard.readText() !== text && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
    return clipboard.readText()
  }, expected)
  if (copied !== expected) throw new Error(`复制与预览不一致：${copied} / ${expected}`)
}

async function waitForAutosave(page, expected) {
  await page.waitForFunction(async (commands) => {
    const saved = await window.mcstudio.project.getAutosave()
    if (!saved) return false
    return JSON.parse(saved.content).data?.datapack?.functions?.some((item) => item.commands === commands)
  }, expected, { timeout: 15_000 })
}

async function main() {
  await mkdir(ARTIFACTS, { recursive: true })
  await rm(USER_DATA, { recursive: true, force: true })
  await rm(PROJECT, { recursive: true, force: true })
  await rm(`${PROJECT}.backup`, { force: true })
  const env = { ...process.env, MCSTUDIO_USER_DATA: USER_DATA }
  delete env.ELECTRON_RUN_AS_NODE
  if (process.env.MCSTUDIO_E2E_EXE) delete env.MCSTUDIO_PACKS_DIR
  else env.MCSTUDIO_PACKS_DIR = join(ROOT, 'packs')
  const sandboxArgs = process.env.MCSTUDIO_E2E_NO_SANDBOX === '1' ? ['--no-sandbox'] : []
  application = await electron.launch(process.env.MCSTUDIO_E2E_EXE
    ? { executablePath: resolve(ROOT, process.env.MCSTUDIO_E2E_EXE), args: sandboxArgs, env, timeout: 60_000 }
    : { args: [...sandboxArgs, '.'], cwd: APP_DIR, env, timeout: 60_000 })
  const page = await application.firstWindow()
  page.on('pageerror', (error) => errors.push(error.message))
  await page.waitForSelector('.sidebar', { timeout: 30_000 })
  if (process.env.MCSTUDIO_E2E_EXE) await verifyPackagedAssets(application, page)

  // Exercise real filesystem writes while keeping native file dialogs deterministic.
  await application.evaluate(({ dialog }, path) => {
    dialog.showSaveDialog = async () => ({ canceled: false, filePath: path })
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [path] })
  }, PROJECT)

  await selectCommand(page, 'datapack')
  await page.locator('#datapack-commands').fill('say first recovery')
  await waitForAutosave(page, 'say first recovery')
  await page.locator('#datapack-commands').fill('say second recovery')
  await waitForAutosave(page, 'say second recovery')

  await selectCommand(page, 'locate')
  await page.locator('#quick-locate-id').fill('minecraft:ancient_city')
  await assertOutput(page, 'locate structure minecraft:ancient_city')
  await selectCommand(page, 'give')
  await selectCommand(page, 'locate')
  if (await page.locator('#quick-locate-id').inputValue() !== 'minecraft:ancient_city') {
    throw new Error('切换命令后快捷表单草稿丢失')
  }
  await page.getByRole('button', { name: '保存', exact: true }).first().click()
  await page.waitForFunction(() => !document.querySelector('.dirty-dot'))
  await page.locator('#quick-locate-id').fill('minecraft:desert_pyramid')
  await page.getByRole('button', { name: '打开', exact: true }).first().click()
  await page.waitForFunction(() => document.querySelector('#quick-locate-id')?.value === 'minecraft:ancient_city')
  await assertOutput(page, 'locate structure minecraft:ancient_city')
  await selectCommand(page, 'datapack')
  if (await page.locator('#datapack-commands').inputValue() !== 'say second recovery') {
    throw new Error('重新打开项目后数据包工作区内容丢失')
  }

  await selectCommand(page, 'attribute')
  await page.getByRole('button', { name: '添加修饰符', exact: true }).click()
  await page.waitForSelector('#attribute-modifier-id')
  await page.waitForFunction(() => document.querySelector('.output-code .cm-content')?.textContent?.includes('mcstudio:bonus'))
  const modern = await output(page)
  if (!modern.includes('mcstudio:bonus')) throw new Error(`现代版属性输出有误：${modern}`)
  await assertOutput(page, modern)
  await selectVersion(page, '1.20.4')
  await page.waitForSelector('#attribute-modifier-uuid')
  await page.waitForFunction(() => document.querySelector('.output-code .cm-content')?.textContent?.includes('00000000-0000-0000-0000-000000000001'))
  const legacy = await output(page)
  if (!legacy.includes('00000000-0000-0000-0000-000000000001') || legacy.includes('mcstudio:bonus')) {
    throw new Error(`切换版本后输出仍使用现代语法：${legacy}`)
  }
  await assertOutput(page, legacy)
  await selectVersion(page, '26.3')
  await page.waitForSelector('#attribute-modifier-id')
  await assertOutput(page, modern)

  // Replace the saved file with a directory to force a real save error.
  await rename(PROJECT, `${PROJECT}.backup`)
  await mkdir(PROJECT)
  await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close())
  const closeDialog = page.getByRole('dialog', { name: '保存修改后关闭？', exact: true })
  await closeDialog.waitFor()
  await page.screenshot({ path: join(ARTIFACTS, 'close-dialog.png'), animations: 'disabled' })
  await closeDialog.getByRole('button', { name: '保存并关闭', exact: true }).click()
  await closeDialog.getByRole('alert').waitFor()
  if (page.isClosed()) throw new Error('保存失败后窗口被关闭')
  await page.screenshot({ path: join(ARTIFACTS, 'save-error.png'), animations: 'disabled' })
  await closeDialog.getByRole('button', { name: '取消', exact: true }).click()
  await closeDialog.waitFor({ state: 'detached' })
  await rm(PROJECT, { recursive: true, force: true })
  await rename(`${PROJECT}.backup`, PROJECT)

  await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close())
  const closed = page.waitForEvent('close', { timeout: 15_000 })
  await page.getByRole('dialog', { name: '保存修改后关闭？', exact: true })
    .getByRole('button', { name: '不保存', exact: true }).click()
  await closed
  if (errors.length) throw new Error(`renderer errors: ${errors.join('; ')}`)
  console.log('✓ 持久化、快捷草稿、跨版本输出、保存失败与取消/放弃退出回归通过')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}).finally(async () => {
  // Tests must not leave a dirty-project confirmation blocking process cleanup.
  if (application) {
    await application.evaluate(({ app }) => app.exit(0)).catch(() => undefined)
    await application.close().catch(() => undefined)
  }
})
