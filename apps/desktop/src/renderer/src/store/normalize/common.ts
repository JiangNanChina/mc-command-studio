// 通用坐标与文本命令的容错归一化。
import {
  createTextSegment,
  type Position,
  type TextSegment
} from '@mcstudio/core'

export function normalizePosition(input: Partial<Position> | undefined): Position {
  return {
    x: typeof input?.x === 'string' ? input.x : '~',
    y: typeof input?.y === 'string' ? input.y : '~',
    z: typeof input?.z === 'string' ? input.z : '~'
  }
}

export function normalizeTextSegment(input: Partial<TextSegment> | undefined): TextSegment {
  const fallback = createTextSegment()
  if (!input) return fallback
  const click =
    input.click &&
    ['open_url', 'run_command', 'suggest_command', 'copy_to_clipboard'].includes(input.click.action) &&
    typeof input.click.value === 'string'
      ? { action: input.click.action, value: input.click.value }
      : null
  return {
    text: typeof input.text === 'string' ? input.text : '',
    color: typeof input.color === 'string' ? input.color : 'white',
    bold: Boolean(input.bold),
    italic: Boolean(input.italic),
    underlined: Boolean(input.underlined),
    strikethrough: Boolean(input.strikethrough),
    obfuscated: Boolean(input.obfuscated),
    click,
    hover: typeof input.hover === 'string' ? input.hover : ''
  }
}
