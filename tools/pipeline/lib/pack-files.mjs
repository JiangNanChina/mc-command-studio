import { createHash, randomUUID } from 'node:crypto'
import { readFile, rename, writeFile } from 'node:fs/promises'
import { registerHooks } from 'node:module'
import { basename, dirname, join, resolve } from 'node:path'

let contractPromise

/** Node 24 strips TS natively. Limit extension resolution to the shared core module graph. */
export function loadPackContract() {
  if (!contractPromise) {
    contractPromise = (async () => {
      const coreRoot = new URL('../../../packages/core/src/', import.meta.url).href
      const hooks = registerHooks({
        resolve(specifier, context, nextResolve) {
          if (context.parentURL?.startsWith(coreRoot) && /^\.\.?\//.test(specifier) && !/\.[a-z]+$/i.test(specifier)) {
            return nextResolve(`${specifier}.ts`, context)
          }
          return nextResolve(specifier, context)
        }
      })
      try {
        return await import(new URL('pack.ts', coreRoot).href)
      } finally {
        hooks.deregister()
      }
    })()
  }
  return contractPromise
}

export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

export async function writeJsonAtomic(path, value) {
  const temporary = `${path}.${randomUUID()}.tmp`
  await writeFile(temporary, `${JSON.stringify(value)}\n`, 'utf8')
  await rename(temporary, path)
}

export async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    throw new Error(`${path}: ${error.message}`, { cause: error })
  }
}

export async function readPackFiles(directory, manifest) {
  const { PACK_FILE_KEYS } = await loadPackContract()
  const buffers = {}
  const payload = {}
  const hashes = {}
  await Promise.all(PACK_FILE_KEYS.map(async (key) => {
    const path = join(directory, manifest.files[key])
    try {
      const buffer = await readFile(path)
      buffers[key] = buffer
      hashes[key] = sha256(buffer)
      payload[key] = JSON.parse(buffer.toString('utf8'))
    } catch (error) {
      throw new Error(`${path}: ${error.message}`, { cause: error })
    }
  }))
  return { buffers, payload, hashes }
}

/** Verification is read-only and requires hashes created at build time or by explicit migration. */
export async function verifyPack(manifestPath) {
  const { parsePackManifest, createVersionPack, assertPackCounts, assertPackFileHashes } = await loadPackContract()
  const manifest = parsePackManifest(await readJson(manifestPath))
  const directory = dirname(resolve(manifestPath))
  if (manifest.id !== basename(directory)) throw new Error('manifest.json: id 与目录名不一致')
  let sourceDir = directory
  let sourceManifest = manifest
  if (manifest.aliasOf) {
    if (manifest.aliasOf === manifest.id) throw new Error('manifest.json: 别名不能指向自身')
    sourceDir = join(dirname(directory), manifest.aliasOf)
    sourceManifest = parsePackManifest(await readJson(join(sourceDir, 'manifest.json')))
    if (sourceManifest.id !== manifest.aliasOf) throw new Error('manifest.json: 别名目标 ID 不一致')
    if (sourceManifest.aliasOf) throw new Error('manifest.json: 别名不能指向另一个别名')
    if (manifest.engine !== sourceManifest.engine) throw new Error('manifest.json: 别名引擎与基础包不一致')
  }
  const { payload, hashes } = await readPackFiles(sourceDir, sourceManifest)
  assertPackFileHashes(sourceManifest, hashes)
  assertPackFileHashes(manifest, hashes, manifest.aliasOf ? sourceManifest : undefined)
  const pack = createVersionPack({ manifest, ...payload })
  assertPackCounts(pack)
  if (manifest.aliasOf) assertPackCounts({ ...pack, manifest: sourceManifest })
  return pack
}

/** Establish the initial baseline only when explicitly requested; existing hashes are never replaced. */
export async function finalizePackMetadata(manifestPath) {
  const { parsePackManifest, createVersionPack, collectPackCounts } = await loadPackContract()
  const rawManifest = await readJson(manifestPath)
  const manifest = parsePackManifest(rawManifest)
  if (manifest.fileHashes) return verifyPack(manifestPath)
  const directory = dirname(resolve(manifestPath))
  if (manifest.aliasOf) {
    const base = await verifyPack(join(dirname(directory), manifest.aliasOf, 'manifest.json'))
    const updated = {
      ...rawManifest,
      engine: base.manifest.engine,
      files: base.manifest.files,
      fileHashes: base.manifest.fileHashes,
      counts: base.manifest.counts
    }
    await writeJsonAtomic(manifestPath, updated)
    return verifyPack(manifestPath)
  }
  const { payload, hashes } = await readPackFiles(directory, manifest)
  const pack = createVersionPack({ manifest, ...payload })
  // 1.20.5/1.20.6 reports used [{type,value}], which the shared contract normalizes.
  if (Object.values(payload.itemComponents).some(Array.isArray)) {
    await writeJsonAtomic(join(directory, manifest.files.itemComponents), pack.itemComponents)
    hashes.itemComponents = sha256(await readFile(join(directory, manifest.files.itemComponents)))
  }
  await writeJsonAtomic(manifestPath, {
    ...rawManifest,
    engine: pack.manifest.engine,
    counts: collectPackCounts(pack),
    fileHashes: hashes
  })
  return verifyPack(manifestPath)
}
