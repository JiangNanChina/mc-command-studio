import { useMemo, useState } from 'react'
import { Copy, Wrench } from 'lucide-react'
import {
  LEGACY_BLOCK_PRESETS,
  LEGACY_ENTITY_PRESETS,
  LEGACY_ITEM_PRESETS,
  LEGACY_SLOTS,
  buildBlockdata,
  buildEntitydata,
  buildLegacyGive,
  buildReplaceitem,
  buildTestfor,
  buildTestforblock,
  buildTestforblocks,
  buildAchievement,
  buildTrigger,
  buildSetidletimeout,
  buildSave,
  createDefaultBlockdata,
  createDefaultEntitydata,
  createDefaultGive,
  createDefaultReplaceitem,
  createDefaultTestfor,
  createDefaultTestforblock,
  createDefaultTestforblocks,
  createDefaultAchievement,
  createDefaultTrigger,
  createDefaultIdle,
  createDefaultSave
} from '@mcstudio/core'
import { useAppStore } from '../store'
import { CustomPresetBar } from './CustomPresetBar'

type LegacyTab = 'testfor' | 'blockdata' | 'entitydata' | 'replaceitem' | 'give' | 'testforblock' | 'testforblocks' | 'achievement' | 'trigger' | 'setidletimeout' | 'save'

const TABS: { id: LegacyTab; label: string }[] = [
  { id: 'testfor', label: 'testfor' },
  { id: 'blockdata', label: 'blockdata' },
  { id: 'entitydata', label: 'entitydata' },
  { id: 'replaceitem', label: 'replaceitem' },
  { id: 'give', label: 'give' },
  { id: 'testforblock', label: 'testforblock' },
  { id: 'testforblocks', label: 'testforblocks' },
  { id: 'achievement', label: 'achievement' },
  { id: 'trigger', label: 'trigger' },
  { id: 'setidletimeout', label: 'setidletimeout' },
  { id: 'save', label: 'save' }
]

