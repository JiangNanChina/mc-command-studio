import {
  buildLegacyGive,
  compareVersions,
  containsControlCharacters,
  error,
  isBalancedCompound,
  isValidResourceLocation,
  resourceId,
  serializePosition,
  serializeTextComponent,
  snbtString,
  type BuildResult,
  type Diagnostic,
  type VersionPack
} from '@mcstudio/core'
import { COMMAND_TEMPLATES, type CommandTemplate } from './templateCatalog'

/** Each catalog entry owns its draft; it never overwrites a normal command form. */
export interface TemplateDraft {
  templateId: string
  target: string
  count: string
  x: string
  y: string
  z: string
  data: string
  itemOrBlockOrEntity: string
  legacyData: string
}

function isLegacy(pack: VersionPack): boolean {
  return pack.manifest.engine === 'legacy'
}

function modernStack(item: string, gameVersion: string): string {
  return '{id:' + snbtString(resourceId(item)) + ',' + (compareVersions(gameVersion, '1.20.5') >= 0 ? 'count:1' : 'Count:1b') + '}'
}

function blockItems(item: string, gameVersion: string): string {
  return '{Items:[{Slot:0b,' + modernStack(item, gameVersion).slice(1) + ']}'
}

function textData(text: string, gameVersion: string): string {
  return serializeTextComponent({ text, italic: false }, undefined, gameVersion)
}

function itemSeed(template: CommandTemplate, pack: VersionPack): Pick<TemplateDraft, 'data' | 'itemOrBlockOrEntity' | 'legacyData'> {
  if (template.target.command !== 'give') throw new Error('Expected an item template')
  const version = pack.manifest.gameVersion
  const legacy = isLegacy(pack)
  const components = pack.manifest.engine === 'components'
  const after1215 = compareVersions(version, '1.21.5') >= 0
  const result = {
    itemOrBlockOrEntity: resourceId(legacy ? template.target.item : template.target.modernItem ?? template.target.item),
    legacyData: '0',
    data: ''
  }
  switch (template.id) {
    case 'json-book': {
      const page = JSON.stringify({ text: '点击执行命令', clickEvent: { action: 'run_command', value: '/say hello' } })
      result.data = components
        ? 'written_book_content={title:"命令书",author:"MC Studio",pages:[' + (after1215 ? '{text:"点击执行命令",click_event:{action:"run_command",command:"/say hello"}}' : snbtString(page)) + ']}'
        : '{title:"命令书",author:"MC Studio",pages:[' + snbtString(page) + ']}'
      break
    }
    case 'nbt-spawner': {
      const entity = '{id:"minecraft:zombie"}'
      const spawn = compareVersions(version, '1.18') >= 0 ? '{entity:' + entity + '}' : entity
      const values = 'SpawnData:' + spawn + ',Delay:20s,MinSpawnDelay:200s,MaxSpawnDelay:800s,SpawnCount:4s,MaxNearbyEntities:6s,RequiredPlayerRange:16s,SpawnRange:4s'
      result.data = components ? 'block_entity_data={id:"minecraft:mob_spawner",' + values + '}' : '{BlockEntityTag:{' + values + '}}'
      break
    }
    case 'nbt-spawn-egg':
      result.data = components ? 'entity_data={id:"minecraft:zombie",NoAI:1b}' : '{EntityTag:{id:"minecraft:zombie",NoAI:1b}}'
      break
    case 'nbt-firework':
      result.data = components
        ? 'fireworks={flight_duration:2,explosions:[{shape:"large_ball",colors:[I;16711680],fade_colors:[I;16776960],has_trail:true,has_twinkle:true}]}'
        : '{Fireworks:{Flight:2b,Explosions:[{Type:1b,Colors:[I;16711680],FadeColors:[I;16776960],Trail:1b,Flicker:1b}]}}'
      break
    case 'nbt-head':
      result.legacyData = legacy ? '3' : '0'
      result.data = components ? 'profile={name:"Notch"}' : '{SkullOwner:"Notch"}'
      break
    case 'nbt-shield':
      result.data = components
        ? 'base_color="blue",banner_patterns=[{pattern:"minecraft:creeper",color:"red"}]'
        : '{BlockEntityTag:{Base:11,Patterns:[{Pattern:"cre",Color:14}]}}'
      break
    case 'nbt-enchanted-book':
      result.data = components
        ? 'stored_enchantments=' + (after1215 ? '{sharpness:5}' : '{levels:{sharpness:5}}')
        : '{StoredEnchantments:[{id:' + (legacy ? '16s' : '"minecraft:sharpness"') + ',lvl:5s}]}'
      break
    case 'complex-leather-armor':
      result.data = components
        ? 'dyed_color=' + (after1215 ? '16711680' : '{rgb:16711680}') + ',custom_name=' + textData('染色护甲', version)
        : '{display:{Name:' + snbtString(legacy ? '染色护甲' : JSON.stringify({ text: '染色护甲' })) + ',color:16711680}}'
      break
    case 'complex-banner':
      result.legacyData = legacy ? '15' : '0'
      result.data = components
        ? 'banner_patterns=[{pattern:"minecraft:creeper",color:"red"},{pattern:"minecraft:flower",color:"yellow"}]'
        : '{BlockEntityTag:{Patterns:[{Pattern:"cre",Color:14},{Pattern:"flo",Color:4}]}}'
      break
    case 'complex-potion':
      result.data = components
        ? 'potion_contents={potion:"minecraft:strong_healing",custom_color:5635925,custom_effects:[{id:"minecraft:speed",amplifier:1,duration:1200}]}'
        : compareVersions(version, '1.20.2') >= 0
          ? '{Potion:"minecraft:strong_healing",CustomPotionColor:5635925,custom_potion_effects:[{id:"minecraft:speed",amplifier:1,duration:1200}]}'
          : '{Potion:"minecraft:strong_healing",CustomPotionColor:5635925,CustomPotionEffects:[{Id:1b,Amplifier:1b,Duration:1200}]}'
      break
  }
  return result
}

