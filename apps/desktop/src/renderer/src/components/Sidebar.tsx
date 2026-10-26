import { useMemo } from 'react'
import { Search, X, Boxes, Link2 } from 'lucide-react'
import {
  CATEGORY_ORDER,
  COMMAND_MAP,
  COMMANDS,
  type CommandCategory
} from '@mcstudio/content'
import { getRoots } from '@mcstudio/core'
import { useAppStore } from '../store'

const ALL: CommandCategory | '全部' = '全部'

export function Sidebar() {
  const state = useAppStore()
  const pack = state.pack

  const roots = useMemo(() => (pack ? getRoots(pack.commands) : []), [pack])
  const rootIds = useMemo(() => new Set(roots.map((root) => root.name)), [roots])

  const query = state.search.trim().toLowerCase()
  const category = state.category

  const curated = useMemo(() => {
    return COMMANDS.filter((command) => {
      if (!rootIds.has(command.id)) return false
      if (category !== ALL && command.category !== category) return false
      if (!query) return true
      return (
        command.id.includes(query) ||
        command.name.toLowerCase().includes(query) ||
        command.description.toLowerCase().includes(query) ||
        (command.keywords ?? []).some((keyword) => keyword.toLowerCase().includes(query))
      )
    })
  }, [category, query, rootIds])

  const others = useMemo(() => {
    if (category !== ALL) return []
    return roots
      .filter((root) => !COMMAND_MAP.has(root.name))
      .filter((root) => {
        if (!query) return true
        return root.name.includes(query)
      })
  }, [category, query, roots])

  const total = curated.length + others.length

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="search-wrap">
          <Search size={15} />
          <input
            id="command-search"
            className="search-input"
            placeholder="搜索命令 / 中文名 / 用途"
            value={state.search}
            spellCheck={false}
            onChange={(event) => state.setSearch(event.target.value)}
          />
          {state.search ? (
            <button type="button" className="search-clear" onClick={() => state.setSearch('')} aria-label="清空搜索">
              <X size={14} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="categories">
        {[ALL, ...CATEGORY_ORDER].map((item) => (
          <button
            key={item}
            type="button"
            className={`chip${category === item ? ' active' : ''}`}
            onClick={() => state.setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="command-list">
        {category === ALL && !query ? (
          <>
            <div className="command-group-label">工具</div>
            <button
              type="button"
              className={`command-item${state.activeCommandId === 'chain' ? ' active' : ''}`}
              onClick={() => state.openChain()}
            >
              <span className="command-glyph">
                <Link2 size={15} />
              </span>
              <span className="command-text">
                <span className="command-name">
                  命令方块链
                  <span className="command-id">chain</span>
                </span>
                <span className="command-desc">排布多个命令方块，生成整链 setblock。</span>
              </span>
            </button>
          </>
        ) : null}

        {curated.length > 0 ? (
          <>
            <div className="command-group-label">精选命令</div>
            {curated.map((command) => {
              const active = state.activeCommandId === command.id
              return (
                <button
                  key={command.id}
                  type="button"
                  className={`command-item${active ? ' active' : ''}`}
                  onClick={() => state.selectCommand(command.id)}
                >
                  <span className="command-glyph">{command.id.slice(0, 1).toUpperCase()}</span>
                  <span className="command-text">
                    <span className="command-name">
                      {command.name}
                      <span className="command-id">{command.id}</span>
                    </span>
                    <span className="command-desc">{command.description}</span>
                  </span>
                </button>
              )
            })}
          </>
        ) : null}

        {others.length > 0 ? (
          <>
            <div className="command-group-label">其他命令</div>
            {others.map((root) => {
              const active = state.activeCommandId === root.name
              return (
                <button
                  key={root.name}
                  type="button"
                  className={`command-item${active ? ' active' : ''}`}
                  onClick={() => state.selectCommand(root.name)}
                >
                  <span className="command-glyph">{root.name.slice(0, 1).toUpperCase()}</span>
                  <span className="command-text">
                    <span className="command-name">
                      <span style={{ fontFamily: 'var(--mono)' }}>{root.name}</span>
                      <span className="command-id">通用</span>
                    </span>
                    <span className="command-desc">该命令的中文说明尚未收录，可用通用构建器拼写。</span>
                  </span>
                </button>
              )
            })}
          </>
        ) : null}

        {total === 0 ? (
          <div className="list-empty">
            <Boxes size={22} style={{ marginBottom: 8, opacity: 0.5 }} />
            <div>没有匹配的命令</div>
            <div style={{ marginTop: 4 }}>试试命令 ID，例如 give、execute。</div>
          </div>
        ) : null}
      </div>

      <div className="sidebar-footer">
        <span>{pack ? `${pack.manifest.counts.roots} 个根命令` : '无数据包'}</span>
        <span>{pack ? `${pack.manifest.counts.items} 物品` : ''}</span>
      </div>
    </aside>
  )
}
