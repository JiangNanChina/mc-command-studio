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
      { key: 'dialog', label: '对话框 ID', kind: 'text', defaultValue: 'minecraft:server_links' }
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
  'save-all': { fields: [], build: () => 'save-all' }
}

export function isQuickCommand(id: string | null): boolean {
  return Boolean(id && QUICK_SCHEMAS[id])
}

function defaultsFor(schema: QuickSchema): Record<string, string> {
  return Object.fromEntries(schema.fields.map((field) => [field.key, field.defaultValue]))
}

export function QuickCommandForm({ id }: { id: string }) {
  const schema = QUICK_SCHEMAS[id]
  const setQuickCommand = useAppStore((state) => state.setQuickCommand)
  const [values, setValues] = useState<Record<string, string>>(() => defaultsFor(schema))
  const meta = COMMAND_MAP.get(id)
  const text = useMemo(() => schema.build(values), [schema, values])

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
            {schema.fields.map((field) => (
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
