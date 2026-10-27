import type { CommandNodeData, VersionPack } from '@mcstudio/core'

/** 返回某个根命令下的节点路径；参数节点与字面量节点都按 key 访问。 */
export function commandPath(
  pack: VersionPack | null,
  root: string,
  ...keys: string[]
): CommandNodeData | null {
  let node = pack?.commands.children?.[root]
  for (const key of keys) {
    node = node?.children?.[key]
    if (!node) return null
  }
  return node ?? null
}

export function hasCommandPath(
  pack: VersionPack | null,
  root: string,
  ...keys: string[]
): boolean {
  return commandPath(pack, root, ...keys) !== null
}

/** 在命令树中查找某个 literal（例如 fill/setblock 的 strict）。 */
export function hasLiteral(
  pack: VersionPack | null,
  root: string,
  literal: string,
  maxDepth = 8
): boolean {
  const start = pack?.commands.children?.[root]
  if (!start) return false
  const visit = (node: CommandNodeData, depth: number): boolean => {
    if (depth > maxDepth) return false
    for (const [key, child] of Object.entries(node.children ?? {})) {
      if (key === literal && child.type === 'literal') return true
      if (visit(child, depth + 1)) return true
    }
    return false
  }
  return visit(start, 0)
}

/** 1.20.4 是 NBT 引擎；attribute 使用 UUID/name，particle 使用旧参数语法。 */
export function isLegacyNbtPack(pack: VersionPack | null): boolean {
  return pack?.manifest.engine === 'nbt'
}

/** 1.13.2 不支持 dust_color_transition；NBT 引擎不支持 raw SNBT。 */
export function particleModeSupported(
  gameVersion: string | undefined,
  engine: string | undefined,
  mode: string
): boolean {
  if (mode === 'raw') return engine === 'components'
  if (gameVersion?.startsWith('1.13') && mode === 'dust_transition') return false
  return true
}
