#!/usr/bin/env node
/** 10 个版本特定快捷表单的能力矩阵。 */
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const ROOT = resolve('.')
const index = JSON.parse(await readFile(join(ROOT, 'packs/index.json'), 'utf8'))

const CAPABILITIES = {
  place: { roots: ['place'], children: ['structure', 'feature', 'template', 'jigsaw'] },
  transfer: { roots: ['transfer'], children: [] },
  dialog: { roots: ['dialog'], children: ['show', 'clear'] },
  waypoint: { roots: ['waypoint'], children: ['list'] },
  test: { roots: ['test'], children: ['run', 'clearall'] },
  stopwatch: { roots: ['stopwatch'], children: ['create', 'query', 'remove', 'restart'] },
  swing: { roots: ['swing'], children: ['targets'] },
  fetchprofile: { roots: ['fetchprofile'], children: ['name', 'id', 'entity'] },
  compute: { roots: ['compute'], children: ['block', 'default', 'entity'] },
  posteffect: { roots: ['posteffect'], children: ['add', 'clear', 'list', 'remove'] }
}

const rows = []
for (const pack of index.packs.filter((entry) => !entry.aliasOf)) {
  const commands = JSON.parse(
    await readFile(join(ROOT, 'packs', pack.id, 'commands.json'), 'utf8')
  )
  const available = {}
  for (const [form, requirement] of Object.entries(CAPABILITIES)) {
    const root = commands.children?.[requirement.roots[0]]
    const children = Object.keys(root?.children ?? {})
    const missing = requirement.children.filter((child) => !children.includes(child))
    available[form] = Boolean(root) && missing.length === 0
  }
  rows.push({ version: pack.id, available })
}

const forms = Object.keys(CAPABILITIES)
console.log(`版本\\能力  ${forms.join(' ')}`)
for (const row of rows) {
  console.log(
    `${row.version.padEnd(8)} ${forms.map((form) => (row.available[form] ? ' ✓ ' : ' - ')).join(' ')}`
  )
}

for (const form of forms) {
  const list = rows.filter((row) => row.available[form]).map((row) => row.version)
  console.log(`${form}: ${list.length ? list.join(', ') : '无'}`)
}
