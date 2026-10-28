import { mcId, mcName, type McCategory } from './mcAssets'

export interface LocalizedOption { value: string; label: string }

const ENUM_NAMES: Record<string, string> = {
  true: '是', false: '否', none: '不使用', all: '全部', masked: '忽略空气', filtered: '仅匹配方块',
  replace: '替换', destroy: '破坏并掉落', keep: '保留已有方块', strict: '严格放置', normal: '普通', force: '强制', move: '移动',
  give: '给予', take: '收回', grant: '授予', revoke: '撤销', test: '检测', add: '添加', set: '设置', query: '查询', get: '查询',
  remove: '移除', list: '列出', clear: '清除', reset: '重置', modify: '修改', show: '显示', hide: '隐藏',
  start: '开始', stop: '停止', play: '播放', append: '追加', prepend: '前插', merge: '合并', insert: '插入',
  entity: '实体', block: '方块', storage: '数据存储', players: '玩家', ips: 'IP 地址', default: '默认',
  survival: '生存模式', creative: '创造模式', adventure: '冒险模式', spectator: '旁观模式',
  peaceful: '和平', easy: '简单', hard: '困难', mainhand: '主手', offhand: '副手',
  structure: '结构', biome: '生物群系', poi: '兴趣点', jigsaw: '拼图结构', template: '结构模板', feature: '地物',
  clockwise_90: '顺时针旋转 90°', '180': '旋转 180°', counterclockwise_90: '逆时针旋转 90°',
  left_right: '左右镜像', front_back: '前后镜像',
  run: '执行命令', value: '指定数值', fail: '返回失败', float: '浮点数', integer: '整数',
  color: '颜色', style: '样式', team: '跟随队伍', hex: '十六进制颜色',
  points: '经验点', levels: '经验等级', name: '玩家名', id: '唯一标识',
  title: '主标题', subtitle: '副标题', actionbar: '动作栏', times: '显示时间',
  only: '仅此进度', until: '截至该进度', from: '从此进度开始', through: '沿进度树', everything: '全部进度',
  hold: '暂停自动保存', save: '保存世界', center: '中心位置', damage: '边界伤害', warning: '边界警告',
  daytime: '当日时间', gametime: '世界运行时间', day: '白天', noon: '正午', night: '夜晚', midnight: '午夜',
  rain: '下雨', thunder: '雷暴', time: '时间', weather: '天气', difficulty: '难度',
  tp: '传送', teleport: '传送', playsound: '播放声音', stopsound: '停止声音',
  ban: '封禁玩家', 'ban-ip': '封禁 IP', banlist: '封禁名单', pardon: '解除玩家封禁', 'pardon-ip': '解除 IP 封禁',
  whitelist: '白名单', op: '授予管理员', deop: '撤销管理员', kick: '踢出玩家',
  help: '命令帮助', seed: '世界种子', reload: '重新加载', 'save-all': '保存世界',
  'save-off': '暂停自动保存', 'save-on': '恢复自动保存', toggledownfall: '切换降雨',
  me: '动作消息', say: '广播消息', tell: '私聊', gamemode: '游戏模式', defaultgamemode: '默认游戏模式',
  setblock: '放置方块', fill: '填充区域', clone: '复制区域', function: '执行函数',
  'recipe-give': '给予配方', 'recipe-take': '收回配方', locate: '定位', spawnpoint: '玩家出生点',
  setworldspawn: '世界出生点', kill: '清除实体', 'debug-start': '开始调试', 'debug-stop': '停止调试',
  'objectives-add': '创建计分目标', 'objectives-remove': '删除计分目标', 'objectives-list': '列出计分目标',
  'players-set': '设置玩家分数', 'players-add': '增加玩家分数', 'players-remove': '减少玩家分数',
  runclosest: '运行最近测试', runfailed: '重试失败测试', runmultiple: '多次运行测试',
  clearall: '清除全部测试', clearthat: '清除指向测试', clearthese: '清除选中测试', verify: '验证',
  create: '创建', pos: '设置测试位置', resetclosest: '重置最近测试', resetthat: '重置指向测试',
  resetthese: '重置选中测试', restart: '重新开始',
  eyes: '眼睛', feet: '脚部', result: '返回值', success: '是否成功',
  master: '主音量', music: '音乐', record: '唱片', records: '唱片', ambient: '环境',
  voice: '语音', hostile: '敌对生物', neutral: '友好生物', player: '玩家', weather_sound: '天气',
  add_value: '加法', add_multiplied_base: '基础值乘法', add_multiplied_total: '总值乘法',
  equals: '等于', matches: '范围匹配',
  'minecraft:overworld': '主世界', 'minecraft:the_nether': '下界', 'minecraft:the_end': '末地',
  'minecraft:brewing/speed_default': '默认酿造速度', 'minecraft:brewing/uses_default': '默认酿造次数'
}

