import { useShallow } from 'zustand/react/shallow'
import { useDeferredValue, useMemo } from 'react'
import { Search, X, Boxes, Link2, PackageOpen, TerminalSquare, Wrench } from 'lucide-react'
import {
  CATEGORY_ORDER,
  COMMAND_MAP,
  COMMANDS,
  TEMPLATE_CATEGORY_ORDER,
  type SidebarCategory,
  type TemplateCategory
} from '@mcstudio/content'
import { getRoots } from '@mcstudio/core'
import { McIcon } from './McIcon'
import { COMMAND_TEMPLATES, templatesInCategory } from '../lib/templateCatalog'
import { useAppStore } from '../store'
import { commandName } from '../lib/commandLabels'

const ALL: SidebarCategory | '全部' = '全部'

function isTemplateCategory(category: SidebarCategory | '全部'): category is TemplateCategory {
  return TEMPLATE_CATEGORY_ORDER.includes(category as TemplateCategory)
}

export function Sidebar() {
  const state = useAppStore(useShallow((state) => ({
    pack: state.pack,
    search: state.search,
    category: state.category,
    setSearch: state.setSearch,
    setCategory: state.setCategory,
    activeCommandId: state.activeCommandId,
    selectCommand: state.selectCommand,
    openChain: state.openChain,
    openDatapack: state.openDatapack,
    openTemplate: state.openTemplate
  })))
  const pack = state.pack

  const roots = useMemo(() => (pack ? getRoots(pack.commands) : []), [pack])
  const rootIds = useMemo(() => new Set(roots.map((root) => root.name)), [roots])

  const deferredSearch = useDeferredValue(state.search)
  const query = deferredSearch.trim().toLowerCase()
  const category = state.category
  const templateCategory = isTemplateCategory(category) ? category : null
  const templates = useMemo(() => templateCategory
    ? templatesInCategory(templateCategory, query)
    : category === ALL ? COMMAND_TEMPLATES.filter((template) =>
      !query || `${template.name} ${template.id} ${template.description}`.toLowerCase().includes(query)
    ) : [], [category, templateCategory, query])

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
        return `${root.name} ${commandName(root.name)}`.toLowerCase().includes(query)
      })
  }, [category, query, roots])

  const total = templates.length + curated.length + others.length

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

      <div className="categories" aria-label="命令分类">
        {[ALL, ...CATEGORY_ORDER, ...TEMPLATE_CATEGORY_ORDER].map((item) => (
          <button
            key={item}
            type="button"
            className={`chip${category === item ? ' active' : ''}`}
            aria-pressed={category === item}
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
              className={`command-item${state.activeCommandId === 'legacy-tools' ? ' active' : ''}`}
              onClick={() => state.selectCommand('legacy-tools')}
            >
              <span className="command-glyph">
                <Wrench size={15} />
              </span>
              <span className="command-text">
                <span className="command-name">
                  1.12.2 旧版工具
                  <span className="command-id">legacy</span>
                </span>
                <span className="command-desc">实体检测、数据编辑、槽位替换等旧版命令</span>
              </span>
            </button>
            <button
              type="button"
              className={`command-item${state.activeCommandId === 'ooc' ? ' active' : ''}`}
              onClick={() => state.selectCommand('ooc')}
            >
              <span className="command-glyph">
                <TerminalSquare size={15} />
              </span>
              <span className="command-text">
                <span className="command-name">
                  一键命令生成器
                  <span className="command-id">ooc</span>
                </span>
                <span className="command-desc">1.12.2 掉落沙 / 命令方块矿车 / 命令方块 NBT</span>
              </span>
            </button>
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
                <span className="command-desc">排布多个命令方块，生成整条放置命令链。</span>
              </span>
            </button>
            <button
              type="button"
              className={`command-item${state.activeCommandId === 'datapack' ? ' active' : ''}`}
              onClick={() => state.openDatapack()}
            >
              <span className="command-glyph">
                <PackageOpen size={15} />
              </span>
              <span className="command-text">
                <span className="command-name">
                  数据包工作区
                  <span className="command-id">datapack</span>
                </span>
                <span className="command-desc">创建多函数数据包，配置加载与循环执行后导出。</span>
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

        {TEMPLATE_CATEGORY_ORDER.map((group) => {
          const entries = templates.filter((template) => template.category === group)
          if (!entries.length) return null
          return (
            <div key={group}>
              <div className="command-group-label">{group} · {entries.length}</div>
              {entries.map((template) => {
                const active = state.activeCommandId === `template:${template.id}`
                return (
                  <button key={template.id} data-template-id={template.id} type="button"
                    className={`command-item template-command${active ? ' active' : ''}`}
                    aria-pressed={active} disabled={!pack} title={template.description}
                    onClick={() => state.openTemplate(template.id)}>
                    <span className="command-glyph template-glyph"><McIcon category={template.iconCategory} id={template.iconId} size={22} /></span>
                    <span className="command-text">
                      <span className="command-name">{template.name}</span>
                      <span className="command-desc">{template.description}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          )
        })}

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
                      {commandName(root.name)}
                      <span className="command-id">{root.name}</span>
                    </span>
                    <span className="command-desc">逐步选择操作并填写参数，实时生成命令。</span>
                  </span>
                </button>
              )
            })}
          </>
        ) : null}

        {total === 0 ? (
          <div className="list-empty">
            <Boxes size={22} style={{ marginBottom: 8, opacity: 0.5 }} />
            <div>{templateCategory ? '没有匹配的模板' : '没有匹配的命令'}</div>
            <div style={{ marginTop: 4 }}>{templateCategory ? '试试搜索物品、方块或实体名称。' : '试试命令 ID，例如 give、execute。'}</div>
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
