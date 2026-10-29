import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MIRROR_URL,
  decideFeedResult,
  describeUpdateFeeds,
  normalizeBaseUrl,
  resolveUpdateFeeds,
  type FeedAttempt
} from './updateFeeds'

function attempt(overrides: Partial<FeedAttempt> & Pick<FeedAttempt, 'feed'>): FeedAttempt {
  return { ok: true, ...overrides }
}

describe('normalizeBaseUrl', () => {
  it('appends a trailing slash required by the generic provider', () => {
    expect(normalizeBaseUrl('https://example.com/updates')).toBe('https://example.com/updates/')
    expect(normalizeBaseUrl('https://example.com/updates/')).toBe('https://example.com/updates/')
    expect(normalizeBaseUrl('  https://example.com/updates  ')).toBe('https://example.com/updates/')
  })

  it('returns an empty string for blank input', () => {
    expect(normalizeBaseUrl('')).toBe('')
    expect(normalizeBaseUrl('   ')).toBe('')
  })
})

describe('resolveUpdateFeeds', () => {
  it('prefers the aliyun mirror and falls back to github', () => {
    const feeds = resolveUpdateFeeds({ version: '0.7.0' })
    expect(feeds.map((feed) => feed.kind)).toEqual(['mirror', 'github'])
    expect(feeds[0].url).toBe(DEFAULT_MIRROR_URL)
  })

  it('keeps a custom mirror url and normalizes it', () => {
    const feeds = resolveUpdateFeeds({ version: '0.7.0', mirrorUrl: 'https://cdn.example.com/mc/updates' })
    expect(feeds[0].url).toBe('https://cdn.example.com/mc/updates/')
    expect(feeds.map((feed) => feed.kind)).toEqual(['mirror', 'github'])
  })

  it('can disable the mirror with off', () => {
    const feeds = resolveUpdateFeeds({ version: '0.7.0', mirrorUrl: 'off' })
    expect(feeds.map((feed) => feed.kind)).toEqual(['github'])
  })

  it('uses only the explicit override when MCSTUDIO_UPDATE_URL is set', () => {
    const feeds = resolveUpdateFeeds({
      version: '0.7.0',
      overrideUrl: 'http://127.0.0.1:8123/updates',
      mirrorUrl: 'https://cdn.example.com/mc/updates/'
    })
    expect(feeds).toHaveLength(1)
    expect(feeds[0].kind).toBe('override')
    expect(feeds[0].url).toBe('http://127.0.0.1:8123/updates/')
  })

  it('keeps local test builds on the bundled feed', () => {
    const feeds = resolveUpdateFeeds({ version: '0.7.1-test.1' })
    expect(feeds.map((feed) => feed.kind)).toEqual(['bundled'])
  })

  it('never puts github before the mirror', () => {
    const feeds = resolveUpdateFeeds({ version: '0.7.0' })
    const mirrorIndex = feeds.findIndex((feed) => feed.kind === 'mirror')
    const githubIndex = feeds.findIndex((feed) => feed.kind === 'github')
    expect(mirrorIndex).toBeLessThan(githubIndex)
  })
})

describe('describeUpdateFeeds', () => {
  it('describes the chain for the settings dialog', () => {
    expect(describeUpdateFeeds(resolveUpdateFeeds({ version: '0.7.0' }))).toBe('更新源：国内镜像 → GitHub')
  })

  it('shows the override url', () => {
    expect(describeUpdateFeeds(resolveUpdateFeeds({ version: '0.7.0', overrideUrl: 'http://127.0.0.1:8123/updates' }))).toBe(
      '更新源：自定义源（http://127.0.0.1:8123/updates/）'
    )
  })
})

describe('decideFeedResult', () => {
  const mirror = { kind: 'mirror' as const, label: '国内镜像', url: DEFAULT_MIRROR_URL }
  const github = { kind: 'github' as const, label: 'GitHub' }

  it('takes the first feed that reports an update', () => {
    const decision = decideFeedResult([
      attempt({ feed: mirror, isUpdateAvailable: false, version: '0.7.0' }),
      attempt({ feed: github, isUpdateAvailable: true, version: '0.7.1' })
    ])
    expect(decision.chosen?.feed.kind).toBe('github')
    expect(decision.errors).toEqual([])
  })

  it('prefers the mirror when both report an update', () => {
    const decision = decideFeedResult([
      attempt({ feed: mirror, isUpdateAvailable: true, version: '0.7.1' }),
      attempt({ feed: github, isUpdateAvailable: true, version: '0.7.1' })
    ])
    expect(decision.chosen?.feed.kind).toBe('mirror')
  })

  it('keeps the reachable source when the fallback fails', () => {
    const decision = decideFeedResult([
      attempt({ feed: mirror, isUpdateAvailable: false, version: '0.7.0' }),
      attempt({ feed: github, ok: false, error: 'timeout' })
    ])
    expect(decision.chosen?.feed.kind).toBe('mirror')
    expect(decision.errors).toEqual(['GitHub：timeout'])
  })

  it('reports every failure when nothing is reachable', () => {
    const decision = decideFeedResult([
      attempt({ feed: mirror, ok: false, error: '404' }),
      attempt({ feed: github, ok: false, error: 'ENOTFOUND' })
    ])
    expect(decision.chosen).toBeNull()
    expect(decision.errors).toEqual(['国内镜像：404', 'GitHub：ENOTFOUND'])
  })

  it('returns no error for an empty attempt list', () => {
    expect(decideFeedResult([])).toEqual({ chosen: null, errors: [] })
  })
})