const DAMAGE_NAMES: Record<string, string> = {
  arrow: '箭矢', bad_respawn_point: '无效重生点爆炸', cactus: '仙人掌', campfire: '营火', cramming: '实体挤压',
  dragon_breath: '龙息', drown: '溺水', dry_out: '脱水', ender_pearl: '末影珍珠', explosion: '爆炸',
  fall: '摔落', falling_anvil: '掉落的铁砧', falling_block: '掉落方块', falling_stalactite: '掉落的钟乳石',
  fireball: '火球', fireworks: '烟花', fly_into_wall: '撞墙', freeze: '冰冻', generic: '通用伤害',
  generic_kill: '直接清除', hot_floor: '炽热地面', in_fire: '火焰', in_wall: '窒息', indirect_magic: '间接魔法',
  lava: '熔岩', lightning_bolt: '雷击', mace_smash: '重锤猛击', magic: '魔法', mob_attack: '生物攻击',
  mob_attack_no_aggro: '不引发仇恨的生物攻击', mob_projectile: '生物弹射物', on_fire: '持续燃烧',
  out_of_world: '虚空', outside_border: '世界边界外', player_attack: '玩家攻击', player_explosion: '玩家引发的爆炸',
  sonic_boom: '音波', spit: '唾沫', stalagmite: '石笋', starve: '饥饿', sting: '蜇伤', sweet_berry_bush: '甜浆果丛',
  thorns: '荆棘反伤', thrown: '投掷物', trident: '三叉戟', unattributed_fireball: '无归属火球',
  wind_charge: '风弹', wither: '凋零效果', wither_skull: '凋灵之首', spear: '矛',
  mob_attack_no_aggro_no_knockback: '无仇恨与击退的生物攻击'
}

const CRITERIA_NAMES: Record<string, string> = {
  dummy: '由命令控制', trigger: '玩家触发器', deathCount: '死亡次数', playerKillCount: '击杀玩家数',
  totalKillCount: '总击杀数', health: '生命值', food: '饥饿值', air: '空气值', armor: '护甲值',
  xp: '经验点', level: '经验等级', points: '总分数'
}

const COLOR_NAMES: Record<string, string> = {
  black: '黑色', dark_blue: '深蓝', dark_green: '深绿', dark_aqua: '深青', dark_red: '深红', dark_purple: '深紫',
  gold: '金色', gray: '灰色', dark_gray: '深灰', blue: '蓝色', green: '绿色', aqua: '青色', red: '红色',
  light_purple: '淡紫', yellow: '黄色', white: '白色'
}

export function builtinOptionName(value: string): string { return ENUM_NAMES[value] ?? value }

/** Used for fixed built-in enums only; unknown/custom strings are preserved. */
export function builtinOptionLabel(value: string): string {
  const name = builtinOptionName(value)
  return name === value ? value : `${name}（${value}）`
}

export function registryOptions(category: McCategory, ids: readonly string[]): LocalizedOption[] {
  return ids.map((value) => {
    const id = mcId(value)
    return { value: id, label: mcName(category, id) }
  })
}

export function damageTypeName(value: string): string {
  return DAMAGE_NAMES[value.replace(/^minecraft:/, '')] ?? value
}

export function itemSlotName(value: string): string {
  const slot = value.replace(/^slot\./, '')
  const direct: Record<string, string> = {
    'weapon.mainhand': '主手', 'weapon.offhand': '副手', 'armor.head': '头部装备', 'armor.chest': '胸部装备',
    'armor.legs': '腿部装备', 'armor.feet': '脚部装备', 'horse.saddle': '坐骑鞍', 'horse.armor': '坐骑护甲',
    'horse.chest': '坐骑箱子', 'player.cursor': '鼠标持有物品'
  }
  if (direct[slot]) return direct[slot]
  const match = /^(hotbar|inventory|container|enderchest|villager|horse|player\.crafting)\.(\d+)$/.exec(slot)
  if (!match) return value
  const group: Record<string, string> = {
    hotbar: '快捷栏', inventory: '背包', container: '容器', enderchest: '末影箱', villager: '村民背包',
    horse: '坐骑物品栏', 'player.crafting': '玩家合成栏'
  }
  return `${group[match[1]]}第 ${Number(match[2]) + 1} 格`
}

export function scoreboardCriterionName(value: string): string { return CRITERIA_NAMES[value] ?? value }

export function scoreboardSlotName(value: string): string {
  const direct: Record<string, string> = { sidebar: '屏幕侧边栏', list: '玩家列表', belowName: '玩家名字下方' }
  if (direct[value]) return direct[value]
  const match = /^sidebar\.team\.(.+)$/.exec(value)
  return match ? `${COLOR_NAMES[match[1]] ?? match[1]}队伍侧边栏` : value
}

export function namedOptions(values: readonly string[], name: (value: string) => string): LocalizedOption[] {
  return values.map((value) => ({ value, label: name(value) }))
}
