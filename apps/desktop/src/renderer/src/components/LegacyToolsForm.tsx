import { useMemo, useState } from 'react'
import { Copy, Wrench } from 'lucide-react'
import {
  LEGACY_BLOCK_PRESETS,
  LEGACY_ENTITY_PRESETS,
  LEGACY_ITEM_PRESETS,
  LEGACY_SLOTS,
  buildBlockdata,
  buildEntitydata,
  buildReplaceitem,
  buildTestfor,
  createDefaultBlockdata,
  createDefaultEntitydata,
  createDefaultReplaceitem,
  createDefaultTestfor
} from '@mcstudio/core'
import { useAppStore } from '../store'
import { CustomPresetBar } from './CustomPresetBar'

type LegacyTab = 'testfor' | 'blockdata' | 'entitydata' | 'replaceitem'

const TABS: { id: LegacyTab; label: string }[] = [
  { id: 'testfor', label: 'testfor' },
  { id: 'blockdata', label: 'blockdata' },
  { id: 'entitydata', label: 'entitydata' },
  { id: 'replaceitem', label: 'replaceitem' }
]

export function LegacyToolsForm() {
  const state = useAppStore()
  const [tab, setTab] = useState<LegacyTab>('testfor')
  const [testfor, setTestfor] = useState(createDefaultTestfor)
  const [blockdata, setBlockdata] = useState(createDefaultBlockdata)
  const [entitydata, setEntitydata] = useState(createDefaultEntitydata)
  const [replaceitem, setReplaceitem] = useState(createDefaultReplaceitem)
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => {
    if (tab === 'testfor') return buildTestfor(testfor)
    if (tab === 'blockdata') return buildBlockdata(blockdata)
    if (tab === 'entitydata') return buildEntitydata(entitydata)
    return buildReplaceitem(replaceitem)
  }, [tab, testfor, blockdata, entitydata, replaceitem])

  const copy = async () => {
    if (!result.text) return
    await navigator.clipboard.writeText(result.text)
    setCopied(true)
    state.showToast('旧版命令已复制', 'success')
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 工具 / 1.12.2 旧版工具</div>
          <div className="hero">
            <div className="hero-icon">
              <Wrench size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                1.12.2 旧版工具
                <span className="hero-id">legacy</span>
              </h1>
              <p className="hero-sub">
                testfor / blockdata / entitydata / replaceitem 的 1.12 语法可视化编辑。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="world-tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`world-tab${tab === item.id ? ' active' : ''}`}
            onClick={() => {
              setTab(item.id)
              setCopied(false)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">{tab}</div>
          <button type="button" className="btn btn-sm" onClick={() => void copy()}>
            <Copy size={13} />
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <div className="card-body">
          {tab === 'testfor' ? (
            <>
              <div className="field">
                <label className="field-label" htmlFor="legacy-testfor-target">
                  目标选择器
                </label>
                <input
                  id="legacy-testfor-target"
                  className="input"
                  value={testfor.target}
                  onChange={(event) => setTestfor({ ...testfor, target: event.target.value })}
                />
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="legacy-testfor-nbt">
                  NBT（可选）
                </label>
                <textarea
                  id="legacy-testfor-nbt"
                  className="textarea"
                  rows={4}
                  placeholder="{Health:10f}"
                  value={testfor.nbt}
                  onChange={(event) => setTestfor({ ...testfor, nbt: event.target.value })}
                />
              </div>
            </>
          ) : null}

          {tab === 'blockdata' ? (
            <>
              <div className="grid-3">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <div className="field" key={axis}>
                    <label className="field-label" htmlFor={`legacy-blockdata-${axis}`}>
                      {axis.toUpperCase()}
                    </label>
                    <input
                      id={`legacy-blockdata-${axis}`}
                      className="input"
                      value={blockdata[axis]}
                      onChange={(event) =>
                        setBlockdata({ ...blockdata, [axis]: event.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="legacy-blockdata-nbt">
                  NBT
                </label>
                <CustomPresetBar
                  storageKey="legacy:block"
                  value={blockdata.nbt}
                  label="方块 NBT"
                  onApply={(nbt) => setBlockdata({ ...blockdata, nbt })}
                />
                <select
                  id="legacy-blockdata-preset"
                  className="select"
                  defaultValue=""
                  style={{ marginBottom: 8 }}
                  onChange={(event) => {
                    const preset = LEGACY_BLOCK_PRESETS[Number(event.target.value)]
                    if (preset) setBlockdata({ ...blockdata, nbt: preset.nbt })
                    event.target.value = ''
                  }}
                >
                  <option value="">选择方块 NBT 预设…</option>
                  {LEGACY_BLOCK_PRESETS.map((preset, index) => (
                    <option key={preset.label} value={index}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <textarea
                  id="legacy-blockdata-nbt"
                  className="textarea"
                  rows={4}
                  placeholder="{Lock:'key'}"
                  value={blockdata.nbt}
                  onChange={(event) => setBlockdata({ ...blockdata, nbt: event.target.value })}
                />
              </div>
            </>
          ) : null}

          {tab === 'entitydata' ? (
            <>
              <div className="field">
                <label className="field-label" htmlFor="legacy-entitydata-target">
                  目标选择器
                </label>
                <input
                  id="legacy-entitydata-target"
                  className="input"
                  value={entitydata.target}
                  onChange={(event) => setEntitydata({ ...entitydata, target: event.target.value })}
                />
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="legacy-entitydata-nbt">
                  NBT
                </label>
                <CustomPresetBar
                  storageKey="legacy:entity"
                  value={entitydata.nbt}
                  label="实体 NBT"
                  onApply={(nbt) => setEntitydata({ ...entitydata, nbt })}
                />
                <select
                  id="legacy-entitydata-preset"
                  className="select"
                  defaultValue=""
                  style={{ marginBottom: 8 }}
                  onChange={(event) => {
                    const preset = LEGACY_ENTITY_PRESETS[Number(event.target.value)]
                    if (preset) setEntitydata({ ...entitydata, nbt: preset.nbt })
                    event.target.value = ''
                  }}
                >
                  <option value="">选择实体 NBT 预设…</option>
                  {LEGACY_ENTITY_PRESETS.map((preset, index) => (
                    <option key={preset.label} value={index}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <textarea
                  id="legacy-entitydata-nbt"
                  className="textarea"
                  rows={4}
                  placeholder="{NoGravity:1b}"
                  value={entitydata.nbt}
                  onChange={(event) => setEntitydata({ ...entitydata, nbt: event.target.value })}
                />
              </div>
            </>
          ) : null}

          {tab === 'replaceitem' ? (
            <>
              <div className="field">
                <label className="field-label" htmlFor="legacy-replaceitem-target-type">
                  目标类型
                </label>
                <select
                  id="legacy-replaceitem-target-type"
                  className="select"
                  value={replaceitem.target}
                  onChange={(event) =>
                    setReplaceitem({
                      ...replaceitem,
                      target: event.target.value as 'block' | 'entity'
                    })
                  }
                >
                  <option value="entity">实体</option>
                  <option value="block">方块容器</option>
                </select>
              </div>
              {replaceitem.target === 'block' ? (
                <div className="grid-3" style={{ marginTop: 12 }}>
                  {(['x', 'y', 'z'] as const).map((axis) => (
                    <div className="field" key={axis}>
                      <label className="field-label" htmlFor={`legacy-replaceitem-${axis}`}>
                        {axis.toUpperCase()}
                      </label>
                      <input
                        id={`legacy-replaceitem-${axis}`}
                        className="input"
                        value={replaceitem[axis]}
                        onChange={(event) =>
                          setReplaceitem({ ...replaceitem, [axis]: event.target.value })
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="legacy-replaceitem-selector">
                    目标选择器
                  </label>
                  <input
                    id="legacy-replaceitem-selector"
                    className="input"
                    value={replaceitem.selector}
                    onChange={(event) =>
                      setReplaceitem({ ...replaceitem, selector: event.target.value })
                    }
                  />
                </div>
              )}
              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-replaceitem-slot">
                    槽位
                  </label>
                  <select
                    id="legacy-replaceitem-slot"
                    className="select"
                    value={replaceitem.slot}
                    onChange={(event) =>
                      setReplaceitem({ ...replaceitem, slot: event.target.value })
                    }
                  >
                    {LEGACY_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-replaceitem-item">
                    物品 ID
                  </label>
                  <input
                    id="legacy-replaceitem-item"
                    className="input"
                    value={replaceitem.item}
                    onChange={(event) =>
                      setReplaceitem({ ...replaceitem, item: event.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-replaceitem-count">
                    数量
                  </label>
                  <input
                    id="legacy-replaceitem-count"
                    className="input"
                    value={replaceitem.count}
                    onChange={(event) =>
                      setReplaceitem({ ...replaceitem, count: event.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-replaceitem-data">
                    数据值
                  </label>
                  <input
                    id="legacy-replaceitem-data"
                    className="input"
                    value={replaceitem.data}
                    onChange={(event) =>
                      setReplaceitem({ ...replaceitem, data: event.target.value })
                    }
                  />
                </div>
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="legacy-replaceitem-nbt">
                  NBT（可选）
                </label>
                <CustomPresetBar
                  storageKey="legacy:item"
                  value={replaceitem.nbt}
                  label="物品 NBT"
                  onApply={(nbt) => setReplaceitem({ ...replaceitem, nbt })}
                />
                <select
                  id="legacy-replaceitem-preset"
                  className="select"
                  defaultValue=""
                  style={{ marginBottom: 8 }}
                  onChange={(event) => {
                    const preset = LEGACY_ITEM_PRESETS[Number(event.target.value)]
                    if (preset) setReplaceitem({ ...replaceitem, nbt: preset.nbt })
                    event.target.value = ''
                  }}
                >
                  <option value="">选择物品 NBT 预设…</option>
                  {LEGACY_ITEM_PRESETS.map((preset, index) => (
                    <option key={preset.label} value={index}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <textarea
                  id="legacy-replaceitem-nbt"
                  className="textarea"
                  rows={3}
                  value={replaceitem.nbt}
                  onChange={(event) => setReplaceitem({ ...replaceitem, nbt: event.target.value })}
                />
              </div>
            </>
          ) : null}

          {result.diagnostics.length > 0 ? (
            <div className="diagnostics" style={{ marginTop: 12 }}>
              {result.diagnostics.map((item, index) => (
                <div key={`${item.code}-${index}`} className={`diagnostic ${item.severity}`}>
                  {item.message}
                </div>
              ))}
            </div>
          ) : null}

          {result.text ? (
            <pre
              id="legacy-output"
              className="output-code"
              style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}
            >
              {result.text}
            </pre>
          ) : null}
        </div>
      </div>
    </div>
  )
}
