import type { TemplateCategory } from '@mcstudio/content'
import type { McCategory } from './mcAssets'

export type TemplateTarget =
  | { command: 'give'; item: string; modernItem?: string; rawNbt?: string; potion?: string }
  | { command: 'setblock'; block: string; modernBlock?: string; states?: Record<string, string>; nbt?: string }
  | { command: 'summon'; entity: string; nbt?: string }
  | { command: 'tellraw'; text: string }
  | { command: 'title'; text: string }

export interface CommandTemplate {
  id: string
  category: TemplateCategory
  name: string
  description: string
  iconCategory: McCategory
  iconId: string
  target: TemplateTarget
}

export const COMMAND_TEMPLATES: CommandTemplate[] = [
  { id: 'json-sign', category: 'JSON 相关', name: '告示牌', description: '编辑告示牌上的 JSON 文本。', iconCategory: 'blocks', iconId: 'oak_sign', target: { command: 'setblock', block: 'standing_sign', modernBlock: 'oak_sign', nbt: '{Text1:"{\\"text\\":\\"告示牌\\"}"}' } },
  { id: 'json-book', category: 'JSON 相关', name: '成书（命令书）', description: '从 written_book 的页面 JSON 开始编辑。', iconCategory: 'items', iconId: 'written_book', target: { command: 'give', item: 'written_book', rawNbt: '{title:"命令书",author:"MC Studio",pages:["{\\"text\\":\\"点击执行命令\\",\\"clickEvent\\":{\\"action\\":\\"run_command\\",\\"value\\":\\"/say hello\\"}}"]}' } },
  { id: 'json-tellraw', category: 'JSON 相关', name: '聊天消息（tellraw）', description: '打开富文本聊天消息编辑器。', iconCategory: 'items', iconId: 'book', target: { command: 'tellraw', text: '欢迎来到服务器！' } },
  { id: 'json-title', category: 'JSON 相关', name: '屏幕标题（title）', description: '打开主标题与副标题编辑器。', iconCategory: 'items', iconId: 'name_tag', target: { command: 'title', text: '新的冒险' } },

  { id: 'nbt-spawner', category: '特殊 NBT 物品/方块', name: '刷怪箱', description: '刷怪箱方块实体数据。', iconCategory: 'blocks', iconId: 'spawner', target: { command: 'give', item: 'mob_spawner', modernItem: 'spawner', rawNbt: '{BlockEntityTag:{SpawnData:{id:"minecraft:zombie"},Delay:20s,MinSpawnDelay:200s,MaxSpawnDelay:800s,SpawnCount:4s,MaxNearbyEntities:6s,RequiredPlayerRange:16s,SpawnRange:4s}}' } },
  { id: 'nbt-spawn-egg', category: '特殊 NBT 物品/方块', name: '刷怪蛋', description: '设置刷怪蛋生成的实体。', iconCategory: 'items', iconId: 'zombie_spawn_egg', target: { command: 'give', item: 'spawn_egg', modernItem: 'zombie_spawn_egg', rawNbt: '{EntityTag:{id:"minecraft:zombie"}}' } },
  { id: 'nbt-firework', category: '特殊 NBT 物品/方块', name: '烟花火箭', description: '配置飞行时间与爆炸效果。', iconCategory: 'items', iconId: 'firework_rocket', target: { command: 'give', item: 'fireworks', modernItem: 'firework_rocket', rawNbt: '{Fireworks:{Flight:2b,Explosions:[{Type:1b,Colors:[16711680],FadeColors:[16776960],Trail:1b,Flicker:1b}]}}' } },
  { id: 'nbt-flower-pot', category: '特殊 NBT 物品/方块', name: '花盆', description: '配置花盆中的植物方块实体。', iconCategory: 'blocks', iconId: 'flower_pot', target: { command: 'setblock', block: 'flower_pot', nbt: '{Item:"minecraft:red_flower",Data:0}' } },
  { id: 'nbt-head', category: '特殊 NBT 物品/方块', name: '头颅', description: '设置玩家头颅的拥有者。', iconCategory: 'items', iconId: 'player_head', target: { command: 'give', item: 'skull', modernItem: 'player_head', rawNbt: '{SkullOwner:"Notch"}' } },
  { id: 'nbt-shield', category: '特殊 NBT 物品/方块', name: '盾牌', description: '盾牌底色与旗帜图案。', iconCategory: 'items', iconId: 'shield', target: { command: 'give', item: 'shield', rawNbt: '{BlockEntityTag:{Base:11,Patterns:[{Pattern:"cre",Color:14}]}}' } },
  { id: 'nbt-enchanted-book', category: '特殊 NBT 物品/方块', name: '附魔书', description: '使用 StoredEnchantments 配置储存附魔。', iconCategory: 'items', iconId: 'enchanted_book', target: { command: 'give', item: 'enchanted_book', rawNbt: '{StoredEnchantments:[{id:"minecraft:sharpness",lvl:5s}]}' } },
  { id: 'nbt-end-portal', category: '特殊 NBT 物品/方块', name: '末地传送门方块', description: '在指定位置放置末地传送门方块。', iconCategory: 'blocks', iconId: 'end_portal', target: { command: 'setblock', block: 'end_portal' } },
  { id: 'nbt-hopper', category: '特殊 NBT 物品/方块', name: '漏斗', description: '编辑漏斗中的物品列表与传输状态。', iconCategory: 'blocks', iconId: 'hopper', target: { command: 'setblock', block: 'hopper', nbt: '{TransferCooldown:8,Items:[{Slot:0b,id:"minecraft:diamond",Count:1b}]}' } },
  { id: 'nbt-furnace', category: '特殊 NBT 物品/方块', name: '熔炉', description: '编辑燃烧时间、烧炼时间与输入物品。', iconCategory: 'blocks', iconId: 'furnace', target: { command: 'setblock', block: 'furnace', nbt: '{BurnTime:1600s,CookTime:100s,Items:[{Slot:0b,id:"minecraft:iron_ore",Count:1b}]}' } },
  { id: 'nbt-brewing-stand', category: '特殊 NBT 物品/方块', name: '酿造台', description: '预置酿造台燃料、时间与药水槽。', iconCategory: 'blocks', iconId: 'brewing_stand', target: { command: 'setblock', block: 'brewing_stand', nbt: '{BrewTime:400s,Fuel:20b,Items:[{Slot:0b,id:"minecraft:nether_wart",Count:1b}]}' } },

  { id: 'complex-command-block', category: '复合物品/方块', name: '命令方块', description: '设置命令、自动执行与条件模式。', iconCategory: 'blocks', iconId: 'command_block', target: { command: 'setblock', block: 'command_block', nbt: '{Command:"say hello",auto:1b,TrackOutput:0b,conditionMet:0b}' } },
  { id: 'complex-chest', category: '复合物品/方块', name: '箱子', description: '预置箱子物品栏 NBT。', iconCategory: 'blocks', iconId: 'chest', target: { command: 'setblock', block: 'chest', nbt: '{Items:[{Slot:0b,id:"minecraft:diamond",Count:1b}]}' } },
  { id: 'complex-leather-armor', category: '复合物品/方块', name: '皮革装备', description: '设置盔甲名称、颜色与属性。', iconCategory: 'items', iconId: 'leather_chestplate', target: { command: 'give', item: 'leather_chestplate', rawNbt: '{display:{Name:"{\\"text\\":\\"染色护甲\\"}",color:16711680}}' } },
  { id: 'complex-banner', category: '复合物品/方块', name: '旗帜', description: '通过图案层组合旗帜纹样。', iconCategory: 'items', iconId: 'white_banner', target: { command: 'give', item: 'banner', modernItem: 'white_banner', rawNbt: '{BlockEntityTag:{Base:15,Patterns:[{Pattern:"cre",Color:14},{Pattern:"flo",Color:4}]}}' } },
  { id: 'complex-potion', category: '复合物品/方块', name: '药水', description: '编辑药水颜色与自定义效果。', iconCategory: 'items', iconId: 'potion', target: { command: 'give', item: 'potion', rawNbt: '{Potion:"minecraft:strong_healing",CustomPotionColor:5635925,CustomPotionEffects:[{Id:1b,Amplifier:1b,Duration:1200}]}' , potion: 'minecraft:strong_healing' } },

  { id: 'entity-dropped-item', category: '特殊 NBT 实体', name: '掉落的物品', description: '召唤指定物品与数量的掉落物。', iconCategory: 'entities', iconId: 'item', target: { command: 'summon', entity: 'item', nbt: '{Item:{id:"minecraft:diamond",Count:1b,tag:{display:{Name:"{\\"text\\":\\"战利品\\"}"}}},PickupDelay:20s}' } },
  { id: 'entity-falling-block', category: '特殊 NBT 实体', name: '下落的方块', description: '召唤沙子或其他方块下落实体。', iconCategory: 'entities', iconId: 'falling_block', target: { command: 'summon', entity: 'falling_block', nbt: '{Block:"minecraft:sand",Time:1,DropItem:0b}' } },
  { id: 'entity-area-effect-cloud', category: '特殊 NBT 实体', name: '效果区域云', description: '设置持续时间、半径与药水效果。', iconCategory: 'entities', iconId: 'area_effect_cloud', target: { command: 'summon', entity: 'area_effect_cloud', nbt: '{Duration:200,Radius:3.0f,Particle:"mobspell",Color:5635925}' } },
  { id: 'entity-villager', category: '特殊 NBT 实体', name: '村民', description: '配置村民职业、等级和交易数据。', iconCategory: 'entities', iconId: 'villager', target: { command: 'summon', entity: 'villager', nbt: '{Profession:0,Career:1,CareerLevel:2,Offers:{Recipes:[]}}' } },
  { id: 'entity-armor-stand', category: '特殊 NBT 实体', name: '盔甲架', description: '设置手臂、姿势、重力与装备。', iconCategory: 'entities', iconId: 'armor_stand', target: { command: 'summon', entity: 'armor_stand', nbt: '{ShowArms:1b,NoGravity:1b,Invulnerable:1b,ArmorItems:[{},{},{},{id:"minecraft:diamond_helmet",Count:1b}]}' } },
  { id: 'entity-experience-orb', category: '特殊 NBT 实体', name: '经验球', description: '设置经验球数值。', iconCategory: 'entities', iconId: 'experience_orb', target: { command: 'summon', entity: 'xp_orb', nbt: '{Value:100s}' } },
  { id: 'entity-squid', category: '特殊 NBT 实体', name: '鱿鱼', description: '生成带指定生命值的鱿鱼。', iconCategory: 'entities', iconId: 'squid', target: { command: 'summon', entity: 'squid', nbt: '{Health:40.0f,PersistenceRequired:1b}' } },
  { id: 'entity-silverfish', category: '特殊 NBT 实体', name: '蠹虫', description: '生成不会自然消失的蠹虫。', iconCategory: 'entities', iconId: 'silverfish', target: { command: 'summon', entity: 'silverfish', nbt: '{Health:12.0f,PersistenceRequired:1b}' } },
  { id: 'entity-chicken', category: '特殊 NBT 实体', name: '鸡', description: '设置鸡的年龄与掉落状态。', iconCategory: 'entities', iconId: 'chicken', target: { command: 'summon', entity: 'chicken', nbt: '{IsChickenJockey:0b,Age:0,PersistenceRequired:1b}' } },
  { id: 'entity-rabbit', category: '特殊 NBT 实体', name: '兔子', description: '设置兔子品种与生命值。', iconCategory: 'entities', iconId: 'rabbit', target: { command: 'summon', entity: 'rabbit', nbt: '{RabbitType:99,Health:6.0f}' } },
  { id: 'entity-sheep', category: '特殊 NBT 实体', name: '羊', description: '设置羊毛颜色与剪毛状态。', iconCategory: 'entities', iconId: 'sheep', target: { command: 'summon', entity: 'sheep', nbt: '{Color:14,Sheared:0b}' } },
  { id: 'entity-creeper', category: '特殊 NBT 实体', name: '爬行者', description: '设置爆炸半径、引爆时间与闪电状态。', iconCategory: 'entities', iconId: 'creeper', target: { command: 'summon', entity: 'creeper', nbt: '{powered:1b,ExplosionRadius:6b,Fuse:30s}' } },
  { id: 'entity-evoker', category: '特殊 NBT 实体', name: '唤魔者', description: '设置唤魔者生命值与持久状态。', iconCategory: 'entities', iconId: 'evoker', target: { command: 'summon', entity: 'evoker', nbt: '{Health:24.0f,PersistenceRequired:1b}' } },
  { id: 'entity-evoker-fangs', category: '特殊 NBT 实体', name: '唤魔者的尖牙', description: '设置尖牙触发延迟与持续时间。', iconCategory: 'entities', iconId: 'evoker_fangs', target: { command: 'summon', entity: 'evoker_fangs', nbt: '{Warmup:0,LifeTicks:22}' } },
  { id: 'entity-ghast', category: '特殊 NBT 实体', name: '恶魂', description: '召唤带自定义生命值的恶魂。', iconCategory: 'entities', iconId: 'ghast', target: { command: 'summon', entity: 'ghast', nbt: '{Health:20.0f,ExplosionPower:2b}' } },
  { id: 'entity-enderman', category: '特殊 NBT 实体', name: '末影人', description: '设置末影人携带的方块。', iconCategory: 'entities', iconId: 'enderman', target: { command: 'summon', entity: 'enderman', nbt: '{carried:"minecraft:grass_block",carriedData:0}' } },
  { id: 'entity-endermite', category: '特殊 NBT 实体', name: '末影螨', description: '生成不会自然消失的末影螨。', iconCategory: 'entities', iconId: 'endermite', target: { command: 'summon', entity: 'endermite', nbt: '{Lifetime:24000,PersistenceRequired:1b}' } },
  { id: 'entity-shulker', category: '特殊 NBT 实体', name: '潜影贝', description: '设置潜影贝颜色与开合状态。', iconCategory: 'entities', iconId: 'shulker', target: { command: 'summon', entity: 'shulker', nbt: '{Color:10b,Peek:100b,PersistenceRequired:1b}' } },
  { id: 'entity-shulker-bullet', category: '特殊 NBT 实体', name: '潜影贝的子弹', description: '编辑飞行步数及可选目标数据。', iconCategory: 'entities', iconId: 'shulker_bullet', target: { command: 'summon', entity: 'shulker_bullet', nbt: '{Steps:1}' } },
  { id: 'entity-ender-dragon', category: '特殊 NBT 实体', name: '末影龙', description: '生成末影龙实体。', iconCategory: 'entities', iconId: 'ender_dragon', target: { command: 'summon', entity: 'ender_dragon', nbt: '{Health:200.0f,DragonPhase:0}' } },
  { id: 'entity-item-frame', category: '特殊 NBT 实体', name: '物品展示框', description: '设置展示框中的物品与旋转角度。', iconCategory: 'entities', iconId: 'item_frame', target: { command: 'summon', entity: 'item_frame', nbt: '{Facing:1b,Item:{id:"minecraft:map",Count:1b},ItemRotation:0b}' } },
  { id: 'entity-painting', category: '特殊 NBT 实体', name: '画', description: '设置画作图案与朝向。', iconCategory: 'entities', iconId: 'painting', target: { command: 'summon', entity: 'painting', nbt: '{Facing:1b,variant:"minecraft:kebab"}' } },
  { id: 'entity-tnt', category: '特殊 NBT 实体', name: '点燃的 TNT', description: '调整点燃 TNT 的引爆时间。', iconCategory: 'entities', iconId: 'tnt', target: { command: 'summon', entity: 'tnt', nbt: '{Fuse:40s}' } },
  { id: 'entity-firework', category: '特殊 NBT 实体', name: '烟花火箭（实体）', description: '召唤带烟花物品数据的火箭实体。', iconCategory: 'entities', iconId: 'firework_rocket', target: { command: 'summon', entity: 'firework_rocket', nbt: '{LifeTime:30,FireworksItem:{id:"minecraft:firework_rocket",Count:1b,tag:{Fireworks:{Flight:1b,Explosions:[]}}}}' } },

  { id: 'complex-zombie', category: '复合实体', name: '僵尸', description: '装备武器和盔甲的复合僵尸。', iconCategory: 'entities', iconId: 'zombie', target: { command: 'summon', entity: 'zombie', nbt: '{IsBaby:0b,CanPickUpLoot:1b,HandItems:[{id:"minecraft:diamond_sword",Count:1b},{}],ArmorItems:[{id:"minecraft:diamond_boots",Count:1b},{id:"minecraft:diamond_leggings",Count:1b},{id:"minecraft:diamond_chestplate",Count:1b},{id:"minecraft:diamond_helmet",Count:1b}]}' } },
  { id: 'complex-slime', category: '复合实体', name: '史莱姆', description: '设置尺寸、生命值与持久状态。', iconCategory: 'entities', iconId: 'slime', target: { command: 'summon', entity: 'slime', nbt: '{Size:4,Health:16.0f,PersistenceRequired:1b}' } },
  { id: 'complex-projectile', category: '复合实体', name: '弹射物', description: '生成带自定义伤害与暴击状态的箭矢。', iconCategory: 'entities', iconId: 'arrow', target: { command: 'summon', entity: 'arrow', nbt: '{damage:8.0d,Critical:1b,Pickup:0b}' } },
  { id: 'complex-mount', category: '复合实体', name: '坐骑', description: '生成已驯服并装备鞍具的马。', iconCategory: 'entities', iconId: 'horse', target: { command: 'summon', entity: 'horse', nbt: '{Tame:1b,SaddleItem:{id:"minecraft:saddle",Count:1b},ArmorItem:{id:"minecraft:iron_horse_armor",Count:1b}}' } },
  { id: 'complex-pet', category: '复合实体', name: '宠物', description: '设置坐下状态与项圈颜色；Owner 需填写真实玩家 UUID。', iconCategory: 'entities', iconId: 'wolf', target: { command: 'summon', entity: 'wolf', nbt: '{Sitting:1b,CollarColor:14b,PersistenceRequired:1b}' } },
  { id: 'complex-summoned', category: '复合实体', name: '召唤物', description: '生成由玩家创建的铁傀儡。', iconCategory: 'entities', iconId: 'iron_golem', target: { command: 'summon', entity: 'iron_golem', nbt: '{PlayerCreated:1b,Health:100.0f,PersistenceRequired:1b}' } },
  { id: 'complex-minecart', category: '复合实体', name: '矿车', description: '生成装载命令方块的矿车。', iconCategory: 'entities', iconId: 'command_block_minecart', target: { command: 'summon', entity: 'commandblock_minecart', nbt: '{Command:"say hello",CustomDisplayTile:1b,DisplayTile:"minecraft:command_block",DisplayData:0}' } }
]

export function templatesInCategory(category: TemplateCategory, query = ''): CommandTemplate[] {
  const normalized = query.trim().toLowerCase()
  return COMMAND_TEMPLATES.filter((template) => {
    if (template.category !== category) return false
    if (!normalized) return true
    return `${template.name} ${template.id} ${template.description}`.toLowerCase().includes(normalized)
  })
}