function blockSeed(template: CommandTemplate, pack: VersionPack): Pick<TemplateDraft, 'data' | 'itemOrBlockOrEntity' | 'legacyData'> {
  if (template.target.command !== 'setblock') throw new Error('Expected a block template')
  const legacy = isLegacy(pack)
  const version = pack.manifest.gameVersion
  const result = {
    itemOrBlockOrEntity: resourceId(legacy ? template.target.block : template.target.modernBlock ?? template.target.block),
    legacyData: '0',
    data: template.target.nbt ?? ''
  }
  switch (template.id) {
    case 'json-sign': {
      if (!legacy) result.itemOrBlockOrEntity = compareVersions(version, '1.14') >= 0 ? 'minecraft:oak_sign' : 'minecraft:sign'
      const text = textData('告示牌', version)
      const empty = textData('', version)
      result.data = compareVersions(version, '1.20') >= 0
        ? '{front_text:{messages:[' + text + ',' + empty + ',' + empty + ',' + empty + ']}}'
        : '{Text1:' + text + ',Text2:' + empty + ',Text3:' + empty + ',Text4:' + empty + '}'
      break
    }
    case 'nbt-flower-pot':
      result.itemOrBlockOrEntity = legacy ? 'minecraft:flower_pot' : 'minecraft:potted_poppy'
      result.data = legacy ? '{Item:"minecraft:red_flower",Data:0}' : ''
      break
    case 'nbt-end-portal':
    case 'nbt-end-portal-frame':
      result.itemOrBlockOrEntity = 'minecraft:end_portal'
      result.data = ''
      break
    case 'nbt-hopper':
      result.data = blockItems('diamond', version)
      break
    case 'nbt-furnace':
      result.data = blockItems('iron_ore', version)
      break
    case 'nbt-brewing-stand':
      result.data = '{Items:[{Slot:3b,' + modernStack('nether_wart', version).slice(1) + ']}'
      break
    case 'complex-chest':
      result.data = blockItems('diamond', version)
      break
    case 'complex-command-block':
      result.data = '{Command:"say hello",auto:1b,TrackOutput:0b}'
      break
  }
  return result
}

