import { useState } from 'react'
import {
  AlertTriangle,
  Bell,
  Calendar,
  ExternalLink,
  Plus,
  Sparkles,
  Wrench
} from 'lucide-react'
import {
  CHANGELOG,
  CHANGE_TYPE_LABELS,
  getChangelogEntry,
  type ChangeType,
  type ChangelogEntry
} from '@mcstudio/content'
import { getApi } from '../lib/api'
import { Modal } from './Modal'
import { useAppStore } from '../store'

const SECTION_ICONS: Record<ChangeType, typeof Plus> = {
  added: Plus,
  improved: Sparkles,
  fixed: Wrench,
  known: AlertTriangle
}

function sectionClass(type: ChangeType): string {
  return `changelog-section ${type}`
}

function EntryView({ entry, current }: { entry: ChangelogEntry; current: string }) {
  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="row" style={{ gap: 8 }}>
            <span className="badge accent">v{entry.version}</span>
            {entry.version === current ? <span className="badge">当前安装</span> : null}
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

      {entry.sections.map((section) => {
        const Icon = SECTION_ICONS[section.type]
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
  const state = useAppStore()
  const current = state.appInfo?.version ?? CHANGELOG[0].version
  const initial = getChangelogEntry(current) ? current : CHANGELOG[0].version
  const [selected, setSelected] = useState(initial)
  const entry = getChangelogEntry(selected) ?? CHANGELOG[0]

  return (
    <Modal
      title="更新公告"
      subtitle="每次版本更新都会在这里记录新增、改进、修复与已知问题。"
      icon={<Bell size={17} />}
      onClose={() => void state.closeAnnouncement()}
      wide
      footer={
        <>
          <div className="left">当前安装：v{current}</div>
          <button type="button" className="btn" onClick={() => void state.closeAnnouncement()}>
            知道了
          </button>
        </>
      }
    >
      <div className="changelog-versions">
        {CHANGELOG.map((item) => (
          <button
            key={item.version}
            type="button"
            className={`chip${item.version === selected ? ' active' : ''}`}
            onClick={() => setSelected(item.version)}
          >
            v{item.version}
          </button>
        ))}
      </div>
      <div className="divider" />
      <EntryView entry={entry} current={current} />
    </Modal>
  )
}
