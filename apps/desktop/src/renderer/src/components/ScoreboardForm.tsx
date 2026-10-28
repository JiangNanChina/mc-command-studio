import { useShallow } from 'zustand/react/shallow'
import { useEffect } from 'react'
import { BarChart3, ListOrdered, Target, Trophy, Users } from 'lucide-react'
import {
  SCOREBOARD_ACTION_LABELS,
  SCORE_CRITERIA,
  SCORE_OPERATIONS,
  SCORE_SLOTS,
  type ScoreboardAction,
  type ScoreboardModifyField,
  type ScoreboardNumberFormat,
  type ScoreboardRenderType,
  type ScoreOperation
} from '@mcstudio/core'
import { COMMAND_MAP } from '@mcstudio/content'
import { hasCommandPath } from '../lib/versionFeatures'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('scoreboard')

const OBJECTIVE_ACTIONS: ScoreboardAction[] = [
  'objective-add',
  'objective-remove',
  'objective-display',
  'objective-modify'
]
const PLAYER_ACTIONS: ScoreboardAction[] = [
  'players-set',
  'players-add',
  'players-remove',
  'players-reset',
  'players-get',
  'players-operation'
]

export function ScoreboardForm() {
  const state = useAppStore(useShallow((state) => ({
    scoreboard: state.scoreboard,
    pack: state.pack,
    updateScoreboard: state.updateScoreboard
  })))
  const scoreboard = state.scoreboard
  const modifyBase = ['scoreboard', 'objectives', 'modify', 'objective'] as const
  const supportsAutoUpdate = hasCommandPath(
    state.pack,
    ...modifyBase,
    'displayautoupdate'
  )
  const supportsNumberFormat = hasCommandPath(state.pack, ...modifyBase, 'numberformat')
  const supportsRenderType = hasCommandPath(state.pack, ...modifyBase, 'rendertype')

  useEffect(() => {
    if (scoreboard.action !== 'objective-modify') return
    if (
      (scoreboard.modifyField === 'displayautoupdate' && !supportsAutoUpdate) ||
      (scoreboard.modifyField === 'numberformat' && !supportsNumberFormat) ||
      (scoreboard.modifyField === 'rendertype' && !supportsRenderType)
    ) {
      state.updateScoreboard({ modifyField: 'displayname' })
    }
  }, [
    scoreboard.action,
    scoreboard.modifyField,
    supportsAutoUpdate,
    supportsNumberFormat,
    supportsRenderType,
    state
  ])

  const isObjective = OBJECTIVE_ACTIONS.includes(scoreboard.action)
  const isOperation = scoreboard.action === 'players-operation'
  const needsScore =
    scoreboard.action === 'players-set' ||
    scoreboard.action === 'players-add' ||
    scoreboard.action === 'players-remove'

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / scoreboard</div>
          <div className="hero">
            <div className="hero-icon">
              <ListOrdered size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '计分板'}
                <span className="hero-id">scoreboard</span>
              </h1>
              <p className="hero-sub">
                可视化创建计分目标、设置显示位置，以及给玩家加分、扣分、查询和运算。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <BarChart3 size={15} />
            操作
          </div>
          <div className="card-hint">{SCOREBOARD_ACTION_LABELS[scoreboard.action]}</div>
        </div>
        <div className="card-body">
          <div className="seg-label">计分目标</div>
          <div className="row" style={{ flexWrap: 'wrap', marginBottom: 10 }}>
            {OBJECTIVE_ACTIONS.map((action) => (
              <button
                key={action}
                type="button"
                className={`btn btn-sm${scoreboard.action === action ? ' btn-primary' : ''}`}
                onClick={() => state.updateScoreboard({ action })}
              >
                {SCOREBOARD_ACTION_LABELS[action]}
              </button>
            ))}
          </div>
          <div className="seg-label">玩家分数</div>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {PLAYER_ACTIONS.map((action) => (
              <button
                key={action}
                type="button"
                className={`btn btn-sm${scoreboard.action === action ? ' btn-primary' : ''}`}
                onClick={() => state.updateScoreboard({ action })}
              >
                {SCOREBOARD_ACTION_LABELS[action]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isObjective ? (
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <Trophy size={15} />
              计分目标
            </div>
          </div>
          <div className="card-body">
            <div className="field">
              <label className="field-label" htmlFor="scoreboard-objective">
                目标名
              </label>
              <input
                id="scoreboard-objective"
                className="input"
                value={scoreboard.objective}
                spellCheck={false}
                placeholder="kills"
                onChange={(event) =>
                  state.updateScoreboard({ objective: event.target.value })
                }
              />
              <div className="hint">
                1–16 位字母/数字/下划线/点/连字符。
                {scoreboard.action === 'objective-display' ? ' 留空表示清除该位置的显示。' : ''}
              </div>
            </div>

            {scoreboard.action === 'objective-add' ? (
              <>
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="scoreboard-criteria">
                    计分项
                  </label>
                  <input
                    id="scoreboard-criteria"
                    className="input"
                    list="scoreboard-criteria-list"
                    value={scoreboard.criteria}
                    spellCheck={false}
                    onChange={(event) =>
                      state.updateScoreboard({ criteria: event.target.value })
                    }
                  />
                  <datalist id="scoreboard-criteria-list">
                    {SCORE_CRITERIA.map((criteria) => (
                      <option key={criteria} value={criteria} />
                    ))}
                  </datalist>
                  <div className="hint">dummy 表示由命令控制；也可以用 deathCount、health 等统计项。</div>
                </div>
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="scoreboard-display-name">
                    显示名称（可选）
                  </label>
                  <input
                    id="scoreboard-display-name"
                    className="input"
                    value={scoreboard.displayName}
                    onChange={(event) =>
                      state.updateScoreboard({ displayName: event.target.value })
                    }
                  />
                  <div className="hint">显示在侧边栏的名称，支持中文。</div>
                </div>
              </>
            ) : null}

            {scoreboard.action === 'objective-display' ? (
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="scoreboard-slot">
                  显示位置
                </label>
                <input
                  id="scoreboard-slot"
                  className="input"
                  list="scoreboard-slot-list"
                  value={scoreboard.slot}
                  spellCheck={false}
                  onChange={(event) => state.updateScoreboard({ slot: event.target.value })}
                />
                <datalist id="scoreboard-slot-list">
                  {SCORE_SLOTS.map((slot) => (
                    <option key={slot} value={slot} />
                  ))}
                </datalist>
                <div className="hint">常用：sidebar、list、belowName；也支持 sidebar.team.red 等队伍位置。</div>
              </div>
            ) : null}

            {scoreboard.action === 'objective-modify' ? (
              <>
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="scoreboard-modify-field">
                    修改项
                  </label>
                  <select
                    id="scoreboard-modify-field"
                    className="select"
                    value={scoreboard.modifyField}
                    onChange={(event) =>
                      state.updateScoreboard({
                        modifyField: event.target.value as ScoreboardModifyField
                      })
                    }
                  >
                    <option value="displayname">显示名称</option>
                    {supportsAutoUpdate ? (
                      <option value="displayautoupdate">自动更新显示</option>
                    ) : null}
                    {supportsNumberFormat ? (
                      <option value="numberformat">数字格式</option>
                    ) : null}
                    {supportsRenderType ? (
                      <option value="rendertype">渲染类型</option>
                    ) : null}
                  </select>
                </div>

                {scoreboard.modifyField === 'displayname' ? (
                  <div className="field" style={{ marginTop: 12 }}>
                    <label className="field-label" htmlFor="scoreboard-modify-name">
                      显示名称
                    </label>
                    <input
                      id="scoreboard-modify-name"
                      className="input"
                      value={scoreboard.displayName}
                      onChange={(event) =>
                        state.updateScoreboard({ displayName: event.target.value })
                      }
                    />
                  </div>
                ) : null}

                {scoreboard.modifyField === 'displayautoupdate' ? (
                  <label className="checkline" style={{ marginTop: 12 }}>
                    <input
                      type="checkbox"
                      checked={scoreboard.autoUpdate}
                      onChange={(event) =>
                        state.updateScoreboard({ autoUpdate: event.target.checked })
                      }
                    />
                    自动更新显示名称
                  </label>
                ) : null}

                {scoreboard.modifyField === 'numberformat' ? (
                  <>
                    <div className="field" style={{ marginTop: 12 }}>
                      <label className="field-label" htmlFor="scoreboard-number-format">
                        数字格式
                      </label>
                      <select
                        id="scoreboard-number-format"
                        className="select"
                        value={scoreboard.numberFormat}
                        onChange={(event) =>
                          state.updateScoreboard({
                            numberFormat: event.target.value as ScoreboardNumberFormat
                          })
                        }
                      >
                        <option value="blank">不显示数字 blank</option>
                        <option value="fixed">固定文本 fixed</option>
                        <option value="styled">样式 styled</option>
                      </select>
                    </div>
                    {scoreboard.numberFormat !== 'blank' ? (
                      <div className="field" style={{ marginTop: 10 }}>
                        <label className="field-label" htmlFor="scoreboard-number-value">
                          {scoreboard.numberFormat === 'fixed' ? '固定文本' : '样式 JSON'}
                        </label>
                        <input
                          id="scoreboard-number-value"
                          className="input"
                          value={scoreboard.numberFormatValue}
                          spellCheck={false}
                          onChange={(event) =>
                            state.updateScoreboard({ numberFormatValue: event.target.value })
                          }
                        />
                        <div className="hint">
                          {scoreboard.numberFormat === 'fixed'
                            ? '例如：分'
                            : '例如：{"color":"gold","bold":true}'}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}

                {scoreboard.modifyField === 'rendertype' ? (
                  <div className="field" style={{ marginTop: 12 }}>
                    <label className="field-label" htmlFor="scoreboard-render-type">
                      渲染类型
                    </label>
                    <select
                      id="scoreboard-render-type"
                      className="select"
                      value={scoreboard.renderType}
                      onChange={(event) =>
                        state.updateScoreboard({
                          renderType: event.target.value as ScoreboardRenderType
                        })
                      }
                    >
                      <option value="integer">整数 integer</option>
                      <option value="hearts">心形 hearts</option>
                    </select>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Target size={15} />
                目标与分数
              </div>
            </div>
            <div className="card-body">
              <SelectorField
                value={scoreboard.target}
                label="玩家目标"
                onChange={(target) => state.updateScoreboard({ target })}
              />
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="scoreboard-player-objective">
                  目标名
                </label>
                <input
                  id="scoreboard-player-objective"
                  className="input"
                  value={scoreboard.objective}
                  spellCheck={false}
                  onChange={(event) =>
                    state.updateScoreboard({ objective: event.target.value })
                  }
                />
              </div>

              {needsScore ? (
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="scoreboard-score">
                    分数
                  </label>
                  <input
                    id="scoreboard-score"
                    className="input"
                    value={scoreboard.score}
                    onChange={(event) =>
                      state.updateScoreboard({ score: event.target.value })
                    }
                  />
                  <div className="hint">整数；增加/减少时作为步长。</div>
                </div>
              ) : null}

              {isOperation ? (
                <div className="grid-2" style={{ marginTop: 12 }}>
                  <div className="field">
                    <label className="field-label" htmlFor="scoreboard-operation">
                      运算
                    </label>
                    <select
                      id="scoreboard-operation"
                      className="select"
                      value={scoreboard.operation}
                      onChange={(event) =>
                        state.updateScoreboard({
                          operation: event.target.value as ScoreOperation
                        })
                      }
                    >
                      {SCORE_OPERATIONS.map((operation) => (
                        <option key={operation.value} value={operation.value}>
                          {operation.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="scoreboard-source-objective">
                      来源目标名
                    </label>
                    <input
                      id="scoreboard-source-objective"
                      className="input"
                      value={scoreboard.sourceObjective}
                      spellCheck={false}
                      onChange={(event) =>
                        state.updateScoreboard({ sourceObjective: event.target.value })
                      }
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {isOperation ? (
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <Users size={15} />
                  运算来源
                </div>
              </div>
              <div className="card-body">
                <SelectorField
                  value={scoreboard.source}
                  label="来源玩家"
                  onChange={(source) => state.updateScoreboard({ source })}
                />
              </div>
            </div>
          ) : null}

          <div className="card">
            <div className="card-head">
              <div className="card-title">预览</div>
            </div>
            <div className="card-body">
              <div className="score-preview">
                <div className="score-preview-title">{scoreboard.objective || 'objective'}</div>
                <div className="score-preview-row">
                  <span>{scoreboard.target.base}</span>
                  <span>
                    {scoreboard.score || (isOperation ? '?' : '0')}
                    {isOperation
                      ? ` ${scoreboard.operation} ${scoreboard.source.base} ${scoreboard.sourceObjective}`
                      : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
