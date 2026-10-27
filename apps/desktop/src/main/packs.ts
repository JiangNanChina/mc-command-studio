import { app } from 'electron'
import { readdir, readFile, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type {
  BlockStates,
  CommandTree,
  ItemComponentDefaults,
  PackManifest,
  Registries
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
  return /^[0-9A-Za-z._-]+$/.test(id)
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T
}

export async function listPacks(): Promise<PackSummary[]> {
  const dir = packsDir()
  const index = await readJson<{ packs?: PackSummary[] }>(join(dir, 'index.json')).catch(() => null)
  if (index?.packs?.length) {
    return index.packs
  }

  // 索引缺失时扫描目录，便于手动放入数据包
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const packs: PackSummary[] = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const manifestPath = join(dir, entry.name, 'manifest.json')
    const manifest = await readJson<PackManifest>(manifestPath).catch(() => null)
    if (!manifest) continue
    packs.push({
      id: manifest.id,
      gameVersion: manifest.gameVersion,
      dataVersion: manifest.dataVersion,
      packFormat: manifest.packFormat,
      type: manifest.type,
      builtAt: manifest.generatedAt
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
    const manifest = await readJson<PackManifest>(manifestPath)
    let sourceDir = dir
    if (manifest.aliasOf) {
      if (!isSafeId(manifest.aliasOf)) {
        throw new Error(`别名目标不合法：${manifest.aliasOf}`)
      }
      sourceDir = join(packsDir(), manifest.aliasOf)
      const baseManifest = await readJson<PackManifest>(join(sourceDir, 'manifest.json'))
      if (baseManifest.aliasOf) throw new Error('数据包别名不能指向另一个别名')
    }
    const [commands, registries, blocks, itemComponents] = await Promise.all([
      readJson<CommandTree>(join(sourceDir, 'commands.json')),
      readJson<Registries>(join(sourceDir, 'registries.json')),
      readJson<BlockStates>(join(sourceDir, 'blocks.json')),
      readJson<ItemComponentDefaults>(join(sourceDir, 'item-components.json'))
    ])
    if (!commands?.children) throw new Error('commands.json 缺少根节点')
    if (!registries || typeof registries !== 'object') throw new Error('registries.json 格式不正确')
    if (!blocks || typeof blocks !== 'object') throw new Error('blocks.json 格式不正确')
    if (!itemComponents || typeof itemComponents !== 'object') {
      throw new Error('item-components.json 格式不正确')
    }
    return {
      ok: true,
      pack: {
        manifest,
        commands,
        registries,
        blocks: blocks as BlockStates,
        itemComponents
      }
    }
  } catch (error) {
    return {
      ok: false,
      error: `数据包 ${id} 读取失败：${(error as Error).message}`,
      hint: '可尝试删除 packs 目录后重新运行 pnpm data:build。',
      packDir: dir
    }
  }
}
