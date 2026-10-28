#!/usr/bin/env node
/** Explicitly baseline trusted historical packs. Verification/build cache hits never do this implicitly. */
import { readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { finalizePackMetadata, loadPackContract, readJson } from './lib/pack-files.mjs'

const packsDirectory = resolve(process.argv[2] ?? 'packs')
const { parsePackManifest } = await loadPackContract()
const manifests = []
for (const entry of await readdir(packsDirectory, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const path = join(packsDirectory, entry.name, 'manifest.json')
  let json
  try { json = await readJson(path) } catch (error) {
    if (error.cause?.code === 'ENOENT') continue
    throw error
  }
  manifests.push({ path, manifest: parsePackManifest(json) })
}
manifests.sort((left, right) => Number(Boolean(left.manifest.aliasOf)) - Number(Boolean(right.manifest.aliasOf)))
for (const { path, manifest } of manifests) {
  await finalizePackMetadata(path)
  console.log(`✓ ${manifest.id} ${manifest.fileHashes ? 'existing hashes verified' : 'metadata migrated'}`)
}
console.log(`✓ ${manifests.length} packs migrated/verified without downloading data`)
