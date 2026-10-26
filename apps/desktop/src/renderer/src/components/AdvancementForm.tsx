import { Award, Trophy } from 'lucide-react'
import { type AdvancementAction, type AdvancementMode } from '@mcstudio/core'
import { COMMAND_MAP } from '@mcstudio/content'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('advancement')

const MODES: { value: AdvancementMode; label: string; hint: string }[] = [
  { value: 'only', label: '仅此进度', hint: '只授予/收回指定进度，可限定条件' },
  { value: 'from', label: '从此开始', hint: '包含该进度及其所有后续进度' },
  { value: 'through', label: '整条链路', hint: '包含该进度、所有前置与后续进度' },
  { value: 'until', label: '直到此处', hint: '包含该进度及其所有前置进度' },
  { value: 'everything', label: '全部进度', hint: '授予/收回所有已加载进度' }
]

const COMMON_ADVANCEMENTS = [
  'minecraft:story/root',
  'minecraft:story/mine_stone',
  'minecraft:story/smelt_iron',
  'minecraft:story/obtain_armor',
  'minecraft:story/enter_the_nether',
  'minecraft:end/root',
  'minecraft:adventure/root',
  'minecraft:husbandry/root'
]

export function AdvancementForm() {
  const state = useAppStore()
  const advancement = state.automation.advancement
  const mode = MODES.find((item) => item.value === advancement.mode) ?? MODES[0]

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 玩家 / advancement</div>
          <div className="hero">
            <div className="hero-icon">
              <Trophy size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '进度'}
                <span className="hero-id">advancement</span>
              </h1>
              <p className="hero-sub">
                授予或收回玩家进度，可按单个进度、前置/后续链或全部进度操作。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Award size={15} />
            操作
          </div>
          <div className="row">
            {(['grant', 'revoke'] as AdvancementAction[]).map((action) => (
              <button
                key={action}
                type="button"
                className={`btn btn-sm${advancement.action === action ? ' btn-primary' : ''}`}
                onClick={() => state.updateAdvancement({ action })}
              >
                {action === 'grant' ? '授予' : '收回'}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          <SelectorField
            value={advancement.target}
            label="玩家目标"
            onChange={(target) => state.updateAdvancement({ target })}
          />
          <div className="row" style={{ flexWrap: 'wrap', marginTop: 12 }}>
            {MODES.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`btn btn-sm${advancement.mode === item.value ? ' btn-primary' : ''}`}
                onClick={() => state.updateAdvancement({ mode: item.value })}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="hint" style={{ marginTop: 6 }}>
            {mode.hint}
          </div>

          {advancement.mode !== 'everything' ? (
            <>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="advancement-id">
                  进度 ID
                </label>
                <input
                  id="advancement-id"
                  className="input"
                  list="advancement-common"
                  value={advancement.advancement}
                  spellCheck={false}
                  onChange={(event) =>
                    state.updateAdvancement({ advancement: event.target.value })
                  }
                />
                <datalist id="advancement-common">
                  {COMMON_ADVANCEMENTS.map((id) => (
                    <option key={id} value={id} />
                  ))}
                </datalist>
                <div className="hint">
                  格式 namespace:path；数据包中的自定义进度也可以直接填写。
                </div>
              </div>
              {advancement.mode === 'only' ? (
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="advancement-criterion">
                    条件名（可选）
                  </label>
                  <input
                    id="advancement-criterion"
                    className="input"
                    value={advancement.criterion}
                    spellCheck={false}
                    placeholder="crafting_table"
                    onChange={(event) =>
                      state.updateAdvancement({ criterion: event.target.value })
                    }
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
