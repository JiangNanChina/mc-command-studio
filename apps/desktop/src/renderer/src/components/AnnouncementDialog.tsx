import { useShallow } from 'zustand/react/shallow'
import {
  Bell,
  Calendar,
  ExternalLink,
  Plus,
  Sparkles,
  TriangleAlert,
  Wrench
} from 'lucide-react'
import {
  CHANGE_TYPE_LABELS,
  getChangelogEntry,
  latestChangelog,
  type ChangeType,
  type ChangelogEntry
} from '@mcstudio/content'
import { getApi } from '../lib/api'
import { Modal } from './Modal'
import { useAppStore } from '../store'

const RELEASES_URL = 'https://github.com/JiangNanChina/mc-command-studio/releases'

const SECTION_ICONS: Record<ChangeType, typeof Plus> = {
  added: Plus,
  improved: Sparkles,
  fixed: Wrench,
  known: TriangleAlert
}

function sectionClass(type: ChangeType): string {
  return `changelog-section ${type}`
}

function EntryView({ entry }: { entry: ChangelogEntry }) {
  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="row" style={{ gap: 8 }}>
            <span className="badge accent">v{entry.version}</span>
            <span className="badge">当前安装</span>
          </div>
          <h2 style={{ margin: '8px 0 2px', fontSize: 20 }}>{entry.title}</h2>
          <div className="hint row" style={{ gap: 6 }}>
            <Calendar size={13} />
            {entry.date}
          </div>
        </div>
        {entry.releaseUrl ? (
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => void getApi().app.openExternal(entry.releaseUrl!)}
          >
            GitHub Release
            <ExternalLink size={12} />
          </button>
        ) : null}
      </div>

      <div className="changelog-highlights">
        {entry.highlights.map((highlight) => (
          <div key={highlight} className="row" style={{ gap: 8 }}>
            <Sparkles size={14} style={{ color: 'var(--accent)', flex: '0 0 auto', marginTop: 3 }} />
            <span>{highlight}</span>
          </div>
        ))}
      </div>

      {entry.sections
        .map((section) => {
          const Icon = SECTION_ICONS[section.type] ?? Plus
          return (
            <div key={section.type} className={sectionClass(section.type)}>
              <div className="changelog-section-head">
                <Icon size={15} />
                {CHANGE_TYPE_LABELS[section.type]}
              </div>
              <ul className="changelog-list">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )
        })}
    </div>
  )
}

export function AnnouncementDialog() {
  const state = useAppStore(useShallow((state) => ({
    appInfo: state.appInfo,
    closeAnnouncement: state.closeAnnouncement
  })))
  const current = state.appInfo?.version ?? latestChangelog().version
  const entry = getChangelogEntry(current) ?? latestChangelog()

  return (
    <Modal
      title="更新公告"
      subtitle="这里只展示当前版本的更新内容；历史版本请前往 GitHub Releases 查看。"
      icon={<Bell size={17} />}
      onClose={() => void state.closeAnnouncement()}
      wide
      footer={
        <>
          <div className="left">当前安装：v{current}</div>
          <button
            type="button"
            className="btn"
            onClick={() => void getApi().app.openExternal(RELEASES_URL)}
          >
            查看历史版本
            <ExternalLink size={12} />
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void state.closeAnnouncement()}>
            知道了
          </button>
        </>
      }
    >
      <EntryView entry={entry} />
    </Modal>
  )
}
