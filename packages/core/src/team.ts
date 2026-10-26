import { error } from './diagnostics'
import { snbtString } from './escape'
import { serializeSelector, type Selector } from './selector'
import { textComponentJson, type TextSegment } from './text'
import type { BuildResult, Diagnostic } from './types'

export type TeamAction = 'create' | 'modify' | 'join' | 'leave' | 'remove' | 'list'
export type TeamColor =
  | 'black'
  | 'dark_blue'
  | 'dark_green'
  | 'dark_aqua'
  | 'dark_red'
  | 'dark_purple'
  | 'gold'
  | 'gray'
  | 'dark_gray'
  | 'blue'
  | 'green'
  | 'aqua'
  | 'red'
  | 'light_purple'
  | 'yellow'
  | 'white'
export type TeamVisibility = 'always' | 'hideForOtherTeams' | 'hideForOwnTeam' | 'never'
export type TeamCollision = 'always' | 'pushOtherTeams' | 'pushOwnTeam' | 'never'

export interface TeamOptions {
  action: TeamAction
  name: string
  displayName: string
  color: TeamColor
  friendlyFire: boolean
  seeFriendlyInvisibles: boolean
  nametagVisibility: TeamVisibility
  collisionRule: TeamCollision
  target: Selector
  prefix: TextSegment[]
  suffix: TextSegment[]
}

export const TEAM_COLORS: { value: TeamColor; label: string; hex: string }[] = [
  { value: 'black', label: '黑色', hex: '#000000' },
  { value: 'dark_blue', label: '深蓝', hex: '#0000aa' },
  { value: 'dark_green', label: '深绿', hex: '#00aa00' },
  { value: 'dark_aqua', label: '深青', hex: '#00aaaa' },
  { value: 'dark_red', label: '深红', hex: '#aa0000' },
  { value: 'dark_purple', label: '深紫', hex: '#aa00aa' },
  { value: 'gold', label: '金色', hex: '#ffaa00' },
  { value: 'gray', label: '灰色', hex: '#aaaaaa' },
  { value: 'dark_gray', label: '深灰', hex: '#555555' },
  { value: 'blue', label: '蓝色', hex: '#5555ff' },
  { value: 'green', label: '绿色', hex: '#55ff55' },
  { value: 'aqua', label: '青色', hex: '#55ffff' },
  { value: 'red', label: '红色', hex: '#ff5555' },
  { value: 'light_purple', label: '浅紫', hex: '#ff55ff' },
  { value: 'yellow', label: '黄色', hex: '#ffff55' },
  { value: 'white', label: '白色', hex: '#ffffff' }
]

export const TEAM_VISIBILITY: { value: TeamVisibility; label: string }[] = [
  { value: 'always', label: '总是显示' },
  { value: 'hideForOtherTeams', label: '对其他队伍隐藏' },
  { value: 'hideForOwnTeam', label: '对己方隐藏' },
  { value: 'never', label: '从不显示' }
]

export const TEAM_COLLISION: { value: TeamCollision; label: string }[] = [
  { value: 'always', label: '总是碰撞' },
  { value: 'pushOtherTeams', label: '推动其他队伍' },
  { value: 'pushOwnTeam', label: '推动己方' },
  { value: 'never', label: '从不碰撞' }
]

export function createDefaultTeamOptions(): TeamOptions {
  return {
    action: 'create',
    name: 'red_team',
    displayName: '红队',
    color: 'red',
    friendlyFire: false,
    seeFriendlyInvisibles: true,
    nametagVisibility: 'always',
    collisionRule: 'always',
    target: { base: '@a' },
    prefix: [],
    suffix: []
  }
}

function validTeamName(name: string): boolean {
  return /^[A-Za-z0-9_.-]{1,16}$/.test(name)
}

export function buildTeamCommands(options: TeamOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const name = options.name.trim()
  if (options.action !== 'leave' && !validTeamName(name)) {
    diagnostics.push(error('team.name', '队伍名只能是 1–16 位字母/数字/下划线/点/连字符', 'name'))
  }

  for (const [kind, segments] of [
    ['prefix', options.prefix],
    ['suffix', options.suffix]
  ] as const) {
    if (segments.some((segment) => /[\r\n]/.test(segment.text))) {
      diagnostics.push(error(`team.${kind}`, '队伍前缀/后缀不能包含换行', kind))
    }
  }

  const modifyLines = (): string[] => {
    const display = options.displayName.trim()
    return [
      ...(display ? [`team modify ${name} displayName ${snbtString(display)}`] : []),
      `team modify ${name} color ${options.color}`,
      `team modify ${name} friendlyFire ${options.friendlyFire ? 'true' : 'false'}`,
      `team modify ${name} seeFriendlyInvisibles ${options.seeFriendlyInvisibles ? 'true' : 'false'}`,
      `team modify ${name} nametagVisibility ${options.nametagVisibility}`,
      `team modify ${name} collisionRule ${options.collisionRule}`,
      ...(options.prefix.length
        ? [`team modify ${name} prefix ${textComponentJson(options.prefix)}`]
        : []),
      ...(options.suffix.length
        ? [`team modify ${name} suffix ${textComponentJson(options.suffix)}`]
        : [])
    ]
  }

  switch (options.action) {
    case 'create': {
      const display = options.displayName.trim()
      return {
        text: [
          `team add ${name}${display ? ` ${snbtString(display)}` : ''}`,
          ...modifyLines().slice(display ? 1 : 0)
        ].join('\n'),
        diagnostics
      }
    }
    case 'modify':
      return { text: modifyLines().join('\n'), diagnostics }
    case 'join': {
      const target = serializeSelector(options.target)
      diagnostics.push(...target.diagnostics)
      return { text: `team join ${name} ${target.text}`, diagnostics }
    }
    case 'leave': {
      const target = serializeSelector(options.target)
      diagnostics.push(...target.diagnostics)
      return { text: `team leave ${target.text}`, diagnostics }
    }
    case 'remove':
      return { text: `team remove ${name}`, diagnostics }
    default:
      return { text: `team list${name ? ` ${name}` : ''}`, diagnostics }
  }
}
