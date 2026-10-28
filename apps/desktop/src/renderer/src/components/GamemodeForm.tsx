import { useShallow } from 'zustand/react/shallow'
import { Gamepad2, Shield } from 'lucide-react'
import { GAME_MODES, type GameMode } from '@mcstudio/core'
import { COMMAND_MAP } from '@mcstudio/content'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('gamemode')

export function GamemodeForm() {
  const state = useAppStore(useShallow((state) => ({
    gamemode: state.gamemode,
    updateGamemode: state.updateGamemode
  })))
  const options = state.gamemode

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 玩家 / gamemode</div>
          <div className="hero">
            <div className="hero-icon">
              <Gamepad2 size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '游戏模式'}
                <span className="hero-id">gamemode</span>
              </h1>
              <p className="hero-sub">切换玩家的生存、创造、冒险或旁观模式。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Shield size={15} />
            模式与目标
          </div>
        </div>
        <div className="card-body">
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {GAME_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                className={`btn${options.mode === mode.value ? ' btn-primary' : ''}`}
                onClick={() => state.updateGamemode({ mode: mode.value as GameMode })}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <SelectorField
              value={options.target}
              label="玩家目标"
              onChange={(target) => state.updateGamemode({ target })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
