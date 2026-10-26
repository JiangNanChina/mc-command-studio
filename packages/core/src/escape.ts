/** SNBT / 命令方块 NBT 字符串转义。 */
export function snbtString(value: string): string {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
  return `"${escaped}"`
}

/** 命令方块里的 Command 字段：先按 SNBT 字符串转义，再处理实际换行。 */
export function commandBlockString(command: string): string {
  return snbtString(command)
}

/**
 * 资源 ID 补全命名空间。
 * - `diamond_sword` -> `minecraft:diamond_sword`
 * - `#minecraft:logs` -> 原样保留
 * - `mypack:item` -> 原样保留
 */
export function resourceId(id: string, fallbackNamespace = 'minecraft'): string {
  const trimmed = id.trim()
  if (!trimmed) return trimmed
  if (trimmed.startsWith('#')) {
    return `#${resourceId(trimmed.slice(1), fallbackNamespace)}`
  }
  return trimmed.includes(':') ? trimmed : `${fallbackNamespace}:${trimmed}`
}

/** 去掉 minecraft 命名空间，便于显示与组件键。 */
export function shortId(id: string): string {
  return id.startsWith('minecraft:') ? id.slice('minecraft:'.length) : id
}

const PLAIN_ID = /^[a-z0-9_.-]+$/

/** SNBT 的键/短 ID：能裸写就裸写，否则加引号。 */
export function snbtKey(id: string): string {
  const short = shortId(id)
  return PLAIN_ID.test(short) ? short : snbtString(id)
}

/** 选择器参数里的普通字符串值。 */
export function selectorValue(value: string): string {
  return snbtString(value)
}

/** 判断文本里是否含有可能破坏命令方块字符串的字符。 */
export function containsControlCharacters(value: string): boolean {
  return /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
}
