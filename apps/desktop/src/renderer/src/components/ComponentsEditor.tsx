import { Plus, Trash2, X } from 'lucide-react'
import {
  RARITIES,
  TEXT_COLORS,
  getVersionCapabilities,
  itemComponentLabel,
  type EnchantmentEntry,
  type ItemComponent,
  type TextLine
} from '@mcstudio/core'

const COLOR_LABELS: Record<string, string> = {
  black: '黑色',
  dark_blue: '深蓝',
  dark_green: '深绿',
  dark_aqua: '深青',
  dark_red: '深红',
  dark_purple: '深紫',
  gold: '金色',
  gray: '灰色',
  dark_gray: '深灰',
  blue: '蓝色',
  green: '绿色',
  aqua: '青色',
  red: '红色',
  light_purple: '淡紫',
  yellow: '黄色',
  white: '白色'
}

interface ComponentsEditorProps {
  components: ItemComponent[]
  enchantments: string[]
  gameVersion?: string
  onReplace: (index: number, component: ItemComponent) => void
  onRemove: (index: number) => void
}

function ColorSelect({
  value,
  onChange,
  label
}: {
  value: string | undefined
  onChange: (value: string) => void
  label: string
}) {
  return (
    <select className="select" value={value ?? ''} aria-label={label} onChange={(event) => onChange(event.target.value)}>
      <option value="">默认颜色</option>
      {TEXT_COLORS.map((color) => (
        <option key={color} value={color}>
          {COLOR_LABELS[color] ?? color}
        </option>
      ))}
    </select>
  )
}

