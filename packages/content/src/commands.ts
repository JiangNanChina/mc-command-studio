import type { ItemComponent } from '@mcstudio/core'

export type CommandCategory = '常用' | '实体' | '世界' | '玩家' | '数据' | '系统'

export const CATEGORY_ORDER: CommandCategory[] = ['常用', '实体', '世界', '玩家', '数据', '系统']

export interface CommandMeta {
  id: string
  name: string
  description: string
  category: CommandCategory
  example?: string
  keywords?: string[]
}

/**
 * 命令中文元数据。全部为原创文案，不复制 Minecraft Wiki / CBC。
 * 未收录的命令会在界面中回退显示英文 ID。
 */
export const COMMANDS: CommandMeta[] = [
  { id: 'give', name: '给予物品', category: '常用', description: '把物品直接放进玩家背包，可附加自定义名称、描述、附魔等组件。', example: 'give @s diamond_sword[custom_name={text:"Excalibur",color:"gold",italic:false}]', keywords: ['物品', 'item'] },
  { id: 'summon', name: '召唤实体', category: '常用', description: '在指定位置生成一个实体，可用 NBT 调整生命、装备、AI 等。', example: 'summon minecraft:zombie ~ ~ ~ {NoAI:1b}', keywords: ['实体', 'mob'] },
  { id: 'setblock', name: '放置方块', category: '常用', description: '把指定坐标的方块替换为另一种方块，支持方块状态与方块实体 NBT。', example: 'setblock ~ ~ ~ minecraft:stone', keywords: ['方块', 'block'] },
  { id: 'fill', name: '填充区域', category: '常用', description: '用同一种方块填充一个长方体区域，适合快速搭建。', example: 'fill ~ ~ ~ ~5 ~5 ~5 minecraft:glass', keywords: ['区域', '建筑'] },
  { id: 'clone', name: '复制区域', category: '常用', description: '把一个区域的方块复制到另一个位置，可选过滤与移动模式。', example: 'clone ~ ~ ~ ~5 ~5 ~5 ~ ~10 ~', keywords: ['复制', '结构'] },
  { id: 'execute', name: '执行上下文', category: '常用', description: '组合 as/at/positioned/if/unless 等子命令，构造条件与执行链。', example: 'execute as @a at @s run say 你好', keywords: ['条件', '链'] },
  { id: 'tp', name: '传送', category: '常用', description: '把实体传送到坐标或另一个实体身边，可指定朝向。', example: 'tp @s 0 64 0', keywords: ['teleport', '位置'] },
  { id: 'effect', name: '状态效果', category: '常用', description: '给予或移除状态效果，可控制时长、等级与粒子。', example: 'effect give @s minecraft:speed 30 1', keywords: ['buff', '药水'] },
  { id: 'enchant', name: '附魔', category: '常用', description: '给手持物品添加附魔，等级可超过原版上限。', example: 'enchant @s minecraft:sharpness 5', keywords: ['附魔'] },
  { id: 'clear', name: '清除物品', category: '常用', description: '从玩家背包移除指定物品，可按数量与组件筛选。', example: 'clear @s minecraft:dirt', keywords: ['背包'] },
  { id: 'item', name: '物品操作', category: '常用', description: '替换、修改或复制容器/实体槽位中的物品。', example: 'item replace entity @s weapon.mainhand with minecraft:diamond_sword', keywords: ['槽位', '容器'] },
  { id: 'loot', name: '战利品', category: '常用', description: '把战利品表的结果给予玩家、放入容器或生成掉落物。', example: 'loot give @s loot minecraft:chests/simple_dungeon', keywords: ['掉落', 'loot'] },
  { id: 'particle', name: '粒子效果', category: '常用', description: '在指定位置生成粒子，可控制速度、数量与扩散范围。', example: 'particle minecraft:flame ~ ~1 ~ 0 0 0 0.1 20', keywords: ['特效'] },
  { id: 'tellraw', name: '富文本消息', category: '常用', description: '向玩家发送 JSON 文本组件，支持颜色、点击事件与悬浮提示。', example: 'tellraw @a {text:"欢迎！",color:"gold"}', keywords: ['聊天', 'json'] },
  { id: 'title', name: '屏幕标题', category: '常用', description: '显示主标题、副标题或动作栏文本。', example: 'title @a title {text:"第一章",color:"gold"}', keywords: ['title', '屏幕'] },

  { id: 'kill', name: '清除实体', category: '实体', description: '让目标实体立即死亡（掉落物规则仍然生效）。', example: 'kill @e[type=item]' },
  { id: 'damage', name: '造成伤害', category: '实体', description: '对实体造成指定类型和数值的伤害。', example: 'damage @e[type=zombie] 5 minecraft:player_attack' },
  { id: 'ride', name: '骑乘', category: '实体', description: '让实体骑乘另一个实体，或让乘客离开。', example: 'ride @s mount @e[type=armor_stand,limit=1]' },
  { id: 'rotate', name: '旋转实体', category: '实体', description: '直接设置实体的朝向（偏航与俯仰）。', example: 'rotate @s 90 0' },
  { id: 'tag', name: '实体标签', category: '实体', description: '给实体添加或移除标签，用选择器批量筛选。', example: 'tag @s add vip' },
  { id: 'team', name: '队伍', category: '实体', description: '创建队伍、设置颜色与友伤规则，并管理成员。', example: 'team add red' },
  { id: 'attribute', name: '实体属性', category: '实体', description: '查询或设置实体属性，管理加算/乘算修饰符。', example: 'attribute @s minecraft:max_health get' },
  { id: 'test', name: '游戏测试', category: '实体', description: '运行或管理内置的游戏测试实例。' },

  { id: 'time', name: '时间', category: '世界', description: '设置或推进世界时间（白天、夜晚、正午等）。', example: 'time set day' },
  { id: 'tick', name: '游戏刻控制', category: '世界', description: '冻结、加速、调速或单步执行游戏刻。', example: 'tick freeze' },
  { id: 'weather', name: '天气', category: '世界', description: '切换晴天、下雨或雷暴，并设置持续时间。', example: 'weather clear 6000' },
  { id: 'difficulty', name: '难度', category: '世界', description: '设置世界难度（和平/简单/普通/困难）。', example: 'difficulty hard' },
  { id: 'gamerule', name: '游戏规则', category: '世界', description: '开关keepInventory、doDaylightCycle等世界规则。', example: 'gamerule keepInventory true' },
  { id: 'worldborder', name: '世界边界', category: '世界', description: '设置、扩张或收缩世界边界。', example: 'worldborder set 200' },
  { id: 'spreadplayers', name: '分散玩家', category: '世界', description: '把玩家随机分散到指定圆形区域内。', example: 'spreadplayers 0 0 10 50 false @a' },
  { id: 'locate', name: '定位结构', category: '世界', description: '查找最近的结构、生物群系或兴趣点坐标。', example: 'locate structure minecraft:village_plains' },
  { id: 'forceload', name: '强制加载区块', category: '世界', description: '让指定区块保持加载，适合常驻机器。', example: 'forceload add ~ ~' },
  { id: 'place', name: '放置结构', category: '世界', description: '放置结构、拼图、地物或模板。', example: 'place structure minecraft:village_plains/houses/plains_small_house_1 ~ ~ ~' },
  { id: 'spawnpoint', name: '设置出生点', category: '世界', description: '设置单个玩家的重生点。', example: 'spawnpoint @s ~ ~ ~' },
  { id: 'setworldspawn', name: '设置世界出生点', category: '世界', description: '设置所有玩家默认的世界出生点。', example: 'setworldspawn 0 64 0' },
  { id: 'seed', name: '查看种子', category: '世界', description: '显示当前世界的种子。', example: 'seed' },

  { id: 'gamemode', name: '游戏模式', category: '玩家', description: '切换生存、创造、冒险或旁观模式。', example: 'gamemode creative @s' },
  { id: 'xp', name: '经验值', category: '玩家', description: '给予、设置或查询玩家经验值与等级。', example: 'xp add @s 100 points' },
  { id: 'experience', name: '经验值（别名）', category: '玩家', description: 'xp 命令的完整名称，用法相同。', example: 'experience add @s 100 points' },
  { id: 'playsound', name: '播放声音', category: '玩家', description: '向玩家播放指定音效，可控制音调与音量。', example: 'playsound minecraft:entity.player.levelup master @s' },
  { id: 'stopsound', name: '停止声音', category: '玩家', description: '停止玩家正在播放的音效。', example: 'stopsound @s' },
  { id: 'bossbar', name: 'BOSS 栏', category: '玩家', description: '创建、修改或删除屏幕顶部的 BOSS 血条。', example: 'bossbar add timer "倒计时"' },
  { id: 'advancement', name: '进度', category: '玩家', description: '给予或收回玩家的进度与配方。', example: 'advancement grant @s only minecraft:story/root' },
  { id: 'trigger', name: '触发器', category: '玩家', description: '让玩家触发计分板触发器，常用于菜单与商店。', example: 'trigger menu set 1' },
  { id: 'msg', name: '私聊', category: '玩家', description: '向指定玩家发送私聊消息。', example: 'msg @s 你好' },
  { id: 'me', name: '动作消息', category: '玩家', description: '以 * 玩家名 的形式广播动作。', example: 'me 正在建造' },
  { id: 'kick', name: '踢出玩家', category: '系统', description: '把玩家踢出服务器，可附原因。', example: 'kick @a 请勿刷屏' },
  { id: 'op', name: '授予管理员', category: '系统', description: '给予玩家管理员权限。', example: 'op @p' },
  { id: 'deop', name: '撤销管理员', category: '系统', description: '撤销玩家的管理员权限。', example: 'deop @p' },
  { id: 'say', name: '广播消息', category: '玩家', description: '向所有玩家发送一条服务器消息。', example: 'say 服务器将在 5 分钟后重启' },

  { id: 'scoreboard', name: '记分板', category: '数据', description: '管理目标、分数、显示位置与运算，是地图逻辑的核心。', example: 'scoreboard objectives add kills dummy "击杀数"' },
  { id: 'data', name: 'NBT 数据', category: '数据', description: '读取、修改、合并或删除方块/实体的 NBT 数据。', example: 'data get entity @s Health' },
  { id: 'datapack', name: '数据包', category: '数据', description: '列出、启用或禁用数据包。', example: 'datapack list' },
  { id: 'function', name: '函数', category: '数据', description: '运行数据包中的 .mcfunction 文件。', example: 'function namespace:path' },
  { id: 'schedule', name: '计划任务', category: '数据', description: '在指定时间后运行函数，可循环执行。', example: 'schedule function namespace:path 5s' },
  { id: 'random', name: '随机数', category: '数据', description: '生成随机数或从列表/骰子中随机取值。', example: 'random value 1..6' },
  { id: 'dialog', name: '对话框', category: '数据', description: '向玩家显示数据包中定义的对话框。' },
  { id: 'waypoint', name: '路径点', category: '数据', description: '管理玩家可见的路径点标记。' },

  { id: 'reload', name: '重载数据包', category: '系统', description: '重新加载数据包与函数。', example: 'reload' },
  { id: 'list', name: '玩家列表', category: '系统', description: '列出当前在线玩家。', example: 'list' },
  { id: 'help', name: '帮助', category: '系统', description: '查看命令列表或某条命令的用法。', example: 'help give' },
  { id: 'version', name: '版本信息', category: '系统', description: '显示服务端/客户端版本。', example: 'version' },
  { id: 'publish', name: '开放局域网', category: '系统', description: '把单人世界开放到局域网。', example: 'publish' },
  { id: 'defaultgamemode', name: '默认游戏模式', category: '系统', description: '设置新玩家加入时的默认游戏模式。', example: 'defaultgamemode survival' },
  { id: 'save-all', name: '保存世界', category: '系统', description: '立即把世界保存到磁盘。', example: 'save-all' },
  { id: 'setidletimeout', name: '挂机踢出', category: '系统', description: '设置空闲玩家被踢出的分钟数。', example: 'setidletimeout 30' },
  { id: 'perf', name: '性能分析', category: '系统', description: '启动/停止服务端性能分析。', example: 'perf start' },
  { id: 'jfr', name: 'JFR 分析', category: '系统', description: '启动/停止 Java Flight Recorder 采样。', example: 'jfr start' },
  { id: 'debug', name: '调试', category: '系统', description: '启动/停止调试采样。', example: 'debug start' }
]

