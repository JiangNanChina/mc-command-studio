import { useShallow } from 'zustand/react/shallow'
import { useState, type ReactNode } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Braces,
  GitBranch,
  Layers,
  Play,
  Plus,
  Sparkles,
  Trash2
} from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import {
  EXECUTE_CLAUSE_LABELS,
  EXECUTE_CONDITION_LABELS,
  serializeSelector,
  type ExecuteClause,
  type ExecuteCondition,
  type Selector
} from '@mcstudio/core'
import { SelectorDialog } from './SelectorDialog'
import { useAppStore } from '../store'
import { hasCommandPath } from '../lib/versionFeatures'

const meta = COMMAND_MAP.get('execute')

const CLAUSE_KINDS: ExecuteClause['kind'][] = [
  'as',
  'at',
  'positioned',
  'align',
  'anchored',
  'facing',
  'rotated',
  'in',
  'if',
  'unless',
  'store',
  'raw'
]

const AXES = ['x', 'y', 'z', 'xy', 'xz', 'yz', 'xyz']
const DIMENSIONS = ['minecraft:overworld', 'minecraft:the_nether', 'minecraft:the_end']

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `clause-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

function makeClause(kind: ExecuteClause['kind']): ExecuteClause {
  const id = newId()
  switch (kind) {
    case 'as':
    case 'at':
      return { id, kind, selector: { base: '@s' } }
    case 'positioned':
    case 'facing':
      return { id, kind, position: { x: '~', y: '~', z: '~' } }
    case 'align':
      return { id, kind, axes: 'xyz' }
    case 'anchored':
      return { id, kind, anchor: 'eyes' }
    case 'rotated':
      return { id, kind, yaw: '0', pitch: '0' }
    case 'in':
      return { id, kind, dimension: 'minecraft:overworld' }
    case 'if':
    case 'unless':
      return { id, kind, condition: { type: 'entity', selector: { base: '@e' } } }
    case 'store':
      return { id, kind, mode: 'result', target: '@s', objective: 'result' }
    case 'raw':
      return { id, kind, text: '' }
  }
}

function defaultCondition(type: ExecuteCondition['type']): ExecuteCondition {
  switch (type) {
    case 'entity':
      return { type, selector: { base: '@e' } }
    case 'block':
      return { type, position: { x: '~', y: '~1', z: '~' }, block: 'minecraft:stone' }
    case 'score':
      return {
        type,
        target: '@s',
        objective: 'obj',
        operator: '=',
        source: '@s',
        sourceObjective: 'obj'
      }
    case 'raw':
      return { type, text: '' }
  }
}

type SelectorTarget = { type: 'clause'; id: string } | { type: 'condition'; id: string }

type BlockCondition = Extract<ExecuteCondition, { type: 'block' }>
type ScoreCondition = Extract<ExecuteCondition, { type: 'score' }>
type RawCondition = Extract<ExecuteCondition, { type: 'raw' }>

function BlockConditionFields({
  condition,
  onChange
}: {
  condition: BlockCondition
  onChange: (condition: BlockCondition) => void
}) {
  return (
    <div>
      <div className="grid-3">
        {(['x', 'y', 'z'] as const).map((axis) => (
          <div className="field" key={axis}>
            <label className="field-label">{axis.toUpperCase()}</label>
            <input
              className="input"
              value={condition.position[axis]}
              onChange={(event) =>
                onChange({
                  ...condition,
                  position: { ...condition.position, [axis]: event.target.value }
                })
              }
            />
          </div>
        ))}
      </div>
      <div className="field" style={{ marginTop: 8 }}>
        <label className="field-label">方块谓词</label>
        <input
          className="input"
          placeholder="minecraft:stone 或 #minecraft:logs"
          value={condition.block}
          onChange={(event) => onChange({ ...condition, block: event.target.value })}
        />
      </div>
    </div>
  )
}

function ScoreConditionFields({
  condition,
  onChange
}: {
  condition: ScoreCondition
  onChange: (condition: ScoreCondition) => void
}) {
  const fields: { key: 'target' | 'objective' | 'source' | 'sourceObjective'; label: string; placeholder: string }[] = [
    { key: 'target', label: '目标', placeholder: '@s' },
    { key: 'objective', label: '目标记分板', placeholder: 'kills' },
    { key: 'source', label: '来源', placeholder: '@s' },
    { key: 'sourceObjective', label: '来源记分板', placeholder: 'deaths' }
  ]

  return (
    <div className="grid-3">
      {fields.map((field) => (
        <div className="field" key={field.key}>
          <label className="field-label">{field.label}</label>
          <input
            className="input"
            placeholder={field.placeholder}
            value={condition[field.key]}
            onChange={(event) => onChange({ ...condition, [field.key]: event.target.value })}
          />
        </div>
      ))}
      <div className="field">
        <label className="field-label">运算符</label>
        <select
          className="select"
          value={condition.operator}
          onChange={(event) =>
            onChange({
              ...condition,
              operator: event.target.value as '<' | '<=' | '=' | '>=' | '>'
            })
          }
        >
          {['<', '<=', '=', '>=', '>'].map((operator) => (
            <option key={operator} value={operator}>
              {operator}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function RawConditionFields({
  condition,
  onChange
}: {
  condition: RawCondition
  onChange: (condition: RawCondition) => void
}) {
  return (
    <div className="field">
      <label className="field-label">原始条件</label>
      <input
        className="input"
        placeholder="例如 loaded ~ ~ ~"
        value={condition.text}
        onChange={(event) => onChange({ ...condition, text: event.target.value })}
      />
    </div>
  )
}

interface ClauseEditorProps {
  clause: ExecuteClause
  index: number
  total: number
  onChange: (clause: ExecuteClause) => void
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
  onEditSelector: () => void
  onEditConditionSelector: () => void
}

function ClauseEditor({
  clause,
  index,
  total,
  onChange,
  onMove,
  onRemove,
  onEditSelector,
  onEditConditionSelector
}: ClauseEditorProps) {
  const pack = useAppStore((state) => state.pack)
  const conditionTypes = (
    Object.keys(EXECUTE_CONDITION_LABELS) as ExecuteCondition['type'][]
  ).filter(
    (type) =>
      type === 'raw' ||
      hasCommandPath(pack, 'execute', 'if', type) ||
      hasCommandPath(pack, 'execute', 'unless', type)
  )

  const positionFields = (
    position: { x: string; y: string; z: string },
    setPosition: (patch: Partial<{ x: string; y: string; z: string }>) => void
  ): ReactNode => (
    <div className="grid-3">
      {(['x', 'y', 'z'] as const).map((axis) => (
        <div className="field" key={axis}>
          <label className="field-label" htmlFor={`exec-${clause.id}-${axis}`}>
            {axis.toUpperCase()}
          </label>
          <input
            id={`exec-${clause.id}-${axis}`}
            className="input"
            value={position[axis]}
            onChange={(event) => setPosition({ [axis]: event.target.value })}
          />
        </div>
      ))}
    </div>
  )

  return (
    <div className="execute-clause">
      <div className="execute-clause-head">
        <span className="execute-index">{index + 1}</span>
        <span className="component-title">{EXECUTE_CLAUSE_LABELS[clause.kind]}</span>
        <span className="component-id">{clause.kind}</span>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          className="icon-btn"
          disabled={index === 0}
          aria-label="上移"
          onClick={() => onMove(-1)}
        >
          <ArrowUp size={14} />
        </button>
        <button
          type="button"
          className="icon-btn"
          disabled={index === total - 1}
          aria-label="下移"
          onClick={() => onMove(1)}
        >
          <ArrowDown size={14} />
        </button>
        <button type="button" className="icon-btn" aria-label="删除子命令" onClick={onRemove}>
          <Trash2 size={14} />
        </button>
      </div>
      <div className="execute-clause-body">
        {clause.kind === 'as' || clause.kind === 'at' ? (
          <div className="selector-card">
            <div style={{ minWidth: 0 }}>
              <div className="field-label">目标选择器</div>
              <div className="selector-preview">{serializeSelector(clause.selector).text}</div>
            </div>
            <button type="button" className="btn btn-sm" onClick={onEditSelector}>
              编辑选择器
            </button>
          </div>
        ) : null}

        {clause.kind === 'positioned' || clause.kind === 'facing'
          ? positionFields(clause.position, (patch) =>
              onChange({ ...clause, position: { ...clause.position, ...patch } })
            )
          : null}

        {clause.kind === 'align' ? (
          <select
            className="select"
            value={clause.axes}
            onChange={(event) => onChange({ ...clause, axes: event.target.value })}
          >
            {AXES.map((axes) => (
              <option key={axes} value={axes}>
                {axes}
              </option>
            ))}
          </select>
        ) : null}

        {clause.kind === 'anchored' ? (
          <select
            className="select"
            value={clause.anchor}
            onChange={(event) =>
              onChange({ ...clause, anchor: event.target.value as 'eyes' | 'feet' })
            }
          >
            <option value="eyes">eyes（眼睛）</option>
            <option value="feet">feet（脚）</option>
          </select>
        ) : null}

        {clause.kind === 'rotated' ? (
          <div className="grid-2">
            <div className="field">
              <label className="field-label">偏航 Yaw</label>
              <input
                className="input"
                value={clause.yaw}
                onChange={(event) => onChange({ ...clause, yaw: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label">俯仰 Pitch</label>
              <input
                className="input"
                value={clause.pitch}
                onChange={(event) => onChange({ ...clause, pitch: event.target.value })}
              />
            </div>
          </div>
        ) : null}

        {clause.kind === 'in' ? (
          <div className="field">
            <label className="field-label">维度</label>
            <input
              className="input"
              list={`dimensions-${clause.id}`}
              value={clause.dimension}
              onChange={(event) => onChange({ ...clause, dimension: event.target.value })}
            />
            <datalist id={`dimensions-${clause.id}`}>
              {DIMENSIONS.map((dimension) => (
                <option key={dimension} value={dimension} />
              ))}
            </datalist>
          </div>
        ) : null}

        {clause.kind === 'if' || clause.kind === 'unless' ? (
          <div>
            <div className="row" style={{ marginBottom: 8 }}>
              <span className="field-label" style={{ margin: 0 }}>
                条件类型
              </span>
              <select
                className="select"
                style={{ width: 160 }}
                value={clause.condition.type}
                onChange={(event) =>
                  onChange({
                    ...clause,
                    condition: defaultCondition(event.target.value as ExecuteCondition['type'])
                  })
                }
              >
                {conditionTypes.map((type) => (
                  <option key={type} value={type}>
                    {EXECUTE_CONDITION_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            {clause.condition.type === 'entity' ? (
              <div className="selector-card">
                <div style={{ minWidth: 0 }}>
                  <div className="field-label">实体选择器</div>
                  <div className="selector-preview">
                    {serializeSelector(clause.condition.selector).text}
                  </div>
                </div>
                <button type="button" className="btn btn-sm" onClick={onEditConditionSelector}>
                  编辑选择器
                </button>
              </div>
            ) : null}

            {clause.condition.type === 'block' ? (
              <BlockConditionFields
                condition={clause.condition}
                onChange={(condition) => onChange({ ...clause, condition })}
              />
            ) : null}

            {clause.condition.type === 'score' ? (
              <ScoreConditionFields
                condition={clause.condition}
                onChange={(condition) => onChange({ ...clause, condition })}
              />
            ) : null}

            {clause.condition.type === 'raw' ? (
              <RawConditionFields
                condition={clause.condition}
                onChange={(condition) => onChange({ ...clause, condition })}
              />
            ) : null}
          </div>
        ) : null}

        {clause.kind === 'store' ? (
          <div>
            <div className="grid-3">
              <div className="field">
                <label className="field-label">保存类型</label>
                <select
                  className="select"
                  value={clause.mode}
                  onChange={(event) =>
                    onChange({ ...clause, mode: event.target.value as 'result' | 'success' })
                  }
                >
                  <option value="result">result（返回值）</option>
                  <option value="success">success（是否成功）</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">目标</label>
                <input
                  className="input"
                  value={clause.target}
                  onChange={(event) => onChange({ ...clause, target: event.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label">记分板</label>
                <input
                  className="input"
                  value={clause.objective}
                  onChange={(event) => onChange({ ...clause, objective: event.target.value })}
                />
              </div>
            </div>
            <div className="hint" style={{ marginTop: 6 }}>
              目前只提供 score 存储；block / bossbar / entity / storage 可先用“原始子命令”。
            </div>
          </div>
        ) : null}

        {clause.kind === 'raw' ? (
          <div className="field">
            <label className="field-label">原始子命令</label>
            <input
              className="input"
              placeholder="例如 on vehicle 或 summon minecraft:armor_stand"
              value={clause.text}
              onChange={(event) => onChange({ ...clause, text: event.target.value })}
            />
          </div>
        ) : null}

        {pack && clause.kind === 'in' ? (
          <div className="hint" style={{ marginTop: 6 }}>
            当前数据包可用维度：{pack.registries.dimension?.length ?? 0} 个
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function ExecuteForm() {
  const state = useAppStore(useShallow((state) => ({
    pack: state.pack,
    execute: state.execute,
    updateExecuteClause: state.updateExecuteClause,
    setExecuteClauses: state.setExecuteClauses,
    setExecuteRun: state.setExecuteRun,
    addExecuteClause: state.addExecuteClause,
    moveExecuteClause: state.moveExecuteClause,
    removeExecuteClause: state.removeExecuteClause
  })))
  const execute = state.execute
  const clauseKinds = CLAUSE_KINDS.filter(
    (kind) => kind === 'raw' || hasCommandPath(state.pack, 'execute', kind)
  )
  const [selectorTarget, setSelectorTarget] = useState<SelectorTarget | null>(null)

  const targetClause = selectorTarget
    ? execute.clauses.find((clause) => clause.id === selectorTarget.id)
    : undefined

  const selectorValue: Selector | undefined =
    selectorTarget?.type === 'clause' && targetClause && (targetClause.kind === 'as' || targetClause.kind === 'at')
      ? targetClause.selector
      : selectorTarget?.type === 'condition' &&
          targetClause &&
          (targetClause.kind === 'if' || targetClause.kind === 'unless') &&
          targetClause.condition.type === 'entity'
        ? targetClause.condition.selector
        : undefined

  const applySelector = (selector: Selector): void => {
    if (!selectorTarget || !targetClause) return
    if (selectorTarget.type === 'clause' && (targetClause.kind === 'as' || targetClause.kind === 'at')) {
      state.updateExecuteClause(targetClause.id, { ...targetClause, selector })
    }
    if (
      selectorTarget.type === 'condition' &&
      (targetClause.kind === 'if' || targetClause.kind === 'unless') &&
      targetClause.condition.type === 'entity'
    ) {
      state.updateExecuteClause(targetClause.id, {
        ...targetClause,
        condition: { ...targetClause.condition, selector }
      })
    }
    setSelectorTarget(null)
  }

  const template = (kind: 'basic' | 'if'): void => {
    if (kind === 'basic') {
      state.setExecuteClauses([makeClause('as'), makeClause('at')])
      state.setExecuteRun('say 你好')
    } else {
      state.setExecuteClauses([makeClause('if')])
      state.setExecuteRun('say 条件成立')
    }
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / execute</div>
          <div className="hero">
            <div className="hero-icon">
              <GitBranch size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '执行上下文'}
                <span className="hero-id">execute</span>
              </h1>
              <p className="hero-sub">
                把 as / at / positioned / if 等子命令拆成可排序的积木，最后用 run 执行一条命令。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Layers size={15} />
            执行链
            <span className="badge">{execute.clauses.length}</span>
          </div>
          <div className="row">
            <select
              className="select"
              style={{ width: 220 }}
              aria-label="添加 execute 子命令"
              value=""
              onChange={(event) => {
                const kind = event.target.value as ExecuteClause['kind']
                if (kind) state.addExecuteClause(kind)
              }}
            >
              <option value="">+ 添加子命令…</option>
              {clauseKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {EXECUTE_CLAUSE_LABELS[kind]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="card-body">
          {execute.clauses.length === 0 ? (
            <div className="component-empty">
              还没有子命令。可以从上方添加，或使用下面的模板快速开始。
              <div className="empty-actions" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn btn-sm" onClick={() => template('basic')}>
                  <Play size={13} />
                  以执行者身份运行
                </button>
                <button type="button" className="btn btn-sm" onClick={() => template('if')}>
                  <Sparkles size={13} />
                  条件判断
                </button>
              </div>
            </div>
          ) : (
            execute.clauses.map((clause, index) => (
              <ClauseEditor
                key={clause.id}
                clause={clause}
                index={index}
                total={execute.clauses.length}
                onChange={(next) => state.updateExecuteClause(clause.id, next)}
                onMove={(direction) => state.moveExecuteClause(clause.id, direction)}
                onRemove={() => state.removeExecuteClause(clause.id)}
                onEditSelector={() => setSelectorTarget({ type: 'clause', id: clause.id })}
                onEditConditionSelector={() =>
                  setSelectorTarget({ type: 'condition', id: clause.id })
                }
              />
            ))
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Play size={15} />
            run：最终执行
          </div>
          <div className="card-hint">可填写任意命令，不需要前导 /</div>
        </div>
        <div className="card-body">
          <textarea
            id="execute-run"
            className="textarea"
            placeholder="例如：say 你好、give @s minecraft:stone、function mypack:main"
            value={execute.run}
            onChange={(event) => state.setExecuteRun(event.target.value)}
          />
          <div className="hint" style={{ marginTop: 6 }}>
            execute 必须有 run 子命令；如果你的条件链没有匹配目标，run 不会执行。
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Braces size={15} />
            常见模板
          </div>
        </div>
        <div className="card-body">
          <div className="row wrap">
            <button type="button" className="btn btn-sm" onClick={() => template('basic')}>
              as @s + at @s
            </button>
            <button type="button" className="btn btn-sm" onClick={() => template('if')}>
              if entity @e
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                state.addExecuteClause('positioned')
                state.addExecuteClause('rotated')
              }}
            >
              坐标 + 朝向
            </button>
          </div>
          <div className="hint" style={{ marginTop: 10 }}>
            选择器编辑在 as/at/if entity 子命令里；方块/分数条件可直接填写。
          </div>
        </div>
      </div>

      {selectorTarget && targetClause ? (
        <SelectorDialog
          value={selectorValue}
          onApply={applySelector}
          onClose={() => setSelectorTarget(null)}
        />
      ) : null}
    </div>
  )
}
