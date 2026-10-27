/** 比较两个 SemVer，包含 prerelease（例如 0.5.1-test.2）。 */
export function isNewerVersion(candidate: string, current: string): boolean {
  const parse = (value: string): { core: number[]; pre: string[] } => {
    const [core, pre] = value.split('-')
    return {
      core: core.split('.').map((part) => Number(part) || 0),
      pre: pre ? pre.split('.') : []
    }
  }
  const left = parse(candidate)
  const right = parse(current)
  for (let i = 0; i < Math.max(left.core.length, right.core.length); i += 1) {
    const a = left.core[i] ?? 0
    const b = right.core[i] ?? 0
    if (a !== b) return a > b
  }
  if (left.pre.length === 0 && right.pre.length === 0) return false
  if (left.pre.length === 0) return true
  if (right.pre.length === 0) return false
  for (let i = 0; i < Math.max(left.pre.length, right.pre.length); i += 1) {
    const a = left.pre[i]
    const b = right.pre[i]
    if (a === undefined) return false
    if (b === undefined) return true
    if (a === b) continue
    const numeric = /^\d+$/.test(a) && /^\d+$/.test(b)
    return numeric ? Number(a) > Number(b) : a > b
  }
  return false
}
