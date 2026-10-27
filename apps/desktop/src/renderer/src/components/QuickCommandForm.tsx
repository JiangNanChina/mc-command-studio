import { useEffect, useMemo, useState } from 'react'
import { TerminalSquare } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import { useAppStore } from '../store'

type FieldKind = 'text' | 'select'

interface QuickField {
  key: string
  label: string
  kind: FieldKind
  options?: string[]
  defaultValue: string
  placeholder?: string
  visible?: (values: Record<string, string>) => boolean
}

interface QuickSchema {
  fields: QuickField[]
  build: (values: Record<string, string>) => string
}

export const QUICK_SCHEMAS: Record<string, QuickSchema> = {
  locate: {
    fields: [
      { key: 'type', label: '类型', kind: 'select', options: ['structure', 'biome', 'poi'], defaultValue: 'structure' },
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
  place: {
    fields: [
      { key: 'type', label: '类型', kind: 'select', options: ['structure', 'jigsaw', 'template', 'feature'], defaultValue: 'structure' },
      { key: 'id', label: '结构/模板 ID', kind: 'text', defaultValue: 'minecraft:village_plains' },
      { key: 'x', label: 'X', kind: 'text', defaultValue: '~' },
      { key: 'y', label: 'Y', kind: 'text', defaultValue: '~' },
      { key: 'z', label: 'Z', kind: 'text', defaultValue: '~' }
    ],
    build: (v) => `place ${v.type} ${v.id} ${v.x} ${v.y} ${v.z}`
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
      { key: 'port', label: '端口（可选）', kind: 'text', defaultValue: '25565' }
    ],
    build: (v) => `transfer ${v.host}${v.port.trim() ? ` ${v.port.trim()}` : ''}`
  },
  dialog: {
    fields: [
      { key: 'action', label: '动作', kind: 'select', options: ['show', 'clear'], defaultValue: 'show' },
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
  waypoint: { fields: [], build: () => 'waypoint list' },
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
      { key: 'action', label: '动作', kind: 'select', options: ['run', 'clear'], defaultValue: 'run' },
      { key: 'id', label: '测试 ID', kind: 'text', defaultValue: 'minecraft:always_pass' }
    ],
    build: (v) => `test ${v.action} ${v.id}`
  },
  stopwatch: {
    fields: [{ key: 'action', label: '动作', kind: 'select', options: ['start', 'stop', 'reset'], defaultValue: 'start' }],
    build: (v) => `stopwatch ${v.action}`
  },
  swing: {
    fields: [
      { key: 'target', label: '目标', kind: 'text', defaultValue: '@s' },
      { key: 'hand', label: '手', kind: 'select', options: ['mainhand', 'offhand'], defaultValue: 'mainhand' }
    ],
    build: (v) => `swing ${v.target} ${v.hand}`
  },
  fetchprofile: {
    fields: [
      { key: 'type', label: '类型', kind: 'select', options: ['name', 'id'], defaultValue: 'name' },
      { key: 'value', label: '名称/UUID', kind: 'text', defaultValue: 'Steve' }
    ],
    build: (v) => `fetchprofile ${v.type} ${v.value}`
  },
  compute: {
    fields: [
      { key: 'targetType', label: '计算目标', kind: 'select', options: ['default', 'entity', 'block'], defaultValue: 'default' },
      { key: 'target', label: '实体/方块坐标', kind: 'text', defaultValue: '@s', visible: (v) => v.targetType !== 'default' },
      { key: 'valueType', label: '数值类型', kind: 'select', options: ['float', 'integer'], defaultValue: 'float' },
      { key: 'providerPreset', label: 'Provider 预设', kind: 'select', options: ['constant(1.0)', 'constant(0.0)', 'custom'], defaultValue: 'constant(1.0)' },
      { key: 'provider', label: '自定义 Provider', kind: 'text', defaultValue: 'constant(1.0)', visible: (v) => v.providerPreset === 'custom' },
      { key: 'scale', label: 'float 缩放（可选）', kind: 'text', defaultValue: '', visible: (v) => v.valueType === 'float' }
    ],
    build: (v) => {
      const prefix =
        v.targetType === 'entity'
          ? `compute entity ${v.target}`
          : v.targetType === 'block'
            ? `compute block ${v.target}`
            : 'compute default'
      if (v.valueType === 'integer') return `${prefix} integer ${v.providerPreset === 'custom' ? v.provider : v.providerPreset}`
      return `${prefix} float ${v.providerPreset === 'custom' ? v.provider : v.providerPreset}${v.scale.trim() ? ` ${v.scale.trim()}` : ''}`
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
      { key: 'target', label: '目标', kind: 'text', defaultValue: '@s' },
      { key: 'effect', label: '效果', kind: 'text', defaultValue: 'minecraft:invert' }
    ],
    build: (v) => `posteffect give ${v.target} ${v.effect}`
  }
}

export function isQuickCommand(id: string | null): boolean {
  return Boolean(id && QUICK_SCHEMAS[id])
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
  'debug'
])

/** NBT 版本（1.13–1.20.4）可安全复用的快捷表单。 */
export function isNbtQuickSafe(id: string | null): boolean {
  return Boolean(id && NBT_SAFE_QUICK.has(id))
}

function defaultsFor(schema: QuickSchema): Record<string, string> {
  return Object.fromEntries(schema.fields.map((field) => [field.key, field.defaultValue]))
}

export function QuickCommandForm({ id }: { id: string }) {
  const schema = QUICK_SCHEMAS[id]
  const setQuickCommand = useAppStore((state) => state.setQuickCommand)
  const [values, setValues] = useState<Record<string, string>>(() => defaultsFor(schema))
  const meta = COMMAND_MAP.get(id)
  const text = useMemo(
    () => schema.build({ ...defaultsFor(schema), ...values }),
    [schema, values]
  )

  useEffect(() => {
    setValues(defaultsFor(schema))
  }, [schema])

  useEffect(() => {
    setQuickCommand(text)
  }, [setQuickCommand, text])

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / {meta?.category ?? '命令'} / {id}</div>
          <div className="hero">
            <div className="hero-icon">
              <TerminalSquare size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? id}
                <span className="hero-id">{id}</span>
              </h1>
              <p className="hero-sub">{meta?.description ?? '快捷命令表单。'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">参数</div>
          <span className="hint">实时生成单行命令</span>
        </div>
        {schema.fields.length > 0 ? (
          <div className="grid-2">
            {schema.fields
              .filter((field) => !field.visible || field.visible(values))
              .map((field) => (
              <div className="field" key={field.key}>
                <label className="field-label" htmlFor={`quick-${id}-${field.key}`}>
                  {field.label}
                </label>
                {field.kind === 'select' ? (
                  <select
                    id={`quick-${id}-${field.key}`}
                    className="select"
                    value={values[field.key] ?? field.defaultValue}
                    onChange={(event) =>
                      setValues({ ...values, [field.key]: event.target.value })
                    }
                  >
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`quick-${id}-${field.key}`}
                    className="input"
                    value={values[field.key] ?? field.defaultValue}
                    placeholder={field.placeholder}
                    onChange={(event) =>
                      setValues({ ...values, [field.key]: event.target.value })
                    }
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="hint">该命令没有参数，直接生成。</div>
        )}
        <div className="hint" style={{ marginTop: 12 }}>
          生成：<code>{text}</code>
        </div>
      </div>
    </div>
  )
}
