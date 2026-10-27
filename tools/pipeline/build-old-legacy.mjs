#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
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

async function readBlockStates(dir) {
  const result = {}
  for (const file of await readdir(dir)) {
    if (!file.endsWith('.json')) continue
    const id = file.replace(/\.json$/, '')
    const data = JSON.parse(await readFile(join(dir, file), 'utf8'))
    const keys = data.variants
      ? Object.keys(data.variants)
      : (data.multipart ?? []).flatMap((part) => {
          if (!part.when) return []
          return Array.isArray(part.when) ? part.when : [part.when]
        })
    const properties = {}
    const defaults = {}
    for (const key of keys) {
      if (typeof key !== 'string') continue
      for (const token of key.split(',')) {
        const index = token.indexOf('=')
        if (index < 0) continue
        const name = token.slice(0, index)
        const value = token.slice(index + 1)
        if (!name || !value) continue
        properties[name] ??= []
        if (!properties[name].includes(value)) properties[name].push(value)
        defaults[name] ??= value
      }
    }
    result[id] = [properties, defaults]
  }
  return result
}

const index = JSON.parse(await readFile('packs/index.json', 'utf8'))
for (const version of VERSIONS) {
  const dir = join('packs', version.id)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, 'commands.json'), `${commandsBuffer.toString('utf8')}\n`)
  const baseRegistries = JSON.parse(
    await readFile('packs/1.13.2/registries.json', 'utf8')
  )
  const assetsDir = join('artifacts', `assets-${version.id}`, 'assets', 'minecraft')
  const blockDir = join(assetsDir, 'blockstates')
  const itemDir = join(assetsDir, 'models', 'item')
  const blocks = (await readdir(blockDir)).filter((file) => file.endsWith('.json'))
  const items = (await readdir(itemDir)).filter((file) => file.endsWith('.json'))
  const registries = {
    ...baseRegistries,
    item: items.map((file) => file.replace(/\.json$/, '')).sort(),
    block: blocks.map((file) => file.replace(/\.json$/, '')).sort()
  }

  // 1.8–1.11 仍使用旧 ID：entity.Creeper.name / enchantment.damage.all / effect.moveSpeed。
  const langDir = join(assetsDir, 'lang')
  const langFiles = await readdir(langDir)
  const langFile = langFiles.find((file) => file.toLowerCase() === 'en_us.lang')
  if (langFile) {
    const lang = Object.fromEntries(
      (await readFile(join(langDir, langFile), 'utf8'))
        .split(/\r?\n/)
        .filter((line) => line.includes('='))
        .map((line) => {
          const index = line.indexOf('=')
          return [line.slice(0, index), line.slice(index + 1)]
        })
    )
    const keys = Object.keys(lang)
    registries.entity_type = keys
      .filter((key) => key.startsWith('entity.') && key.endsWith('.name'))
      .map((key) => key.slice('entity.'.length, -'.name'.length))
      .sort()
    registries.enchantment = keys
      .filter((key) => key.startsWith('enchantment.') && !key.startsWith('enchantment.level.'))
      .map((key) => key.slice('enchantment.'.length))
      .sort()
    registries.mob_effect = keys
      .filter((key) => key.startsWith('effect.') && key !== 'effect.none')
      .map((key) => key.slice('effect.'.length))
      .sort()
    if (registries.mob_effect.length === 0) {
      // 1.8 没有 effect.*，效果名在 potion.* 下。
      registries.mob_effect = keys
        .filter(
          (key) =>
            key.startsWith('potion.') &&
            !key.startsWith('potion.prefix.') &&
            !key.startsWith('potion.potency.') &&
            !key.endsWith('.postfix') &&
            !key.includes('.effects.') &&
            key !== 'potion.empty' &&
            key !== 'potion.whenDrank'
        )
        .map((key) => key.slice('potion.'.length))
        .sort()
    }
  }
  await writeFile(join(dir, 'registries.json'), `${JSON.stringify(registries)}\n`)
  await writeFile(
    join(dir, 'blocks.json'),
    `${JSON.stringify(await readBlockStates(blockDir))}\n`
  )
  await writeFile(join(dir, 'item-components.json'), '{}\n')
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
      items: items.length,
      blocks: blocks.length,
      enchantments: registries.enchantment.length,
      entities: registries.entity_type.length
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