function entitySeed(template: CommandTemplate, pack: VersionPack): Pick<TemplateDraft, 'data' | 'itemOrBlockOrEntity' | 'legacyData'> {
  if (template.target.command !== 'summon') throw new Error('Expected an entity template')
  const legacy = isLegacy(pack)
  const version = pack.manifest.gameVersion
  const after1215 = compareVersions(version, '1.21.5') >= 0
  const aliases: Record<string, string> = legacy
    ? { experience_orb: 'xp_orb', evoker: 'evocation_illager', evoker_fangs: 'evocation_fangs', firework_rocket: 'fireworks_rocket', iron_golem: 'villager_golem', command_block_minecart: 'commandblock_minecart' }
    : { xp_orb: 'experience_orb', commandblock_minecart: 'command_block_minecart' }
  const sourceId = template.target.entity.replace(/^minecraft:/, '')
  const result = { itemOrBlockOrEntity: resourceId(aliases[sourceId] ?? sourceId), legacyData: '0', data: template.target.nbt ?? '' }
  const sword = modernStack('diamond_sword', version)
  const helmet = modernStack('diamond_helmet', version)
  switch (template.id) {
    case 'entity-dropped-item':
      result.data = '{Item:' + modernStack('diamond', version) + ',PickupDelay:20s}'
      break
    case 'entity-falling-block':
      result.data = legacy ? '{Block:"minecraft:sand",Data:0,Time:1,DropItem:0b}' : '{BlockState:{Name:"minecraft:sand"},Time:1,DropItem:0b}'
      break
    case 'entity-area-effect-cloud':
      result.data = '{Duration:200,Radius:3.0f}'
      break
    case 'entity-villager':
      result.data = compareVersions(version, '1.14') >= 0
        ? '{VillagerData:{profession:"minecraft:farmer",level:2,type:"minecraft:plains"},Offers:{Recipes:[]}}'
        : '{Profession:0,Career:1,CareerLevel:2,Offers:{Recipes:[]}}'
      break
    case 'entity-armor-stand':
      result.data = '{ShowArms:1b,NoGravity:1b,Invulnerable:1b,' + (after1215 ? 'equipment:{head:' + helmet + '}' : 'ArmorItems:[{},{},{},' + helmet + ']') + '}'
      break
    case 'entity-experience-orb':
      result.itemOrBlockOrEntity = legacy ? 'minecraft:xp_orb' : 'minecraft:experience_orb'
      result.data = '{Value:100s}'
      break
    case 'entity-enderman':
      result.data = legacy ? '{carried:"minecraft:grass",carriedData:0s}' : '{carriedBlockState:{Name:"minecraft:grass_block"}}'
      break
    case 'entity-shulker-bullet':
      // No fake all-zero UUID: the target is optional and can be supplied by the user.
      result.data = '{Steps:1}'
      break
    case 'entity-evoker-fangs':
      result.data = '{Warmup:0}'
      break
    case 'entity-painting':
      result.data = compareVersions(version, '1.19') >= 0 ? '{variant:"minecraft:kebab",Facing:2b}' : '{Motive:"Kebab",Facing:2b}'
      break
    case 'entity-item-frame':
      result.data = '{Facing:2b,Item:' + modernStack('map', version) + ',ItemRotation:0b}'
      break
    case 'entity-tnt':
      result.data = compareVersions(version, '1.20.2') >= 0 ? '{fuse:40s}' : '{Fuse:40s}'
      break
    case 'entity-firework': {
      const item = legacy ? 'fireworks' : 'firework_rocket'
      const stack = modernStack(item, version)
      const content = compareVersions(version, '1.20.5') >= 0
        ? ',components:{"minecraft:fireworks":{flight_duration:1,explosions:[]}}'
        : ',tag:{Fireworks:{Flight:1b,Explosions:[]}}'
      result.data = '{LifeTime:30,FireworksItem:' + stack.slice(0, -1) + content + '}}'
      break
    }
    case 'complex-zombie':
      result.data = '{IsBaby:0b,CanPickUpLoot:1b,' + (after1215 ? 'equipment:{mainhand:' + sword + ',head:' + helmet + '}' : 'HandItems:[' + sword + ',{}],ArmorItems:[{},{},{},' + helmet + ']') + '}'
      break
    case 'complex-projectile':
      result.data = '{damage:8.0d,crit:1b,pickup:0b}'
      break
    case 'complex-mount':
      result.data = after1215
        ? '{Tame:1b,equipment:{saddle:' + modernStack('saddle', version) + ',body:' + modernStack('iron_horse_armor', version) + '}}'
        : '{Tame:1b,SaddleItem:' + modernStack('saddle', version) + ',' + (compareVersions(version, '1.20.5') >= 0 ? 'body_armor_item' : 'ArmorItem') + ':' + modernStack('iron_horse_armor', version) + '}'
      break
    case 'complex-pet':
      // Owner UUID is deliberately absent: a zero UUID is not a usable player owner.
      result.data = '{Sitting:1b,CollarColor:14b,PersistenceRequired:1b}'
      break
    case 'complex-minecart':
      result.data = '{Command:"say hello"}'
      break
  }
  return result
}

