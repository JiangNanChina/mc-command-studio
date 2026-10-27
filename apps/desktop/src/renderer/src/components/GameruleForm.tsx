import { useEffect, useMemo, useState } from 'react'
import { Settings2, ShieldCheck } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import rulesJson from '../data/gamerules.json'
import { GamerulePickerDialog, type GameruleRule } from './GamerulePickerDialog'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('gamerule')
const allRules = rulesJson as GameruleRule[]

export function GameruleForm() {
  const state = useAppStore()
  const gamerule = state.gamerule
  const [pickerOpen, setPickerOpen] = useState(false)
  const rules = useMemo(() => {
    const tree = state.pack?.commands.children?.gamerule?.children
    if (!tree) return allRules
    const bySnake = new Map(allRules.map((rule) => [rule.id, rule]))
    const camelToSnake = (value: string): string =>
      value.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)
    const dynamic = Object.entries(tree).map(([id, node]) => {
      const meta = bySnake.get(id) ?? bySnake.get(camelToSnake(id))
      const parser = node.children?.value?.parser
      const type: GameruleRule['type'] =
        meta?.type ?? (parser === 'brigadier:integer' ? 'integer' : 'boolean')
      return {
        id,
        name: meta?.name ?? id,
        description:
          meta?.description ??
          `来自 ${state.pack?.manifest.gameVersion ?? '当前版本'} 数据包命令树。`,
        type,
        min: meta?.min,
        max: meta?.max
      }
    })
    return dynamic.length > 0 ? dynamic : allRules
  }, [state.pack])
  const selected = useMemo(
    () => rules.find((rule) => rule.id === gamerule.rule) ?? rules[0],
    [gamerule.rule]
  )

  const chooseRule = (rule: GameruleRule): void => {
    state.updateGamerule({
      rule: rule.id,
      type: rule.type,
      value: rule.type === 'boolean' ? 'false' : String(rule.min ?? 0)
    })
  }

  useEffect(() => {
    if (!rules.some((rule) => rule.id === gamerule.rule)) {
      chooseRule(rules[0])
    }
  }, [rules, gamerule.rule])

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 世界 / gamerule</div>
          <div className="hero">
            <div className="hero-icon">
              <Settings2 size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '游戏规则'}
                <span className="hero-id">gamerule</span>
              </h1>
              <p className="hero-sub">
                可视化选择 59 条 26.3 游戏规则，设置开关或整数值，也可以查询当前值。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <ShieldCheck size={15} />
            规则
          </div>
          <div className="row">
            <button
              type="button"
              className={`btn btn-sm${gamerule.action === 'set' ? ' btn-primary' : ''}`}
              onClick={() => state.updateGamerule({ action: 'set' })}
            >
              设置
            </button>
            <button
              type="button"
              className={`btn btn-sm${gamerule.action === 'query' ? ' btn-primary' : ''}`}
              onClick={() => state.updateGamerule({ action: 'query' })}
            >
              查询
            </button>
          </div>
        </div>
        <div className="card-body">
          <button type="button" className="gamerule-selected" onClick={() => setPickerOpen(true)}>
            <span className="gamerule-selected-main">
              <span className="gamerule-selected-name">{selected.name}</span>
              <span className="gamerule-selected-id">{selected.id}</span>
            </span>
            <span className={`gamerule-type ${selected.type}`}>
              {selected.type === 'boolean' ? '开关' : '整数'}
            </span>
            <span className="btn btn-sm">选择规则</span>
          </button>
          {selected.description ? (
            <div className="hint" style={{ marginTop: 8 }}>
              {selected.description}
            </div>
          ) : null}

          {gamerule.action === 'set' ? (
            selected.type === 'boolean' ? (
              <div className="row" style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className={`btn${gamerule.value === 'true' ? ' btn-primary' : ''}`}
                  onClick={() => state.updateGamerule({ value: 'true' })}
                >
                  开启 true
                </button>
                <button
                  type="button"
                  className={`btn${gamerule.value === 'false' ? ' btn-primary' : ''}`}
                  onClick={() => state.updateGamerule({ value: 'false' })}
                >
                  关闭 false
                </button>
              </div>
            ) : (
              <div className="field" style={{ marginTop: 14 }}>
                <label className="field-label" htmlFor="gamerule-value">
                  整数值
                </label>
                <input
                  id="gamerule-value"
                  className="input"
                  value={gamerule.value}
                  onChange={(event) => state.updateGamerule({ value: event.target.value })}
                />
                <div className="hint">
                  范围：{selected.min ?? '无下限'} – {selected.max ?? '无上限'}
                </div>
              </div>
            )
          ) : (
            <div className="hint" style={{ marginTop: 14 }}>
              查询命令不会修改世界，只返回该规则的当前值。
            </div>
          )}
        </div>
      </div>

      {pickerOpen ? (
        <GamerulePickerDialog
          rules={rules}
          current={gamerule.rule}
          onSelect={chooseRule}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  )
}
