import { containsControlCharacters, error, type BuildResult, type Diagnostic, type VersionPack } from '@mcstudio/core'

type FieldKind = 'text' | 'select'

export interface QuickField {
  key: string
  label: string
  kind: FieldKind
  options?: string[]
  defaultValue: string
  placeholder?: string
  visible?: (values: Record<string, string>) => boolean
  optionRoot?: string
  optionsRegistry?: string | ((values: Record<string, string>) => string)
}

export interface QuickSchema {
  fields: QuickField[]
  build: (values: Record<string, string>) => string
}

export const QUICK_SCHEMAS: Record<string, QuickSchema> = {
  locate: {
    fields: [
      { key: 'type', label: '类型', kind: 'select', options: ['structure', 'biome', 'poi'], defaultValue: 'structure', optionRoot: 'locate' },
      { key: 'id', label: '目标 ID', kind: 'text', defaultValue: 'minecraft:village_plains' }
    ],
    build: (values) => `locate ${values.type} ${values.id}`.trim()
  },
  fillbiome: {
    fields: [
      { key: 'x1', label: '起点 X', kind: 'text', defaultValue: '~' },
      { key: 'y1', label: '起点 Y', kind: 'text', defaultValue: '~' },
      { key: 'z1', label: '起点 Z', kind: 'text', defaultValue: '~' },
      { key: 'x2', label: '终点 X', kind: 'text', defaultValue: '~5' },
      { key: 'y2', label: '终点 Y', kind: 'text', defaultValue: '~5' },
      { key: 'z2', label: '终点 Z', kind: 'text', defaultValue: '~5' },
      { key: 'biome', label: '生物群系', kind: 'text', defaultValue: 'minecraft:plains' }
    ],
    build: (v) => `fillbiome ${v.x1} ${v.y1} ${v.z1} ${v.x2} ${v.y2} ${v.z2} ${v.biome}`
  },
  replaceitem: {
    fields: [
      { key: 'mode', label: '目标类型', kind: 'select', options: ['block', 'entity'], defaultValue: 'entity' },
      { key: 'target', label: '实体/坐标', kind: 'text', defaultValue: '@s' },
      { key: 'x', label: 'X（block）', kind: 'text', defaultValue: '~', visible: (v) => v.mode === 'block' },
      { key: 'y', label: 'Y（block）', kind: 'text', defaultValue: '~', visible: (v) => v.mode === 'block' },
      { key: 'z', label: 'Z（block）', kind: 'text', defaultValue: '~', visible: (v) => v.mode === 'block' },
      { key: 'slot', label: '槽位', kind: 'text', defaultValue: 'weapon.mainhand' },
      { key: 'item', label: '物品', kind: 'text', defaultValue: 'minecraft:stone' },
      { key: 'count', label: '数量（可选）', kind: 'text', defaultValue: '' }
    ],
    build: (v) => {
      const place = v.mode === 'block' ? `block ${v.x} ${v.y} ${v.z}` : `entity ${v.target}`
      return `replaceitem ${place} ${v.slot} ${v.item}${v.count.trim() ? ` ${v.count.trim()}` : ''}`
    }
  },
  locatebiome: {
    fields: [{ key: 'biome', label: '生物群系', kind: 'text', defaultValue: 'minecraft:plains' }],
    build: (v) => `locatebiome ${v.biome}`
  },
  place: {
    fields: [
      { key: 'type', label: '类型', kind: 'select', options: ['structure', 'jigsaw', 'template', 'feature'], defaultValue: 'structure', optionRoot: 'place' },
      { key: 'id', label: '结构/模板 ID', kind: 'text', defaultValue: 'minecraft:village_plains' },
      { key: 'x', label: 'X', kind: 'text', defaultValue: '~' },
      { key: 'y', label: 'Y', kind: 'text', defaultValue: '~' },
      { key: 'z', label: 'Z', kind: 'text', defaultValue: '~' },
      { key: 'target', label: '拼图目标', kind: 'text', defaultValue: 'minecraft:empty', visible: (v) => v.type === 'jigsaw' },
      { key: 'maxDepth', label: '最大深度', kind: 'text', defaultValue: '7', visible: (v) => v.type === 'jigsaw' },
      { key: 'rotation', label: '旋转（template）', kind: 'select', options: ['none', 'clockwise_90', '180', 'counterclockwise_90'], defaultValue: 'none', visible: (v) => v.type === 'template' },
      { key: 'mirror', label: '镜像（template）', kind: 'select', options: ['none', 'left_right', 'front_back'], defaultValue: 'none', visible: (v) => v.type === 'template' }
    ],
    build: (v) => {
      const position = `${v.x} ${v.y} ${v.z}`
      if (v.type === 'jigsaw') {
        return `place jigsaw ${v.id} ${v.target} ${v.maxDepth} ${position}`
      }
      if (v.type === 'template') {
        return `place template ${v.id} ${position} ${v.rotation} ${v.mirror}`
      }
      return `place ${v.type} ${v.id} ${position}`
    }
  },
  spectate: {
    fields: [
      { key: 'target', label: '目标（留空停止旁观）', kind: 'text', defaultValue: '@p' }
    ],
    build: (v) => (v.target.trim() ? `spectate ${v.target.trim()}` : 'spectate')
  },
  recipe: {
    fields: [
      { key: 'action', label: '动作', kind: 'select', options: ['give', 'take'], defaultValue: 'give' },
      { key: 'targets', label: '目标', kind: 'text', defaultValue: '@s' },
      { key: 'recipe', label: '配方 ID', kind: 'text', defaultValue: 'minecraft:bread' }
    ],
    build: (v) => `recipe ${v.action} ${v.targets} ${v.recipe}`
  },
  return: {
    fields: [
      { key: 'mode', label: '模式', kind: 'select', options: ['run', 'value', 'fail'], defaultValue: 'run' },
      { key: 'value', label: '命令/值/消息', kind: 'text', defaultValue: 'say done' }
    ],
    build: (v) => (v.mode === 'run' ? `return run ${v.value}` : v.mode === 'fail' ? `return fail ${v.value}` : `return ${v.value}`)
  },
  transfer: {
    fields: [
      { key: 'host', label: '主机', kind: 'text', defaultValue: 'localhost' },
      { key: 'port', label: '端口（可选）', kind: 'text', defaultValue: '25565' },
      { key: 'players', label: '玩家（可选）', kind: 'text', defaultValue: '@a', visible: (v) => Boolean(v.port.trim()) }
    ],
    build: (v) =>
      `transfer ${v.host}${v.port.trim() ? ` ${v.port.trim()}` : ''}${v.port.trim() && v.players.trim() ? ` ${v.players.trim()}` : ''}`
  },
  dialog: {
    fields: [
      { key: 'action', label: '动作', kind: 'select', options: ['show', 'clear'], defaultValue: 'show', optionRoot: 'dialog' },
      { key: 'targets', label: '目标', kind: 'text', defaultValue: '@s' },
      { key: 'dialog', label: '对话框 ID', kind: 'text', defaultValue: 'minecraft:server_links', visible: (v) => v.action === 'show' }
    ],
    build: (v) => (v.action === 'show' ? `dialog show ${v.targets} ${v.dialog}` : `dialog clear ${v.targets}`)
  },
  help: {
    fields: [{ key: 'command', label: '命令（可选）', kind: 'text', defaultValue: 'give' }],
    build: (v) => (v.command.trim() ? `help ${v.command.trim()}` : 'help')
  },
  perf: {
    fields: [{ key: 'action', label: '动作', kind: 'select', options: ['start', 'stop'], defaultValue: 'start' }],
    build: (v) => `perf ${v.action}`
  },
  jfr: {
    fields: [{ key: 'action', label: '动作', kind: 'select', options: ['start', 'stop'], defaultValue: 'start' }],
    build: (v) => `jfr ${v.action}`
  },
  debug: {
    fields: [{ key: 'action', label: '动作', kind: 'select', options: ['start', 'stop'], defaultValue: 'start' }],
    build: (v) => `debug ${v.action}`
  },
  reload: { fields: [], build: () => 'reload' },
  seed: { fields: [], build: () => 'seed' },
  list: { fields: [], build: () => 'list' },
  version: { fields: [], build: () => 'version' },
  publish: { fields: [], build: () => 'publish' },
  'save-all': { fields: [], build: () => 'save-all' },
  'save-off': { fields: [], build: () => 'save-off' },
  'save-on': { fields: [], build: () => 'save-on' },
  stop: { fields: [], build: () => 'stop' },
  unpublish: { fields: [], build: () => 'unpublish' },
  waypoint: {
    fields: [
      { key: 'action', label: '动作', kind: 'select', options: ['list', 'modify'], defaultValue: 'list', optionRoot: 'waypoint' },
      { key: 'waypoint', label: '路径点', kind: 'text', defaultValue: '@e[type=waypoint]', visible: (v) => v.action === 'modify' },
      { key: 'modifyType', label: '修改类型', kind: 'select', options: ['color', 'style'], defaultValue: 'color', visible: (v) => v.action === 'modify' },
      { key: 'colorMode', label: '颜色模式', kind: 'select', options: ['team', 'hex', 'reset'], defaultValue: 'team', visible: (v) => v.action === 'modify' && v.modifyType === 'color' },
      { key: 'color', label: '颜色值', kind: 'text', defaultValue: 'red', visible: (v) => v.action === 'modify' && v.modifyType === 'color' && v.colorMode !== 'reset' },
      { key: 'style', label: '样式 ID', kind: 'text', defaultValue: 'minecraft:default', visible: (v) => v.action === 'modify' && v.modifyType === 'style' }
    ],
    build: (v) => {
      if (v.action === 'list') return 'waypoint list'
      if (v.modifyType === 'style') return `waypoint modify ${v.waypoint} style set ${v.style}`
      if (v.colorMode === 'reset') return `waypoint modify ${v.waypoint} color reset`
      if (v.colorMode === 'hex') return `waypoint modify ${v.waypoint} color hex ${v.color}`
      return `waypoint modify ${v.waypoint} color ${v.color}`
    }
  },
  kill: {
    fields: [{ key: 'target', label: '目标', kind: 'text', defaultValue: '@e[type=item]' }],
    build: (v) => `kill ${v.target}`
  },
  kick: {
    fields: [
      { key: 'target', label: '目标', kind: 'text', defaultValue: '@p' },
      { key: 'reason', label: '原因', kind: 'text', defaultValue: '请稍后再试' }
    ],
    build: (v) => `kick ${v.target} ${v.reason}`
  },
  op: {
    fields: [{ key: 'target', label: '目标', kind: 'text', defaultValue: '@p' }],
    build: (v) => `op ${v.target}`
  },
  deop: {
    fields: [{ key: 'target', label: '目标', kind: 'text', defaultValue: '@p' }],
    build: (v) => `deop ${v.target}`
  },
  say: {
    fields: [{ key: 'message', label: '消息', kind: 'text', defaultValue: '服务器将在 5 分钟后重启' }],
    build: (v) => `say ${v.message}`
  },
  me: {
    fields: [{ key: 'message', label: '动作', kind: 'text', defaultValue: '正在建造' }],
    build: (v) => `me ${v.message}`
  },
  setidletimeout: {
    fields: [{ key: 'minutes', label: '分钟', kind: 'text', defaultValue: '30' }],
    build: (v) => `setidletimeout ${v.minutes}`
  },
  ban: {
    fields: [
      { key: 'target', label: '玩家', kind: 'text', defaultValue: 'Steve' },
      { key: 'reason', label: '原因', kind: 'text', defaultValue: '违反服务器规则' }
    ],
    build: (v) => `ban ${v.target} ${v.reason}`
  },
  'ban-ip': {
    fields: [
      { key: 'target', label: 'IP/玩家', kind: 'text', defaultValue: '127.0.0.1' },
      { key: 'reason', label: '原因', kind: 'text', defaultValue: '违反服务器规则' }
    ],
    build: (v) => `ban-ip ${v.target} ${v.reason}`
  },
  banlist: {
    fields: [{ key: 'type', label: '类型', kind: 'select', options: ['ips', 'players'], defaultValue: 'players' }],
    build: (v) => `banlist ${v.type}`
  },
  pardon: {
    fields: [{ key: 'target', label: '玩家', kind: 'text', defaultValue: 'Steve' }],
    build: (v) => `pardon ${v.target}`
  },
  'pardon-ip': {
    fields: [{ key: 'target', label: 'IP', kind: 'text', defaultValue: '127.0.0.1' }],
    build: (v) => `pardon-ip ${v.target}`
  },
  whitelist: {
    fields: [
      { key: 'action', label: '动作', kind: 'select', options: ['add', 'remove', 'list'], defaultValue: 'add' },
      { key: 'target', label: '玩家', kind: 'text', defaultValue: 'Steve' }
    ],
    build: (v) => (v.action === 'list' ? 'whitelist list' : `whitelist ${v.action} ${v.target}`)
  },
  tell: {
    fields: [
      { key: 'target', label: '目标', kind: 'text', defaultValue: '@p' },
      { key: 'message', label: '消息', kind: 'text', defaultValue: '你好' }
    ],
    build: (v) => `tell ${v.target} ${v.message}`
  },
  msg: {
    fields: [
      { key: 'target', label: '目标', kind: 'text', defaultValue: '@p' },
      { key: 'message', label: '消息', kind: 'text', defaultValue: '你好' }
    ],
    build: (v) => `msg ${v.target} ${v.message}`
  },
  tm: {
    fields: [
      { key: 'target', label: '目标', kind: 'text', defaultValue: '@p' },
      { key: 'message', label: '消息', kind: 'text', defaultValue: '你好' }
    ],
    build: (v) => `tm ${v.target} ${v.message}`
  },
  teammsg: {
    fields: [{ key: 'message', label: '消息', kind: 'text', defaultValue: '集合' }],
    build: (v) => `teammsg ${v.message}`
  },
  w: {
    fields: [
      { key: 'target', label: '目标', kind: 'text', defaultValue: '@p' },
      { key: 'message', label: '消息', kind: 'text', defaultValue: '你好' }
    ],
    build: (v) => `w ${v.target} ${v.message}`
  },
  teleport: {
    fields: [
      { key: 'target', label: '目标', kind: 'text', defaultValue: '@s' },
      { key: 'x', label: 'X', kind: 'text', defaultValue: '~' },
      { key: 'y', label: 'Y', kind: 'text', defaultValue: '~' },
      { key: 'z', label: 'Z', kind: 'text', defaultValue: '~' }
    ],
    build: (v) => `teleport ${v.target} ${v.x} ${v.y} ${v.z}`
  },
  experience: {
    fields: [
      { key: 'action', label: '动作', kind: 'select', options: ['add', 'set', 'query'], defaultValue: 'add' },
      { key: 'amount', label: '数量', kind: 'text', defaultValue: '100' },
      { key: 'unit', label: '单位', kind: 'select', options: ['points', 'levels'], defaultValue: 'points' }
    ],
    build: (v) =>
      v.action === 'query'
        ? `experience query @s ${v.unit}`
        : `experience ${v.action} @s ${v.amount} ${v.unit}`
  },
  defaultgamemode: {
    fields: [{ key: 'mode', label: '模式', kind: 'select', options: ['survival', 'creative', 'adventure', 'spectator'], defaultValue: 'survival' }],
    build: (v) => `defaultgamemode ${v.mode}`
  },
  test: {
    fields: [
      { key: 'action', label: '动作', kind: 'select', options: ['run', 'runclosest', 'runfailed', 'runmultiple', 'stop', 'clearall', 'clearthat', 'clearthese', 'verify', 'locate', 'create', 'pos', 'resetclosest', 'resetthat', 'resetthese'], defaultValue: 'run', optionRoot: 'test' },
      { key: 'tests', label: '测试选择器', kind: 'text', defaultValue: '@e', visible: (v) => ['run', 'runmultiple', 'verify', 'locate'].includes(v.action) },
      { key: 'id', label: '测试实例 ID', kind: 'text', defaultValue: 'minecraft:always_pass', visible: (v) => v.action === 'create' },
      { key: 'width', label: '宽度', kind: 'text', defaultValue: '5', visible: (v) => v.action === 'create' },
      { key: 'height', label: '高度', kind: 'text', defaultValue: '5', visible: (v) => v.action === 'create' },
      { key: 'depth', label: '深度', kind: 'text', defaultValue: '5', visible: (v) => v.action === 'create' },
      { key: 'times', label: '执行次数（可选）', kind: 'text', defaultValue: '', visible: (v) => ['run', 'runclosest', 'runfailed'].includes(v.action) },
      { key: 'until', label: '失败即停', kind: 'select', options: ['false', 'true'], defaultValue: 'false', visible: (v) => ['run', 'runclosest', 'runfailed'].includes(v.action) && Boolean(v.times?.trim()) },
      { key: 'amount', label: '数量', kind: 'text', defaultValue: '1', visible: (v) => v.action === 'runmultiple' },
      { key: 'radius', label: '半径（可选）', kind: 'text', defaultValue: '', visible: (v) => v.action === 'clearall' },
      { key: 'var', label: '变量名', kind: 'text', defaultValue: 'value', visible: (v) => v.action === 'pos' }
    ],
    build: (v) => {
      const tail = v.times?.trim() ? ` ${v.times.trim()}${v.until === 'true' ? ' true' : ''}` : ''
      if (v.action === 'run') return `test run ${v.tests}${tail}`
      if (v.action === 'runclosest' || v.action === 'runfailed') return `test ${v.action}${tail}`
      if (v.action === 'runmultiple') return `test runmultiple ${v.tests} ${v.amount}`
      if (v.action === 'clearall') return `test clearall${v.radius.trim() ? ` ${v.radius.trim()}` : ''}`
      if (v.action === 'verify') return `test verify ${v.tests}`
      if (v.action === 'locate') return `test locate ${v.tests}`
      if (v.action === 'create') return `test create ${v.id} ${v.width} ${v.height} ${v.depth}`
      if (v.action === 'pos') return `test pos ${v.var}`
      return `test ${v.action}`
    }
  },
  stopwatch: {
    fields: [
      { key: 'action', label: '动作', kind: 'select', options: ['create', 'query', 'remove', 'restart'], defaultValue: 'create', optionRoot: 'stopwatch' },
      { key: 'id', label: '计时器 ID', kind: 'text', defaultValue: 'timer' },
      { key: 'scale', label: '缩放（query 可选）', kind: 'text', defaultValue: '', visible: (v) => v.action === 'query' }
    ],
    build: (v) =>
      `stopwatch ${v.action} ${v.id}${v.scale.trim() ? ` ${v.scale.trim()}` : ''}`
  },
  swing: {
    fields: [
      { key: 'target', label: '目标', kind: 'text', defaultValue: '@s' },
      { key: 'hand', label: '手', kind: 'select', options: ['mainhand', 'offhand'], defaultValue: 'mainhand' },
      { key: 'animation', label: '动画（可选）', kind: 'text', defaultValue: '' },
      { key: 'duration', label: '时长（可选）', kind: 'text', defaultValue: '' }
    ],
    build: (v) =>
      `swing ${v.target} ${v.hand}${v.animation.trim() ? ` ${v.animation.trim()}${v.duration.trim() ? ` ${v.duration.trim()}` : ''}` : ''}`
  },
  fetchprofile: {
    fields: [
      { key: 'type', label: '类型', kind: 'select', options: ['name', 'id', 'entity'], defaultValue: 'name', optionRoot: 'fetchprofile' },
      { key: 'value', label: '名称/UUID/实体', kind: 'text', defaultValue: 'Steve' }
    ],
    build: (v) => `fetchprofile ${v.type} ${v.value}`
  },
  compute: {
    fields: [
      { key: 'targetType', label: '计算目标', kind: 'select', options: ['default', 'entity', 'block'], defaultValue: 'default', optionRoot: 'compute' },
      { key: 'target', label: '实体/方块坐标', kind: 'text', defaultValue: '@s', visible: (v) => v.targetType !== 'default' },
      { key: 'valueType', label: '数值类型', kind: 'select', options: ['float', 'integer'], defaultValue: 'float' },
      { key: 'floatProvider', label: 'Float Provider', kind: 'select', options: [], defaultValue: 'minecraft:brewing/speed_default', optionsRegistry: 'context_float_provider', visible: (v) => v.valueType === 'float' },
      { key: 'integerProvider', label: 'Integer Provider', kind: 'select', options: [], defaultValue: 'minecraft:brewing/uses_default', optionsRegistry: 'context_int_provider', visible: (v) => v.valueType === 'integer' },
      { key: 'scale', label: 'float 缩放（可选）', kind: 'text', defaultValue: '', visible: (v) => v.valueType === 'float' }
    ],
    build: (v) => {
      const prefix =
        v.targetType === 'entity'
          ? `compute entity ${v.target}`
          : v.targetType === 'block'
            ? `compute block ${v.target}`
            : 'compute default'
      const provider =
        v.valueType === 'integer' ? v.integerProvider : v.floatProvider
      if (v.valueType === 'integer') return `${prefix} integer ${provider}`
      return `${prefix} float ${provider}${v.scale.trim() ? ` ${v.scale.trim()}` : ''}`
    }
  },
  trigger: {
    fields: [
      { key: 'objective', label: '目标', kind: 'text', defaultValue: 'quest' },
      { key: 'action', label: '动作', kind: 'select', options: ['add', 'set'], defaultValue: 'add' },
      { key: 'value', label: '数值', kind: 'text', defaultValue: '1' }
    ],
    build: (v) => `trigger ${v.objective} ${v.action} ${v.value}`
  },
  posteffect: {
    fields: [
      { key: 'action', label: '动作', kind: 'select', options: ['add', 'clear', 'list', 'remove'], defaultValue: 'add', optionRoot: 'posteffect' },
      { key: 'target', label: '目标', kind: 'text', defaultValue: '@s' },
      { key: 'effect', label: '效果', kind: 'text', defaultValue: 'minecraft:invert', visible: (v) => v.action === 'add' || v.action === 'remove' }
    ],
    build: (v) =>
      v.action === 'clear'
        ? `posteffect clear ${v.target}`
        : v.action === 'list'
          ? `posteffect list ${v.target}`
          : `posteffect ${v.action} ${v.target} ${v.effect}`
  },
}

