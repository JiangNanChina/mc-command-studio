#!/usr/bin/env node
/** Verify bundled updater discovery/download against an isolated local fixture. Never install it. */
import { _electron as electron } from 'playwright'
import { createHash, randomUUID } from 'node:crypto'
import { createServer } from 'node:http'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const ARTIFACTS = join(ROOT, 'artifacts')
const EXE = resolve(ROOT, process.env.MCSTUDIO_E2E_EXE ?? 'artifacts/p1p2-package/win-unpacked/MC Command Studio.exe')
const artifactRelative = relative(ARTIFACTS, EXE)
if (artifactRelative.startsWith(`..${sep}`) || artifactRelative === '..' || resolve(EXE) === ARTIFACTS) {
  throw new Error('该测试只允许修改 artifacts 中的隔离目录包，不接受 release 或已安装程序。')
}
const USER_DATA = join(ARTIFACTS, 'updater-bundle-userdata')
const CONFIG = join(dirname(EXE), 'resources', 'app-update.yml')
const CACHE_NAME = `mcstudio-updater-test-${randomUUID()}`
const CACHE_ROOT = join(ARTIFACTS, 'updater-bundle-cache')
const PAYLOAD = Buffer.from('MCSTUDIO E2E DOWNLOAD FIXTURE — NOT AN INSTALLER\n')
const SHA512 = createHash('sha512').update(PAYLOAD).digest('base64')
let application
let server
let previousConfig
let configWritten = false
let cachePath

async function main() {
  cachePath = join(CACHE_ROOT, CACHE_NAME)
  await rm(USER_DATA, { recursive: true, force: true })
  await mkdir(USER_DATA, { recursive: true })
  await mkdir(CACHE_ROOT, { recursive: true })
  await writeFile(join(USER_DATA, 'settings.json'), JSON.stringify({ autoUpdate: false }))
  server = createServer((request, response) => {
    const path = new URL(request.url ?? '/', 'http://127.0.0.1').pathname
    if (path === '/updates/latest.yml') {
      const latest = [
        'version: 999.0.0',
        'files:',
        '  - url: updater-fixture.exe',
        `    sha512: ${SHA512}`,
        `    size: ${PAYLOAD.length}`,
        'path: updater-fixture.exe',
        `sha512: ${SHA512}`,
        'releaseDate: 2026-10-28T00:00:00.000Z',
        'releaseNotes: Local bundle verification fixture'
      ].join('\n')
      response.writeHead(200, { 'content-type': 'text/yaml' }).end(latest)
    } else if (path === '/updates/updater-fixture.exe') {
      response.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': PAYLOAD.length }).end(PAYLOAD)
    } else response.writeHead(404).end()
  })
  await new Promise((done) => server.listen(0, '127.0.0.1', done))
  const feed = `http://127.0.0.1:${server.address().port}/updates/`
  previousConfig = await readFile(CONFIG).catch((error) => {
    if (error.code !== 'ENOENT') throw error
    return null
  })
  await writeFile(CONFIG, `provider: generic\nurl: ${feed}\nupdaterCacheDirName: ${CACHE_NAME}\n`)
  configWritten = true
  const env = {
    ...process.env,
    MCSTUDIO_USER_DATA: USER_DATA,
    MCSTUDIO_UPDATE_URL: feed,
    LOCALAPPDATA: CACHE_ROOT
  }
  delete env.ELECTRON_RUN_AS_NODE
  delete env.MCSTUDIO_PACKS_DIR
  delete env.PORTABLE_EXECUTABLE_DIR
  const args = process.env.MCSTUDIO_E2E_NO_SANDBOX === '1' ? ['--no-sandbox'] : []
  application = await electron.launch({ executablePath: EXE, args, env, timeout: 60_000 })
  // Explicitly prevent auto-install-on-quit for this synthetic download fixture.
  await application.evaluate(({ app }) => app.removeAllListeners('quit'))
  const page = await application.firstWindow()
  await page.waitForSelector('.sidebar', { timeout: 30_000 })
  const checked = await page.evaluate(() => window.mcstudio.updater.check(true))
  if (checked.status !== 'available' || checked.version !== '999.0.0') {
    throw new Error(`本地更新检查失败：${JSON.stringify(checked)}`)
  }
  await page.locator('.banner.update').getByRole('button', { name: '下载更新', exact: true }).click()
  await page.waitForFunction(async () => {
    const state = await window.mcstudio.updater.getState()
    if (state.status === 'error') throw new Error(state.error)
    return state.status === 'downloaded'
  }, null, { timeout: 30_000 })
  await page.locator('.banner.update').getByRole('button', { name: '重新载入', exact: true }).waitFor()
  const downloaded = await readFile(join(cachePath, 'pending', 'updater-fixture.exe'))
  if (!downloaded.equals(PAYLOAD)) throw new Error('下载缓存与测试内容不一致')
  await page.screenshot({ path: join(ARTIFACTS, 'updater-bundle-downloaded.png'), animations: 'disabled' })
  console.log('✓ 打包后 updater 本地检查、SHA-512 下载校验与待安装 UI 通过（未安装）')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}).finally(async () => {
  if (application) {
    await application.evaluate(({ app }) => {
      app.removeAllListeners('quit')
      app.exit(0)
    }).catch(() => undefined)
    await application.close().catch(() => undefined)
  }
  if (configWritten) {
    if (previousConfig === null) await rm(CONFIG, { force: true })
    else await writeFile(CONFIG, previousConfig)
  }
  if (cachePath) await rm(cachePath, { recursive: true, force: true })
  if (server) await new Promise((done) => server.close(done))
})
