import { Gift, Sparkles } from 'lucide-react'
import { type LootAction } from '@mcstudio/core'
import { COMMAND_MAP } from '@mcstudio/content'
import { PositionInput } from './PositionInput'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('loot')

const ACTIONS: { value: LootAction; label: string }[] = [
  { value: 'give', label: '给予玩家' },
  { value: 'spawn', label: '生成掉落物' },
  { value: 'insert', label: '插入容器' }
]

const COMMON_LOOT_TABLES = [
  'minecraft:chests/simple_dungeon',
  'minecraft:chests/shipwreck_treasure',
  'minecraft:chests/village/village_weaponsmith',
  'minecraft:chests/nether_bridge',
  'minecraft:chests/end_city_treasure',
  'minecraft:entities/zombie',
  'minecraft:entities/creeper'
]

export function LootForm() {
  const state = useAppStore()
  const loot = state.loot
  const dataLootTables = state.datapack.dataFiles
    .filter((file) => file.type === 'loot_table')
    .map((file) => `${state.datapack.namespace}:${file.name}`)

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 物品 / loot</div>
          <div className="hero">
            <div className="hero-icon">
              <Gift size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '战利品'}
                <span className="hero-id">loot</span>
              </h1>
              <p className="hero-sub">
                按战利品表发放给玩家、生成掉落物，或插入方块容器。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Sparkles size={15} />
            战利品表
          </div>
        </div>
        <div className="card-body">
          <div className="row" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
            {ACTIONS.map((action) => (
              <button
                key={action.value}
                type="button"
                className={`btn btn-sm${loot.action === action.value ? ' btn-primary' : ''}`}
                onClick={() => state.updateLoot({ action: action.value })}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="loot-table">
              战利品表 ID
            </label>
            <input
              id="loot-table"
              className="input"
              list="loot-table-suggestions"
              value={loot.lootTable}
              spellCheck={false}
              onChange={(event) => state.updateLoot({ lootTable: event.target.value })}
            />
            <datalist id="loot-table-suggestions">
              {[...dataLootTables, ...COMMON_LOOT_TABLES].map((id) => (
                <option key={id} value={id} />
              ))}
            </datalist>
            <div className="hint">
              格式 namespace:path；数据包工作区已有 {dataLootTables.length} 个战利品表。
            </div>
          </div>

          {loot.action === 'give' ? (
            <div style={{ marginTop: 12 }}>
              <SelectorField
                value={loot.target}
                label="玩家目标"
                onChange={(target) => state.updateLoot({ target })}
              />
            </div>
          ) : (
            <>
              <div style={{ marginTop: 12 }}>
                <PositionInput
                  label={loot.action === 'insert' ? '容器坐标' : '掉落位置'}
                  value={loot.position}
                  onChange={(position) => state.updateLoot({ position })}
                />
              </div>
              {loot.action === 'insert' ? (
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="loot-slot">
                    槽位
                  </label>
                  <input
                    id="loot-slot"
                    className="input"
                    value={loot.slot}
                    spellCheck={false}
                    onChange={(event) => state.updateLoot({ slot: event.target.value })}
                  />
                  <div className="hint">例如 container.0 或 container.3。</div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
