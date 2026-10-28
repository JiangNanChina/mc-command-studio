import { useShallow } from 'zustand/react/shallow'
import { CalendarClock, Clock3 } from 'lucide-react'
import { type ScheduleAction, type ScheduleMode } from '@mcstudio/core'
import { COMMAND_MAP } from '@mcstudio/content'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('schedule')

export function ScheduleForm() {
  const state = useAppStore(useShallow((state) => ({
    automation: state.automation,
    datapack: state.datapack,
    updateSchedule: state.updateSchedule
  })))
  const schedule = state.automation.schedule
  const dataFunctions = state.datapack.functions.map(
    (item) => `${state.datapack.namespace}:${item.name}`
  )

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 数据 / schedule</div>
          <div className="hero">
            <div className="hero-icon">
              <CalendarClock size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '计划任务'}
                <span className="hero-id">schedule</span>
              </h1>
              <p className="hero-sub">
                在指定时间后运行函数；可追加或替换同一函数的计划，也可以清除计划。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Clock3 size={15} />
            计划
          </div>
          <div className="row">
            {(['function', 'clear'] as ScheduleAction[]).map((action) => (
              <button
                key={action}
                type="button"
                className={`btn btn-sm${schedule.action === action ? ' btn-primary' : ''}`}
                onClick={() => state.updateSchedule({ action })}
              >
                {action === 'function' ? '安排运行' : '清除计划'}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          <div className="field">
            <label className="field-label" htmlFor="schedule-function">
              函数名
            </label>
            <input
              id="schedule-function"
              className="input"
              list="schedule-function-suggestions"
              value={schedule.functionName}
              spellCheck={false}
              onChange={(event) =>
                state.updateSchedule({ functionName: event.target.value })
              }
            />
            <datalist id="schedule-function-suggestions">
              {dataFunctions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <div className="hint">格式 namespace:path；可从数据包工作区函数中选择。</div>
          </div>

          {schedule.action === 'function' ? (
            <>
              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="schedule-time">
                    延迟时间
                  </label>
                  <input
                    id="schedule-time"
                    className="input"
                    value={schedule.time}
                    onChange={(event) => state.updateSchedule({ time: event.target.value })}
                  />
                  <div className="hint">10、10s、10t 或 10d。</div>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="schedule-mode">
                    重复计划处理
                  </label>
                  <select
                    id="schedule-mode"
                    className="select"
                    value={schedule.mode}
                    onChange={(event) =>
                      state.updateSchedule({ mode: event.target.value as ScheduleMode })
                    }
                  >
                    <option value="replace">替换已有计划</option>
                    <option value="append">追加新计划</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <div className="hint" style={{ marginTop: 12 }}>
              清除该函数当前安排的所有计划任务。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
