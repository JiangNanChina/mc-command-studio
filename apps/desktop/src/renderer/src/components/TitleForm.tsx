import { useShallow } from 'zustand/react/shallow'
import { Clock, MonitorPlay, Users } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import type { TitleAction } from '@mcstudio/core'
import { TextPreview, TextSegmentsEditor } from './TextSegmentsEditor'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('title')

const ACTIONS: { value: TitleAction; label: string }[] = [
  { value: 'title', label: '主标题' },
  { value: 'subtitle', label: '副标题' },
  { value: 'actionbar', label: '动作栏' }
]

export function TitleForm() {
  const state = useAppStore(useShallow((state) => ({
    title: state.title,
    updateTitle: state.updateTitle
  })))
  const title = state.title

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / title</div>
          <div className="hero">
            <div className="hero-icon">
              <MonitorPlay size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '标题'}
                <span className="hero-id">title</span>
              </h1>
              <p className="hero-sub">
                可视化编辑主标题、副标题或动作栏文本，可选淡入/停留/淡出时间。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Users size={15} />
            目标与位置
          </div>
          <div className="row">
            {ACTIONS.map((action) => (
              <button
                key={action.value}
                type="button"
                className={`btn btn-sm${title.action === action.value ? ' btn-primary' : ''}`}
                onClick={() => state.updateTitle({ action: action.value })}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          <SelectorField
            value={title.target}
            onChange={(target) => state.updateTitle({ target })}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Clock size={15} />
            时序
          </div>
          <label className="checkline">
            <input
              type="checkbox"
              checked={title.times}
              onChange={(event) => state.updateTitle({ times: event.target.checked })}
            />
            同时设置淡入/停留/淡出
          </label>
        </div>
        {title.times ? (
          <div className="card-body">
            <div className="grid-3">
              <div className="field">
                <label className="field-label" htmlFor="title-fade-in">
                  淡入 tick
                </label>
                <input
                  id="title-fade-in"
                  className="input"
                  value={title.fadeIn}
                  onChange={(event) => state.updateTitle({ fadeIn: event.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="title-stay">
                  停留 tick
                </label>
                <input
                  id="title-stay"
                  className="input"
                  value={title.stay}
                  onChange={(event) => state.updateTitle({ stay: event.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="title-fade-out">
                  淡出 tick
                </label>
                <input
                  id="title-fade-out"
                  className="input"
                  value={title.fadeOut}
                  onChange={(event) => state.updateTitle({ fadeOut: event.target.value })}
                />
              </div>
            </div>
            <div className="hint" style={{ marginTop: 8 }}>
              20 tick = 1 秒；times 会单独生成一条命令。
            </div>
          </div>
        ) : null}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">文本</div>
        </div>
        <div className="card-body">
          <TextSegmentsEditor
            segments={title.segments}
            onChange={(segments) => state.updateTitle({ segments })}
            interactive={false}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">预览</div>
        </div>
        <div className="card-body">
          <TextPreview segments={title.segments} />
        </div>
      </div>
    </div>
  )
}