export function createTemplateDraft(templateId: string, pack: VersionPack): TemplateDraft {
  const template = COMMAND_TEMPLATES.find((entry) => entry.id === templateId)
  const defaults: TemplateDraft = {
    templateId, target: '@p', count: '1', x: '~', y: '~', z: '~',
    data: '', itemOrBlockOrEntity: '', legacyData: '0'
  }
  if (!template) return defaults
  if (template.target.command === 'give') return { ...defaults, ...itemSeed(template, pack) }
  if (template.target.command === 'setblock') return { ...defaults, ...blockSeed(template, pack) }
  if (template.target.command === 'summon') return { ...defaults, ...entitySeed(template, pack) }
  return { ...defaults, target: '@a', data: JSON.stringify({ text: template.target.text }) }
}

function checkTarget(target: string, diagnostics: Diagnostic[], pack: VersionPack): void {
  if (!target.trim() || /[\r\n\u0000-\u001f]/.test(target)) {
    diagnostics.push(error('template.target', '目标不能为空，也不能包含换行或控制字符', 'target'))
  } else if (!/^@[paresn](?:\[.*\])?$/.test(target.trim()) && !/^[A-Za-z0-9_]{1,16}$/.test(target.trim())) {
    diagnostics.push(error('template.target', '请输入玩家名或完整目标选择器，例如 @p 或 @a[tag=builder]', 'target'))
  }
  if (isLegacy(pack) && /^@n(?:\[|$)/.test(target.trim())) {
    diagnostics.push(error('template.target.legacy', '此版本尚未支持 @n，请改用 @p、@a、@r、@e、@s 或玩家名', 'target'))
  }
  if (compareVersions(pack.manifest.gameVersion, '1.21') < 0 && /^@n(?:\[|$)/.test(target.trim()) && !isLegacy(pack)) {
    diagnostics.push(error('template.target.version', '此版本尚未支持 @n，请改用 @e[sort=nearest,limit=1]', 'target'))
  }
}

function checkCompound(data: string, diagnostics: Diagnostic[]): void {
  if (data.trim() && !isBalancedCompound(data)) {
    diagnostics.push(error('template.nbt', 'NBT 必须是括号完整且字符串闭合的 {…} 复合标签', 'data'))
  }
}

/** Split only top-level commas; strings and nested SNBT remain intact. */
function splitComponents(data: string): string[] {
  const result: string[] = []
  let quote = ''
  let depth = 0
  let start = 0
  for (let i = 0; i < data.length; i += 1) {
    const char = data[i]
    if (quote) {
      if (char === '\\') i += 1
      else if (char === quote) quote = ''
    } else if (char === '"' || char === "'") quote = char
    else if (char === '{' || char === '[') depth += 1
    else if (char === '}' || char === ']') depth -= 1
    else if (char === ',' && depth === 0) {
      result.push(data.slice(start, i).trim())
      start = i + 1
    }
  }
  result.push(data.slice(start).trim())
  return result
}

function checkComponents(data: string, diagnostics: Diagnostic[]): void {
  if (!data) return
  if (!isBalancedCompound('{components:[' + data + ']}')) {
    diagnostics.push(error('template.components', '组件的括号或字符串未闭合', 'data'))
    return
  }
  const seen = new Set<string>()
  for (const component of splitComponents(data)) {
    const separator = component.indexOf('=')
    const id = separator > 0 ? component.slice(0, separator).trim() : ''
    if (!isValidResourceLocation(id) || !component.slice(separator + 1).trim()) {
      diagnostics.push(error('template.component', '每个组件必须写作 组件ID=值，并以逗号分隔', 'data'))
      continue
    }
    const normalized = resourceId(id)
    if (seen.has(normalized)) diagnostics.push(error('template.component.duplicate', '组件 ' + normalized + ' 重复', 'data'))
    seen.add(normalized)
  }
}

/** Allow formatted SNBT/JSON in the editor while keeping generated commands on one line. */
function singleLineData(value: string): string {
  let result = ''
  let quote = ''
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i]
    if (quote) {
      result += char
      if (char === '\\') result += value[++i] ?? ''
      else if (char === quote) quote = ''
    } else if (char === '"' || char === "'") {
      quote = char
      result += char
    } else result += /[\r\n\t]/.test(char) ? ' ' : char
  }
  return result.trim()
}

