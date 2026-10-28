#!/usr/bin/env node
/** Discover supported versions from the catalog instead of maintaining a second command list. */
import { join, resolve } from 'node:path'
import { loadPackContract, readJson, verifyPack } from './lib/pack-files.mjs'

const packsDirectory = resolve(process.argv[2] ?? 'packs')
const { parsePackIndex } = await loadPackContract()
const index = parsePackIndex(await readJson(join(packsDirectory, 'index.json')))
const errors = []
for (const entry of index.packs) {
  try {
    const { manifest } = await verifyPack(join(packsDirectory, entry.id, 'manifest.json'))
    for (const key of ['id', 'gameVersion', 'dataVersion', 'packFormat', 'engine', 'aliasOf']) {
      if ((manifest[key] ?? null) !== (entry[key] ?? null)) throw new Error(`index.json: ${entry.id}.${key} 与 manifest 不一致`)
    }
    console.log(`✓ ${entry.id}${entry.aliasOf ? ` → ${entry.aliasOf}` : ''}`)
  } catch (error) {
    errors.push(`${entry.id}: ${error.message}`)
  }
}
if (errors.length) {
  for (const error of errors) console.error(`✗ ${error}`)
  process.exitCode = 1
} else {
  console.log(`✓ ${index.packs.length} packs: schemas, counts, aliases and SHA-256 verified`)
}