export function isQuickCommand(id: string | null): boolean {
  return Boolean(id && Object.hasOwn(QUICK_SCHEMAS, id))
}

const NBT_SAFE_QUICK = new Set([
  'locate',
  'help',
  'reload',
  'seed',
  'list',
  'version',
  'publish',
  'save-all',
  'save-off',
  'save-on',
  'stop',
  'unpublish',
  'kill',
  'kick',
  'op',
  'deop',
  'say',
  'me',
  'setidletimeout',
  'ban',
  'ban-ip',
  'banlist',
  'pardon',
  'pardon-ip',
  'whitelist',
  'tell',
  'msg',
  'tm',
  'teammsg',
  'w',
  'teleport',
  'experience',
  'defaultgamemode',
  'trigger',
  'fillbiome',
  'spectate',
  'recipe',
  'return',
  'perf',
  'jfr',
  'debug',
  'place',
  'replaceitem',
  'locatebiome'
])

/** NBT 版本（1.13–1.20.4）可安全复用的快捷表单。 */
export function isNbtQuickSafe(id: string | null): boolean {
  return Boolean(id && NBT_SAFE_QUICK.has(id) && isQuickCommand(id))
}

/** UI 与序列化共用选项来源，避免界面显示一个值而输出另一个值。 */
export function getQuickFieldOptions(
  field: QuickField,
  values: Record<string, string>,
  pack: VersionPack | null
): string[] {
  if (field.optionsRegistry) {
    const key = typeof field.optionsRegistry === 'function'
      ? field.optionsRegistry(values)
      : field.optionsRegistry
    const registry = pack?.registries[key] ?? []
    if (registry.length > 0) return registry.map((id) => id.includes(':') ? id : `minecraft:${id}`)
  }
  const options = field.options ?? []
  const root = field.optionRoot && pack?.commands.children?.[field.optionRoot]
  return root
    ? options.filter((option) => root.children?.[option]?.type === 'literal')
    : options
}

