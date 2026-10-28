import { useShallow } from 'zustand/react/shallow'
import { useEffect, useMemo, useState } from 'react'
import { MapPin, Play, Square, Volume2, VolumeX } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import { SOUND_SOURCES } from '@mcstudio/core'
import { mcId, mcName } from '../lib/mcAssets'
import { McIcon } from './McIcon'
import { PositionInput } from './PositionInput'
import { RegistryPickerDialog } from './RegistryPickerDialog'
import { SelectorField } from './SelectorField'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('playsound')

export function SoundForm() {
  const state = useAppStore(useShallow((state) => ({
    sound: state.sound,
    pack: state.pack,
    activeCommandId: state.activeCommandId,
    updateSound: state.updateSound
  })))
  const sound = state.sound
  const [pickerOpen, setPickerOpen] = useState(false)
  const sounds = useMemo(() => {
    const list = state.pack?.registries.sound_event ?? []
    return list.map((id) => mcId(id))
  }, [state.pack])

  useEffect(() => {
    const expected =
      state.activeCommandId === 'stopsound'
        ? 'stop'
        : state.activeCommandId === 'playsound'
          ? 'play'
          : null
    if (expected && sound.action !== expected) {
      state.updateSound({ action: expected })
    }
  }, [sound.action, state.activeCommandId, state.updateSound])

  const pickSound = (): void => setPickerOpen(true)

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / playsound</div>
          <div className="hero">
            <div className="hero-icon">
              <Volume2 size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {sound.action === 'stop' ? '停止声音' : (meta?.name ?? '播放声音')}
                <span className="hero-id">{sound.action === 'stop' ? 'stopsound' : 'playsound'}</span>
              </h1>
              <p className="hero-sub">
                可视化选择声音、来源、目标与坐标，控制音量、音调和最小音量。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Volume2 size={15} />
            操作与目标
          </div>
          <div className="row">
            <button
              type="button"
              className={`btn btn-sm${sound.action === 'play' ? ' btn-primary' : ''}`}
              onClick={() => state.updateSound({ action: 'play' })}
            >
              <Play size={13} />
              播放
            </button>
            <button
              type="button"
              className={`btn btn-sm${sound.action === 'stop' ? ' btn-primary' : ''}`}
              onClick={() => state.updateSound({ action: 'stop' })}
            >
              <Square size={13} />
              停止
            </button>
          </div>
        </div>
        <div className="card-body">
          <SelectorField
            value={sound.target}
            onChange={(target) => state.updateSound({ target })}
          />
        </div>
      </div>

      {sound.action === 'play' ? (
        <>
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Volume2 size={15} />
                声音
              </div>
              <div className="card-hint">{sounds.length} 个声音</div>
            </div>
            <div className="card-body">
              <div className="item-select">
                <McIcon category="sounds" id={sound.sound} size={38} />
                <div className="item-main">
                  <div className="item-name">{mcName('sounds', sound.sound)}</div>
                  <div className="item-sub">{sound.sound}</div>
                </div>
                <button type="button" className="btn" onClick={pickSound}>
                  选择声音
                </button>
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="sound-source">
                  声音来源
                </label>
                <select
                  id="sound-source"
                  className="select"
                  value={sound.source}
                  onChange={(event) =>
                    state.updateSound({ source: event.target.value as typeof sound.source })
                  }
                >
                  {SOUND_SOURCES.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginTop: 12 }}>
                <PositionInput
                  label="播放坐标"
                  value={sound.position}
                  onChange={(position) => state.updateSound({ position })}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <MapPin size={15} />
                音量与音调
              </div>
            </div>
            <div className="card-body">
              <div className="grid-3">
                <div className="field">
                  <label className="field-label" htmlFor="sound-volume">
                    音量
                  </label>
                  <input
                    id="sound-volume"
                    className="input"
                    value={sound.volume}
                    onChange={(event) => state.updateSound({ volume: event.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="sound-pitch">
                    音调
                  </label>
                  <input
                    id="sound-pitch"
                    className="input"
                    value={sound.pitch}
                    onChange={(event) => state.updateSound({ pitch: event.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="sound-min-volume">
                    最小音量
                  </label>
                  <input
                    id="sound-min-volume"
                    className="input"
                    value={sound.minVolume}
                    onChange={(event) => state.updateSound({ minVolume: event.target.value })}
                  />
                </div>
              </div>
              <div className="hint" style={{ marginTop: 8 }}>
                音量 1、音调 1 为默认值；最小音量用于远处玩家仍能听到的最小值。
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <VolumeX size={15} />
              停止范围
            </div>
            <div className="row">
              {[
                { value: 'all', label: '全部声音' },
                { value: 'source', label: '指定来源' },
                { value: 'sound', label: '指定声音' }
              ].map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  className={`btn btn-sm${sound.stopMode === mode.value ? ' btn-primary' : ''}`}
                  onClick={() =>
                    state.updateSound({ stopMode: mode.value as typeof sound.stopMode })
                  }
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body">
            {sound.stopMode !== 'all' ? (
              <div className="field" style={{ marginBottom: 12 }}>
                <label className="field-label" htmlFor="stop-source">
                  声音来源
                </label>
                <select
                  id="stop-source"
                  className="select"
                  value={sound.source}
                  onChange={(event) =>
                    state.updateSound({ source: event.target.value as typeof sound.source })
                  }
                >
                  {SOUND_SOURCES.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {sound.stopMode === 'sound' ? (
              <div className="item-select">
                <McIcon category="sounds" id={sound.sound} size={34} />
                <div className="item-main">
                  <div className="item-name">{mcName('sounds', sound.sound)}</div>
                  <div className="item-sub">{sound.sound}</div>
                </div>
                <button type="button" className="btn btn-sm" onClick={pickSound}>
                  选择声音
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {pickerOpen ? (
        <RegistryPickerDialog
          title="选择声音"
          category="sounds"
          ids={sounds}
          current={sound.sound}
          limit={400}
          onSelect={(id) => state.updateSound({ sound: id })}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  )
}
