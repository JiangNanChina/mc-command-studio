import { useShallow } from 'zustand/react/shallow'
import { Bell, Check } from 'lucide-react'
import { getChangelogEntry, latestChangelog } from '@mcstudio/content'
import { useAppStore } from '../store'

export function AnnouncementBanner() {
  const state = useAppStore(useShallow((state) => ({
    appInfo: state.appInfo,
    settings: state.settings,
    markAnnouncementSeen: state.markAnnouncementSeen,
    openAnnouncement: state.openAnnouncement
  })))
  const version = state.appInfo?.version
  if (!version) return null
  if (state.settings.lastSeenVersion === version) return null

  const entry = getChangelogEntry(version) ?? latestChangelog()
  if (!entry) return null

  return (
    <div className="banner announcement">
      <div className="banner-icon">
        <Bell size={15} />
      </div>
      <div className="banner-text">
        <div className="banner-title">
          v{entry.version} 更新内容 · {entry.title}
        </div>
        <div className="banner-sub">{entry.highlights[0]}</div>
      </div>
      <div className="banner-actions">
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={() => void state.markAnnouncementSeen()}
        >
          <Check size={13} />
          知道了
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => state.openAnnouncement()}>
          查看详情
        </button>
      </div>
    </div>
  )
}
