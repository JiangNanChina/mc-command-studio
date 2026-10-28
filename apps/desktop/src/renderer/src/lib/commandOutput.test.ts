import { describe, expect, it } from 'vitest'
import { createProjectFile, parseProjectFile, type VersionPack } from '@mcstudio/core'
import { normalizeProjectPayload } from '../store/normalize'
import { createCurrentOutputSelector, getCurrentOutput, type CommandOutputState } from './commandOutput'
import { buildQuickCommand, getQuickValues } from './quickCommands'

function versionPack(engine: 'nbt' | 'components' | 'legacy' = 'components'): VersionPack {
  return {
    manifest: {
      schemaVersion: 1, id: engine, gameVersion: engine === 'nbt' ? '1.20.4' : '26.3',
      engine, dataVersion: 1, packFormat: 1, type: 'release', generatedAt: '', sources: [], files: {},
      counts: { roots: 3, literals: 3, parsers: 1, items: 0, blocks: 0, enchantments: 0, entities: 0 }
    },
    commands: {
      type: 'root', children: {
        say: { type: 'literal', children: { message: { type: 'argument', parser: 'minecraft:message', executable: true } } },
        locate: { type: 'literal', children: { structure: { type: 'literal', children: { id: { type: 'argument', executable: true } } } } },
        teleport: { type: 'literal', executable: true }
      }
    },
    registries: {}, blocks: {}, itemComponents: {}
  }
}

function document(engine: 'nbt' | 'components' | 'legacy' = 'components'): CommandOutputState {
  return { ...normalizeProjectPayload(null), pack: versionPack(engine), activeCommandId: 'locate' }
}

describe('shared command output pipeline', () => {
  it('restores quick fields from a saved project and uses them in every output mode', () => {
    const state = document()
    state.quickDrafts.locate = { type: 'structure', id: 'minecraft:ancient_city' }
    const file = createProjectFile('quick project', '26.3', state)
    const parsed = parseProjectFile(JSON.parse(JSON.stringify(file)))
    expect(parsed.ok).toBe(true)
    const restored = { ...normalizeProjectPayload(parsed.project!.data), pack: state.pack }
    expect(getCurrentOutput(restored).text).toBe('locate structure minecraft:ancient_city')
    restored.outputMode = 'command-block'
    const output = getCurrentOutput(restored)
    expect(output.command.text).toBe('locate structure minecraft:ancient_city')
    expect(output.text).toContain('minecraft:command_block')
    expect(output.text).toContain('Command:"locate structure minecraft:ancient_city"')
    expect(output.hasErrors).toBe(false)
  })

  it('uses the current specialized form after switching from NBT to components', () => {
    const state = document('nbt')
    state.activeCommandId = 'say'
    state.quickDrafts.say = { message: 'NBT draft' }
    state.social.message = 'components draft'
    expect(getCurrentOutput(state).text).toBe('say NBT draft')
    expect(getCurrentOutput({ ...state, pack: versionPack('components') }).text).toBe('say components draft')
    expect(getCurrentOutput(state).text).toBe('say NBT draft')
  })

  it('keeps legacy commands on the command tree instead of reading a newer quick draft', () => {
    const state = document('legacy')
    state.activeCommandId = 'say'
    state.quickDrafts.say = { message: 'newer draft' }
    state.generic = { root: 'say', steps: [{ name: 'message', value: 'legacy draft' }] }
    expect(getCurrentOutput(state).text).toBe('say legacy draft')
  })

  it('passes quick diagnostics through the normal and command block output', () => {
    const state = document()
    state.quickDrafts.locate = { type: 'biome', id: 'minecraft:plains\nsay hidden' }
    for (const outputMode of ['command', 'command-block'] as const) {
      const output = getCurrentOutput({ ...state, outputMode })
      expect(output.hasErrors).toBe(true)
      expect(output.diagnostics.some((entry) => entry.code === 'quick.option')).toBe(true)
      expect(output.diagnostics.some((entry) => entry.code === 'quick.control')).toBe(true)
    }
  })

  it('reports a command unavailable in the selected version', () => {
    expect(getCurrentOutput({ ...document(), activeCommandId: 'not_a_command' }).hasErrors).toBe(true)
  })

  it('does not rebuild output for unrelated document or UI updates', () => {
    const state = { ...document(), toast: null }
    const select = createCurrentOutputSelector()
    const first = select(state)
    const unrelatedChange = { ...state, toast: { message: 'saved' }, give: { ...state.give, count: 10 } }
    expect(select(unrelatedChange)).toBe(first)
    const changed = select({ ...state, quickDrafts: { locate: { id: 'minecraft:ancient_city' } } })
    expect(changed).not.toBe(first)
    expect(changed.text).toBe('locate structure minecraft:ancient_city')
  })

  it('updates aliased quick commands even when a specialized state field has the same name', () => {
    const state = { ...document(), activeCommandId: 'teleport' }
    const select = createCurrentOutputSelector()
    expect(select(state).text).toBe('teleport @s ~ ~ ~')
    expect(select({ ...state, quickDrafts: { teleport: { x: '42' } } }).text).toBe('teleport @s 42 ~ ~')
  })
})

describe('quick drafts', () => {
  it('opens older projects with empty quick drafts', () => {
    expect(normalizeProjectPayload({}).quickDrafts).toEqual({})
  })

  it('repairs malformed drafts without accepting unknown fields or prototype keys', () => {
    const input = JSON.parse('{"locate":{"type":"structure","id":"minecraft:stronghold","extra":"ignored"},"say":{"message":1},"unknown":{"x":"1"},"__proto__":{"polluted":"yes"}}')
    expect(normalizeProjectPayload({ quickDrafts: input }).quickDrafts).toEqual({
      locate: { type: 'structure', id: 'minecraft:stronghold' }, say: {}
    })
    expect(normalizeProjectPayload({ quickDrafts: [] }).quickDrafts).toEqual({})
  })

  it('shares defaults and preserves unsupported saved choices for a visible diagnostic', () => {
    const pack = versionPack()
    const type = { ...pack.commands.children!.locate.children!.structure }
    pack.commands.children!.locate.children = { biome: type }
    expect(getQuickValues('locate', undefined, pack).type).toBe('biome')
    expect(buildQuickCommand(pack, 'locate', { type: 'poi' }).diagnostics.some((entry) => entry.code === 'quick.option')).toBe(true)
  })
})
