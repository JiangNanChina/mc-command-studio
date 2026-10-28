#!/usr/bin/env node
/** 加载全部 54 个版本数据包并校验根命令数。 */
import { _electron as electron } from 'playwright'
import { join, resolve } from 'node:path'
import { rm } from 'node:fs/promises'

const ROOT = resolve('.')
const USER_DATA = join(ROOT, 'artifacts/all-versions-userdata')
await rm(USER_DATA, { recursive: true, force: true })

const env = {
  ...process.env,
  MCSTUDIO_PACKS_DIR: join(ROOT, 'packs'),
  MCSTUDIO_USER_DATA: USER_DATA
}
delete env.ELECTRON_RUN_AS_NODE

const app = await electron.launch({
  args: ['.'],
  cwd: join(ROOT, 'apps/desktop'),
  env,
  timeout: 60_000
})
const page = await app.firstWindow()
await page.waitForSelector('.sidebar', { timeout: 30_000 })

const result = await page.evaluate(async () => {
  const list = await window.mcstudio.packs.list()
  const rows = []
  for (const entry of list) {
    const loaded = await window.mcstudio.packs.load(entry.id)
    if (!loaded.ok) {
      rows.push({ id: entry.id, actual: 0, expected: 0, ok: false, error: loaded.error })
      continue
    }
    const pack = loaded.pack
    const actual = Object.keys(pack.commands.children ?? {}).length
    const expected = pack.manifest.counts?.roots ?? 0
    rows.push({ id: entry.id, actual, expected, ok: actual === expected })
  }
  return rows
})

const failed = result.filter((row) => !row.ok)
for (const row of result) {
  console.log(`${row.ok ? '✓' : '✗'} ${row.id} ${row.actual}/${row.expected}`)
}
await app.evaluate(({ app: electronApp }) => electronApp.exit(0)).catch(() => undefined)
await app.close()
if (failed.length > 0) {
  throw new Error(`${failed.length} 个版本根命令数不一致`)
}
console.log(`✓ 全部 ${result.length} 个版本加载通过`)
