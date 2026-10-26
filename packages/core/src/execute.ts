import { containsControlCharacters, resourceId } from './escape'
import { error, warn } from './diagnostics'
import { serializePosition, type Position } from './position'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type ExecuteCondition =
  | { type: 'entity'; selector: Selector }
  | { type: 'block'; position: Position; block: string }
  | {
      type: 'score'
      target: string
      objective: string
      operator: '<' | '<=' | '=' | '>=' | '>'
      source: string
      sourceObjective: string
    }
  | { type: 'raw'; text: string }

export type ExecuteClause =
  | { id: string; kind: 'as' | 'at'; selector: Selector }
  | { id: string; kind: 'positioned' | 'facing'; position: Position }
  | { id: string; kind: 'align'; axes: string }
  | { id: string; kind: 'anchored'; anchor: 'eyes' | 'feet' }
  | { id: string; kind: 'rotated'; yaw: string; pitch: string }
  | { id: string; kind: 'in'; dimension: string }
  | { id: string; kind: 'if' | 'unless'; condition: ExecuteCondition }
  | { id: string; kind: 'store'; mode: 'result' | 'success'; target: string; objective: string }
  | { id: string; kind: 'raw'; text: string }

export interface ExecuteOptions {
  clauses: ExecuteClause[]
  run: string
}

export function createDefaultExecuteOptions(): ExecuteOptions {
  return { clauses: [], run: '' }
}

export function createDefaultExecuteCondition(): ExecuteCondition {
  return { type: 'entity', selector: { base: '@e' } }
}

const AXES = new Set(['x', 'y', 'z', 'xy', 'xz', 'yz', 'xyz'])
const SCORE_OPERATORS = new Set(['<', '<=', '=', '>=', '>'])

function serializeCondition(condition: ExecuteCondition, diagnostics: Diagnostic[]): string {
  switch (condition.type) {
    case 'entity': {
      const selector = serializeSelector(condition.selector)
      diagnostics.push(...selector.diagnostics)
      return `entity ${selector.text}`
    }
    case 'block': {
      const position = serializePosition(condition.position)
      diagnostics.push(...position.diagnostics)
      const block = condition.block.trim()
      if (!block) diagnostics.push(error('execute.condition.block', '方块谓词不能为空', 'block'))
      return `block ${position.text} ${block}`
    }
    case 'score': {
      const target = condition.target.trim()
      const objective = condition.objective.trim()
      const source = condition.source.trim()
      const sourceObjective = condition.sourceObjective.trim()
      if (!target || !objective || !source || !sourceObjective) {
        diagnostics.push(
          error('execute.condition.score', 'score 条件需要目标、目标记分板、来源和来源记分板', 'score')
        )
      }
      if (!SCORE_OPERATORS.has(condition.operator)) {
        diagnostics.push(error('execute.condition.score.op', 'score 运算符不合法', 'score'))
      }
      return `score ${target} ${objective} ${condition.operator} ${source} ${sourceObjective}`
    }
    case 'raw': {
      const text = condition.text.trim()
      if (!text) diagnostics.push(error('execute.condition.raw', '原始条件不能为空', 'condition'))
      return text
    }
  }
}

function serializeClause(clause: ExecuteClause, diagnostics: Diagnostic[]): string {
  switch (clause.kind) {
    case 'as':
    case 'at': {
      const selector = serializeSelector(clause.selector)
      diagnostics.push(...selector.diagnostics)
      return `${clause.kind} ${selector.text}`
    }
    case 'positioned':
    case 'facing': {
      const position = serializePosition(clause.position)
      diagnostics.push(...position.diagnostics)
      return `${clause.kind} ${position.text}`
    }
    case 'align': {
      if (!AXES.has(clause.axes)) {
        diagnostics.push(error('execute.align', 'align 轴必须是 x/y/z/xy/xz/yz/xyz', 'axes'))
      }
      return `align ${clause.axes}`
    }
    case 'anchored':
      return `anchored ${clause.anchor}`
    case 'rotated': {
      if (!clause.yaw.trim() || !clause.pitch.trim()) {
        diagnostics.push(error('execute.rotated', 'rotated 需要偏航和俯仰', 'rotation'))
      }
      return `rotated ${clause.yaw.trim()} ${clause.pitch.trim()}`
    }
    case 'in': {
      const dimension = resourceId(clause.dimension.trim())
      if (!/^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(dimension)) {
        diagnostics.push(error('execute.in', '维度 ID 格式不正确', 'dimension'))
      }
      return `in ${dimension}`
    }
    case 'if':
    case 'unless':
      return `${clause.kind} ${serializeCondition(clause.condition, diagnostics)}`
    case 'store': {
      const target = clause.target.trim()
      const objective = clause.objective.trim()
      if (!target || !objective) {
        diagnostics.push(error('execute.store', 'store 需要目标和记分板', 'store'))
      }
      return `store ${clause.mode} score ${target} ${objective}`
    }
    case 'raw': {
      const text = clause.text.trim()
      if (!text) diagnostics.push(error('execute.raw', '原始子命令不能为空', 'raw'))
      return text
    }
  }
}

/** 生成 execute 链：execute <clauses> run <command>。 */
export function buildExecuteCommand(options: ExecuteOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const parts = ['execute']

  for (const clause of options.clauses) {
    parts.push(serializeClause(clause, diagnostics))
  }

  const run = options.run.trim().replace(/^\//, '')
  if (!run) {
    diagnostics.push(error('execute.run', 'execute 需要 run 子命令', 'run'))
  } else {
    parts.push('run', run)
  }

  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (text.length > 32500) {
    diagnostics.push(error('execute.length', '命令超过 32,500 字符上限', 'command'))
  }
  if (containsControlCharacters(text)) {
    diagnostics.push(warn('execute.control', '命令中包含不可见控制字符，可能导致解析失败'))
  }
  return { text, diagnostics }
}

export const EXECUTE_CLAUSE_LABELS: Record<ExecuteClause['kind'], string> = {
  as: '以实体身份执行',
  at: '以实体位置执行',
  positioned: '设置坐标',
  align: '对齐坐标',
  anchored: '设置锚点',
  facing: '设置朝向',
  rotated: '设置旋转',
  in: '切换维度',
  if: '条件判断 if',
  unless: '条件判断 unless',
  store: '保存结果',
  raw: '原始子命令'
}

export const EXECUTE_CONDITION_LABELS: Record<ExecuteCondition['type'], string> = {
  entity: '实体存在',
  block: '方块匹配',
  score: '计分板比较',
  raw: '原始条件'
}
