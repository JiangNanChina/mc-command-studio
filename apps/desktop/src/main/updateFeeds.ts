import type { UpdateSource } from '../shared/types'

/**
 * 更新源解析：国内镜像优先，GitHub 兜底。
 *
 * 这里是纯函数，不依赖 Electron，方便单测；真正的网络请求仍在 updater.ts。
 * 约定见 docs/21-cn-mirror-oss.md。
 */

export type UpdateFeedKind = UpdateSource

export interface UpdateFeed {
  kind: UpdateFeedKind
  /** 给用户看的名称 */
  label: string
  /** generic 源的基地址；bundled / github 为空 */
  url?: string
}

/** 阿里云 OSS 国内镜像默认地址。改这里要同步 docs/21-cn-mirror-oss.md。 */
export const DEFAULT_MIRROR_URL =
  'https://mcstudio-cn.oss-cn-chengdu.aliyuncs.com/mc-command-studio/updates/'

export const GITHUB_OWNER = 'JiangNanChina'
export const GITHUB_REPO = 'mc-command-studio'

/** generic 源必须是目录地址，electron-updater 会在后面拼 latest.yml。 */
export function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return ''
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`
}

export interface ResolveUpdateFeedsInput {
  /** 当前应用版本；带 -test 的本地测试版固定用打包内置源 */
  version: string
  /** MCSTUDIO_UPDATE_URL：显式覆盖，只用这一个源，不做回退 */
  overrideUrl?: string | null
  /** MCSTUDIO_UPDATE_MIRROR：自定义镜像地址；填 off 关闭镜像 */
  mirrorUrl?: string | null
}

export function resolveUpdateFeeds(input: ResolveUpdateFeedsInput): UpdateFeed[] {
  const override = normalizeBaseUrl(input.overrideUrl ?? '')
  if (override.length > 0) {
    return [{ kind: 'override', label: '自定义源', url: override }]
  }

  // 本地测试版走 electron-builder.test.yml 打包进去的本地源（app-update.yml），不碰线上镜像。
  if (input.version.trim().includes('-test')) {
    return [{ kind: 'bundled', label: '打包内置源' }]
  }

  const feeds: UpdateFeed[] = []
  const mirrorSetting = (input.mirrorUrl ?? '').trim()
  if (mirrorSetting.toLowerCase() !== 'off') {
    const mirror = normalizeBaseUrl(mirrorSetting.length > 0 ? mirrorSetting : DEFAULT_MIRROR_URL)
    if (mirror.length > 0) {
      feeds.push({ kind: 'mirror', label: '国内镜像', url: mirror })
    }
  }

  feeds.push({ kind: 'github', label: 'GitHub' })
  return feeds
}

export function describeUpdateFeeds(feeds: UpdateFeed[]): string {
  if (feeds.length === 0) return '未配置更新源'
  const parts = feeds.map((feed) => (feed.kind === 'override' && feed.url ? `${feed.label}（${feed.url}）` : feed.label))
  return `更新源：${parts.join(' → ')}`
}

export interface FeedAttempt {
  feed: UpdateFeed
  ok: boolean
  isUpdateAvailable?: boolean
  version?: string
  error?: string
}

export interface FeedDecision {
  /** 选中的检查结果：优先"有更新"，否则第一个可用的"已是最新" */
  chosen: FeedAttempt | null
  /** 所有失败源的可读错误，用于提示 */
  errors: string[]
}

/**
 * 多源检查结果汇总：
 * - 任一源报告有更新 → 用第一个（镜像优先）；
 * - 都没有更新 → 用第一个能连通的源，避免镜像正常但 GitHub 抖动时误报错误；
 * - 全部失败 → chosen 为 null，返回每个源的错误。
 */
export function decideFeedResult(attempts: FeedAttempt[]): FeedDecision {
  const errors = attempts
    .filter((attempt) => !attempt.ok)
    .map((attempt) => `${attempt.feed.label}：${attempt.error?.trim() || '未知错误'}`)

  const available = attempts.find((attempt) => attempt.ok && attempt.isUpdateAvailable)
  if (available) return { chosen: available, errors }

  const reachable = attempts.find((attempt) => attempt.ok)
  return { chosen: reachable ?? null, errors }
}
