import { Coins, TrendingUp, Users } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import type { XpAction, XpUnit } from '@mcstudio/core'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('xp')

export function XpForm() {
  const state = useAppStore()
  const xp = state.xp
  const query = xp.action === 'query'

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / xp</div>
          <div className="hero">
            <div className="hero-icon">
              <Coins size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '经验'}
                <span className="hero-id">xp</span>
              </h1>
              <p className="hero-sub">
                {meta?.description ?? '增加、设置或查询玩家的经验点/等级。'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Users size={15} />
            目标
          </div>
          <div className="row">
            {(['add', 'set', 'query'] as XpAction[]).map((action) => (
              <button
                key={action}
                type="button"
                className={`btn btn-sm${xp.action === action ? ' btn-primary' : ''}`}
                onClick={() => state.updateXp({ action })}
              >
                {action === 'add' ? '增加' : action === 'set' ? '设置' : '查询'}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          <SelectorField value={xp.target} onChange={(target) => state.updateXp({ target })} />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <TrendingUp size={15} />
            数值
          </div>
          <div className="card-hint">
            {query ? '查询不需要数量' : xp.unit === 'points' ? '经验点' : '等级'}
          </div>
        </div>
        <div className="card-body">
          {!query ? (
            <div className="grid-2">
              <div className="field">
                <label className="field-label" htmlFor="xp-amount">
                  数量
                </label>
                <input
                  id="xp-amount"
                  className="input"
                  value={xp.amount}
                  onChange={(event) => state.updateXp({ amount: event.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="xp-unit">
                  单位
                </label>
                <select
                  id="xp-unit"
                  className="select"
                  value={xp.unit}
                  onChange={(event) => state.updateXp({ unit: event.target.value as XpUnit })}
                >
                  <option value="points">points（经验点）</option>
                  <option value="levels">levels（等级）</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="field">
              <label className="field-label" htmlFor="xp-query-unit">
                查询单位
              </label>
              <select
                id="xp-query-unit"
                className="select"
                value={xp.unit}
                onChange={(event) => state.updateXp({ unit: event.target.value as XpUnit })}
              >
                <option value="points">points（经验点）</option>
                <option value="levels">levels（等级）</option>
              </select>
              <div className="hint">查询结果会显示在命令执行者的聊天栏中。</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
