import { describe, expect, it } from 'vitest'
import { createProjectFile, parseProjectFile } from './project'

describe('project file', () => {
  it('creates and parses a project', () => {
    const file = createProjectFile('测试项目', '26.3', { activeCommandId: 'give' })
    const result = parseProjectFile(file)
    expect(result.ok).toBe(true)
    expect(result.project?.name).toBe('测试项目')
    expect(file.schemaVersion).toBe(1)
  })

  it('falls back to a default name', () => {
    const file = createProjectFile('   ', '26.3', null)
    expect(file.name).toBe('未命名项目')
  })

  it('round trips custom presets', () => {
    const presets = { 'legacy:block': [{ name: 'test', value: '{Lock:"x"}' }] }
    const file = createProjectFile('presets', '1.12.2', null, presets)
    const parsed = parseProjectFile(file)
    expect(parsed.ok).toBe(true)
    expect(parsed.project?.presets).toEqual(presets)
  })

  it('rejects an incompatible schema', () => {
    const result = parseProjectFile({ schemaVersion: 99, name: 'x', packId: '26.3' })
    expect(result.ok).toBe(false)
    expect(result.error).toContain('格式')
  })
})
