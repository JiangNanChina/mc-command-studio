import { containsControlCharacters, snbtString } from './escape'
import { error, warn } from './diagnostics'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type ScoreboardAction =
  | 'objective-add'
  | 'objective-remove'
  | 'objective-display'
  | 'objective-modify'
  | 'players-set'
  | 'players-add'
  | 'players-remove'
  | 'players-reset'
  | 'players-get'
  | 'players-operation'

export type ScoreOperation = '=' | '+=' | '-=' | '*=' | '/=' | '%=' | '<' | '>' | '><'
export type ScoreboardModifyField =
  | 'displayname'
  | 'displayautoupdate'
  | 'numberformat'
  | 'rendertype'
export type ScoreboardNumberFormat = 'blank' | 'fixed' | 'styled'
export type ScoreboardRenderType = 'hearts' | 'integer'

export interface ScoreboardOptions {
  action: ScoreboardAction
  objective: string
  criteria: string
  displayName: string
  slot: string
  target: Selector
  score: string
  operation: ScoreOperation
  source: Selector
  sourceObjective: string
  modifyField: ScoreboardModifyField
  autoUpdate: boolean
  numberFormat: ScoreboardNumberFormat
  numberFormatValue: string
  renderType: ScoreboardRenderType
}

export const SCORE_CRITERIA = [
  'dummy',
  'trigger',
  'deathCount',
  'playerKillCount',
  'totalKillCount',
  'health',
  'food',
  'air',
  'armor',
  'xp',
  'level',
  'points'
]

export const SCORE_SLOTS = ['sidebar', 'list', 'belowName']

export const SCORE_OPERATIONS: { value: ScoreOperation; label: string }[] = [
  { value: '=', label: '= 赋值' },
  { value: '+=', label: '+= 相加' },
  { value: '-=', label: '-= 相减' },
  { value: '*=', label: '*= 相乘' },
  { value: '/=', label: '/= 整除' },
  { value: '%=', label: '%= 取余' },
  { value: '<', label: '< 取较小' },
  { value: '>', label: '> 取较大' },
  { value: '><', label: '>< 交换' }
]

export const SCOREBOARD_ACTION_LABELS: Record<ScoreboardAction, string> = {
  'objective-add': '创建目标',
  'objective-remove': '删除目标',
  'objective-display': '设置显示位置',
  'objective-modify': '修改目标',
  'players-set': '设置分数',
  'players-add': '增加分数',
  'players-remove': '减少分数',
  'players-reset': '重置分数',
  'players-get': '查询分数',
  'players-operation': '分数运算'
}

export function createDefaultScoreboardOptions(): ScoreboardOptions {
  return {
    action: 'objective-add',
    objective: 'kills',
    criteria: 'dummy',
    displayName: '击杀数',
    slot: 'sidebar',
    target: { base: '@s' },
    score: '0',
    operation: '=',
    source: { base: '@s' },
    sourceObjective: 'kills',
    modifyField: 'displayname',
    autoUpdate: true,
    numberFormat: 'blank',
    numberFormatValue: '{"text":"#","color":"gold"}',
    renderType: 'integer'
  }
}

function validObjective(name: string): boolean {
  return /^[A-Za-z0-9_.-]{1,16}$/.test(name)
}

export function buildScoreboardCommand(options: ScoreboardOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const objective = options.objective.trim()
  const needsObjective = options.action !== 'objective-display' || objective.length > 0
  if (needsObjective && !validObjective(objective)) {
    diagnostics.push(
      error('scoreboard.objective', '目标名只能是 1–16 位字母/数字/下划线/点/连字符', 'objective')
    )
  }

  const target = () => {
    const selector = serializeSelector(options.target)
    diagnostics.push(...selector.diagnostics)
    return selector.text
  }

  let text = ''
  switch (options.action) {
    case 'objective-add': {
      const criteria = options.criteria.trim()
      if (!criteria) diagnostics.push(error('scoreboard.criteria', '计分项不能为空', 'criteria'))
      const name = options.displayName.trim()
      text = `scoreboard objectives add ${objective} ${criteria}${name ? ` ${snbtString(name)}` : ''}`
      break
    }
    case 'objective-remove':
      text = `scoreboard objectives remove ${objective}`
      break
    case 'objective-display': {
      const slot = options.slot.trim()
      if (!slot) diagnostics.push(error('scoreboard.slot', '显示位置不能为空', 'slot'))
      text = `scoreboard objectives setdisplay ${slot}${objective ? ` ${objective}` : ''}`
      break
    }
    case 'objective-modify': {
      switch (options.modifyField) {
        case 'displayname': {
          const name = options.displayName.trim()
          if (!name) diagnostics.push(error('scoreboard.displayName', '显示名称不能为空', 'displayName'))
          text = `scoreboard objectives modify ${objective} displayname ${snbtString(name)}`
          break
        }
        case 'displayautoupdate':
          text = `scoreboard objectives modify ${objective} displayautoupdate ${options.autoUpdate}`
          break
        case 'numberformat': {
          if (options.numberFormat === 'blank') {
            text = `scoreboard objectives modify ${objective} numberformat blank`
          } else if (options.numberFormat === 'fixed') {
            const value = options.numberFormatValue.trim()
            if (!value) {
              diagnostics.push(error('scoreboard.numberFormat', '固定格式内容不能为空', 'numberFormatValue'))
            }
            text = `scoreboard objectives modify ${objective} numberformat fixed ${snbtString(value)}`
          } else {
            const value = options.numberFormatValue.trim()
            if (!value) {
              diagnostics.push(error('scoreboard.numberFormat', '样式 JSON 不能为空', 'numberFormatValue'))
            }
            text = `scoreboard objectives modify ${objective} numberformat styled ${value}`
          }
          break
        }
        default:
          text = `scoreboard objectives modify ${objective} rendertype ${options.renderType}`
          break
      }
      break
    }
    case 'players-set':
    case 'players-add':
    case 'players-remove': {
      const action = options.action.replace('players-', '')
      if (!/^-?\d+$/.test(options.score.trim())) {
        diagnostics.push(error('scoreboard.score', '分数必须是整数', 'score'))
      }
      text = `scoreboard players ${action} ${target()} ${objective} ${options.score.trim()}`
      break
    }
    case 'players-reset':
      text = `scoreboard players reset ${target()} ${objective}`
      break
    case 'players-get':
      text = `scoreboard players get ${target()} ${objective}`
      break
    case 'players-operation': {
      const source = serializeSelector(options.source)
      diagnostics.push(...source.diagnostics)
      if (!validObjective(options.sourceObjective.trim())) {
        diagnostics.push(
          error('scoreboard.source', '来源目标名不合法', 'sourceObjective')
        )
      }
      text = `scoreboard players operation ${target()} ${objective} ${options.operation} ${source.text} ${options.sourceObjective.trim()}`
      break
    }
  }

  if (containsControlCharacters(text)) {
    diagnostics.push(warn('scoreboard.control', '命令中包含不可见控制字符'))
  }
  return { text, diagnostics }
}
