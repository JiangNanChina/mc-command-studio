#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const VERSIONS = [
  { id: '1.8.9', dataVersion: 47, packFormat: 1 },
  { id: '1.9.4', dataVersion: 184, packFormat: 1 },
  { id: '1.10.2', dataVersion: 512, packFormat: 1 },
  { id: '1.11.2', dataVersion: 922, packFormat: 2 }
]

const ROOTS = [
  'achievement', 'blockdata', 'clear', 'clone', 'debug', 'defaultgamemode',
  'difficulty', 'effect', 'enchant', 'entitydata', 'execute', 'fill', 'gamemode',
  'gamerule', 'give', 'help', 'kill', 'list', 'me', 'op', 'pardon', 'particle',
  'playsound', 'publish', 'replaceitem', 'save', 'say', 'scoreboard', 'seed',
  'setblock', 'setidletimeout', 'setworldspawn', 'spawnpoint', 'spreadplayers',
  'stats', 'stopsound', 'summon', 'tellraw', 'testfor', 'testforblock',
  'testforblocks', 'time', 'title', 'trigger', 'weather', 'worldborder', 'xp'
]

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
const commandsSha = createHash('sha256').update(commandsBuffer).digest('hex')

const index = JSON.parse(await readFile('packs/index.json', 'utf8'))
for (const version of VERSIONS) {
  const dir = join('packs', version.id)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, 'commands.json'), `${commandsBuffer.toString('utf8')}\n`)
  await copyFile('packs/1.13.2/registries.json', join(dir, 'registries.json'))
  await copyFile('packs/1.13.2/blocks.json', join(dir, 'blocks.json'))
  await writeFile(join(dir, 'item-components.json'), '{}\n')
  const registries = JSON.parse(await readFile(join(dir, 'registries.json'), 'utf8'))
  const blocks = JSON.parse(await readFile(join(dir, 'blocks.json'), 'utf8'))
  const manifest = {
    schemaVersion: 1,
    id: version.id,
    gameVersion: version.id,
    dataVersion: version.dataVersion,
    packFormat: version.packFormat,
    engine: 'legacy',
    type: 'release',
    generatedAt: new Date().toISOString(),
    sources: [{ name: 'legacy_static', url: 'local://legacy-command-list', sha256: commandsSha }],
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
      items: registries.item?.length ?? 0,
      blocks: Object.keys(blocks).length,
      enchantments: registries.enchantment?.length ?? 0,
      entities: registries.entity_type?.length ?? 0
    }
  }
  await writeFile(join(dir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  index.packs = index.packs.filter((pack) => pack.id !== version.id)
  index.packs.push({
    id: version.id,
    gameVersion: version.id,
    dataVersion: version.dataVersion,
    packFormat: version.packFormat,
    engine: 'legacy',
    type: 'release',
    builtAt: manifest.generatedAt,
    manifest: `${version.id}/manifest.json`
  })
  console.log(`✓ ${version.id}`)
}
index.updatedAt = new Date().toISOString()
await writeFile('packs/index.json', `${JSON.stringify(index)}\n`)