export const COMMAND_MAP = new Map(COMMANDS.map((command) => [command.id, command]))

export function getCommandMeta(id: string): CommandMeta | undefined {
  return COMMAND_MAP.get(id)
}

export interface ComponentMeta {
  kind: ItemComponent['kind']
  name: string
  description: string
  example: string
}

export const ITEM_COMPONENTS: ComponentMeta[] = [
  { kind: 'custom_name', name: '自定义名称', description: '物品在快捷栏和提示框中的名字，支持颜色与斜体。', example: 'custom_name={text:"Excalibur",color:"gold",italic:false}' },
  { kind: 'item_name', name: '默认名称', description: '覆盖物品的默认名称（区别于铁砧修改的 custom_name）。', example: 'item_name={text:"Magic Sword",color:"light_purple",italic:false}' },
  { kind: 'lore', name: '描述文本', description: '物品提示框中的多行描述。', example: 'lore=[{text:"第一行",color:"gray",italic:false}]' },
  { kind: 'enchantments', name: '附魔', description: '添加生效中的附魔及等级。', example: 'enchantments={sharpness:5,knockback:2}' },
  { kind: 'unbreakable', name: '无法破坏', description: '隐藏耐久条，物品不会因使用而损坏。', example: 'unbreakable={}' },
  { kind: 'max_stack_size', name: '最大堆叠', description: '覆盖物品的最大堆叠数量（1–99）。', example: 'max_stack_size=16' },
  { kind: 'max_damage', name: '最大耐久', description: '覆盖物品的最大耐久值。', example: 'max_damage=2000' },
  { kind: 'damage', name: '已消耗耐久', description: '设置物品当前已消耗的耐久值。', example: 'damage=10' },
  { kind: 'rarity', name: '稀有度', description: '物品名称颜色与稀有度标签。', example: 'rarity=epic' },
  { kind: 'enchantment_glint_override', name: '附魔光效', description: '强制打开或关闭附魔光效。', example: 'enchantment_glint_override=true' },
  { kind: 'custom_model_data', name: '自定义模型数据', description: '供资源包判断模型/贴图用的数据，直接填写 SNBT。', example: 'custom_model_data={strings:["my_pack:model"]}' },
  { kind: 'custom_data', name: '自定义数据', description: '写入物品的 custom_data 复合标签，供数据包/模组读取。', example: 'custom_data={my_pack:{level:3}}' },
  { kind: 'raw', name: '自定义组件（raw）', description: '直接写入任意组件 id=SNBT，用于尚未收录的组件。', example: 'tooltip_display={hidden_components:["minecraft:enchantments"]}' }
]
