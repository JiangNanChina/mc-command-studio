#!/usr/bin/env node
/**
 * 1.13.2 专用转换：mcmeta 缺少 1.13 数据，改用官方 server.jar 的 reports + client.jar 的 lang。
 * 生成后提交 packs/1.13.2，CI 不需要每次重跑 Java。
 *
 * 用法：
 *   node tools/pipeline/build-1.13.2.mjs \
 *     --reports artifacts/mcreports-1.13.2/generated/reports \
 *     --lang artifacts/client-1.13.2/assets/minecraft/lang/en_us.json
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const args = process.argv.slice(2)
const valueOf = (name, fallback) => {
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? args[index + 1] : fallback
}
const reportsDir = valueOf('reports', 'artifacts/mcreports-1.13.2/generated/reports')
const langPath = valueOf('lang', 'artifacts/client-1.13.2/assets/minecraft/lang/en_us.json')
const output = 'packs/1.13.2'

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'))
const strip = (id) => id.replace(/^minecraft:/, '')

function countTree(root) {
  let literals = 0
  const parsers = new Set()
  const visit = (node) => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'literal') literals += 1
    if (node.parser) parsers.add(node.parser)
    for (const child of Object.values(node.children ?? {})) visit(child)
  }
  for (const child of Object.values(root.children ?? {})) visit(child)
  return { roots: Object.keys(root.children ?? {}).length, literals, parsers: parsers.size }
}

function convertBlocks(report) {
  const output = {}
  for (const [id, block] of Object.entries(report)) {
    const properties = {}
    for (const [key, values] of Object.entries(block.properties ?? {})) {
      properties[key] = values
    }
    const states = Array.isArray(block.states) ? block.states : []
    for (const state of states) {
      for (const [key, value] of Object.entries(state.properties ?? {})) {
        if (!properties[key]) properties[key] = []
        if (!properties[key].includes(value)) properties[key].push(value)
      }
    }
    const defaultState = states.find((state) => state.default)?.properties ?? {}
    output[strip(id)] = [properties, defaultState]
  }
  return output
}

const main = async () => {
  const [commands, itemsReport, blocksReport, lang, baseRegistries] = await Promise.all([
    readJson(join(reportsDir, 'commands.json')),
    readJson(join(reportsDir, 'items.json')),
    readJson(join(reportsDir, 'blocks.json')),
    readJson(langPath),
    readJson('packs/1.14.4/registries.json')
  ])

  const fromLang = (prefix) =>
    Object.keys(lang)
      .filter((key) => key.startsWith(prefix))
      .map((key) => key.slice(prefix.length))
      .filter((id) => /^[a-z0-9_.-]+$/.test(id))
      .sort()

  const registries = { ...baseRegistries }
  registries.item = Object.keys(itemsReport).map(strip).sort()
  registries.block = Object.keys(blocksReport).map(strip).sort()
  registries.entity_type = fromLang('entity.minecraft.')
  registries.enchantment = fromLang('enchantment.minecraft.')
  registries.mob_effect = fromLang('effect.minecraft.')
  const particle13 = new Set([
    'ambient_entity_effect', 'angry_villager', 'barrier', 'block', 'bubble',
    'bubble_column_up', 'bubble_pop', 'cloud', 'crit', 'current_down',
    'damage_indicator', 'dolphin', 'dragon_breath', 'dripping_lava',
    'dripping_water', 'dust', 'effect', 'enchant', 'enchanted_hit', 'end_rod',
    'entity_effect', 'explosion', 'explosion_emitter', 'falling_dust',
    'firework', 'fishing', 'flame', 'happy_villager', 'heart', 'instant_effect',
    'item', 'item_slime', 'item_snowball', 'large_smoke', 'lava', 'mycelium',
    'nautilus', 'note', 'poof', 'portal', 'rain', 'smoke', 'spit', 'splash',
    'squid_ink', 'sweep_attack', 'totem_of_undying', 'underwater'
  ])
  registries.particle_type = (baseRegistries.particle_type ?? []).filter((id) =>
    particle13.has(id)
  )
  // 1.13 无属性命令；保留空表避免 UI 误选。
  registries.attribute = []

  const blocks = convertBlocks(blocksReport)
  const counts = countTree(commands)
  const itemCount = registries.item.length
  const blockCount = Object.keys(blocks).length

  const server = await readFile('artifacts/server-1.13.2.jar')
  const client = await readFile('artifacts/client-1.13.2.jar')
  const commandsBuffer = Buffer.from(JSON.stringify(commands))
  const registriesBuffer = Buffer.from(JSON.stringify(registries))
  const blocksBuffer = Buffer.from(JSON.stringify(blocks))
  const emptyComponents = Buffer.from('{}')

  await mkdir(output, { recursive: true })
  await writeFile(join(output, 'commands.json'), `${commandsBuffer.toString('utf8')}\n`)
  await writeFile(join(output, 'registries.json'), `${registriesBuffer.toString('utf8')}\n`)
  await writeFile(join(output, 'blocks.json'), `${blocksBuffer.toString('utf8')}\n`)
  await writeFile(join(output, 'item-components.json'), '{}\n')

  const manifest = {
    schemaVersion: 1,
    id: '1.13.2',
    gameVersion: '1.13.2',
    dataVersion: 1631,
    packFormat: 4,
    engine: 'nbt',
    type: 'release',
    generatedAt: new Date().toISOString(),
    sources: [
      {
        name: 'server_reports',
        url: 'https://piston-data.mojang.com/v1/objects/3737db93722a9e39eeada7c27e7aca28b144ffa7/server.jar',
        sha256: createHash('sha256').update(server).digest('hex')
      },
      {
        name: 'client_lang',
        url: 'https://piston-data.mojang.com/v1/objects/30bfe37a8db404db11c7edf02cb5165817afb4d9/client.jar',
        sha256: createHash('sha256').update(client).digest('hex')
      }
    ],
    files: {
      commands: 'commands.json',
      registries: 'registries.json',
      blocks: 'blocks.json',
      itemComponents: 'item-components.json'
    },
    counts: {
      ...counts,
      items: itemCount,
      blocks: blockCount,
      enchantments: registries.enchantment.length,
      entities: registries.entity_type.length
    }
  }
  await writeFile(join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

  const indexPath = 'packs/index.json'
  const index = await readJson(indexPath)
  const packs = index.packs.filter((entry) => entry.id !== '1.13.2')
  packs.push({
    id: '1.13.2',
    gameVersion: '1.13.2',
    dataVersion: 1631,
    packFormat: 4,
    engine: 'nbt',
    type: 'release',
    builtAt: manifest.generatedAt,
    manifest: '1.13.2/manifest.json'
  })
  index.packs = packs
  index.updatedAt = manifest.generatedAt
  await writeFile(indexPath, `${JSON.stringify(index)}\n`)
  console.log('✓ 1.13.2 pack', manifest.counts)
}

await main()
