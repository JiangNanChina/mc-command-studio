import { MessageSquareText, Users } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import { TextPreview, TextSegmentsEditor } from './TextSegmentsEditor'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('tellraw')

export function TellrawForm() {
  const state = useAppStore()
  const tellraw = state.tellraw

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / tellraw</div>
          <div className="hero">
            <div className="hero-icon">
              <MessageSquareText size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '富文本消息'}
                <span className="hero-id">tellraw</span>
              </h1>
              <p className="hero-sub">
                可视化编辑多段文本：颜色、粗体/斜体/下划线、点击事件与悬停提示。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Users size={15} />
            发送给
          </div>
        </div>
        <div className="card-body">
          <SelectorField
            value={tellraw.target}
            onChange={(target) => state.updateTellraw({ target })}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <MessageSquareText size={15} />
            文本片段
            <span className="badge">{tellraw.segments.length}</span>
          </div>
        </div>
        <div className="card-body">
          <TextSegmentsEditor
            segments={tellraw.segments}
            onChange={(segments) => state.updateTellraw({ segments })}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">预览</div>
        </div>
        <div className="card-body">
          <TextPreview segments={tellraw.segments} />
        </div>
      </div>
    </div>
  )
}
