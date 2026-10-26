import { containsControlCharacters } from './escape'
import { error, warn } from './diagnostics'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export type TextAction = 'open_url' | 'run_command' | 'suggest_command' | 'copy_to_clipboard'

export interface TextClick {
  action: TextAction
  value: string
}

export interface TextSegment {
  text: string
  color: string
  bold: boolean
  italic: boolean
  underlined: boolean
  strikethrough: boolean
  obfuscated: boolean
  click: TextClick | null
  hover: string
}

export interface TellrawOptions {
  target: Selector
  segments: TextSegment[]
}

export type TitleAction = 'title' | 'subtitle' | 'actionbar'

export interface TitleOptions {
  target: Selector
  action: TitleAction
  segments: TextSegment[]
  times: boolean
  fadeIn: string
  stay: string
  fadeOut: string
}

export const TEXT_COMPONENT_COLORS = [
  'white',
  'gray',
  'dark_gray',
  'black',
  'dark_blue',
  'blue',
  'dark_aqua',
  'aqua',
  'dark_green',
  'green',
  'dark_red',
  'red',
  'dark_purple',
  'light_purple',
  'gold',
  'yellow'
] as const

export const TEXT_COMPONENT_COLOR_LABELS: Record<string, string> = {
  white: '白色',
  gray: '灰色',
  dark_gray: '深灰',
  black: '黑色',
  dark_blue: '深蓝',
  blue: '蓝色',
  dark_aqua: '深青',
  aqua: '青色',
  dark_green: '深绿',
  green: '绿色',
  dark_red: '深红',
  red: '红色',
  dark_purple: '深紫',
  light_purple: '浅紫',
  gold: '金色',
  yellow: '黄色'
}

export const TEXT_ACTION_LABELS: Record<TextAction, string> = {
  open_url: '打开链接',
  run_command: '执行命令',
  suggest_command: '填入命令',
  copy_to_clipboard: '复制到剪贴板'
}

export function createTextSegment(): TextSegment {
  return {
    text: '文本',
    color: 'white',
    bold: false,
    italic: false,
    underlined: false,
    strikethrough: false,
    obfuscated: false,
    click: null,
    hover: ''
  }
}

export function createDefaultTellrawOptions(): TellrawOptions {
  return { target: { base: '@a' }, segments: [createTextSegment()] }
}

export function createDefaultTitleOptions(): TitleOptions {
  return {
    target: { base: '@a' },
    action: 'title',
    segments: [createTextSegment()],
    times: false,
    fadeIn: '10',
    stay: '70',
    fadeOut: '20'
  }
}

function segmentJson(segment: TextSegment): Record<string, unknown> {
  const json: Record<string, unknown> = { text: segment.text }
  if (segment.color && segment.color !== 'white') json.color = segment.color
  if (segment.bold) json.bold = true
  if (segment.italic) json.italic = true
  if (segment.underlined) json.underlined = true
  if (segment.strikethrough) json.strikethrough = true
  if (segment.obfuscated) json.obfuscated = true
  if (segment.click && segment.click.value.trim()) {
    json.clickEvent = {
      action: segment.click.action,
      value: segment.click.value.trim()
    }
  }
  if (segment.hover.trim()) {
    json.hoverEvent = {
      action: 'show_text',
      contents: { text: segment.hover.trim() }
    }
  }
  return json
}

export function textComponentJson(segments: TextSegment[]): string {
  if (segments.length === 1) return JSON.stringify(segmentJson(segments[0]))
  return JSON.stringify({ text: '', extra: segments.map(segmentJson) })
}

function checkSegments(segments: TextSegment[], diagnostics: Diagnostic[]): void {
  if (segments.length === 0) {
    diagnostics.push(error('text.empty', '至少需要一个文本片段', 'segments'))
    return
  }
  segments.forEach((segment, index) => {
    if (/[\r\n]/.test(segment.text)) {
      diagnostics.push(error('text.newline', `第 ${index + 1} 段文本不能包含换行符`, 'text'))
    }
    if (containsControlCharacters(segment.text)) {
      diagnostics.push(warn('text.control', `第 ${index + 1} 段包含控制字符`))
    }
    if (segment.click && !segment.click.value.trim()) {
      diagnostics.push(error('text.click', `第 ${index + 1} 段的点击事件缺少值`, 'click'))
    }
  })
}

export function buildTellrawCommand(options: TellrawOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)
  checkSegments(options.segments, diagnostics)
  const json = textComponentJson(options.segments)
  const text = `tellraw ${target.text} ${json}`
  if (text.length > 32500) diagnostics.push(error('tellraw.length', '命令超过 32,500 字符', 'command'))
  return { text, diagnostics }
}

export function buildTitleCommand(options: TitleOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)
  checkSegments(options.segments, diagnostics)
  const lines: string[] = []

  if (options.times) {
    const fields: [string, string][] = [
      ['fadeIn', options.fadeIn],
      ['stay', options.stay],
      ['fadeOut', options.fadeOut]
    ]
    for (const [name, value] of fields) {
      if (!/^\d+$/.test(value.trim())) {
        diagnostics.push(error('title.times', `${name} 必须是整数 tick`, 'times'))
      }
    }
    lines.push(
      `title ${target.text} times ${options.fadeIn.trim()} ${options.stay.trim()} ${options.fadeOut.trim()}`
    )
  }

  const action =
    options.action === 'subtitle'
      ? 'subtitle'
      : options.action === 'actionbar'
        ? 'actionbar'
        : 'title'
  lines.push(`title ${target.text} ${action} ${textComponentJson(options.segments)}`)
  const text = lines.join('\n')
  if (text.length > 32500) diagnostics.push(error('title.length', '命令超过 32,500 字符', 'command'))
  return { text, diagnostics }
}