/** 草稿保留用户输入；只有未填写过的字段使用适合当前版本的默认值。 */
export function getQuickValues(
  id: string,
  draft: Record<string, string> | undefined,
  pack: VersionPack | null
): Record<string, string> {
  if (!isQuickCommand(id)) return {}
  const schema = QUICK_SCHEMAS[id]
  const values = Object.fromEntries(schema.fields.map((field) => [field.key, draft?.[field.key] ?? field.defaultValue]))
  for (const field of schema.fields) {
    if (field.kind !== 'select' || draft?.[field.key] !== undefined) continue
    const options = getQuickFieldOptions(field, values, pack)
    if (options.length > 0 && !options.includes(values[field.key])) values[field.key] = options[0]
  }
  return values
}

/** 不信任项目文件中的快捷草稿，只接受已知命令、字段和字符串值。 */
export function normalizeQuickDrafts(input: unknown): Record<string, Record<string, string>> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {}
  return Object.fromEntries(Object.entries(input).flatMap(([id, value]) => {
    if (!isQuickCommand(id) || !value || typeof value !== 'object' || Array.isArray(value)) return []
    const fields = new Set(QUICK_SCHEMAS[id].fields.map((field) => field.key))
    const entries = Object.entries(value).filter((entry): entry is [string, string] => fields.has(entry[0]) && typeof entry[1] === 'string')
    const draft = Object.fromEntries(entries)
    return [[id, draft]]
  }))
}

