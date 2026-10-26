import { useMemo, useState } from 'react'
import { Award, Plus, Trash2, Trophy } from 'lucide-react'
import { ItemPickerDialog } from './ItemPickerDialog'
import { McIcon } from './McIcon'
import { mcName } from '../lib/mcAssets'
import {
  ADVANCEMENT_TRIGGERS,
  parseAdvancement,
  serializeAdvancement,
  type AdvancementFrame,
  type AdvancementModel
} from '../../../shared/advancement'

interface AdvancementEditorProps {
  content: string
  onChange: (content: string) => void
}

export function AdvancementEditor({ content, onChange }: AdvancementEditorProps) {
  const model = useMemo(() => parseAdvancement(content), [content])
  const [iconOpen, setIconOpen] = useState(false)

  if (!model) {
    return (
      <div className="diag info" style={{ marginTop: 12 }}>
        当前 JSON 不是“简单显示 + 单触发条件”的进度结构，请直接使用上方 JSON 编辑。
      </div>
    )
  }

  const update = (next: AdvancementModel): void => onChange(serializeAdvancement(next))
  const patchCriterion = (
    index: number,
    patch: Partial<AdvancementModel['criteria'][number]>
  ): void => {
    update({
      ...model,
      criteria: model.criteria.map((item, i) => (i === index ? { ...item, ...patch } : item))
    })
  }

  return (
    <div className="loot-structured-editor">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div className="card-title">
            <Trophy size={15} />
            进度结构化编辑
          </div>
          <div className="hint" style={{ marginTop: 4 }}>
            适合简单显示 + 无 conditions 的触发条件；复杂结构请使用 JSON。
          </div>
        </div>
        <button
          type="button"
          className="btn btn-sm"
          disabled={model.criteria.length >= 32}
          onClick={() =>
            update({
              ...model,
              criteria: [
                ...model.criteria,
                { name: `criterion_${model.criteria.length + 1}`, trigger: 'minecraft:tick' }
              ]
            })
          }
        >
          <Plus size={13} />
          添加条件
        </button>
      </div>

      <div className="grid-2">
        <div className="field">
          <label className="field-label" htmlFor="advancement-parent">
            父进度（可选）
          </label>
          <input
            id="advancement-parent"
            className="input"
            value={model.parent}
            spellCheck={false}
            placeholder="minecraft:story/root"
            onChange={(event) => update({ ...model, parent: event.target.value })}
          />
        </div>
        <label className="checkline" style={{ alignSelf: 'end', marginBottom: 6 }}>
          <input
            type="checkbox"
            checked={model.displayEnabled}
            onChange={(event) =>
              update({ ...model, displayEnabled: event.target.checked })
            }
          />
          显示在进度界面（display）
        </label>
      </div>

      {model.displayEnabled ? (
        <>
          <div className="field" style={{ marginTop: 12 }}>
            <span className="field-label">图标</span>
            <button
              type="button"
              className="item-select"
              style={{ marginTop: 4 }}
              onClick={() => setIconOpen(true)}
            >
              <McIcon category="items" id={model.icon} size={30} />
              <span className="item-main">
                <span className="item-name">{mcName('items', model.icon)}</span>
                <span className="item-sub">{model.icon}</span>
              </span>
              <span className="btn btn-sm">选择图标</span>
            </button>
          </div>

          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="field">
              <label className="field-label" htmlFor="advancement-structured-title">
                标题
              </label>
              <input
                id="advancement-structured-title"
                className="input"
                value={model.title}
                onChange={(event) => update({ ...model, title: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="advancement-structured-description">
                描述
              </label>
              <input
                id="advancement-structured-description"
                className="input"
                value={model.description}
                onChange={(event) => update({ ...model, description: event.target.value })}
              />
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: 10 }}>
            <div className="field">
              <label className="field-label" htmlFor="advancement-frame">
                进度框架
              </label>
              <select
                id="advancement-frame"
                className="select"
                value={model.frame}
                onChange={(event) =>
                  update({ ...model, frame: event.target.value as AdvancementFrame })
                }
              >
                <option value="task">普通 task</option>
                <option value="goal">目标 goal</option>
                <option value="challenge">挑战 challenge</option>
              </select>
            </div>
            <div className="row" style={{ alignSelf: 'end', marginBottom: 6, flexWrap: 'wrap' }}>
              <label className="checkline">
                <input
                  type="checkbox"
                  checked={model.showToast}
                  onChange={(event) =>
                    update({ ...model, showToast: event.target.checked })
                  }
                />
                弹 Toast
              </label>
              <label className="checkline">
                <input
                  type="checkbox"
                  checked={model.announceToChat}
                  onChange={(event) =>
                    update({ ...model, announceToChat: event.target.checked })
                  }
                />
                聊天公告
              </label>
              <label className="checkline">
                <input
                  type="checkbox"
                  checked={model.hidden}
                  onChange={(event) => update({ ...model, hidden: event.target.checked })}
                />
                隐藏
              </label>
            </div>
          </div>
        </>
      ) : null}

      <div className="field" style={{ marginTop: 14 }}>
        <span className="field-label">
          <Award size={13} /> 触发条件（{model.criteria.length}）
        </span>
        <div className="loot-entry-list">
          {model.criteria.map((criterion, index) => (
            <div className="loot-entry" key={`${criterion.name}-${index}`}>
              <label className="loot-entry-field" style={{ width: 150 }}>
                <span>条件名</span>
                <input
                  id={`advancement-criterion-name-${index}`}
                  className="input"
                  value={criterion.name}
                  spellCheck={false}
                  onChange={(event) =>
                    patchCriterion(index, { name: event.target.value })
                  }
                />
              </label>
              <label className="loot-entry-field" style={{ flex: 1, width: 'auto' }}>
                <span>触发器</span>
                <input
                  id={`advancement-criterion-trigger-${index}`}
                  className="input"
                  list="advancement-trigger-suggestions"
                  value={criterion.trigger}
                  spellCheck={false}
                  onChange={(event) =>
                    patchCriterion(index, { trigger: event.target.value })
                  }
                />
              </label>
              <button
                type="button"
                className="icon-btn"
                aria-label="删除触发条件"
                disabled={model.criteria.length <= 1}
                onClick={() =>
                  update({
                    ...model,
                    criteria: model.criteria.filter((_, i) => i !== index)
                  })
                }
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <datalist id="advancement-trigger-suggestions">
          {ADVANCEMENT_TRIGGERS.map((trigger) => (
            <option key={trigger} value={trigger} />
          ))}
        </datalist>
      </div>

      {iconOpen ? (
        <ItemPickerDialog
          currentId={model.icon}
          onSelect={(icon) => update({ ...model, icon })}
          onClose={() => setIconOpen(false)}
        />
      ) : null}
    </div>
  )
}
