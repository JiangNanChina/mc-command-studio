import { useState } from 'react'
import { Package, Wrench } from 'lucide-react'
import {
  ITEM_SLOTS,
  type ItemAction,
  type ItemTargetType
} from '@mcstudio/core'
import { COMMAND_MAP } from '@mcstudio/content'
import { mcName } from '../lib/mcAssets'
import { ItemPickerDialog } from './ItemPickerDialog'
import { McIcon } from './McIcon'
import { PositionInput } from './PositionInput'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('item')

export function ItemCommandForm() {
  const state = useAppStore()
  const options = state.itemCommand
  const [itemOpen, setItemOpen] = useState(false)
  const nbtEngine = state.pack?.manifest.engine === 'nbt'

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 物品 / item</div>
          <div className="hero">
            <div className="hero-icon">
              <Package size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '物品操作'}
                <span className="hero-id">item</span>
              </h1>
              <p className="hero-sub">
                替换实体或方块容器槽位中的物品，或对槽位物品应用物品修饰符。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Wrench size={15} />
            操作
          </div>
          <div className="row">
            {(['replace', 'modify'] as ItemAction[]).map((action) => (
              <button
                key={action}
                type="button"
                className={`btn btn-sm${options.action === action ? ' btn-primary' : ''}`}
                onClick={() => state.updateItemCommand({ action })}
              >
                {action === 'replace' ? '替换物品' : '应用修饰符'}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          <div className="row" style={{ marginBottom: 10 }}>
            {(['entity', 'block'] as ItemTargetType[]).map((type) => (
              <button
                key={type}
                type="button"
                className={`btn btn-sm${options.targetType === type ? ' btn-primary' : ''}`}
                onClick={() => state.updateItemCommand({ targetType: type })}
              >
                {type === 'entity' ? '实体槽位' : '方块容器'}
              </button>
            ))}
          </div>

          {options.targetType === 'entity' ? (
            <SelectorField
              value={options.target}
              label="实体目标"
              onChange={(target) => state.updateItemCommand({ target })}
            />
          ) : (
            <PositionInput
              label="方块坐标"
              value={options.position}
              onChange={(position) => state.updateItemCommand({ position })}
            />
          )}

          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label" htmlFor="item-slot">
              槽位
            </label>
            <input
              id="item-slot"
              className="input"
              list="item-slot-suggestions"
              value={options.slot}
              spellCheck={false}
              onChange={(event) => state.updateItemCommand({ slot: event.target.value })}
            />
            <datalist id="item-slot-suggestions">
              {ITEM_SLOTS.map((slot) => (
                <option key={slot} value={slot} />
              ))}
            </datalist>
            <div className="hint">
              例如 weapon.mainhand、armor.head、hotbar.0、container.0。
            </div>
          </div>
        </div>
      </div>

      {options.action === 'replace' ? (
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <Package size={15} />
              物品
            </div>
          </div>
          <div className="card-body">
            <div className="item-select">
              <McIcon category="items" id={options.item} size={34} />
              <div className="item-main">
                <div className="item-name">{mcName('items', options.item)}</div>
                <div className="item-sub">{options.item}</div>
              </div>
              <button type="button" className="btn btn-sm" onClick={() => setItemOpen(true)}>
                选择物品
              </button>
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label className="field-label" htmlFor="item-count">
                数量（1–99）
              </label>
              <input
                id="item-count"
                className="input"
                value={options.count}
                onChange={(event) => state.updateItemCommand({ count: event.target.value })}
              />
            </div>
            {nbtEngine ? (
              <>
                <label className="checkline" style={{ marginTop: 12 }}>
                  <input
                    type="checkbox"
                    checked={options.nbtEnabled}
                    onChange={(event) =>
                      state.updateItemCommand({ nbtEnabled: event.target.checked })
                    }
                  />
                  追加 NBT（1.20.4）
                </label>
                {options.nbtEnabled ? (
                  <div className="field" style={{ marginTop: 10 }}>
                    <label className="field-label" htmlFor="item-nbt">
                      物品 NBT
                    </label>
                    <textarea
                      id="item-nbt"
                      className="textarea particle-raw"
                      value={options.nbt}
                      spellCheck={false}
                      onChange={(event) =>
                        state.updateItemCommand({ nbt: event.target.value })
                      }
                    />
                    <div className="hint">
                      例如 {`{display:{Name:'{"text":"剑"}'}}`}。
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <Wrench size={15} />
              物品修饰符
            </div>
          </div>
          <div className="card-body">
            <div className="field">
              <label className="field-label" htmlFor="item-modifier">
                修饰符 ID
              </label>
              <input
                id="item-modifier"
                className="input"
                value={options.modifier}
                spellCheck={false}
                onChange={(event) =>
                  state.updateItemCommand({ modifier: event.target.value })
                }
              />
              <div className="hint">
                数据包中的物品修饰符，格式 namespace:path，例如 mcstudio:bonus。
              </div>
            </div>
          </div>
        </div>
      )}

      {itemOpen ? (
        <ItemPickerDialog
          currentId={options.item}
          onSelect={(item) => state.updateItemCommand({ item })}
          onClose={() => setItemOpen(false)}
        />
      ) : null}
    </div>
  )
}
