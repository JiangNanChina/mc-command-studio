import { containsControlCharacters, resourceId, snbtString } from './escape'
import { error, warn } from './diagnostics'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type BossbarAction = 'create' | 'update' | 'remove'
export type BossbarColor =
  | 'blue'
  | 'green'
  | 'pink'
  | 'purple'
  | 'red'
  | 'white'
  | 'yellow'
export type BossbarStyle =
  | 'progress'
  | 'notched_6'
  | 'notched_10'
  | 'notched_12'
  | 'notched_20'

export interface BossbarOptions {
  action: BossbarAction
  id: string
  name: string
  color: BossbarColor
  style: BossbarStyle
  max: string
  value: string
  visible: boolean
  playersEnabled: boolean
  players: Selector
}

export const BOSSBAR_COLORS: { value: BossbarColor; label: string; hex: string }[] = [
  { value: 'blue', label: '蓝色', hex: '#3c44aa' },
  { value: 'green', label: '绿色', hex: '#3ab33a' },
  { value: 'pink', label: '粉色', hex: '#f38baa' },
  { value: 'purple', label: '紫色', hex: '#8932b8' },
  { value: 'red', label: '红色', hex: '#b02e26' },
  { value: 'white', label: '白色', hex: '#f9fffe' },
  { value: 'yellow', label: '黄色', hex: '#fed83d' }
]

export const BOSSBAR_STYLES: { value: BossbarStyle; label: string; notches: number }[] = [
  { value: 'progress', label: '连续', notches: 0 },
  { value: 'notched_6', label: '6 段', notches: 6 },
  { value: 'notched_10', label: '10 段', notches: 10 },
  { value: 'notched_12', label: '12 段', notches: 12 },
  { value: 'notched_20', label: '20 段', notches: 20 }
]

export function createDefaultBossbarOptions(): BossbarOptions {
  return {
    action: 'create',
    id: 'mcstudio:boss',
    name: 'BOSS',
    color: 'red',
    style: 'progress',
    max: '100',
    value: '100',
    visible: true,
    playersEnabled: true,
    players: { base: '@a' }
  }
}

export function buildBossbarCommands(options: BossbarOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const id = resourceId(options.id.trim())

  if (!/^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(id)) {
    diagnostics.push(error('bossbar.id', 'BOSS 栏 ID 必须是 namespace:path 格式', 'id'))
  }
  if (options.action === 'remove') {
    return finish([`bossbar remove ${id}`], diagnostics)
  }

  const name = options.name.trim()
  if (!name) diagnostics.push(error('bossbar.name', '名称不能为空', 'name'))
  if (/[\r\n]/.test(options.name)) {
    diagnostics.push(error('bossbar.name.newline', '名称不能包含换行符', 'name'))
  }

  const max = Number(options.max)
  const value = Number(options.value)
  if (!/^\d+$/.test(options.max.trim()) || !Number.isInteger(max) || max < 1) {
    diagnostics.push(error('bossbar.max', '最大值必须是大于 0 的整数', 'max'))
  }
  if (!/^\d+$/.test(options.value.trim()) || !Number.isInteger(value) || value < 0) {
    diagnostics.push(error('bossbar.value', '当前值必须是非负整数', 'value'))
  } else if (Number.isInteger(max) && value > max) {
    diagnostics.push(error('bossbar.value.range', '当前值不能大于最大值', 'value'))
  }

  const lines: string[] = []
  if (options.action === 'create') {
    lines.push(`bossbar add ${id} ${snbtString(name)}`)
  }
  lines.push(`bossbar set ${id} name ${snbtString(name)}`)
  lines.push(`bossbar set ${id} color ${options.color}`)
  lines.push(`bossbar set ${id} style ${options.style}`)
  lines.push(`bossbar set ${id} max ${max}`)
  lines.push(`bossbar set ${id} value ${value}`)
  lines.push(`bossbar set ${id} visible ${options.visible ? 'true' : 'false'}`)
  if (options.playersEnabled) {
    const players = serializeSelector(options.players)
    diagnostics.push(...players.diagnostics)
    lines.push(`bossbar set ${id} players ${players.text}`)
  }
  return finish(lines, diagnostics)
}

function finish(lines: string[], diagnostics: Diagnostic[]): BuildResult {
  const text = lines.join('\n')
  if (containsControlCharacters(text)) {
    diagnostics.push(warn('bossbar.control', '命令中包含不可见控制字符'))
  }
  return { text, diagnostics }
}
