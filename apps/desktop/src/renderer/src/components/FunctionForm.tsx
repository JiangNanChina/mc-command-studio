import { useShallow } from 'zustand/react/shallow'
import { Braces, Code2 } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('function')

export function FunctionForm() {
  const state = useAppStore(useShallow((state) => ({
    automation: state.automation,
    datapack: state.datapack,
    updateFunction: state.updateFunction
  })))
  const fn = state.automation.function
  const dataFunctions = state.datapack.functions.map(
    (item) => `${state.datapack.namespace}:${item.name}`
  )

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 数据 / function</div>
          <div className="hero">
            <div className="hero-icon">
              <Code2 size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '函数'}
                <span className="hero-id">function</span>
              </h1>
              <p className="hero-sub">
                运行数据包中的 .mcfunction；可直接引用数据包工作区里的函数，也支持宏参数。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Code2 size={15} />
            函数调用
          </div>
        </div>
        <div className="card-body">
          <div className="field">
            <label className="field-label" htmlFor="function-name">
              函数名
            </label>
            <input
              id="function-name"
              className="input"
              list="function-suggestions"
              value={fn.name}
              spellCheck={false}
              onChange={(event) => state.updateFunction({ name: event.target.value })}
            />
            <datalist id="function-suggestions">
              {dataFunctions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <div className="hint">
              格式 namespace:path。数据包工作区已有 {dataFunctions.length} 个函数。
            </div>
          </div>

          <label className="checkline" style={{ marginTop: 12 }}>
            <input
              type="checkbox"
              checked={fn.argumentsEnabled}
              onChange={(event) =>
                state.updateFunction({ argumentsEnabled: event.target.checked })
              }
            />
            传入宏参数（SNBT）
          </label>

          {fn.argumentsEnabled ? (
            <div className="field" style={{ marginTop: 10 }}>
              <label className="field-label" htmlFor="function-arguments">
                参数
              </label>
              <textarea
                id="function-arguments"
                className="textarea particle-raw"
                value={fn.arguments}
                spellCheck={false}
                onChange={(event) =>
                  state.updateFunction({ arguments: event.target.value })
                }
              />
              <div className="hint">
                例如 <code className="code-inline">{'{"name":"Steve","count":3}'}</code>。
              </div>
            </div>
          ) : null}

          <div className="diag info" style={{ marginTop: 14 }}>
            <Braces size={15} />
            <span>函数需位于数据包 data/&lt;namespace&gt;/function/ 下，导出后执行 /reload。</span>
          </div>
        </div>
      </div>
    </div>
  )
}