/** 快捷表单与专用表单一样返回诊断，不再把生成的字符串视为无条件通过。 */
export function buildQuickCommand(
  pack: VersionPack | null,
  id: string,
  draft: Record<string, string> | undefined
): BuildResult {
  if (!isQuickCommand(id)) return { text: '', diagnostics: [error('quick.unknown', '没有此命令的快捷表单')] }
  const values = getQuickValues(id, draft, pack)
  const diagnostics: Diagnostic[] = []
  if (!pack?.commands.children?.[id]) {
    diagnostics.push(error('quick.unsupported', `当前版本不支持 ${id} 命令`, 'command'))
  }
  for (const field of QUICK_SCHEMAS[id].fields) {
    if (field.visible && !field.visible(values)) continue
    const value = values[field.key]
    if (/[\r\n]/.test(value) || containsControlCharacters(value)) {
      diagnostics.push(error('quick.control', `${field.label}不能包含换行或控制字符`, field.key))
    }
    if (field.kind === 'select' && !getQuickFieldOptions(field, values, pack).includes(value)) {
      diagnostics.push(error('quick.option', `${field.label}的选项不适用于当前版本，请重新选择`, field.key))
    }
  }
  const text = QUICK_SCHEMAS[id].build(values).trim()
  if (text.length > 32500) diagnostics.push(error('quick.length', '命令超过 32,500 字符上限', 'command'))
  return { text, diagnostics }
}
