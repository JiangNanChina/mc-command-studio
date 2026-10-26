import { useState } from 'react'
import { PackageX, Trash2 } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import { mcName } from '../lib/mcAssets'
import { ItemPickerDialog } from './ItemPickerDialog'
import { McIcon } from './McIcon'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('clear')

export function ClearForm() {
  const state = useAppStore()
  const clear = state.clear
  const [itemOpen, setItemOpen] = useState(false)

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 物品 / clear</div>
          <div className="hero">
            <div className="hero-icon">
              <PackageX size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '清除物品'}
                <span className="hero-id">clear</span>
              </h1>
              <p className="hero-sub">
                清除玩家全部物品，或只清除指定物品并限制数量。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Trash2 size={15} />
            清除范围
          </div>
        </div>
        <div className="card-body">
          <SelectorField
            value={clear.target}
            label="玩家目标"
            onChange={(target) => state.updateClear({ target })}
          />
          <div className="row" style={{ marginTop: 12 }}>
            <button
              type="button"
              className={`btn${clear.allItems ? ' btn-primary' : ''}`}
              onClick={() => state.updateClear({ allItems: true })}
            >
              全部物品
            </button>
            <button
              type="button"
              className={`btn${!clear.allItems ? ' btn-primary' : ''}`}
              onClick={() => state.updateClear({ allItems: false })}
            >
              指定物品
            </button>
          </div>

          {!clear.allItems ? (
            <>
              <div className="item-select" style={{ marginTop: 12 }}>
                <McIcon category="items" id={clear.item} size={34} />
                <div className="item-main">
                  <div className="item-name">{mcName('items', clear.item)}</div>
                  <div className="item-sub">{clear.item}</div>
                </div>
                <button type="button" className="btn btn-sm" onClick={() => setItemOpen(true)}>
                  选择物品
                </button>
              </div>
              <label className="checkline" style={{ marginTop: 12 }}>
                <input
                  type="checkbox"
                  checked={clear.maxCountEnabled}
                  onChange={(event) =>
                    state.updateClear({ maxCountEnabled: event.target.checked })
                  }
                />
                限制最大清除数量
              </label>
              {clear.maxCountEnabled ? (
                <div className="field" style={{ marginTop: 10 }}>
                  <label className="field-label" htmlFor="clear-max-count">
                    最大数量
                  </label>
                  <input
                    id="clear-max-count"
                    className="input"
                    value={clear.maxCount}
                    onChange={(event) =>
                      state.updateClear({ maxCount: event.target.value })
                    }
                  />
                  <div className="hint">0 表示只统计数量，不实际移除。</div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="hint" style={{ marginTop: 12 }}>
              清除全部物品时无法附加数量限制；如需限制，请选择“指定物品”。
            </div>
          )}
        </div>
      </div>

      {itemOpen ? (
        <ItemPickerDialog
          currentId={clear.item}
          onSelect={(item) => state.updateClear({ item })}
          onClose={() => setItemOpen(false)}
        />
      ) : null}
    </div>
  )
}