export function buildTemplateOutput(draft: TemplateDraft, pack: VersionPack): BuildResult {
  const template = COMMAND_TEMPLATES.find((entry) => entry.id === draft.templateId)
  if (!template) return { text: '', diagnostics: [error('template.missing', '找不到模板，请从分类中重新选择', 'templateId')] }
  if (compareVersions(pack.manifest.gameVersion, '1.12') < 0) {
    return { text: '', diagnostics: [error('template.version', '这些起始模板支持 1.12.2 及更新版本，请切换版本；更早版本仍可使用基础命令和旧版工具', 'templateId')] }
  }
  const command = template.target.command
  const diagnostics: Diagnostic[] = []
  if (!pack.commands.children?.[command]) {
    return { text: '', diagnostics: [error('template.unsupported', '当前版本不支持 ' + command + ' 命令，请切换版本', 'templateId')] }
  }
  const data = singleLineData(draft.data)
  const id = resourceId(draft.itemOrBlockOrEntity)
  const legacy = isLegacy(pack)
  let text = ''
  if (command === 'tellraw' || command === 'title') {
    checkTarget(draft.target, diagnostics, pack)
    try {
      const json: unknown = JSON.parse(data)
      if (json === null || (typeof json !== 'string' && typeof json !== 'object')) throw new Error()
    } catch {
      diagnostics.push(error('template.json', '请输入有效的 JSON 文本组件，例如 {"text":"你好"}', 'data'))
    }
    text = command + ' ' + draft.target.trim() + (command === 'title' ? ' title ' : ' ') + data
  } else {
    const baseId = id.split('[')[0]
    if (!isValidResourceLocation(baseId) || (command !== 'setblock' && id.includes('['))) {
      diagnostics.push(error('template.id', '物品、方块或实体 ID 不合法', 'itemOrBlockOrEntity'))
    }
    if (command === 'give') {
      checkTarget(draft.target, diagnostics, pack)
      if (!/^\d+$/.test(draft.count.trim()) || Number(draft.count) < 1 || Number(draft.count) > 99) {
        diagnostics.push(error('template.count', '数量必须是 1–99 的整数', 'count'))
      }
      if (pack.manifest.engine === 'components') {
        checkComponents(data, diagnostics)
        text = 'give ' + draft.target.trim() + ' ' + id + (data ? '[' + data + ']' : '') + ' ' + draft.count.trim()
      } else if (legacy) {
        checkCompound(data, diagnostics)
        const result = buildLegacyGive({ target: draft.target, item: id, count: draft.count, data: draft.legacyData, nbt: data })
        diagnostics.push(...result.diagnostics)
        text = result.text
      } else {
        checkCompound(data, diagnostics)
        text = 'give ' + draft.target.trim() + ' ' + id + data + ' ' + draft.count.trim()
      }
    } else {
      const position = serializePosition({ x: draft.x, y: draft.y, z: draft.z })
      diagnostics.push(...position.diagnostics)
      if (legacy && [draft.x, draft.y, draft.z].some((value) => value.trim().startsWith('^'))) {
        diagnostics.push(error('template.position.legacy', '此旧版本不支持 ^ 局部坐标，请使用数值或 ~ 坐标', 'x'))
      }
      checkCompound(data, diagnostics)
      if (command === 'setblock') {
        if (legacy && (!/^\d+$/.test(draft.legacyData.trim()) || Number(draft.legacyData) > 15)) {
          diagnostics.push(error('template.block.data', '旧版方块数据值必须为 0–15 的整数', 'legacyData'))
        }
        if (legacy && id.includes('[')) diagnostics.push(error('template.block.state', '旧版本请使用数据值设置方块状态', 'itemOrBlockOrEntity'))
        if (!legacy && id.includes('[') && !/^[a-z0-9_.:/-]+\[(?:[a-z0-9_]+=[a-z0-9_]+)(?:,[a-z0-9_]+=[a-z0-9_]+)*\]$/.test(id)) {
          diagnostics.push(error('template.block.state', '方块状态应为 [属性=值,属性=值]', 'itemOrBlockOrEntity'))
        }
        text = legacy
          ? 'setblock ' + position.text + ' ' + id + ' ' + draft.legacyData.trim() + ' replace' + (data ? ' ' + data : '')
          : 'setblock ' + position.text + ' ' + id + data + ' replace'
      } else text = 'summon ' + id + ' ' + position.text + (data ? ' ' + data : '')
    }
  }
  if (/[\r\n]/.test(text) || containsControlCharacters(text)) diagnostics.push(error('template.control', '命令不能包含未转义的换行或控制字符', 'data'))
  if (text.length > 32500) diagnostics.push(error('template.length', '命令超过 32,500 字符，请减少模板数据', 'data'))
  return { text, diagnostics }
}
