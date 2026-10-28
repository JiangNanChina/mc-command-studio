import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { VersionPack } from '@mcstudio/core'
import { COMMAND_TEMPLATES } from './templateCatalog'
import { buildTemplateOutput, createTemplateDraft } from './templateDraft'

const cache = new Map<string, VersionPack>()
function pack(version: string): VersionPack {
  const cached = cache.get(version)
  if (cached) return cached
  const dir = join(process.cwd(), 'packs', version)
  const read = (file: string) => JSON.parse(readFileSync(join(dir, file), 'utf8'))
  const result = {
    manifest: read('manifest.json'), commands: read('commands.json'),
    registries: read('registries.json'), blocks: read('blocks.json'),
    itemComponents: read('item-components.json')
  } as VersionPack
  cache.set(version, result)
  return result
}

function output(templateId: string, version: string): string {
  return buildTemplateOutput(createTemplateDraft(templateId, pack(version)), pack(version)).text
}

describe('versioned template drafts', () => {
  for (const version of ['1.12.2', '1.20.4', '1.21.4', '26.3']) {
    it('builds all catalog entries without diagnostics for ' + version, () => {
      const data = pack(version)
      for (const template of COMMAND_TEMPLATES) {
        const draft = createTemplateDraft(template.id, data)
        const result = buildTemplateOutput(draft, data)
        expect(result.diagnostics, version + '/' + template.id).toEqual([])
        expect(result.text, version + '/' + template.id).not.toBe('')
        expect(result.text.startsWith(template.target.command + ' '), template.id).toBe(true)
      }
    })
  }

  it('uses 1.12.2 give ordering, correct legacy IDs, and numeric stored enchantments', () => {
    expect(output('nbt-head', '1.12.2')).toBe('give @p minecraft:skull 1 3 {SkullOwner:"Notch"}')
    expect(output('nbt-spawner', '1.12.2')).toContain('minecraft:mob_spawner 1 0 {BlockEntityTag:{SpawnData:{id:')
    expect(output('nbt-enchanted-book', '1.12.2')).toContain('{StoredEnchantments:[{id:16s,lvl:5s}]}')
    expect(output('entity-experience-orb', '1.12.2')).toContain('summon minecraft:xp_orb')
    expect(output('entity-evoker', '1.12.2')).toContain('summon minecraft:evocation_illager')
    expect(output('entity-evoker-fangs', '1.12.2')).toContain('summon minecraft:evocation_fangs')
    expect(output('entity-firework', '1.12.2')).toContain('summon minecraft:fireworks_rocket')
    expect(output('complex-summoned', '1.12.2')).toContain('summon minecraft:villager_golem')
    expect(output('json-sign', '1.12.2')).toContain('setblock ~ ~ ~ minecraft:standing_sign 0 replace {Text1:')
  })

  it('uses modern IDs and NBT field shapes before item components', () => {
    expect(output('nbt-spawner', '1.20.4')).toContain('give @p minecraft:spawner{BlockEntityTag:{SpawnData:{entity:')
    expect(output('nbt-head', '1.20.4')).toContain('give @p minecraft:player_head{SkullOwner:')
    expect(output('complex-banner', '1.20.4')).toContain('minecraft:white_banner{')
    expect(output('complex-potion', '1.20.4')).toContain('custom_potion_effects:[{id:"minecraft:speed"')
    expect(output('json-sign', '1.20.4')).toContain('minecraft:oak_sign{front_text:{messages:')
    expect(output('nbt-flower-pot', '1.20.4')).toBe('setblock ~ ~ ~ minecraft:potted_poppy replace')
    expect(output('entity-falling-block', '1.20.4')).toContain('BlockState:{Name:"minecraft:sand"}')
  })

  it('uses real item components and their version-specific codecs', () => {
    for (const version of ['1.21.4', '26.3']) {
      expect(output('nbt-spawner', version)).toContain('[block_entity_data={id:"minecraft:mob_spawner",SpawnData:{entity:')
      expect(output('nbt-firework', version)).toContain('[fireworks={flight_duration:2')
      expect(output('nbt-head', version)).toContain('[profile={name:"Notch"}]')
      expect(output('nbt-shield', version)).toContain('banner_patterns=[{pattern:"minecraft:creeper"')
      expect(output('complex-potion', version)).toContain('[potion_contents=')
      for (const template of COMMAND_TEMPLATES.filter((entry) => entry.target.command === 'give')) {
        expect(output(template.id, version)).not.toContain('custom_data=')
      }
    }
    expect(output('nbt-enchanted-book', '1.21.4')).toContain('stored_enchantments={levels:{sharpness:5}}')
    expect(output('nbt-enchanted-book', '26.3')).toContain('stored_enchantments={sharpness:5}')
    expect(output('complex-leather-armor', '1.21.4')).toContain('dyed_color={rgb:16711680}')
    expect(output('complex-leather-armor', '26.3')).toContain('dyed_color=16711680')
    expect(output('complex-zombie', '1.21.4')).toContain('HandItems:[{id:"minecraft:diamond_sword",count:1}')
    expect(output('complex-zombie', '26.3')).toContain('equipment:{mainhand:{id:"minecraft:diamond_sword",count:1}')
  })

  it('does not mutate draft objects and uses edited fields in output', () => {
    const data = pack('1.12.2')
    const draft = { ...createTemplateDraft('nbt-head', data), target: '@a', count: '3', data: '{SkullOwner:"Dinnerbone"}' }
    const before = structuredClone(draft)
    expect(buildTemplateOutput(draft, data).text).toBe('give @a minecraft:skull 3 3 {SkullOwner:"Dinnerbone"}')
    expect(draft).toEqual(before)
  })

  it('accepts formatted NBT without putting unescaped newlines into commands', () => {
    const data = pack('1.12.2')
    const draft = { ...createTemplateDraft('nbt-head', data), data: '{\n  SkullOwner: "Notch"\n}' }
    const result = buildTemplateOutput(draft, data)
    expect(result.diagnostics).toEqual([])
    expect(result.text).not.toContain('\n')
    expect(draft.data).toContain('\n')
  })

  it('rejects unknown templates, unsupported commands and malformed draft values', () => {
    const data = pack('1.12.2')
    expect(buildTemplateOutput(createTemplateDraft('not-a-template', data), data).diagnostics[0]?.code).toBe('template.missing')
    const noCommands = { ...data, commands: { type: 'root' as const, children: {} } }
    expect(buildTemplateOutput(createTemplateDraft('nbt-head', data), noCommands).diagnostics[0]?.code).toBe('template.unsupported')
    const give = { ...createTemplateDraft('nbt-head', data), target: '', count: '0', itemOrBlockOrEntity: 'bad item', data: '{bad:[}' }
    expect(buildTemplateOutput(give, data).diagnostics.map((item) => item.code)).toEqual(expect.arrayContaining(['template.target', 'template.count', 'template.id', 'template.nbt']))
    const block = { ...createTemplateDraft('complex-chest', data), x: '^1', legacyData: '99' }
    expect(buildTemplateOutput(block, data).diagnostics.map((item) => item.code)).toEqual(expect.arrayContaining(['template.position.legacy', 'template.block.data']))
    const json = { ...createTemplateDraft('json-title', data), data: '{"text":' }
    expect(buildTemplateOutput(json, data).diagnostics.some((item) => item.code === 'template.json')).toBe(true)
    const modern = pack('26.3')
    const duplicate = { ...createTemplateDraft('nbt-head', modern), data: 'profile={name:"a"},minecraft:profile={name:"b"}' }
    expect(buildTemplateOutput(duplicate, modern).diagnostics.some((item) => item.code === 'template.component.duplicate')).toBe(true)
    const unsupportedSelector = { ...createTemplateDraft('nbt-head', data), target: '@n' }
    expect(buildTemplateOutput(unsupportedSelector, data).diagnostics.some((item) => item.code === 'template.target.legacy')).toBe(true)
    const selfSelector = { ...createTemplateDraft('nbt-head', data), target: '@s' }
    expect(buildTemplateOutput(selfSelector, data).diagnostics).toEqual([])
    expect(buildTemplateOutput(selfSelector, data).text).toBe('give @s minecraft:skull 1 3 {SkullOwner:"Notch"}')
    const older = { ...data, manifest: { ...data.manifest, gameVersion: '1.8.9' } }
    expect(buildTemplateOutput(createTemplateDraft('nbt-head', older), older).diagnostics[0]?.code).toBe('template.version')
  })

  it('uses modern item, entity and block ids present in the selected version registry', () => {
    for (const version of ['1.20.4', '1.21.4', '26.3']) {
      const data = pack(version)
      for (const template of COMMAND_TEMPLATES) {
        const registryKey = template.target.command === 'give' ? 'item' : template.target.command === 'summon' ? 'entity_type' : template.target.command === 'setblock' ? 'block' : null
        if (!registryKey) continue
        const draft = createTemplateDraft(template.id, data)
        const id = draft.itemOrBlockOrEntity.replace(/^minecraft:/, '').split('[')[0]
        expect(data.registries[registryKey], version + '/' + template.id).toContain(id)
      }
    }
  })
})
