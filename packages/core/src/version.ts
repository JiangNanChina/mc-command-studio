export interface ParsedVersion {
  major: number
  minor: number
  patch: number
  prerelease: string[]
}

export function parseVersion(version: string): ParsedVersion {
  const cleaned = version.trim().replace(/^v/i, '')
  const [core, ...rest] = cleaned.split('-')
  const [major = 0, minor = 0, patch = 0] = core.split('.').map((part) => {
    const value = Number.parseInt(part, 10)
    return Number.isFinite(value) ? value : 0
  })
  const prerelease = rest.join('-').split('.').filter(Boolean)
  return { major, minor, patch, prerelease }
}

function comparePrerelease(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0
  if (a.length === 0) return 1
  if (b.length === 0) return -1
  const length = Math.max(a.length, b.length)
  for (let i = 0; i < length; i += 1) {
    const left = a[i]
    const right = b[i]
    if (left === undefined) return -1
    if (right === undefined) return 1
    const leftNumber = /^\d+$/.test(left) ? Number(left) : null
    const rightNumber = /^\d+$/.test(right) ? Number(right) : null
    if (leftNumber !== null && rightNumber !== null) {
      if (leftNumber !== rightNumber) return leftNumber < rightNumber ? -1 : 1
    } else if (leftNumber !== null) {
      return -1
    } else if (rightNumber !== null) {
      return 1
    } else if (left !== right) {
      return left < right ? -1 : 1
    }
  }
  return 0
}

/** 语义化版本比较：a > b 返回 1，a < b 返回 -1。 */
export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a)
  const right = parseVersion(b)
  if (left.major !== right.major) return left.major > right.major ? 1 : -1
  if (left.minor !== right.minor) return left.minor > right.minor ? 1 : -1
  if (left.patch !== right.patch) return left.patch > right.patch ? 1 : -1
  return comparePrerelease(left.prerelease, right.prerelease)
}

export function isNewerVersion(candidate: string, current: string): boolean {
  return compareVersions(candidate, current) > 0
}

export function isValidVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version.trim().replace(/^v/i, ''))
}
