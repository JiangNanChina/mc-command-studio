import { List, MessageSquare, Skull, Sprout } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

export function SocialForm() {
  const state = useAppStore()
  const options = state.social
  const id = state.activeCommandId ?? 'say'
  const meta = COMMAND_MAP.get(id)

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 玩家 / {id}</div>
          <div className="hero">
            <div className="hero-icon">
              {id === 'kill' ? <Skull size={21} /> : id === 'seed' ? <Sprout size={21} /> : id === 'list' ? <List size={21} /> : <MessageSquare size={21} />}
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? id}
                <span className="hero-id">{id}</span>
              </h1>
              <p className="hero-sub">
                {meta?.description ?? '服务器与玩家交互命令。'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <MessageSquare size={15} />
            {id === 'kill' ? '目标' : id === 'list' ? '显示选项' : id === 'seed' ? '说明' : '消息'}
          </div>
        </div>
        <div className="card-body">
          {id === 'msg' ? (
            <SelectorField
              value={options.target}
              label="接收玩家"
              onChange={(target) => state.updateSocial({ target })}
            />
          ) : null}

          {id === 'kill' ? (
            <SelectorField
              value={options.target}
              label="要清除的实体"
              onChange={(target) => state.updateSocial({ target })}
            />
          ) : null}

          {id === 'say' || id === 'msg' ? (
            <div className="field" style={{ marginTop: id === 'msg' ? 12 : 0 }}>
              <label className="field-label" htmlFor="social-message">
                消息内容
              </label>
              <textarea
                id="social-message"
                className="textarea particle-raw"
                value={options.message}
                onChange={(event) => state.updateSocial({ message: event.target.value })}
              />
              <div className="hint">支持 @p、@a 等选择器变量，由服务器替换。</div>
            </div>
          ) : null}

          {id === 'list' ? (
            <label className="checkline">
              <input
                type="checkbox"
                checked={options.uuids}
                onChange={(event) => state.updateSocial({ uuids: event.target.checked })}
              />
              同时显示玩家 UUID（list uuids）
            </label>
          ) : null}

          {id === 'seed' ? (
            <div className="hint">
              显示当前世界种子；需要服务器管理员权限。点击右侧复制即可使用。
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
