import { Braces, Database } from 'lucide-react'
import {
  type DataAction,
  type DataModifyOperation,
  type DataTargetType
} from '@mcstudio/core'
import { COMMAND_MAP } from '@mcstudio/content'
import { PositionInput } from './PositionInput'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('data')

const ACTIONS: { value: DataAction; label: string }[] = [
  { value: 'get', label: '查询' },
  { value: 'modify', label: '修改路径' },
  { value: 'merge', label: '合并' },
  { value: 'remove', label: '删除路径' }
]

const MODIFY_OPERATIONS: { value: DataModifyOperation; label: string }[] = [
  { value: 'set', label: '设置 set' },
  { value: 'merge', label: '合并 merge' },
  { value: 'append', label: '追加 append' },
  { value: 'prepend', label: '前置 prepend' },
  { value: 'insert', label: '插入 insert' },
  { value: 'remove', label: '移除 remove' }
]

const TARGETS: { value: DataTargetType; label: string }[] = [
  { value: 'entity', label: '实体' },
  { value: 'block', label: '方块实体' },
  { value: 'storage', label: '命令存储' }
]

export function DataCommandForm() {
  const state = useAppStore()
  const options = state.dataCommand

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 数据 / data</div>
          <div className="hero">
            <div className="hero-icon">
              <Database size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? 'NBT 数据'}
                <span className="hero-id">data</span>
              </h1>
              <p className="hero-sub">
                查询实体/方块/命令存储的 NBT，合并 SNBT，或删除指定 NBT 路径。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Database size={15} />
            操作与目标
          </div>
          <div className="row">
            {ACTIONS.map((action) => (
              <button
                key={action.value}
                type="button"
                className={`btn btn-sm${options.action === action.value ? ' btn-primary' : ''}`}
                onClick={() => state.updateDataCommand({ action: action.value })}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          <div className="row" style={{ marginBottom: 12 }}>
            {TARGETS.map((target) => (
              <button
                key={target.value}
                type="button"
                className={`btn btn-sm${options.targetType === target.value ? ' btn-primary' : ''}`}
                onClick={() => state.updateDataCommand({ targetType: target.value })}
              >
                {target.label}
              </button>
            ))}
          </div>

          {options.targetType === 'entity' ? (
            <SelectorField
              value={options.target}
              label="实体目标（单个）"
              onChange={(target) => state.updateDataCommand({ target })}
            />
          ) : options.targetType === 'block' ? (
            <PositionInput
              label="方块坐标"
              value={options.position}
              onChange={(position) => state.updateDataCommand({ position })}
            />
          ) : (
            <div className="field">
              <label className="field-label" htmlFor="data-storage">
                命令存储 ID
              </label>
              <input
                id="data-storage"
                className="input"
                value={options.storage}
                spellCheck={false}
                onChange={(event) =>
                  state.updateDataCommand({ storage: event.target.value })
                }
              />
              <div className="hint">格式 namespace:path。</div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Braces size={15} />
            NBT
          </div>
        </div>
        <div className="card-body">
          {options.action === 'merge' ? (
            <div className="field">
              <label className="field-label" htmlFor="data-nbt">
                合并 SNBT
              </label>
              <textarea
                id="data-nbt"
                className="textarea particle-raw"
                value={options.nbt}
                spellCheck={false}
                onChange={(event) => state.updateDataCommand({ nbt: event.target.value })}
              />
              <div className="hint">
                例如 <code className="code-inline">{'{Health:20,CustomName:"\\"Boss\\""}'}</code>。
              </div>
            </div>
          ) : (
            <>
              <div className="field">
                <label className="field-label" htmlFor="data-path">
                  NBT 路径
                </label>
                <input
                  id="data-path"
                  className="input"
                  value={options.path}
                  spellCheck={false}
                  placeholder="Health / Inventory[0] / foo.bar"
                  onChange={(event) =>
                    state.updateDataCommand({ path: event.target.value })
                  }
                />
                <div className="hint">查询可留空以读取整个 NBT；删除/修改路径不能为空。</div>
              </div>

              {options.action === 'modify' ? (
                <>
                  <div className="grid-2" style={{ marginTop: 12 }}>
                    <div className="field">
                      <label className="field-label" htmlFor="data-modify-operation">
                        操作
                      </label>
                      <select
                        id="data-modify-operation"
                        className="select"
                        value={options.modifyOperation}
                        onChange={(event) =>
                          state.updateDataCommand({
                            modifyOperation: event.target.value as DataModifyOperation
                          })
                        }
                      >
                        {MODIFY_OPERATIONS.map((operation) => (
                          <option key={operation.value} value={operation.value}>
                            {operation.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {options.modifyOperation === 'insert' ||
                    options.modifyOperation === 'remove' ? (
                      <div className="field">
                        <label className="field-label" htmlFor="data-index">
                          列表索引
                        </label>
                        <input
                          id="data-index"
                          className="input"
                          value={options.index}
                          onChange={(event) =>
                            state.updateDataCommand({ index: event.target.value })
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                  {options.modifyOperation !== 'remove' ? (
                    <div className="field" style={{ marginTop: 10 }}>
                      <label className="field-label" htmlFor="data-nbt">
                        SNBT 值
                      </label>
                      <textarea
                        id="data-nbt"
                        className="textarea particle-raw"
                        value={options.nbt}
                        spellCheck={false}
                        onChange={(event) =>
                          state.updateDataCommand({ nbt: event.target.value })
                        }
                      />
                    </div>
                  ) : null}
                </>
              ) : null}

              {options.action === 'get' ? (
                <>
                  <label className="checkline" style={{ marginTop: 12 }}>
                    <input
                      type="checkbox"
                      checked={options.scaleEnabled}
                      onChange={(event) =>
                        state.updateDataCommand({ scaleEnabled: event.target.checked })
                      }
                    />
                    使用 scale 缩放查询结果
                  </label>
                  {options.scaleEnabled ? (
                    <div className="field" style={{ marginTop: 10 }}>
                      <label className="field-label" htmlFor="data-scale">
                        scale
                      </label>
                      <input
                        id="data-scale"
                        className="input"
                        value={options.scale}
                        onChange={(event) =>
                          state.updateDataCommand({ scale: event.target.value })
                        }
                      />
                    </div>
                  ) : null}
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
