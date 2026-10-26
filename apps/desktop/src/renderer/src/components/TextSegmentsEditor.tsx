import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import {
  TEXT_ACTION_LABELS,
  TEXT_COMPONENT_COLORS,
  TEXT_COMPONENT_COLOR_LABELS,
  createTextSegment,
  type TextAction,
  type TextSegment
} from '@mcstudio/core'

const COLOR_HEX: Record<string, string> = {
  white: '#ffffff',
  gray: '#aaaaaa',
  dark_gray: '#555555',
  black: '#000000',
  dark_blue: '#0000aa',
  blue: '#5555ff',
  dark_aqua: '#00aaaa',
  aqua: '#55ffff',
  dark_green: '#00aa00',
  green: '#55ff55',
  dark_red: '#aa0000',
  red: '#ff5555',
  dark_purple: '#aa00aa',
  light_purple: '#ff55ff',
  gold: '#ffaa00',
  yellow: '#ffff55'
}

export function TextPreview({ segments }: { segments: TextSegment[] }) {
  return (
    <div className="text-preview" aria-label="文本预览">
      {segments.map((segment, index) => (
        <span
          key={index}
          title={segment.hover || undefined}
          style={{
            color: COLOR_HEX[segment.color] ?? '#ffffff',
            fontWeight: segment.bold ? 700 : 400,
            fontStyle: segment.italic ? 'italic' : 'normal',
            textDecoration: [
              segment.underlined ? 'underline' : '',
              segment.strikethrough ? 'line-through' : ''
            ]
              .filter(Boolean)
              .join(' ') || 'none',
            filter: segment.obfuscated ? 'blur(1.5px)' : undefined
          }}
        >
          {segment.text || ' '}
        </span>
      ))}
    </div>
  )
}

interface TextSegmentsEditorProps {
  segments: TextSegment[]
  onChange: (segments: TextSegment[]) => void
  interactive?: boolean
}

export function TextSegmentsEditor({
  segments,
  onChange,
  interactive = true
}: TextSegmentsEditorProps) {
  const patch = (index: number, patchValue: Partial<TextSegment>): void => {
    onChange(segments.map((segment, i) => (i === index ? { ...segment, ...patchValue } : segment)))
  }

  const move = (index: number, direction: -1 | 1): void => {
    const target = index + direction
    if (target < 0 || target >= segments.length) return
    const next = [...segments]
    const [segment] = next.splice(index, 1)
    next.splice(target, 0, segment)
    onChange(next)
  }

  return (
    <div>
      {segments.map((segment, index) => (
        <div className="text-segment" key={index}>
          <div className="text-segment-head">
            <span className="execute-index">{index + 1}</span>
            <input
              className="input"
              style={{ flex: 1 }}
              value={segment.text}
              placeholder="显示的文本"
              onChange={(event) => patch(index, { text: event.target.value })}
            />
            <span className="color-swatch" style={{ background: COLOR_HEX[segment.color] ?? '#fff' }} />
            <select
              className="select"
              style={{ width: 110 }}
              value={segment.color}
              onChange={(event) => patch(index, { color: event.target.value })}
            >
              {TEXT_COMPONENT_COLORS.map((color) => (
                <option key={color} value={color}>
                  {TEXT_COMPONENT_COLOR_LABELS[color]}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="icon-btn"
              aria-label="上移文本"
              disabled={index === 0}
              onClick={() => move(index, -1)}
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="下移文本"
              disabled={index === segments.length - 1}
              onClick={() => move(index, 1)}
            >
              <ArrowDown size={14} />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="删除文本"
              onClick={() => onChange(segments.filter((_, i) => i !== index))}
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="row wrap" style={{ marginTop: 8 }}>
            {[
              { key: 'bold' as const, label: 'B', title: '粗体', style: { fontWeight: 700 } },
              { key: 'italic' as const, label: 'I', title: '斜体', style: { fontStyle: 'italic' } },
              {
                key: 'underlined' as const,
                label: 'U',
                title: '下划线',
                style: { textDecoration: 'underline' }
              },
              {
                key: 'strikethrough' as const,
                label: 'S',
                title: '删除线',
                style: { textDecoration: 'line-through' }
              },
              { key: 'obfuscated' as const, label: 'O', title: '随机字符', style: { opacity: 0.7 } }
            ].map((style) => (
              <button
                key={style.key}
                type="button"
                title={style.title}
                className={`btn btn-sm${segment[style.key] ? ' btn-primary' : ''}`}
                style={style.style}
                onClick={() => patch(index, { [style.key]: !segment[style.key] })}
              >
                {style.label}
              </button>
            ))}
          </div>

          {interactive ? (
            <div className="grid-2" style={{ marginTop: 8 }}>
              <div className="field">
                <label className="field-label">点击事件</label>
                <div className="row">
                  <select
                    className="select"
                    value={segment.click?.action ?? ''}
                    onChange={(event) =>
                      patch(index, {
                        click: event.target.value
                          ? { action: event.target.value as TextAction, value: segment.click?.value ?? '' }
                          : null
                      })
                    }
                  >
                    <option value="">无</option>
                    {(Object.keys(TEXT_ACTION_LABELS) as TextAction[]).map((action) => (
                      <option key={action} value={action}>
                        {TEXT_ACTION_LABELS[action]}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input"
                    placeholder="链接 / 命令 / 文本"
                    value={segment.click?.value ?? ''}
                    disabled={!segment.click}
                    onChange={(event) =>
                      patch(index, {
                        click: segment.click
                          ? { action: segment.click.action, value: event.target.value }
                          : null
                      })
                    }
                  />
                </div>
              </div>
              <div className="field">
                <label className="field-label">悬停文本</label>
                <input
                  className="input"
                  value={segment.hover}
                  placeholder="鼠标悬停时显示"
                  onChange={(event) => patch(index, { hover: event.target.value })}
                />
              </div>
            </div>
          ) : null}
        </div>
      ))}

      <button
        type="button"
        className="btn btn-sm"
        style={{ marginTop: 10 }}
        onClick={() => onChange([...segments, createTextSegment()])}
      >
        <Plus size={13} />
        添加文本片段
      </button>
    </div>
  )
}
