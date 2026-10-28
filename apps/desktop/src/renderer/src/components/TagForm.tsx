import { useShallow } from 'zustand/react/shallow'
import { Tag, Tags } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import type { TagAction } from '@mcstudio/core'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('tag')

export function TagForm() {
  const state = useAppStore(useShallow((state) => ({
    tag: state.tag,
    updateTag: state.updateTag
  })))
  const tag = state.tag

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 实体 / tag</div>
          <div className="hero">
            <div className="hero-icon">
              <Tag size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '实体标签'}
                <span className="hero-id">tag</span>
              </h1>
              <p className="hero-sub">
                给实体添加或移除标签，也可以查询实体当前拥有的全部标签。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Tags size={15} />
            操作
          </div>
          <div className="row">
            {(['add', 'remove', 'list'] as TagAction[]).map((action) => (
              <button
                key={action}
                type="button"
                className={`btn btn-sm${tag.action === action ? ' btn-primary' : ''}`}
                onClick={() => state.updateTag({ action })}
              >
                {action === 'add' ? '添加' : action === 'remove' ? '移除' : '查询'}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          <SelectorField
            value={tag.target}
            label="实体目标"
            onChange={(target) => state.updateTag({ target })}
          />
          {tag.action !== 'list' ? (
            <div className="field" style={{ marginTop: 12 }}>
              <label className="field-label" htmlFor="tag-name">
                标签名
              </label>
              <input
                id="tag-name"
                className="input"
                value={tag.name}
                spellCheck={false}
                placeholder="mcstudio.tag"
                onChange={(event) => state.updateTag({ name: event.target.value })}
              />
              <div className="hint">不能包含空格；建议使用命名空间风格，例如 map.wave1。</div>
            </div>
          ) : (
            <div className="hint" style={{ marginTop: 12 }}>
              查询会列出目标当前拥有的所有标签，不会修改实体。
            </div>
          )}

          <div className="tag-preview" style={{ marginTop: 14 }}>
            <span className="tag-chip">{tag.action === 'list' ? '查询标签' : tag.name || '标签'}</span>
            <span className="tag-target">→ {tag.target.base}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
