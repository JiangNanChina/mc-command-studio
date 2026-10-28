import { COMMAND_MAP } from '@mcstudio/content'
import { builtinOptionName } from './localizedOptions'
import { gameruleLabel } from './gameruleLabels'

const ROOT_NAMES: Record<string, string> = {
  blockdata: '修改方块数据', entitydata: '修改实体数据', replaceitem: '替换槽位物品',
  testfor: '检测实体', testforblock: '检测方块', testforblocks: '比较区域方块',
  stats: '命令执行统计', toggledownfall: '切换降雨', teleport: '传送', tell: '私聊', w: '私聊',
  tm: '队伍消息', teammsg: '队伍消息', fetchprofile: '查询玩家档案', compute: '计算',
  posteffect: '屏幕后期效果', stopwatch: '秒表', swing: '挥动手臂',
  unpublish: '关闭局域网共享', version: '查看版本',
  ban: '封禁玩家', 'ban-ip': '封禁 IP', banlist: '查看封禁名单', pardon: '解除玩家封禁',
  'pardon-ip': '解除 IP 封禁', 'save-off': '暂停自动保存', 'save-on': '恢复自动保存', stop: '关闭服务器',
  fillbiome: '填充生物群系', return: '返回执行结果', spectate: '旁观实体', transfer: '转移服务器',
  recipe: '配方管理', whitelist: '白名单'
}

const ARGUMENT_NAMES: Record<string, string> = {
  action: '操作', advancement: '进度', allowCommands: '允许命令', allowed: '是否允许',
  amount: '数量 / 数值', amplifier: '效果等级', anchor: '定位基准', angle: '角度', animation: '动画',
  args: '参数', arguments: '参数', attribute: '属性', axes: '坐标轴', begin: '起点坐标', biome: '生物群系',
  block: '方块', cause: '伤害来源', center: '中心位置', clock: '时钟', color: '颜色', command: '命令',
  computePos: '计算位置', computeTarget: '计算目标', contents: '内容', count: '数量', criteria: '统计规则',
  criterion: '统计规则', damagePerBlock: '每格伤害', damageType: '伤害类型', delta: '偏移范围',
  depth: '深度', description: '说明', destination: '目的地', dialog: '对话框', dimension: '维度',
  displayName: '显示名称', distance: '距离', duration: '持续时间', effect: '状态效果', enchantment: '附魔',
  end: '终点坐标', entities: '目标实体', entity: '目标实体', existing: '现有条目',
  facingAnchor: '朝向基准', facingEntity: '面向实体', facingLocation: '面向位置',
  fadeIn: '淡入时间', fadeOut: '淡出时间', feature: '地物', filter: '过滤条件', from: '来源',
  function: '函数', gamemode: '游戏模式', height: '高度', heightmap: '高度图', hideParticles: '隐藏粒子',
  hostname: '服务器地址', id: '资源标识', includeSequenceId: '包含序列标识', includeWorldSeed: '包含世界种子',
  index: '索引', integrity: '完整度', item: '物品', item_predicate: '物品匹配条件', level: '等级',
  location: '位置', loot_table: '战利品表', max: '最大值', maxCount: '最大数量', maxHeight: '最高高度',
  maxRange: '最大范围', max_depth: '最大深度', members: '成员', message: '消息内容', minVolume: '最小音量',
  minutes: '分钟', mirror: '镜像方式', modifier: '修饰器', name: '名称', nbt: '标签数据',
  numberOfTimes: '运行次数', objective: '计分目标', onlyRequiredTests: '仅必需测试', operation: '运算方式',
  path: '数据路径', pitch: '俯仰角 / 音调', player: '玩家', players: '玩家', poi: '兴趣点', pool: '模板池',
  port: '端口', pos: '位置', position: '位置', posteffect: '后期效果', predicate: '判定条件',
  prefix: '前缀', provider: '数据来源', radius: '半径', range: '范围', rate: '速率', reason: '原因',
  recipe: '配方', respectTeams: '按队伍分组', rot: '旋转角度', rotation: '旋转方式', rotationSteps: '旋转步数',
  scale: '倍率', score: '分数', seconds: '秒数', seed: '种子', sequence: '随机序列',
  slot: '物品槽位', slots: '物品槽位', sound: '声音', source: '来源', sourceDimension: '来源维度',
  sourceObjective: '来源计分目标', sourcePath: '来源数据路径', sourcePos: '来源位置', sourceSlot: '来源槽位',
  sourceSlots: '来源槽位', speed: '速度', spreadDistance: '最小间距', start: '起始值', stay: '停留时间',
  structure: '结构', style: '样式', suffix: '后缀', target: '目标', targetDimension: '目标维度',
  targetObjective: '目标计分目标', targetPath: '目标数据路径', targetPos: '目标位置', targets: '目标',
  team: '队伍', template: '结构模板', tests: '测试集', testsPerRow: '每行测试数', time: '时间',
  timeline: '时间线', timemarker: '时间标记', title: '标题', to: '目标位置', tool: '工具',
  untilFailed: '运行至失败', uuid: '唯一标识', value: '数值', var: '变量', vehicle: '坐骑',
  viewers: '可见玩家', visible: '是否可见', volume: '音量', waypoint: '路径点', width: '宽度'
}

