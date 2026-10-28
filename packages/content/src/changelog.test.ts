import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { compareVersions } from '@mcstudio/core'
import { CHANGELOG, getChangelogEntry, latestChangelog } from './changelog'

const packageJson = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf8')
) as { version: string }

describe('changelog', () => {
  it('is sorted from newest to oldest', () => {
    for (let i = 1; i < CHANGELOG.length; i += 1) {
      expect(compareVersions(CHANGELOG[i - 1].version, CHANGELOG[i].version)).toBeGreaterThan(0)
    }
  })

  it('has the current release at the top', () => {
    expect(latestChangelog().version).toBe(packageJson.version)
  })

  it('shows the testing-stage and unfinished-function notice in the current announcement', () => {
    // Keep the stage warning above the fold as well as in the detailed limitations.
    const current = latestChangelog()
    expect(current.highlights[0]).toContain('软件仍处于测试阶段')
    expect(current.highlights[0]).toContain('半成品')
    const knownItems = current.sections
      .filter((section) => section.type === 'known')
      .flatMap((section) => section.items)
    expect(knownItems.some((item) => item.includes('JSON / SNBT') && item.includes('尚未全部可视化'))).toBe(true)
    expect(knownItems.some((item) => item.includes('尚未在实际 Minecraft 游戏 / 服务器中逐项执行命令'))).toBe(true)
  })

  it('contains non-empty sections and items', () => {
    for (const entry of CHANGELOG) {
      expect(entry.title.length).toBeGreaterThan(0)
      expect(entry.highlights.length).toBeGreaterThan(0)
      expect(entry.sections.length).toBeGreaterThan(0)
      for (const section of entry.sections) {
        expect(section.items.length).toBeGreaterThan(0)
        for (const item of section.items) expect(item.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('finds a version by number', () => {
    expect(getChangelogEntry('0.1.1')?.title).toBe('专用表单与文本导入')
    expect(getChangelogEntry('9.9.9')).toBeUndefined()
  })
})
