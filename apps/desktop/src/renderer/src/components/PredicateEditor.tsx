import { useMemo } from 'react'
import { Filter, Plus, Trash2 } from 'lucide-react'
import {
  ENTITY_FLAGS,
  PREDICATE_TYPES,
  createPredicateCondition,
  parsePredicate,
  predicateMode,
  serializePredicate,
  type EntityFlag,
  type PredicateCondition,
  type PredicateMode,
  type PredicateType
} from '../../../shared/predicate'

interface PredicateEditorProps {
  content: string
  onChange: (content: string) => void
}

const ENTITY_OPTIONS = [
  { value: 'this', label: 'this（当前实体）' },
  { value: 'killer', label: 'killer（击杀者）' },
  { value: 'player', label: 'player（玩家）' },
  { value: 'direct_killer', label: 'direct_killer（直接击杀者）' }
]

export function PredicateEditor({ content, onChange }: PredicateEditorProps) {
  const model = useMemo(() => parsePredicate(content), [content])

  if (!model) {
    return (
      <div className="diag info" style={{ marginTop: 12 }}>
        当前 JSON 不是受支持的简单条件结构，请直接使用上方 JSON 编辑。
      </div>
    )
  }

  const update = (next: typeof model): void => onChange(serializePredicate(next))

  const patch = (index: number, patchValue: Partial<PredicateCondition>): void => {
    update({
      ...model,
      conditions: model.conditions.map((condition, i) =>
        i === index ? { ...condition, ...patchValue } : condition
      )
    })
  }

  const add = (): void => {
    if (model.conditions.length >= 32) return
    update({
      ...model,
      mode: model.conditions.length === 0 ? 'single' : model.mode === 'single' ? 'all_of' : model.mode,
      conditions: [...model.conditions, createPredicateCondition('random_chance')]
    })
  }

  const remove = (index: number): void => {
    if (model.conditions.length <= 1) return
    const conditions = model.conditions.filter((_, i) => i !== index)
    update({
      ...model,
      mode: conditions.length === 1 ? 'single' : model.mode,
      conditions
    })
  }

  return (
    <div className="loot-structured-editor">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div className="card-title">
            <Filter size={15} />
            条件结构化编辑
          </div>
          <div className="hint" style={{ marginTop: 4 }}>
            支持随机概率、天气、时间、实体状态；复杂条件请使用 JSON。
          </div>
        </div>
        <button type="button" className="btn btn-sm" onClick={add}>
          <Plus size={13} />
          添加条件
        </button>
      </div>

      {model.conditions.length > 1 ? (
        <div className="field" style={{ maxWidth: 240 }}>
          <label className="field-label" htmlFor="predicate-mode">
            组合方式
          </label>
          <select
            id="predicate-mode"
            className="select"
            value={predicateMode(model)}
            onChange={(event) =>
              update({
                ...model,
                mode: event.target.value as PredicateMode
              })
            }
          >
            <option value="all_of">全部满足 all_of</option>
            <option value="any_of">任意满足 any_of</option>
          </select>
        </div>
      ) : null}

      <div className="loot-entry-list" style={{ marginTop: 10 }}>
        {model.conditions.map((condition, index) => (
          <div className="predicate-condition" key={index}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <select
                id={`predicate-type-${index}`}
                className="select"
                style={{ width: 160 }}
                value={condition.type}
                onChange={(event) =>
                  patch(index, {
                    type: event.target.value as PredicateType,
                    ...(event.target.value === 'random_chance'
                      ? { chance: 0.5 }
                      : event.target.value === 'time_check'
                        ? { time: 0 }
                        : event.target.value === 'value_check'
                          ? { valueObjective: 'kills', valueMin: 1, valueMax: 5 }
                          : {})
                  })
                }
              >
                {PREDICATE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="icon-btn"
                aria-label="删除条件"
                disabled={model.conditions.length <= 1}
                onClick={() => remove(index)}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {condition.type === 'random_chance' ? (
              <div className="field" style={{ marginTop: 8 }}>
                <label className="field-label" htmlFor={`predicate-chance-${index}`}>
                  概率（0–1）
                </label>
                <input
                  id={`predicate-chance-${index}`}
                  className="input"
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={condition.chance}
                  onChange={(event) =>
                    patch(index, { chance: Math.min(1, Math.max(0, Number(event.target.value))) })
                  }
                />
              </div>
            ) : null}

            {condition.type === 'weather_check' ? (
              <div className="row" style={{ marginTop: 8, flexWrap: 'wrap' }}>
                <label className="checkline">
                  <input
                    type="checkbox"
                    checked={condition.raining}
                    onChange={(event) => patch(index, { raining: event.target.checked })}
                  />
                  正在下雨
                </label>
                <label className="checkline">
                  <input
                    type="checkbox"
                    checked={condition.thundering}
                    onChange={(event) =>
                      patch(index, { thundering: event.target.checked })
                    }
                  />
                  正在雷暴
                </label>
              </div>
            ) : null}

            {condition.type === 'time_check' ? (
              <div className="field" style={{ marginTop: 8 }}>
                <label className="field-label" htmlFor={`predicate-time-${index}`}>
                  游戏时间 tick
                </label>
                <input
                  id={`predicate-time-${index}`}
                  className="input"
                  type="number"
                  min={0}
                  value={condition.time}
                  onChange={(event) =>
                    patch(index, { time: Math.max(0, Number(event.target.value)) })
                  }
                />
              </div>
            ) : null}

            {condition.type === 'value_check' ? (
              <>
                <div className="field" style={{ marginTop: 8 }}>
                  <label className="field-label" htmlFor={`predicate-value-objective-${index}`}>
                    记分板目标
                  </label>
                  <input
                    id={`predicate-value-objective-${index}`}
                    className="input"
                    value={condition.valueObjective}
                    onChange={(event) =>
                      patch(index, { valueObjective: event.target.value })
                    }
                  />
                </div>
                <div className="grid-2" style={{ marginTop: 8 }}>
                  <div className="field">
                    <label className="field-label" htmlFor={`predicate-value-min-${index}`}>
                      最小值
                    </label>
                    <input
                      id={`predicate-value-min-${index}`}
                      className="input"
                      type="number"
                      value={condition.valueMin}
                      onChange={(event) =>
                        patch(index, { valueMin: Number(event.target.value) })
                      }
                    />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor={`predicate-value-max-${index}`}>
                      最大值
                    </label>
                    <input
                      id={`predicate-value-max-${index}`}
                      className="input"
                      type="number"
                      value={condition.valueMax}
                      onChange={(event) =>
                        patch(index, { valueMax: Number(event.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="hint" style={{ marginTop: 6 }}>
                  读取执行者 this 的记分板数值，判断是否落在区间内。
                </div>
              </>
            ) : null}

            {condition.type === 'entity_properties' ? (
              <>
                <div className="field" style={{ marginTop: 8 }}>
                  <label className="field-label" htmlFor={`predicate-entity-${index}`}>
                    实体角色
                  </label>
                  <select
                    id={`predicate-entity-${index}`}
                    className="select"
                    value={condition.entity}
                    onChange={(event) => patch(index, { entity: event.target.value })}
                  >
                    {ENTITY_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="row" style={{ marginTop: 8, flexWrap: 'wrap' }}>
                  {ENTITY_FLAGS.map((flag) => (
                    <label className="checkline" key={flag}>
                      <input
                        type="checkbox"
                        checked={condition.flags.includes(flag)}
                        onChange={(event) =>
                          patch(index, {
                            flags: event.target.checked
                              ? [...condition.flags, flag as EntityFlag]
                              : condition.flags.filter((item) => item !== flag)
                          })
                        }
                      />
                      {flag}
                    </label>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
