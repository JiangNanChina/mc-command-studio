#!/usr/bin/env node
/**
 * 1.12.2 没有 Brigadier 命令树；用静态命令表生成一个 legacy 包。
 * 该包只用于版本切换、原始命令构建与 OOC；可视化表单按 legacy 引擎禁用。
 */
import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { finalizePackMetadata } from './lib/pack-files.mjs'

const ROOTS = [
  'advancement',
  'ban',
  'ban-ip',
  'banlist',
  'blockdata',
  'clear',
  'clone',
  'debug',
  'defaultgamemode',
  'deop',
  'difficulty',
  'effect',
  'enchant',
  'entitydata',
  'execute',
  'fill',
  'function',
  'gamemode',
  'gamerule',
  'give',
  'help',
  'kick',
  'kill',
  'list',
  'locate',
  'me',
  'op',
  'pardon',
  'pardon-ip',
  'particle',
  'playsound',
  'recipe',
  'reload',
  'replaceitem',
  'save-all',
  'save-off',
  'save-on',
  'say',
  'scoreboard',
  'seed',
  'setblock',
  'setidletimeout',
  'setworldspawn',
  'spawnpoint',
  'spreadplayers',
  'stats',
  'stop',
  'stopsound',
  'summon',
  'teleport',
  'tell',
  'tellraw',
  'testfor',
  'testforblock',
  'testforblocks',
  'time',
  'title',
  'toggledownfall',
  'tp',
  'trigger',
  'weather',
  'whitelist',
  'worldborder',
  'xp'
]

const output = 'packs/1.12.2'
await mkdir(output, { recursive: true })

const children = {}
for (const root of ROOTS) {
  children[root] = {
    type: 'literal',
    children: {
      args: {
        type: 'argument',
        parser: 'brigadier:string',
        properties: { type: 'greedy' },
        executable: true
      }
    }
  }
}
const commands = { type: 'root', children }
const commandsBuffer = Buffer.from(JSON.stringify(commands))
await writeFile(join(output, 'commands.json'), `${commandsBuffer.toString('utf8')}\n`)

// 1.12 的注册表/方块表仅用于图标与选择器兜底；legacy 表单已关闭。
await copyFile('packs/1.13.2/registries.json', join(output, 'registries.json'))
await copyFile('packs/1.13.2/blocks.json', join(output, 'blocks.json'))
await writeFile(join(output, 'item-components.json'), '{}\n')

const manifest = {
  schemaVersion: 1,
  id: '1.12.2',
  gameVersion: '1.12.2',
  dataVersion: 1343,
  packFormat: 3,
  engine: 'legacy',
  type: 'release',
  generatedAt: new Date().toISOString(),
  sources: [
    {
      name: 'legacy_static',
      url: 'local://legacy-command-list',
      sha256: createHash('sha256').update(commandsBuffer).digest('hex')
    }
  ],
  files: {
    commands: 'commands.json',
    registries: 'registries.json',
    blocks: 'blocks.json',
    itemComponents: 'item-components.json'
  },
  counts: {
    roots: ROOTS.length,
    literals: 0,
    parsers: 1,
    items: JSON.parse(await readFile(join(output, 'registries.json'), 'utf8')).item.length,
    blocks: Object.keys(JSON.parse(await readFile(join(output, 'blocks.json'), 'utf8'))).length,
    enchantments: 0,
    entities: 0
  }
}
await writeFile(join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
await finalizePackMetadata(join(output, 'manifest.json'))

const indexPath = 'packs/index.json'
const index = JSON.parse(await readFile(indexPath, 'utf8'))
index.packs = index.packs.filter((pack) => pack.id !== '1.12.2')
index.packs.push({
  id: '1.12.2',
  gameVersion: '1.12.2',
  dataVersion: 1343,
  packFormat: 3,
  engine: 'legacy',
  type: 'release',
  builtAt: manifest.generatedAt,
  manifest: '1.12.2/manifest.json'
})
index.updatedAt = manifest.generatedAt
await writeFile(indexPath, `${JSON.stringify(index)}\n`)
console.log(`✓ 1.12.2 legacy pack (${ROOTS.length} roots)`)
