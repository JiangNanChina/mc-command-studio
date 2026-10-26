import { describe, expect, it } from 'vitest'
import { compareVersions } from '@mcstudio/core'
import { CHANGELOG, getChangelogEntry, latestChangelog } from './changelog'

describe('changelog', () => {
  it('is sorted from newest to oldest', () => {
    for (let i = 1; i < CHANGELOG.length; i += 1) {
      expect(compareVersions(CHANGELOG[i - 1].version, CHANGELOG[i].version)).toBeGreaterThan(0)
    }
  })

  it('has the current release at the top', () => {
    expect(latestChangelog().version).toBe('0.1.37')
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
