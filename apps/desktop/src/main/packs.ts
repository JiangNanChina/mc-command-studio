import { app } from 'electron'
import { createHash } from 'node:crypto'
import { readdir, readFile, stat } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import {
  PACK_FILE_KEYS,
  assertPackCounts,
  assertPackFileHashes,
  createVersionPack,
  parsePackIndex,
  parsePackManifest,
  type PackFileKey
} from '@mcstudio/core'
import type { LoadPackResult, PackSummary } from '../shared/types'

export function packsDir(): string {
  if (process.env.MCSTUDIO_PACKS_DIR) {
    return resolve(process.env.MCSTUDIO_PACKS_DIR)
  }
  if (app.isPackaged) {
    return join(process.resourcesPath, 'packs')
  }
  return resolve(app.getAppPath(), '..', '..', 'packs')
}

function isSafeId(id: string): boolean {
  return /^[0-9A-Za-z._-]+$/.test(id) && id !== '.' && id !== '..'
}

async function readJson(path: string): Promise<unknown> {
  const content = await readFile(path, 'utf8')
  try {
    return JSON.parse(content)
  } catch (error) {
    throw new Error(`${basename(path)}: JSON 格式错误：${(error as Error).message}`)
  }
}

export async function listPacks(): Promise<PackSummary[]> {
  const dir = packsDir()
  const index = await readJson(join(dir, 'index.json')).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return null
    throw error
  })
  if (index) {
    return parsePackIndex(index).packs
  }

  // 索引缺失时扫描目录，便于手动放入数据包
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const packs: PackSummary[] = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const manifestPath = join(dir, entry.name, 'manifest.json')
    const manifest = await readJson(manifestPath).then(parsePackManifest).catch(() => null)
    if (!manifest) continue
    packs.push({
      id: manifest.id,
      gameVersion: manifest.gameVersion,
      dataVersion: manifest.dataVersion,
      packFormat: manifest.packFormat,
      engine: manifest.engine,
      type: manifest.type,
      builtAt: manifest.generatedAt,
      ...(manifest.aliasOf ? { aliasOf: manifest.aliasOf } : {})
    })
  }
  return packs
}

export async function loadPack(id: string): Promise<LoadPackResult> {
  if (!isSafeId(id)) {
    return { ok: false, error: `数据包 ID 不合法：${id}` }
  }
  const dir = join(packsDir(), id)
  const manifestPath = join(dir, 'manifest.json')
  try {
    await stat(manifestPath)
  } catch {
    return {
      ok: false,
      error: `找不到数据包 ${id}`,
      hint: '请在项目根目录运行 pnpm data:build 生成数据包，或检查安装目录下的 packs 文件夹。',
      packDir: dir
    }
  }

  try {
    const manifest = parsePackManifest(await readJson(manifestPath))
    if (manifest.id !== id) throw new Error('manifest.json: id 与目录名不一致')
    let sourceDir = dir
    let sourceManifest = manifest
    if (manifest.aliasOf) {
      if (manifest.aliasOf === id) throw new Error('manifest.json: 别名不能指向自身')
      sourceDir = join(packsDir(), manifest.aliasOf)
      sourceManifest = parsePackManifest(await readJson(join(sourceDir, 'manifest.json')))
      if (sourceManifest.id !== manifest.aliasOf) throw new Error('manifest.json: 别名目标 ID 不一致')
      if (sourceManifest.aliasOf) throw new Error('manifest.json: 别名不能指向另一个别名')
      if (sourceManifest.engine !== manifest.engine) throw new Error('manifest.json: 别名引擎与基础包不一致')
    }
    const payload = {} as Record<PackFileKey, unknown>
    const hashes: Record<string, string> = {}
    await Promise.all(PACK_FILE_KEYS.map(async (key) => {
      const file = sourceManifest.files[key]
      const buffer = await readFile(join(sourceDir, file))
      hashes[key] = createHash('sha256').update(buffer).digest('hex')
      try {
        payload[key] = JSON.parse(buffer.toString('utf8'))
      } catch (error) {
        throw new Error(`${file}: JSON 格式错误：${(error as Error).message}`)
      }
    }))
    assertPackFileHashes(sourceManifest, hashes)
    assertPackFileHashes(manifest, hashes, manifest.aliasOf ? sourceManifest : undefined)
    const pack = createVersionPack({ manifest, ...payload })
    assertPackCounts(pack)
    if (manifest.aliasOf) assertPackCounts({ ...pack, manifest: sourceManifest })
    return { ok: true, pack }
  } catch (error) {
    return {
      ok: false,
      error: `数据包 ${id} 读取失败：${(error as Error).message}`,
      hint: '请重新构建损坏的数据包；开发环境的历史数据包可显式运行 node tools/pipeline/migrate-pack-metadata.mjs。',
      packDir: dir
    }
  }
}