const LITERAL_NAMES: Record<string, string> = {
  as: '以实体身份', at: '在实体位置', positioned: '设置执行位置', rotated: '设置执行朝向',
  facing: '面向', align: '对齐坐标轴', anchored: '设置定位基准', in: '切换维度',
  if: '条件满足时', unless: '条件不满足时', store: '存储结果', on: '关联实体', summon: '召唤实体',
  base: '基础值', modifier: '属性修饰器', objectives: '计分目标', operation: '分数运算',
  display: '显示设置', enable: '启用', disable: '禁用', enabled: '已启用', available: '可用',
  reload: '重新加载', status: '状态', overwrite: '覆盖', before: '之前', after: '之后',
  freeze: '冻结', unfreeze: '解除冻结', step: '单步运行', sprint: '快速运行', rate: '设置速率',
  pause: '暂停', resume: '继续', reset: '重置', restart: '重新开始', lap: '计次',
  whitelist: '白名单', everything: '全部', flush: '立即写入磁盘',
  without: '排除', with: '使用', from: '来源', by: '由实体造成', via: '经由实体',
  facing_entity: '面向实体', minecraft: '游戏内置', add_value: '加法',
  add_multiplied_base: '基础值乘法', add_multiplied_total: '总值乘法',
  '*': '任意匹配', '<': '小于', '<=': '小于等于', '=': '等于', '>': '大于', '>=': '大于等于',
  attacker: '攻击者', controller: '控制者', leasher: '拴绳持有者', origin: '来源实体',
  owner: '拥有者', passengers: '乘客', target: '目标', vehicle: '坐骑',
  amount: '数量', always: '始终', never: '从不', blocks: '区域方块', items: '物品',
  byte: '字节整数', short: '短整数', int: '整数', long: '长整数', double: '双精度数', string: '字符串',
  empty: '清空', blank: '留空', first: '最前', last: '最后', fixed: '固定数值', styled: '文本样式',
  displayautoupdate: '自动更新显示', displayname: '显示名称', dismount: '离开坐骑',
  hearts: '心形', rendertype: '显示格式', numberformat: '数字格式', setdisplay: '显示位置',
  hollow: '填充空心区域', outline: '仅填充外框', join: '加入', leave: '离开',
  loaded: '已加载', loot: '战利品表', mine: '模拟挖掘', kill: '模拟击杀',
  mount: '骑上坐骑', of: '选取', off: '关闭', over: '在高度图上方',
  progress: '连续进度条', notched_6: '分为 6 格', notched_10: '分为 10 格',
  notched_12: '分为 12 格', notched_20: '分为 20 格', override: '覆盖',
  prefix: '前缀', suffix: '后缀', repetition: '循环', roll: '抽取随机值',
  score: '分数', slots: '槽位', spawn: '生成', stopwatch: '秒表', to: '目标',
  ui: '界面', under: '在下方', uuids: '唯一标识列表', visible: '是否可见',
  blue: '蓝色', green: '绿色', pink: '粉色', purple: '紫色', red: '红色', white: '白色', yellow: '黄色',
  runthat: '运行指向测试', runthese: '运行选中测试', max: '最大值',
  bossbar: '首领血条', buffer: '缓冲区', compute: '计算', data: '数据',
  dimension: '维度', fish: '模拟钓鱼', fill: '填充', infinite: '无限', time: '时间',
  collisionRule: '实体碰撞规则', deathMessageVisibility: '死亡消息可见性', displayName: '显示名称',
  distance: '距离', friendlyFire: '队友伤害', hideForOtherTeams: '对其他队伍隐藏',
  hideForOwnTeam: '对本队隐藏', multiply: '总值乘法', multiply_base: '基础值乘法',
  nametagVisibility: '名称标签可见性', predicate: '判定条件', pushOtherTeams: '只碰撞其他队伍',
  pushOwnTeam: '只碰撞本队', seeFriendlyInvisibles: '看见隐身队友'
}

/** Display helpers only: callers continue to store the original command-tree tokens. */
export function commandName(id: string): string {
  return COMMAND_MAP.get(id)?.name ?? ROOT_NAMES[id] ?? '扩展命令'
}

export function argumentName(name: string): string {
  return ARGUMENT_NAMES[name] ?? '命令参数'
}

export function literalName(name: string): string {
  const builtin = builtinOptionName(name)
  const rule = gameruleLabel(name)
  return LITERAL_NAMES[name] ?? (rule.name !== '扩展游戏规则' ? rule.name : undefined)
    ?? (builtin !== name ? builtin : '子命令')
}
