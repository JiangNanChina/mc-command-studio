import { useEffect, useState } from 'react'
import { Activity, Gauge } from 'lucide-react'
import {
  ATTRIBUTE_OPERATIONS,
  type AttributeAction,
  type AttributeOperation
} from '@mcstudio/core'
import { COMMAND_MAP } from '@mcstudio/content'
import { AttributePickerDialog, attributeName } from './AttributePickerDialog'
import { SelectorField } from './SelectorField'
import { hasCommandPath, isLegacyNbtPack } from '../lib/versionFeatures'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('attribute')

const ACTIONS: { value: AttributeAction; label: string }[] = [
  { value: 'get', label: '查询总值' },
  { value: 'base-get', label: '查询基础值' },
  { value: 'base-set', label: '设置基础值' },
  { value: 'base-reset', label: '重置基础值' },
  { value: 'modifier-add', label: '添加修饰符' },
  { value: 'modifier-remove', label: '移除修饰符' },
  { value: 'modifier-value', label: '查询修饰符值' }
]

export function AttributeForm() {
  const state = useAppStore()
  const attribute = state.attribute
  const [pickerOpen, setPickerOpen] = useState(false)
  const legacy = isLegacyNbtPack(state.pack)
  const supportsReset = hasCommandPath(
    state.pack,
    'attribute',
    'target',
    'attribute',
    'base',
    'reset'
  )
  const actions = ACTIONS.filter(
    (action) => action.value !== 'base-reset' || supportsReset
  )
  const showScale =
    attribute.action === 'get' ||
    attribute.action === 'base-get' ||
    attribute.action === 'modifier-value'
  const showModifier =
    attribute.action === 'modifier-add' ||
    attribute.action === 'modifier-remove' ||
    attribute.action === 'modifier-value'

  useEffect(() => {
    if (!supportsReset && attribute.action === 'base-reset') {
      state.updateAttribute({ action: 'get' })
    }
  }, [attribute.action, supportsReset, state])

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 实体 / attribute</div>
          <div className="hero">
            <div className="hero-icon">
              <Activity size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '实体属性'}
                <span className="hero-id">attribute</span>
              </h1>
              <p className="hero-sub">
                查询或设置实体属性，管理加算/乘算修饰符。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Gauge size={15} />
            属性与操作
          </div>
          <div className="card-hint">{attributeName(attribute.attribute)}</div>
        </div>
        <div className="card-body">
          <SelectorField
            value={attribute.target}
            label="实体目标（单个）"
            onChange={(target) => state.updateAttribute({ target })}
          />

          <button
            type="button"
            className="attribute-selected"
            style={{ marginTop: 12 }}
            onClick={() => setPickerOpen(true)}
          >
            <span className="attribute-selected-main">
              <span className="attribute-selected-name">
                {attributeName(attribute.attribute)}
              </span>
              <span className="attribute-selected-id">{attribute.attribute}</span>
            </span>
            <span className="btn btn-sm">选择属性</span>
          </button>

          <div className="row" style={{ flexWrap: 'wrap', marginTop: 12 }}>
            {actions.map((action) => (
              <button
                key={action.value}
                type="button"
                className={`btn btn-sm${attribute.action === action.value ? ' btn-primary' : ''}`}
                onClick={() => state.updateAttribute({ action: action.value })}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">参数</div>
        </div>
        <div className="card-body">
          {attribute.action === 'base-set' ? (
            <div className="field">
              <label className="field-label" htmlFor="attribute-value">
                基础值
              </label>
              <input
                id="attribute-value"
                className="input"
                value={attribute.value}
                onChange={(event) => state.updateAttribute({ value: event.target.value })}
              />
            </div>
          ) : null}

          {attribute.action === 'base-reset' ? (
            <div className="hint">将基础值重置为属性默认值。</div>
          ) : null}

          {showScale ? (
            <>
              <label className="checkline">
                <input
                  type="checkbox"
                  checked={attribute.scaleEnabled}
                  onChange={(event) =>
                    state.updateAttribute({ scaleEnabled: event.target.checked })
                  }
                />
                使用 scale 缩放查询结果
              </label>
              {attribute.scaleEnabled ? (
                <div className="field" style={{ marginTop: 10 }}>
                  <label className="field-label" htmlFor="attribute-scale">
                    scale
                  </label>
                  <input
                    id="attribute-scale"
                    className="input"
                    value={attribute.scale}
                    onChange={(event) =>
                      state.updateAttribute({ scale: event.target.value })
                    }
                  />
                </div>
              ) : null}
            </>
          ) : null}

          {showModifier ? (
            legacy ? (
              <>
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="attribute-modifier-uuid">
                    修饰符 UUID
                  </label>
                  <input
                    id="attribute-modifier-uuid"
                    className="input"
                    value={attribute.modifierUuid}
                    spellCheck={false}
                    onChange={(event) =>
                      state.updateAttribute({ modifierUuid: event.target.value })
                    }
                  />
                </div>
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="attribute-modifier-name">
                    修饰符名称
                  </label>
                  <input
                    id="attribute-modifier-name"
                    className="input"
                    value={attribute.modifierName}
                    onChange={(event) =>
                      state.updateAttribute({ modifierName: event.target.value })
                    }
                  />
                </div>
                <div className="hint" style={{ marginTop: 6 }}>
                  1.20.4 使用 UUID + 名称标识修饰符。
                </div>
              </>
            ) : (
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="attribute-modifier-id">
                  修饰符 ID
                </label>
                <input
                  id="attribute-modifier-id"
                  className="input"
                  value={attribute.modifierId}
                  spellCheck={false}
                  onChange={(event) =>
                    state.updateAttribute({ modifierId: event.target.value })
                  }
                />
                <div className="hint">格式 namespace:path，例如 mcstudio:bonus。</div>
              </div>
            )
          ) : null}

          {attribute.action === 'modifier-add' ? (
            <>
              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="attribute-modifier-value">
                    修饰符值
                  </label>
                  <input
                    id="attribute-modifier-value"
                    className="input"
                    value={attribute.modifierValue}
                    onChange={(event) =>
                      state.updateAttribute({ modifierValue: event.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="attribute-operation">
                    运算方式
                  </label>
                  <select
                    id="attribute-operation"
                    className="select"
                    value={attribute.operation}
                    onChange={(event) =>
                      state.updateAttribute({
                        operation: event.target.value as AttributeOperation
                      })
                    }
                  >
                    {ATTRIBUTE_OPERATIONS.map((operation) => (
                      <option key={operation.value} value={operation.value}>
                        {operation.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {pickerOpen ? (
        <AttributePickerDialog
          current={attribute.attribute}
          onSelect={(id) => state.updateAttribute({ attribute: id })}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  )
}
