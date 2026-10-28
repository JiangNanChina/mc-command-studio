import { TerminalSquare } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import { useAppStore } from '../store'
import { QUICK_SCHEMAS, buildQuickCommand, getQuickValues, getQuickFieldOptions } from '../lib/quickCommands'

export { isQuickCommand, isNbtQuickSafe } from '../lib/quickCommands'

export function QuickCommandForm({ id }: { id: string }) {
  const schema = QUICK_SCHEMAS[id]
  const pack = useAppStore((state) => state.pack)
  const draft = useAppStore((state) => state.quickDrafts[id])
  const setQuickValue = useAppStore((state) => state.setQuickValue)
  const values = getQuickValues(id, draft, pack)
  const meta = COMMAND_MAP.get(id)
  const text = buildQuickCommand(pack, id, draft).text

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
                      setQuickValue(id, field.key, event.target.value)
                    }
                  >
                    {!getQuickFieldOptions(field, values, pack).includes(values[field.key]) ? (
                      <option value={values[field.key]} disabled>{values[field.key] || '无可用选项'}（当前版本不支持）</option>
                    ) : null}
                    {getQuickFieldOptions(field, values, pack).map((option) => (
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
                      setQuickValue(id, field.key, event.target.value)
                    }
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="hint">该命令没有参数，直接生成。</div>
        )}
        {schema.fields.some((field) => field.optionRoot || field.optionsRegistry) ? (
          <div className="hint" style={{ marginTop: 10 }}>
            选项已按当前版本命令树过滤，不支持的子命令会自动隐藏。
          </div>
        ) : null}
        <div className="hint" style={{ marginTop: 12 }}>
          生成：<code>{text}</code>
        </div>
      </div>
    </div>
  )
}
