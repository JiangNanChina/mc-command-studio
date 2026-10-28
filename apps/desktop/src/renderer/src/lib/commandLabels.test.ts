import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { argumentName, commandName, literalName } from './commandLabels'

interface LabelNode { type?: string; children?: Record<string, LabelNode> }

describe('Chinese command display labels', () => {
  it.each(['1.12.2', '1.20.4', '26.3'])('labels every bundled root command in %s', (version) => {
    const tree = JSON.parse(readFileSync(join(process.cwd(), 'packs', version, 'commands.json'), 'utf8'))
    expect(Object.keys(tree.children).filter((id) => commandName(id) === '扩展命令')).toEqual([])
    for (const id of Object.keys(tree.children)) expect(commandName(id), id).toMatch(/[\u4e00-\u9fff]/)
  })

  it('explains technical parameters and operations without changing their tokens', () => {
    expect(argumentName('targetPos')).toBe('目标位置')
    expect(argumentName('sourceObjective')).toBe('来源计分目标')
    expect(literalName('positioned')).toBe('设置执行位置')
    expect(literalName('minecraft:keep_inventory')).toMatch(/物品|背包/)
    expect(argumentName('mod_argument')).toBe('命令参数')
    expect(commandName('mod_command')).toBe('扩展命令')
  })

  it.each(['1.12.2', '1.20.4', '26.3'])('explains built-in arguments and operations in %s', (version) => {
    const tree = JSON.parse(readFileSync(join(process.cwd(), 'packs', version, 'commands.json'), 'utf8'))
    const unknown = new Set<string>()
    const walk = (node: LabelNode): void => {
      for (const [name, child] of Object.entries(node.children ?? {})) {
        if (child.type === 'argument' && argumentName(name) === '命令参数') unknown.add(`参数：${name}`)
        if (child.type === 'literal' && literalName(name) === '子命令') unknown.add(`操作：${name}`)
        walk(child)
      }
    }
    for (const child of Object.values(tree.children)) walk(child as Parameters<typeof walk>[0])
    expect([...unknown].sort()).toEqual([])
  })
})
