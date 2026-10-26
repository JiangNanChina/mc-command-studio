import { useMemo, useState } from 'react'
import { Crosshair, RotateCcw } from 'lucide-react'
import {
  SELECTOR_BASES,
  serializeSelector,
  type Selector
} from '@mcstudio/core'
import { Modal } from './Modal'
import { useAppStore } from '../store'

export function SelectorDialog() {
  const state = useAppStore()
  const [draft, setDraft] = useState<Selector>(() => structuredClone(state.give.target))
  const preview = serializeSelector(draft)
  const entities = useMemo(() => {
    const list = state.pack?.registries.entity_type ?? []
    return list.map((id) => (id.includes(':') ? id : `minecraft:${id}`))
  }, [state.pack])

  const patch = (value: Partial<Selector>): void => setDraft((current) => ({ ...current, ...value }))

  return (
    <Modal
      title="编辑目标选择器"
      subtitle="只填写需要的条件，留空的条件不会出现在命令里。"
      icon={<Crosshair size={17} />}
      onClose={() => state.setDialog('selector', false)}
      wide
      footer={
        <>
          <div className="left">
            <code className="code-inline">{preview.text}</code>
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => setDraft({ base: '@s' })}
          >
            <RotateCcw size={14} />
            重置
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => state.setDialog('selector', false)}
          >
            取消
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              state.setTarget(draft)
              state.setDialog('selector', false)
            }}
          >
            应用
          </button>
        </>
      }
    >
      <div className="field">
        <div className="field-label">选择器类型</div>
        <div className="row wrap">
          {SELECTOR_BASES.map((base) => (
            <button
              key={base.value}
              type="button"
              className={`chip${draft.base === base.value ? ' active' : ''}`}
              title={base.hint}
              onClick={() => patch({ base: base.value })}
            >
              {base.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 14 }}>
        <div className="field">
          <label className="field-label" htmlFor="selector-name">
            玩家名
          </label>
          <input
            id="selector-name"
            className="input"
            placeholder="留空表示不限制"
            value={draft.name ?? ''}
            onChange={(event) => patch({ name: event.target.value })}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="selector-type">
            实体类型
          </label>
          <input
            id="selector-type"
            className="input"
            list="selector-entity-types"
            placeholder="minecraft:player"
            value={draft.type ?? ''}
            onChange={(event) => patch({ type: event.target.value })}
          />
          <datalist id="selector-entity-types">
            {entities.map((id) => (
              <option key={id} value={id} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 14 }}>
        <div className="field">
          <label className="field-label" htmlFor="selector-tag">
            标签
          </label>
          <input
            id="selector-tag"
            className="input"
            placeholder="例如 vip"
            value={draft.tag ?? ''}
            onChange={(event) => patch({ tag: event.target.value })}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="selector-distance">
            距离（数字或 a..b）
          </label>
          <input
            id="selector-distance"
            className="input"
            placeholder="例如 0..32"
            value={draft.distance ?? ''}
            onChange={(event) => patch({ distance: event.target.value })}
          />
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: 14 }}>
        <div className="field">
          <label className="field-label" htmlFor="selector-level">
            等级范围
          </label>
          <input
            id="selector-level"
            className="input"
            placeholder="例如 1..100"
            value={draft.level ?? ''}
            onChange={(event) => patch({ level: event.target.value })}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="selector-gamemode">
            游戏模式
          </label>
          <select
            id="selector-gamemode"
            className="select"
            value={draft.gamemode ?? ''}
            onChange={(event) =>
              patch({ gamemode: (event.target.value || undefined) as Selector['gamemode'] })
            }
          >
            <option value="">不限制</option>
            <option value="survival">生存</option>
            <option value="creative">创造</option>
            <option value="adventure">冒险</option>
            <option value="spectator">旁观</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="selector-limit">
            数量上限
          </label>
          <input
            id="selector-limit"
            className="input"
            type="number"
            min={1}
            placeholder="不限"
            value={draft.limit ?? ''}
            onChange={(event) =>
              patch({ limit: event.target.value ? Number(event.target.value) : null })
            }
          />
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 14 }}>
        <div className="field">
          <label className="field-label" htmlFor="selector-sort">
            排序
          </label>
          <select
            id="selector-sort"
            className="select"
            value={draft.sort ?? ''}
            onChange={(event) => patch({ sort: (event.target.value || undefined) as Selector['sort'] })}
          >
            <option value="">默认</option>
            <option value="nearest">最近</option>
            <option value="furthest">最远</option>
            <option value="random">随机</option>
            <option value="arbitrary">任意</option>
          </select>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: 14 }}>
        {(['x', 'y', 'z'] as const).map((axis) => (
          <div className="field" key={axis}>
            <label className="field-label" htmlFor={`selector-${axis}`}>
              {axis.toUpperCase()} 坐标
            </label>
            <input
              id={`selector-${axis}`}
              className="input"
              placeholder="例如 ~1"
              value={draft[axis] ?? ''}
              onChange={(event) => patch({ [axis]: event.target.value } as Partial<Selector>)}
            />
          </div>
        ))}
      </div>
      <div className="grid-3" style={{ marginTop: 14 }}>
        {(['dx', 'dy', 'dz'] as const).map((axis) => (
          <div className="field" key={axis}>
            <label className="field-label" htmlFor={`selector-${axis}`}>
              {axis.toUpperCase()} 范围
            </label>
            <input
              id={`selector-${axis}`}
              className="input"
              placeholder="例如 10"
              value={draft[axis] ?? ''}
              onChange={(event) => patch({ [axis]: event.target.value } as Partial<Selector>)}
            />
          </div>
        ))}
      </div>

      <div className="field" style={{ marginTop: 14 }}>
        <label className="field-label" htmlFor="selector-nbt">
          NBT（可选）
        </label>
        <textarea
          id="selector-nbt"
          className="textarea"
          placeholder='例如 {NoAI:1b}'
          value={draft.nbt ?? ''}
          onChange={(event) => patch({ nbt: event.target.value })}
        />
      </div>

      {preview.diagnostics.length > 0 ? (
        <div className="diagnostics" style={{ marginTop: 12 }}>
          {preview.diagnostics.map((diagnostic, index) => (
            <div key={index} className={`diag ${diagnostic.severity}`}>
              {diagnostic.message}
            </div>
          ))}
        </div>
      ) : null}
    </Modal>
  )
}
