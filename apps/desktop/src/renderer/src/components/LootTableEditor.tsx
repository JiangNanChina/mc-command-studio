import { useMemo, useState } from 'react'
import { Package, Plus, Trash2 } from 'lucide-react'
import { ItemPickerDialog } from './ItemPickerDialog'
import { McIcon } from './McIcon'
import { mcName } from '../lib/mcAssets'
import {
  parseLootTable,
  serializeLootTable,
  type LootTableModel
} from '../../../shared/lootTable'

interface LootTableEditorProps {
  content: string
  onChange: (content: string) => void
}

function num(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

export function LootTableEditor({ content, onChange }: LootTableEditorProps) {
  const model = useMemo(() => parseLootTable(content), [content])
  const [pickerIndex, setPickerIndex] = useState<number | null>(null)

  if (!model) {
    return (
      <div className="diag info" style={{ marginTop: 12 }}>
        当前 JSON 不是“单池、纯物品、无附加条件”的简单结构，请直接使用上方 JSON 编辑。
      </div>
    )
  }

  const update = (next: LootTableModel): void => onChange(serializeLootTable(next))

  const patchEntry = (index: number, patch: Partial<LootTableModel['entries'][number]>): void => {
    update({
      ...model,
      entries: model.entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry))
    })
  }

  const removeEntry = (index: number): void => {
    if (model.entries.length <= 1) return
    update({ ...model, entries: model.entries.filter((_, i) => i !== index) })
  }

  const addEntry = (): void => {
    if (model.entries.length >= 64) return
    update({
      ...model,
      entries: [
        ...model.entries,
        {
          id: 'minecraft:stone',
          weight: 1,
          minCount: 1,
          maxCount: 1
        }
      ]
    })
    setPickerIndex(model.entries.length)
  }

  return (
    <div className="loot-structured-editor">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div className="card-title">
            <Package size={15} />
            结构化编辑
          </div>
          <div className="hint" style={{ marginTop: 4 }}>
            适合单池、纯物品、无条件的战利品表；复杂结构请使用 JSON。
          </div>
        </div>
        <button type="button" className="btn btn-sm" onClick={addEntry}>
          <Plus size={13} />
          添加掉落物
        </button>
      </div>

      <div className="grid-2">
        <div className="field">
          <label className="field-label" htmlFor="loot-structured-type">
            战利品表类型
          </label>
          <input
            id="loot-structured-type"
            className="input"
            value={model.type}
            spellCheck={false}
            onChange={(event) => update({ ...model, type: event.target.value })}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="loot-structured-bonus">
            幸运加成 rolls
          </label>
          <input
            id="loot-structured-bonus"
            className="input"
            type="number"
            min={0}
            value={model.bonusRolls}
            onChange={(event) => update({ ...model, bonusRolls: num(event.target.value) })}
          />
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 10 }}>
        <div className="field">
          <label className="field-label" htmlFor="loot-structured-min-rolls">
            最少抽取次数
          </label>
          <input
            id="loot-structured-min-rolls"
            className="input"
            type="number"
            min={0}
            value={model.minRolls}
            onChange={(event) =>
              update({
                ...model,
                minRolls: num(event.target.value),
                maxRolls: Math.max(num(event.target.value), model.maxRolls)
              })
            }
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="loot-structured-max-rolls">
            最多抽取次数
          </label>
          <input
            id="loot-structured-max-rolls"
            className="input"
            type="number"
            min={0}
            value={model.maxRolls}
            onChange={(event) =>
              update({
                ...model,
                maxRolls: Math.max(num(event.target.value), model.minRolls)
              })
            }
          />
        </div>
      </div>

      <div className="field" style={{ marginTop: 14 }}>
        <span className="field-label">掉落物（{model.entries.length}）</span>
        <div className="loot-entry-list">
          {model.entries.map((entry, index) => (
            <div className="loot-entry" key={`${entry.id}-${index}`}>
              <button
                type="button"
                className="loot-entry-item"
                onClick={() => setPickerIndex(index)}
              >
                <McIcon category="items" id={entry.id} size={28} />
                <span className="loot-entry-main">
                  <span className="loot-entry-name">{mcName('items', entry.id)}</span>
                  <span className="loot-entry-id">{entry.id}</span>
                </span>
              </button>
              <label className="loot-entry-field">
                <span>权重</span>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={entry.weight}
                  onChange={(event) =>
                    patchEntry(index, { weight: Math.max(1, num(event.target.value)) })
                  }
                />
              </label>
              <label className="loot-entry-field">
                <span>最少</span>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={entry.minCount}
                  onChange={(event) =>
                    patchEntry(index, {
                      minCount: Math.max(1, num(event.target.value)),
                      maxCount: Math.max(Math.max(1, num(event.target.value)), entry.maxCount)
                    })
                  }
                />
              </label>
              <label className="loot-entry-field">
                <span>最多</span>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={entry.maxCount}
                  onChange={(event) =>
                    patchEntry(index, {
                      maxCount: Math.max(Math.max(1, num(event.target.value)), entry.minCount)
                    })
                  }
                />
              </label>
              <button
                type="button"
                className="icon-btn"
                aria-label="删除掉落物"
                disabled={model.entries.length <= 1}
                onClick={() => removeEntry(index)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="hint" style={{ marginTop: 6 }}>
          权重越高越常见；最少/最多不同会生成 uniform 数量。
        </div>
      </div>

      {pickerIndex !== null ? (
        <ItemPickerDialog
          currentId={model.entries[pickerIndex]?.id}
          onSelect={(id) => {
            if (pickerIndex < model.entries.length) patchEntry(pickerIndex, { id })
          }}
          onClose={() => setPickerIndex(null)}
        />
      ) : null}
    </div>
  )
}