export function LegacyToolsForm() {
  const state = useAppStore()
  const [tab, setTab] = useState<LegacyTab>('testfor')
  const [testfor, setTestfor] = useState(createDefaultTestfor)
  const [blockdata, setBlockdata] = useState(createDefaultBlockdata)
  const [entitydata, setEntitydata] = useState(createDefaultEntitydata)
  const [replaceitem, setReplaceitem] = useState(createDefaultReplaceitem)
  const [give, setGive] = useState(createDefaultGive)
  const [testforblock, setTestforblock] = useState(createDefaultTestforblock)
  const [testforblocks, setTestforblocks] = useState(createDefaultTestforblocks)
  const [achievement, setAchievement] = useState(createDefaultAchievement)
  const [trigger, setTrigger] = useState(createDefaultTrigger)
  const [idle, setIdle] = useState(createDefaultIdle)
  const [save, setSave] = useState(createDefaultSave)
  const pack = useAppStore((state) => state.pack)
  const itemOptions = pack?.registries.item ?? []
  const blockOptions = pack?.registries.block ?? []
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => {
    if (tab === 'testfor') return buildTestfor(testfor)
    if (tab === 'blockdata') return buildBlockdata(blockdata)
    if (tab === 'entitydata') return buildEntitydata(entitydata)
    if (tab === 'give') return buildLegacyGive(give)
    if (tab === 'testforblock') return buildTestforblock(testforblock)
    if (tab === 'testforblocks') return buildTestforblocks(testforblocks)
    if (tab === 'achievement') return buildAchievement(achievement)
    if (tab === 'trigger') return buildTrigger(trigger)
    if (tab === 'setidletimeout') return buildSetidletimeout(idle)
    if (tab === 'save') return buildSave(save)
    return buildReplaceitem(replaceitem)
  }, [tab, testfor, blockdata, entitydata, replaceitem, give, testforblock, testforblocks, achievement, trigger, idle, save])

  const copy = async () => {
    if (!result.text) return
    await navigator.clipboard.writeText(result.text)
    setCopied(true)
    state.showToast('旧版命令已复制', 'success')
  }

  return (
    <div className="content">
      <datalist id="legacy-item-options">
        {itemOptions.map((id) => (
          <option key={id} value={`minecraft:${id}`} />
        ))}
      </datalist>
      <datalist id="legacy-block-options">
        {blockOptions.map((id) => (
          <option key={id} value={`minecraft:${id}`} />
        ))}
      </datalist>
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 工具 / 1.12.2 旧版工具</div>
          <div className="hero">
            <div className="hero-icon">
              <Wrench size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                旧版工具
                <span className="hero-id">legacy</span>
              </h1>
              <p className="hero-sub">
                testfor / blockdata / entitydata / replaceitem / give / testforblock / testforblocks / achievement 的 1.8–1.12 语法可视化编辑。
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

          {tab === 'give' ? (
            <>
              <div className="grid-2">
                <div className="field">
                  <label className="field-label" htmlFor="legacy-give-target">
                    目标
                  </label>
                  <input
                    id="legacy-give-target"
                    className="input"
                    value={give.target}
                    onChange={(event) => setGive({ ...give, target: event.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-give-item">
                    物品
                  </label>
                  <input
                    id="legacy-give-item"
                    className="input"
                    list="legacy-item-options"
                    value={give.item}
                    onChange={(event) => setGive({ ...give, item: event.target.value })}
                  />
                </div>
              </div>
              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-give-count">
                    数量
                  </label>
                  <input
                    id="legacy-give-count"
                    className="input"
                    value={give.count}
                    onChange={(event) => setGive({ ...give, count: event.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-give-data">
                    数据值
                  </label>
                  <input
                    id="legacy-give-data"
                    className="input"
                    value={give.data}
                    onChange={(event) => setGive({ ...give, data: event.target.value })}
                  />
                </div>
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="legacy-give-nbt">
                  NBT（可选）
                </label>
                <CustomPresetBar
                  storageKey="legacy:give"
                  value={give.nbt}
                  label="give NBT"
                  onApply={(nbt) => setGive({ ...give, nbt })}
                />
                <textarea
                  id="legacy-give-nbt"
                  className="textarea"
                  rows={3}
                  value={give.nbt}
                  onChange={(event) => setGive({ ...give, nbt: event.target.value })}
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
                    list="legacy-item-options"
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

          {tab === 'testforblock' ? (
            <>
              <div className="grid-3">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <div className="field" key={axis}>
                    <label className="field-label" htmlFor={`legacy-tfb-${axis}`}>{axis.toUpperCase()}</label>
                    <input id={`legacy-tfb-${axis}`} className="input" value={testforblock[axis]}
                      onChange={(event) => setTestforblock({ ...testforblock, [axis]: event.target.value })} />
                  </div>
                ))}
              </div>
              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-tfb-block">方块</label>
                  <input id="legacy-tfb-block" className="input" list="legacy-block-options" value={testforblock.block}
                    onChange={(event) => setTestforblock({ ...testforblock, block: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-tfb-data">数据值（可选）</label>
                  <input id="legacy-tfb-data" className="input" value={testforblock.data}
                    onChange={(event) => setTestforblock({ ...testforblock, data: event.target.value })} />
                </div>
              </div>
            </>
          ) : null}

          {tab === 'testforblocks' ? (
            <>
              {([
                ['起点', ['fromX', 'fromY', 'fromZ']],
                ['终点', ['toX', 'toY', 'toZ']],
                ['目标', ['destX', 'destY', 'destZ']]
              ] as const).map(([label, keys]) => (
                <div key={label} style={{ marginTop: 8 }}>
                  <div className="hint">{label}</div>
                  <div className="grid-3">
                    {keys.map((key) => (
                      <input key={key} className="input" value={testforblocks[key]}
                        onChange={(event) => setTestforblocks({ ...testforblocks, [key]: event.target.value })} />
                    ))}
                  </div>
                </div>
              ))}
              <div className="field" style={{ marginTop: 8 }}>
                <label className="field-label" htmlFor="legacy-tfbs-mode">模式</label>
                <select id="legacy-tfbs-mode" className="select" value={testforblocks.mode}
                  onChange={(event) => setTestforblocks({ ...testforblocks, mode: event.target.value as 'all' | 'masked' })}>
                  <option value="all">all</option>
                  <option value="masked">masked</option>
                </select>
              </div>
            </>
          ) : null}

          {tab === 'achievement' ? (
            <>
              <div className="grid-2">
                <div className="field">
                  <label className="field-label" htmlFor="legacy-ach-action">动作</label>
                  <select id="legacy-ach-action" className="select" value={achievement.action}
                    onChange={(event) => setAchievement({ ...achievement, action: event.target.value as 'give' | 'take' })}>
                    <option value="give">give</option>
                    <option value="take">take</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-ach-target">目标</label>
                  <input id="legacy-ach-target" className="input" value={achievement.target}
                    onChange={(event) => setAchievement({ ...achievement, target: event.target.value })} />
                </div>
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="legacy-ach-id">成就 ID</label>
                <input id="legacy-ach-id" className="input" value={achievement.achievement}
                  onChange={(event) => setAchievement({ ...achievement, achievement: event.target.value })} />
              </div>
            </>
          ) : null}

          {tab === 'trigger' ? (
            <div className="grid-3">
              <div className="field">
                <label className="field-label" htmlFor="legacy-trigger-objective">目标</label>
                <input id="legacy-trigger-objective" className="input" value={trigger.objective}
                  onChange={(event) => setTrigger({ ...trigger, objective: event.target.value })} />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="legacy-trigger-action">动作</label>
                <select id="legacy-trigger-action" className="select" value={trigger.action}
                  onChange={(event) => setTrigger({ ...trigger, action: event.target.value as 'add' | 'set' })}>
                  <option value="add">add</option>
                  <option value="set">set</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="legacy-trigger-value">数值</label>
                <input id="legacy-trigger-value" className="input" value={trigger.value}
                  onChange={(event) => setTrigger({ ...trigger, value: event.target.value })} />
              </div>
            </div>
          ) : null}

          {tab === 'setidletimeout' ? (
            <div className="field">
              <label className="field-label" htmlFor="legacy-idle-minutes">挂机超时（分钟）</label>
              <input id="legacy-idle-minutes" className="input" value={idle.minutes}
                onChange={(event) => setIdle({ minutes: event.target.value })} />
            </div>
          ) : null}

          {tab === 'save' ? (
            <div className="field">
              <label className="field-label" htmlFor="legacy-save-action">动作</label>
              <select id="legacy-save-action" className="select" value={save.action}
                onChange={(event) => setSave({ action: event.target.value as 'hold' | 'query' })}>
                <option value="hold">hold</option>
                <option value="query">query</option>
              </select>
            </div>
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