export function ComponentsEditor({ components, enchantments, gameVersion, onReplace, onRemove }: ComponentsEditorProps) {
  const enchantmentOptions = enchantments.map((id) => (id.includes(':') ? id : `minecraft:${id}`))
  const integerModelData = getVersionCapabilities(gameVersion).customModelData === 'integer'

  return (
    <div>
      {components.length === 0 ? (
        <div className="component-empty">
          还没有添加组件。可以从上方“添加组件”选择一个；不添加组件也能生成普通的 give 命令。
        </div>
      ) : null}

      {components.map((component, index) => {
        if (component.kind === 'custom_name' || component.kind === 'item_name') {
          return (
            <div className="component-card" key={component.kind}>
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">{component.kind}</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <div className="field">
                  <label className="field-label" htmlFor={`component-${component.kind}-text`}>
                    名称
                  </label>
                  <input
                    id={`component-${component.kind}-text`}
                    className="input"
                    placeholder="例如 Excalibur"
                    value={component.text}
                    onChange={(event) => onReplace(index, { ...component, text: event.target.value })}
                  />
                </div>
                <div className="grid-3" style={{ marginTop: 10 }}>
                  <ColorSelect
                    value={component.color}
                    label="名称颜色"
                    onChange={(color) => onReplace(index, { ...component, color: color as TextLine['color'] })}
                  />
                  <label className="checkline">
                    <input
                      type="checkbox"
                      checked={component.italic}
                      onChange={(event) => onReplace(index, { ...component, italic: event.target.checked })}
                    />
                    斜体
                  </label>
                </div>
              </div>
            </div>
          )
        }

        if (component.kind === 'lore') {
          const updateLine = (lineIndex: number, patch: Partial<TextLine>): void => {
            const lines = component.lines.map((line, i) => (i === lineIndex ? { ...line, ...patch } : line))
            onReplace(index, { ...component, lines })
          }
          return (
            <div className="component-card" key="lore">
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">lore</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                {component.lines.map((line, lineIndex) => (
                  <div className="lore-line" key={lineIndex}>
                    <input
                      className="input"
                      placeholder={`第 ${lineIndex + 1} 行描述`}
                      value={line.text}
                      onChange={(event) => updateLine(lineIndex, { text: event.target.value })}
                    />
                    <ColorSelect
                      value={line.color}
                      label={`第 ${lineIndex + 1} 行颜色`}
                      onChange={(color) => updateLine(lineIndex, { color: color as TextLine['color'] })}
                    />
                    <label className="checkline">
                      <input
                        type="checkbox"
                        checked={line.italic}
                        onChange={(event) => updateLine(lineIndex, { italic: event.target.checked })}
                      />
                      斜体
                    </label>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="删除这一行"
                      onClick={() => {
                        if (component.lines.length <= 1) return
                        onReplace(index, { ...component, lines: component.lines.filter((_, i) => i !== lineIndex) })
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-row"
                  onClick={() =>
                    onReplace(index, {
                      ...component,
                      lines: [...component.lines, { text: '', color: '', italic: false }]
                    })
                  }
                >
                  <Plus size={13} />
                  添加一行
                </button>
              </div>
            </div>
          )
        }

        if (component.kind === 'enchantments') {
          const updateEntry = (entryIndex: number, patch: Partial<EnchantmentEntry>): void => {
            const entries = component.entries.map((entry, i) =>
              i === entryIndex ? { ...entry, ...patch } : entry
            )
            onReplace(index, { ...component, entries })
          }
          return (
            <div className="component-card" key="enchantments">
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">enchantments</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                {component.entries.map((entry, entryIndex) => (
                  <div className="enchant-row" key={entryIndex}>
                    <input
                      className="input"
                      list="enchantment-options"
                      value={entry.id}
                      onChange={(event) => updateEntry(entryIndex, { id: event.target.value })}
                    />
                    <input
                      className="input"
                      type="number"
                      min={1}
                      max={255}
                      value={entry.level}
                      onChange={(event) =>
                        updateEntry(entryIndex, { level: Math.max(1, Number(event.target.value) || 1) })
                      }
                    />
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="删除附魔"
                      onClick={() =>
                        onReplace(index, {
                          ...component,
                          entries: component.entries.filter((_, i) => i !== entryIndex)
                        })
                      }
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <datalist id="enchantment-options">
                  {enchantmentOptions.map((id) => (
                    <option key={id} value={id} />
                  ))}
                </datalist>
                <button
                  type="button"
                  className="add-row"
                  onClick={() =>
                    onReplace(index, {
                      ...component,
                      entries: [...component.entries, { id: 'minecraft:sharpness', level: 1 }]
                    })
                  }
                >
                  <Plus size={13} />
                  添加附魔
                </button>
                <div className="hint" style={{ marginTop: 8 }}>
                  1.21+ 使用扁平映射，例如 <code className="code-inline">{'{sharpness:5,knockback:2}'}</code>。
                </div>
              </div>
            </div>
          )
        }

        if (component.kind === 'unbreakable') {
          return (
            <div className="component-card" key="unbreakable">
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">unbreakable</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <div className="hint">已启用：物品不会损失耐久，并隐藏耐久条。生成值为 unbreakable={'{}'}。</div>
              </div>
            </div>
          )
        }

        if (component.kind === 'max_stack_size') {
          return (
            <div className="component-card" key="max_stack_size">
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">max_stack_size</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <div className="field">
                  <label className="field-label" htmlFor="max-stack-size">
                    最大堆叠（1–99）
                  </label>
                  <input
                    id="max-stack-size"
                    className="input"
                    type="number"
                    min={1}
                    max={99}
                    value={component.value}
                    onChange={(event) =>
                      onReplace(index, {
                        ...component,
                        value: Math.max(1, Math.min(99, Number(event.target.value) || 1))
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )
        }

        if (component.kind === 'max_damage' || component.kind === 'damage') {
          const minimum = component.kind === 'max_damage' ? 1 : 0
          return (
            <div className="component-card" key={component.kind}>
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">{component.kind}</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <div className="field">
                  <label className="field-label" htmlFor={`component-${component.kind}`}>
                    {component.kind === 'max_damage' ? '最大耐久值' : '已消耗耐久值'}
                  </label>
                  <input
                    id={`component-${component.kind}`}
                    className="input"
                    type="number"
                    min={minimum}
                    value={component.value}
                    onChange={(event) =>
                      onReplace(index, {
                        ...component,
                        value: Math.max(minimum, Math.floor(Number(event.target.value) || minimum))
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )
        }

        if (component.kind === 'rarity') {
          return (
            <div className="component-card" key="rarity">
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">rarity</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <div className="field">
                  <label className="field-label" htmlFor="component-rarity">
                    稀有度
                  </label>
                  <select
                    id="component-rarity"
                    className="select"
                    value={component.value}
                    onChange={(event) =>
                      onReplace(index, { ...component, value: event.target.value as typeof component.value })
                    }
                  >
                    {RARITIES.map((rarity) => (
                      <option key={rarity} value={rarity}>
                        {rarity}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )
        }

        if (component.kind === 'enchantment_glint_override') {
          return (
            <div className="component-card" key="enchantment_glint_override">
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">enchantment_glint_override</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <label className="checkline">
                  <input
                    type="checkbox"
                    checked={component.value}
                    onChange={(event) => onReplace(index, { ...component, value: event.target.checked })}
                  />
                  强制附魔光效
                </label>
              </div>
            </div>
          )
        }

        if (component.kind === 'custom_data') {
          return (
            <div className="component-card" key="custom_data">
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">custom_data</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <textarea
                  className="textarea"
                  placeholder="例如 {my_pack:{level:3}}"
                  value={component.raw}
                  onChange={(event) => onReplace(index, { ...component, raw: event.target.value })}
                />
                <div className="hint">必须是一个完整的 SNBT 复合标签 {'{…}'}。</div>
              </div>
            </div>
          )
        }

        if (component.kind === 'raw') {
          return (
            <div className="component-card" key={`raw-${index}`}>
              <div className="component-head">
                <span className="component-title">{itemComponentLabel(component.kind)}</span>
                <span className="component-id">{component.id || 'raw'}</span>
                <span style={{ flex: 1 }} />
                <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="component-body">
                <div className="grid-2">
                  <div className="field">
                    <label className="field-label" htmlFor={`raw-id-${index}`}>
                      组件 ID
                    </label>
                    <input
                      id={`raw-id-${index}`}
                      className="input"
                      placeholder="minecraft:tooltip_display"
                      value={component.id}
                      onChange={(event) => onReplace(index, { ...component, id: event.target.value })}
                    />
                  </div>
                </div>
                <div className="field" style={{ marginTop: 10 }}>
                  <label className="field-label" htmlFor={`raw-value-${index}`}>
                    SNBT 值
                  </label>
                  <textarea
                    id={`raw-value-${index}`}
                    className="textarea"
                    placeholder='例如 {hidden_components:["minecraft:enchantments"]}'
                    value={component.value}
                    onChange={(event) => onReplace(index, { ...component, value: event.target.value })}
                  />
                </div>
              </div>
            </div>
          )
        }

        return (
          <div className="component-card" key="custom_model_data">
            <div className="component-head">
              <span className="component-title">{itemComponentLabel(component.kind)}</span>
              <span className="component-id">custom_model_data</span>
              <span style={{ flex: 1 }} />
              <button type="button" className="icon-btn" onClick={() => onRemove(index)} aria-label="移除组件">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="component-body">
              <div className="field">
                <label className="field-label" htmlFor="custom-model-data">
                  {integerModelData ? '整数模型编号' : 'SNBT 值'}
                </label>
                <textarea
                  id="custom-model-data"
                  className="textarea"
                  placeholder={integerModelData ? '例如 123' : '例如 {strings:["my_pack:model"]}'}
                  value={component.raw}
                  onChange={(event) => onReplace(index, { ...component, raw: event.target.value })}
                />
                <div className="hint">
                  {integerModelData
                    ? '当前版本使用整数模型编号，例如 123。'
                    : '当前版本使用复合值，例如 {strings:["my_pack:model"]}。'}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
