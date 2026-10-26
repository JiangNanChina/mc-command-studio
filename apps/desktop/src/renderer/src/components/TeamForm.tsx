import { Flag, Shield, Users } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import {
  TEAM_COLLISION,
  TEAM_COLORS,
  TEAM_VISIBILITY,
  type TeamAction,
  type TeamCollision,
  type TeamColor,
  type TeamVisibility
} from '@mcstudio/core'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('team')

const ACTIONS: { value: TeamAction; label: string }[] = [
  { value: 'create', label: '创建队伍' },
  { value: 'modify', label: '修改选项' },
  { value: 'join', label: '加入队伍' },
  { value: 'leave', label: '离开队伍' },
  { value: 'remove', label: '删除队伍' },
  { value: 'list', label: '查询队伍' }
]

export function TeamForm() {
  const state = useAppStore()
  const team = state.team
  const color = TEAM_COLORS.find((item) => item.value === team.color) ?? TEAM_COLORS[0]
  const showOptions = team.action === 'create' || team.action === 'modify'
  const showTarget = team.action === 'join' || team.action === 'leave'

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 实体 / team</div>
          <div className="hero">
            <div className="hero-icon">
              <Flag size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '队伍'}
                <span className="hero-id">team</span>
              </h1>
              <p className="hero-sub">
                创建或修改队伍，设置颜色、友伤、队友隐身、名字标签与碰撞规则。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Users size={15} />
            操作
          </div>
        </div>
        <div className="card-body">
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {ACTIONS.map((action) => (
              <button
                key={action.value}
                type="button"
                className={`btn btn-sm${team.action === action.value ? ' btn-primary' : ''}`}
                onClick={() => state.updateTeam({ action: action.value })}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="field">
              <label className="field-label" htmlFor="team-name">
                队伍名
              </label>
              <input
                id="team-name"
                className="input"
                value={team.name}
                spellCheck={false}
                onChange={(event) => state.updateTeam({ name: event.target.value })}
              />
              <div className="hint">1–16 位字母/数字/下划线/点/连字符。</div>
            </div>
            {showOptions ? (
              <div className="field">
                <label className="field-label" htmlFor="team-display">
                  显示名称
                </label>
                <input
                  id="team-display"
                  className="input"
                  value={team.displayName}
                  onChange={(event) => state.updateTeam({ displayName: event.target.value })}
                />
              </div>
            ) : null}
          </div>

          {showTarget ? (
            <div style={{ marginTop: 12 }}>
              <SelectorField
                value={team.target}
                label={team.action === 'join' ? '要加入队伍的玩家' : '要离开队伍的玩家'}
                onChange={(target) => state.updateTeam({ target })}
              />
            </div>
          ) : null}

          {showOptions ? (
            <>
              <div className="field" style={{ marginTop: 12 }}>
                <span className="field-label">队伍颜色</span>
                <div className="team-colors">
                  {TEAM_COLORS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      title={item.label}
                      aria-label={item.label}
                      className={`team-color${team.color === item.value ? ' active' : ''}`}
                      style={{ background: item.hex }}
                      onClick={() => state.updateTeam({ color: item.value as TeamColor })}
                    />
                  ))}
                </div>
              </div>

              <div className="grid-2" style={{ marginTop: 12 }}>
                <label className="checkline">
                  <input
                    type="checkbox"
                    checked={team.friendlyFire}
                    onChange={(event) =>
                      state.updateTeam({ friendlyFire: event.target.checked })
                    }
                  />
                  队友之间可以互相伤害（friendlyFire）
                </label>
                <label className="checkline">
                  <input
                    type="checkbox"
                    checked={team.seeFriendlyInvisibles}
                    onChange={(event) =>
                      state.updateTeam({ seeFriendlyInvisibles: event.target.checked })
                    }
                  />
                  可以看到隐身队友（seeFriendlyInvisibles）
                </label>
              </div>

              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="team-visibility">
                    名字标签可见性
                  </label>
                  <select
                    id="team-visibility"
                    className="select"
                    value={team.nametagVisibility}
                    onChange={(event) =>
                      state.updateTeam({
                        nametagVisibility: event.target.value as TeamVisibility
                      })
                    }
                  >
                    {TEAM_VISIBILITY.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="team-collision">
                    碰撞规则
                  </label>
                  <select
                    id="team-collision"
                    className="select"
                    value={team.collisionRule}
                    onChange={(event) =>
                      state.updateTeam({ collisionRule: event.target.value as TeamCollision })
                    }
                  >
                    {TEAM_COLLISION.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : null}

          <div className="team-preview" style={{ marginTop: 14 }}>
            <span className="team-chip" style={{ borderColor: color.hex, color: color.hex }}>
              {team.displayName || team.name || '队伍'}
            </span>
            <span className="tag-target">{team.name || '(未命名)'}</span>
            {showOptions ? (
              <span className="hint" style={{ margin: 0 }}>
                <Shield size={12} /> 友伤 {team.friendlyFire ? '开' : '关'} ·{' '}
                {team.seeFriendlyInvisibles ? '可见隐身队友' : '不可见隐身队友'}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
