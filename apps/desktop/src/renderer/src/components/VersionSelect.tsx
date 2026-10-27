import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { useAppStore } from '../store'

const RECENT_KEY = 'mcstudio:recent-versions'
const ENGINE_LABEL: Record<string, string> = {
  legacy: 'Legacy',
  nbt: 'NBT',
  components: '组件'
}

function groupOf(version: string): string {
  const parts = version.split('.')
  return `${parts[0]}.${parts[1]}`
}

function compareVersion(a: string, b: string): number {
  const left = a.split('.').map(Number)
  const right = b.split('.').map(Number)
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

function loadRecent(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((item) => typeof item === 'string').slice(0, 4) : []
  } catch {
    return []
  }
}

export function VersionSelect() {
  const packs = useAppStore((state) => state.packs)
  const activePackId = useAppStore((state) => state.activePackId)
  const booted = useAppStore((state) => state.booted)
  const loadPack = useAppStore((state) => state.loadPack)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>(loadRecent)
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const current = packs.find((pack) => pack.id === activePackId)
  const engine = current?.engine ?? 'nbt'

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    const frame = requestAnimationFrame(() => searchRef.current?.focus())
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      cancelAnimationFrame(frame)
    }
  }, [open])

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    return packs
      .filter((pack) => !value || pack.gameVersion.toLowerCase().includes(value))
      .sort((a, b) => compareVersion(a.gameVersion, b.gameVersion))
  }, [packs, query])

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const pack of filtered) {
      const key = groupOf(pack.gameVersion)
      const list = map.get(key) ?? []
      list.push(pack)
      map.set(key, list)
    }
    return [...map.entries()]
  }, [filtered])

  const recentPacks = useMemo(
    () =>
      recent
        .map((id) => packs.find((pack) => pack.id === id))
        .filter((pack): pack is NonNullable<typeof pack> => Boolean(pack))
        .filter((pack) => !query.trim()),
    [packs, recent, query]
  )

  const choose = (id: string) => {
    setOpen(false)
    setQuery('')
    const next = [id, ...recent.filter((item) => item !== id)].slice(0, 4)
    setRecent(next)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    if (id !== activePackId) void loadPack(id)
  }

  return (
    <div className="version-select" ref={rootRef}>
      <button
        type="button"
        className="version-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Minecraft 版本"
        disabled={!booted || packs.length <= 1}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="dot" />
        <span className="version-current">{activePackId}</span>
        <span className="version-engine">{ENGINE_LABEL[engine] ?? engine}</span>
        <ChevronDown size={13} />
      </button>

      {open ? (
        <div className="version-popover" role="listbox">
          <div className="version-search-row">
            <Search size={14} />
            <input
              ref={searchRef}
              className="version-search"
              value={query}
              placeholder="搜索版本，如 1.20 或 26"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="version-list">
            {recentPacks.length > 0 ? (
              <div className="version-group">
                <div className="version-group-title">最近使用</div>
                {recentPacks.map((pack) => (
                  <button
                    type="button"
                    key={`recent-${pack.id}`}
                    className={`version-option${pack.id === activePackId ? ' active' : ''}`}
                    onClick={() => choose(pack.id)}
                  >
                    <span className="version-name">{pack.gameVersion}</span>
                    <span className="version-tags">
                      <span className={`version-tag ${pack.engine ?? 'nbt'}`}>
                        {ENGINE_LABEL[pack.engine ?? 'nbt']}
                      </span>
                      <span className="version-tag ghost">{pack.aliasOf ? '别名' : '基础'}</span>
                    </span>
                    {pack.id === activePackId ? <Check size={13} /> : null}
                  </button>
                ))}
              </div>
            ) : null}

            {groups.map(([group, list]) => (
              <div className="version-group" key={group}>
                <div className="version-group-title">{group}</div>
                {list.map((pack) => (
                  <button
                    type="button"
                    key={pack.id}
                    className={`version-option${pack.id === activePackId ? ' active' : ''}`}
                    onClick={() => choose(pack.id)}
                  >
                    <span className="version-name">{pack.gameVersion}</span>
                    <span className="version-tags">
                      <span className={`version-tag ${pack.engine ?? 'nbt'}`}>
                        {ENGINE_LABEL[pack.engine ?? 'nbt']}
                      </span>
                      <span className="version-tag ghost">{pack.aliasOf ? '别名' : '基础'}</span>
                    </span>
                    {pack.id === activePackId ? <Check size={13} /> : null}
                  </button>
                ))}
              </div>
            ))}

            {filtered.length === 0 ? <div className="version-empty">没有匹配的版本</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
