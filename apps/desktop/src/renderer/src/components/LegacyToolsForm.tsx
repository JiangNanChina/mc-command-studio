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
  buildStats,
  buildScoreboard,
  buildLegacyExecute,
  buildAdvancement,
  buildClear,
  buildWorldborder,
  buildSpreadplayers,
  buildTitle,
  buildParticle,
  buildSummon,
  buildGamerule,
  buildXp,
  buildTellraw,
  buildEffect,
  buildEnchant,
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
  createDefaultSave,
  createDefaultStats,
  createDefaultScoreboard,
  createDefaultLegacyExecute,
  createDefaultAdvancement,
  createDefaultClear,
  createDefaultWorldborder,
  createDefaultSpreadplayers,
  createDefaultTitle,
  createDefaultParticle,
  createDefaultSummon,
  createDefaultGamerule,
  createDefaultXp,
  createDefaultTellraw,
  createDefaultEffect,
  createDefaultEnchant
} from '@mcstudio/core'
import { useAppStore } from '../store'
import { CustomPresetBar } from './CustomPresetBar'

type LegacyTab = 'testfor' | 'blockdata' | 'entitydata' | 'replaceitem' | 'give' | 'testforblock' | 'testforblocks' | 'achievement' | 'trigger' | 'setidletimeout' | 'save' | 'stats' | 'scoreboard' | 'execute' | 'advancement' | 'clear' | 'worldborder' | 'spreadplayers' | 'title' | 'particle' | 'summon' | 'gamerule' | 'xp' | 'tellraw' | 'effect' | 'enchant'

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
  { id: 'save', label: 'save' },
  { id: 'stats', label: 'stats' },
  { id: 'scoreboard', label: 'scoreboard' },
  { id: 'execute', label: 'execute' },
  { id: 'advancement', label: 'advancement' },
  { id: 'clear', label: 'clear' },
  { id: 'worldborder', label: 'worldborder' },
  { id: 'spreadplayers', label: 'spreadplayers' },
  { id: 'title', label: 'title' },
  { id: 'particle', label: 'particle' },
  { id: 'summon', label: 'summon' },
  { id: 'gamerule', label: 'gamerule' },
  { id: 'xp', label: 'xp' },
  { id: 'tellraw', label: 'tellraw' },
  { id: 'effect', label: 'effect' },
  { id: 'enchant', label: 'enchant' }
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
  const [stats, setStats] = useState(createDefaultStats)
  const [scoreboard, setScoreboard] = useState(createDefaultScoreboard)
  const [execute, setExecute] = useState(createDefaultLegacyExecute)
  const [advancement, setAdvancement] = useState(createDefaultAdvancement)
  const [clear, setClear] = useState(createDefaultClear)
  const [worldborder, setWorldborder] = useState(createDefaultWorldborder)
  const [spreadplayers, setSpreadplayers] = useState(createDefaultSpreadplayers)
  const [title, setTitle] = useState(createDefaultTitle)
  const [particle, setParticle] = useState(createDefaultParticle)
  const [summon, setSummon] = useState(createDefaultSummon)
  const [gamerule, setGamerule] = useState(createDefaultGamerule)
  const [xp, setXp] = useState(createDefaultXp)
  const [tellraw, setTellraw] = useState(createDefaultTellraw)
  const [effect, setEffect] = useState(createDefaultEffect)
  const [enchant, setEnchant] = useState(createDefaultEnchant)
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
    if (tab === 'stats') return buildStats(stats)
    if (tab === 'scoreboard') return buildScoreboard(scoreboard)
    if (tab === 'execute') return buildLegacyExecute(execute)
    if (tab === 'advancement') return buildAdvancement(advancement)
    if (tab === 'clear') return buildClear(clear)
    if (tab === 'worldborder') return buildWorldborder(worldborder)
    if (tab === 'spreadplayers') return buildSpreadplayers(spreadplayers)
    if (tab === 'title') return buildTitle(title)
    if (tab === 'particle') return buildParticle(particle)
    if (tab === 'summon') return buildSummon(summon)
    if (tab === 'gamerule') return buildGamerule(gamerule)
    if (tab === 'xp') return buildXp(xp)
    if (tab === 'tellraw') return buildTellraw(tellraw)
    if (tab === 'effect') return buildEffect(effect)
    if (tab === 'enchant') return buildEnchant(enchant)
    return buildReplaceitem(replaceitem)
  }, [tab, testfor, blockdata, entitydata, replaceitem, give, testforblock, testforblocks, achievement, trigger, idle, save, stats, scoreboard, execute, advancement, clear, worldborder, spreadplayers, title, particle, summon, gamerule, xp, tellraw, effect, enchant])

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

          {tab === 'stats' ? (
            <>
              <div className="grid-3">
                <div className="field">
                  <label className="field-label" htmlFor="legacy-stats-type">目标类型</label>
                  <select id="legacy-stats-type" className="select" value={stats.targetType}
                    onChange={(event) => setStats({ ...stats, targetType: event.target.value as 'entity' | 'block' })}>
                    <option value="entity">entity</option>
                    <option value="block">block</option>
                  </select>
                </div>
                {stats.targetType === 'entity' ? (
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-stats-target">目标</label>
                    <input id="legacy-stats-target" className="input" value={stats.target}
                      onChange={(event) => setStats({ ...stats, target: event.target.value })} />
                  </div>
                ) : (
                  <>
                    {(['x', 'y', 'z'] as const).map((axis) => (
                      <div className="field" key={axis}>
                        <label className="field-label" htmlFor={`legacy-stats-${axis}`}>{axis.toUpperCase()}</label>
                        <input id={`legacy-stats-${axis}`} className="input" value={stats[axis]}
                          onChange={(event) => setStats({ ...stats, [axis]: event.target.value })} />
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div className="grid-3" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-stats-action">动作</label>
                  <select id="legacy-stats-action" className="select" value={stats.action}
                    onChange={(event) => setStats({ ...stats, action: event.target.value as 'set' | 'clear' })}>
                    <option value="set">set</option>
                    <option value="clear">clear</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-stats-stat">统计项</label>
                  <input id="legacy-stats-stat" className="input" value={stats.stat}
                    onChange={(event) => setStats({ ...stats, stat: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-stats-objective">目标（set）</label>
                  <input id="legacy-stats-objective" className="input" value={stats.objective}
                    onChange={(event) => setStats({ ...stats, objective: event.target.value })} />
                </div>
              </div>
            </>
          ) : null}

          {tab === 'scoreboard' ? (
            <>
              <div className="field">
                <label className="field-label" htmlFor="legacy-score-action">操作</label>
                <select id="legacy-score-action" className="select" value={scoreboard.action}
                  onChange={(event) => setScoreboard({ ...scoreboard, action: event.target.value as typeof scoreboard.action })}>
                  <option value="objectives-add">objectives add</option>
                  <option value="objectives-remove">objectives remove</option>
                  <option value="objectives-list">objectives list</option>
                  <option value="players-set">players set</option>
                  <option value="players-add">players add</option>
                  <option value="players-remove">players remove</option>
                </select>
              </div>
              {scoreboard.action.startsWith('objectives') ? (
                <div className="grid-3" style={{ marginTop: 12 }}>
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-score-name">目标名</label>
                    <input id="legacy-score-name" className="input" value={scoreboard.name}
                      onChange={(event) => setScoreboard({ ...scoreboard, name: event.target.value })} />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-score-criterion">准则</label>
                    <input id="legacy-score-criterion" className="input" value={scoreboard.criterion}
                      onChange={(event) => setScoreboard({ ...scoreboard, criterion: event.target.value })} />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-score-display">显示名</label>
                    <input id="legacy-score-display" className="input" value={scoreboard.display}
                      onChange={(event) => setScoreboard({ ...scoreboard, display: event.target.value })} />
                  </div>
                </div>
              ) : (
                <div className="grid-3" style={{ marginTop: 12 }}>
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-score-target">目标</label>
                    <input id="legacy-score-target" className="input" value={scoreboard.target}
                      onChange={(event) => setScoreboard({ ...scoreboard, target: event.target.value })} />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-score-objective">目标名</label>
                    <input id="legacy-score-objective" className="input" value={scoreboard.objective}
                      onChange={(event) => setScoreboard({ ...scoreboard, objective: event.target.value })} />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-score-value">分数</label>
                    <input id="legacy-score-value" className="input" value={scoreboard.value}
                      onChange={(event) => setScoreboard({ ...scoreboard, value: event.target.value })} />
                  </div>
                </div>
              )}
            </>
          ) : null}

          {tab === 'execute' ? (
            <>
              <div className="grid-2">
                <div className="field">
                  <label className="field-label" htmlFor="legacy-exec-target">目标</label>
                  <input id="legacy-exec-target" className="input" value={execute.target}
                    onChange={(event) => setExecute({ ...execute, target: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-exec-command">命令</label>
                  <input id="legacy-exec-command" className="input" value={execute.command}
                    onChange={(event) => setExecute({ ...execute, command: event.target.value })} />
                </div>
              </div>
              <div className="grid-3" style={{ marginTop: 12 }}>
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <div className="field" key={axis}>
                    <label className="field-label" htmlFor={`legacy-exec-${axis}`}>{axis.toUpperCase()}</label>
                    <input id={`legacy-exec-${axis}`} className="input" value={execute[axis]}
                      onChange={(event) => setExecute({ ...execute, [axis]: event.target.value })} />
                  </div>
                ))}
              </div>
              <label className="checkbox-row" style={{ marginTop: 12 }}>
                <input type="checkbox" checked={execute.detect}
                  onChange={(event) => setExecute({ ...execute, detect: event.target.checked })} />
                检测方块
              </label>
              {execute.detect ? (
                <div className="grid-2" style={{ marginTop: 8 }}>
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-exec-block">方块</label>
                    <input id="legacy-exec-block" className="input" list="legacy-block-options" value={execute.block}
                      onChange={(event) => setExecute({ ...execute, block: event.target.value })} />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-exec-data">数据值</label>
                    <input id="legacy-exec-data" className="input" value={execute.data}
                      onChange={(event) => setExecute({ ...execute, data: event.target.value })} />
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {tab === 'advancement' ? (
            <>
              <div className="grid-3">
                <div className="field">
                  <label className="field-label" htmlFor="legacy-adv-action">动作</label>
                  <select id="legacy-adv-action" className="select" value={advancement.action}
                    onChange={(event) => setAdvancement({ ...advancement, action: event.target.value as typeof advancement.action })}>
                    <option value="grant">grant</option>
                    <option value="revoke">revoke</option>
                    <option value="test">test</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-adv-target">目标</label>
                  <input id="legacy-adv-target" className="input" value={advancement.target}
                    onChange={(event) => setAdvancement({ ...advancement, target: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-adv-mode">范围</label>
                  <select id="legacy-adv-mode" className="select" value={advancement.mode}
                    onChange={(event) => setAdvancement({ ...advancement, mode: event.target.value as typeof advancement.mode })}>
                    <option value="only">only</option>
                    <option value="until">until</option>
                    <option value="from">from</option>
                    <option value="through">through</option>
                  </select>
                </div>
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="legacy-adv-id">进度 ID</label>
                <input id="legacy-adv-id" className="input" value={advancement.advancement}
                  onChange={(event) => setAdvancement({ ...advancement, advancement: event.target.value })} />
              </div>
            </>
          ) : null}

          {tab === 'clear' ? (
            <>
              <div className="grid-3">
                <div className="field">
                  <label className="field-label" htmlFor="legacy-clear-target">目标</label>
                  <input id="legacy-clear-target" className="input" value={clear.target}
                    onChange={(event) => setClear({ ...clear, target: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-clear-item">物品</label>
                  <input id="legacy-clear-item" className="input" list="legacy-item-options" value={clear.item}
                    onChange={(event) => setClear({ ...clear, item: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-clear-data">数据值</label>
                  <input id="legacy-clear-data" className="input" value={clear.data}
                    onChange={(event) => setClear({ ...clear, data: event.target.value })} />
                </div>
              </div>
              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-clear-max">最大数量</label>
                  <input id="legacy-clear-max" className="input" value={clear.maxCount}
                    onChange={(event) => setClear({ ...clear, maxCount: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-clear-nbt">NBT（可选）</label>
                  <input id="legacy-clear-nbt" className="input" value={clear.nbt}
                    onChange={(event) => setClear({ ...clear, nbt: event.target.value })} />
                </div>
              </div>
            </>
          ) : null}

          {tab === 'worldborder' ? (
            <>
              <div className="field">
                <label className="field-label" htmlFor="legacy-wb-action">动作</label>
                <select id="legacy-wb-action" className="select" value={worldborder.action}
                  onChange={(event) => setWorldborder({ ...worldborder, action: event.target.value as typeof worldborder.action })}>
                  <option value="set">set</option>
                  <option value="center">center</option>
                  <option value="damage">damage</option>
                  <option value="warning">warning</option>
                  <option value="get">get</option>
                  <option value="add">add</option>
                </select>
              </div>
              <div className="grid-3" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-wb-value">直径/值</label>
                  <input id="legacy-wb-value" className="input" value={worldborder.value}
                    onChange={(event) => setWorldborder({ ...worldborder, value: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-wb-x">中心 X</label>
                  <input id="legacy-wb-x" className="input" value={worldborder.x}
                    onChange={(event) => setWorldborder({ ...worldborder, x: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-wb-z">中心 Z</label>
                  <input id="legacy-wb-z" className="input" value={worldborder.z}
                    onChange={(event) => setWorldborder({ ...worldborder, z: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-wb-seconds">秒数</label>
                  <input id="legacy-wb-seconds" className="input" value={worldborder.seconds}
                    onChange={(event) => setWorldborder({ ...worldborder, seconds: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-wb-amount">伤害/距离</label>
                  <input id="legacy-wb-amount" className="input" value={worldborder.amount}
                    onChange={(event) => setWorldborder({ ...worldborder, amount: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-wb-buffer">缓冲</label>
                  <input id="legacy-wb-buffer" className="input" value={worldborder.buffer}
                    onChange={(event) => setWorldborder({ ...worldborder, buffer: event.target.value })} />
                </div>
              </div>
            </>
          ) : null}

          {tab === 'spreadplayers' ? (
            <>
              <div className="grid-2">
                <div className="field">
                  <label className="field-label" htmlFor="legacy-spread-x">中心 X</label>
                  <input id="legacy-spread-x" className="input" value={spreadplayers.x}
                    onChange={(event) => setSpreadplayers({ ...spreadplayers, x: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-spread-z">中心 Z</label>
                  <input id="legacy-spread-z" className="input" value={spreadplayers.z}
                    onChange={(event) => setSpreadplayers({ ...spreadplayers, z: event.target.value })} />
                </div>
              </div>
              <div className="grid-3" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-spread-min">最小距离</label>
                  <input id="legacy-spread-min" className="input" value={spreadplayers.min}
                    onChange={(event) => setSpreadplayers({ ...spreadplayers, min: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-spread-max">最大范围</label>
                  <input id="legacy-spread-max" className="input" value={spreadplayers.max}
                    onChange={(event) => setSpreadplayers({ ...spreadplayers, max: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-spread-targets">目标</label>
                  <input id="legacy-spread-targets" className="input" value={spreadplayers.targets}
                    onChange={(event) => setSpreadplayers({ ...spreadplayers, targets: event.target.value })} />
                </div>
              </div>
              <label className="checkbox-row" style={{ marginTop: 12 }}>
                <input type="checkbox" checked={spreadplayers.respectTeams}
                  onChange={(event) => setSpreadplayers({ ...spreadplayers, respectTeams: event.target.checked })} />
                按队伍分散
              </label>
            </>
          ) : null}

          {tab === 'title' ? (
            <>
              <div className="grid-2">
                <div className="field">
                  <label className="field-label" htmlFor="legacy-title-target">目标</label>
                  <input id="legacy-title-target" className="input" value={title.target}
                    onChange={(event) => setTitle({ ...title, target: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-title-action">动作</label>
                  <select id="legacy-title-action" className="select" value={title.action}
                    onChange={(event) => setTitle({ ...title, action: event.target.value as typeof title.action })}>
                    <option value="title">title</option>
                    <option value="subtitle">subtitle</option>
                    <option value="actionbar">actionbar</option>
                    <option value="clear">clear</option>
                    <option value="reset">reset</option>
                    <option value="times">times</option>
                  </select>
                </div>
              </div>
              {title.action === 'times' ? (
                <div className="grid-3" style={{ marginTop: 12 }}>
                  {(['fadeIn', 'stay', 'fadeOut'] as const).map((key) => (
                    <div className="field" key={key}>
                      <label className="field-label" htmlFor={`legacy-title-${key}`}>{key}</label>
                      <input id={`legacy-title-${key}`} className="input" value={title[key]}
                        onChange={(event) => setTitle({ ...title, [key]: event.target.value })} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="legacy-title-text">JSON 文本</label>
                  <textarea id="legacy-title-text" className="textarea" rows={3} value={title.text}
                    onChange={(event) => setTitle({ ...title, text: event.target.value })} />
                </div>
              )}
            </>
          ) : null}

          {tab === 'particle' ? (
            <>
              <div className="field">
                <label className="field-label" htmlFor="legacy-particle-name">粒子名</label>
                <input id="legacy-particle-name" className="input" value={particle.name}
                  onChange={(event) => setParticle({ ...particle, name: event.target.value })} />
              </div>
              <div className="grid-3" style={{ marginTop: 12 }}>
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <div className="field" key={axis}>
                    <label className="field-label" htmlFor={`legacy-particle-${axis}`}>{axis.toUpperCase()}</label>
                    <input id={`legacy-particle-${axis}`} className="input" value={particle[axis]}
                      onChange={(event) => setParticle({ ...particle, [axis]: event.target.value })} />
                  </div>
                ))}
                {(['dx', 'dy', 'dz'] as const).map((axis) => (
                  <div className="field" key={axis}>
                    <label className="field-label" htmlFor={`legacy-particle-${axis}`}>{axis}</label>
                    <input id={`legacy-particle-${axis}`} className="input" value={particle[axis]}
                      onChange={(event) => setParticle({ ...particle, [axis]: event.target.value })} />
                  </div>
                ))}
              </div>
              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-particle-speed">速度</label>
                  <input id="legacy-particle-speed" className="input" value={particle.speed}
                    onChange={(event) => setParticle({ ...particle, speed: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-particle-count">数量</label>
                  <input id="legacy-particle-count" className="input" value={particle.count}
                    onChange={(event) => setParticle({ ...particle, count: event.target.value })} />
                </div>
              </div>
            </>
          ) : null}

          {tab === 'summon' ? (
            <>
              <div className="field">
                <label className="field-label" htmlFor="legacy-summon-entity">实体</label>
                <input id="legacy-summon-entity" className="input" value={summon.entity}
                  onChange={(event) => setSummon({ ...summon, entity: event.target.value })} />
              </div>
              <div className="grid-3" style={{ marginTop: 12 }}>
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <div className="field" key={axis}>
                    <label className="field-label" htmlFor={`legacy-summon-${axis}`}>{axis.toUpperCase()}</label>
                    <input id={`legacy-summon-${axis}`} className="input" value={summon[axis]}
                      onChange={(event) => setSummon({ ...summon, [axis]: event.target.value })} />
                  </div>
                ))}
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="legacy-summon-nbt">NBT（可选）</label>
                <textarea id="legacy-summon-nbt" className="textarea" rows={3} value={summon.nbt}
                  onChange={(event) => setSummon({ ...summon, nbt: event.target.value })} />
              </div>
            </>
          ) : null}

          {tab === 'gamerule' ? (
            <div className="grid-2">
              <div className="field">
                <label className="field-label" htmlFor="legacy-rule-name">规则</label>
                <input id="legacy-rule-name" className="input" value={gamerule.rule}
                  onChange={(event) => setGamerule({ ...gamerule, rule: event.target.value })} />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="legacy-rule-value">值（留空查询）</label>
                <input id="legacy-rule-value" className="input" value={gamerule.value}
                  onChange={(event) => setGamerule({ ...gamerule, value: event.target.value })} />
              </div>
            </div>
          ) : null}

          {tab === 'xp' ? (
            <>
              <div className="grid-2">
                <div className="field">
                  <label className="field-label" htmlFor="legacy-xp-amount">经验值</label>
                  <input id="legacy-xp-amount" className="input" value={xp.amount}
                    onChange={(event) => setXp({ ...xp, amount: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-xp-target">目标</label>
                  <input id="legacy-xp-target" className="input" value={xp.target}
                    onChange={(event) => setXp({ ...xp, target: event.target.value })} />
                </div>
              </div>
              <label className="checkbox-row" style={{ marginTop: 12 }}>
                <input type="checkbox" checked={xp.levels}
                  onChange={(event) => setXp({ ...xp, levels: event.target.checked })} />
                按等级（L）
              </label>
            </>
          ) : null}

          {tab === 'tellraw' ? (
            <>
              <div className="field">
                <label className="field-label" htmlFor="legacy-tellraw-target">目标</label>
                <input id="legacy-tellraw-target" className="input" value={tellraw.target}
                  onChange={(event) => setTellraw({ ...tellraw, target: event.target.value })} />
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="legacy-tellraw-json">JSON 文本</label>
                <textarea id="legacy-tellraw-json" className="textarea" rows={4} value={tellraw.json}
                  onChange={(event) => setTellraw({ ...tellraw, json: event.target.value })} />
              </div>
            </>
          ) : null}

          {tab === 'effect' ? (
            <>
              <div className="grid-2">
                <div className="field">
                  <label className="field-label" htmlFor="legacy-effect-action">动作</label>
                  <select id="legacy-effect-action" className="select" value={effect.action}
                    onChange={(event) => setEffect({ ...effect, action: event.target.value as 'give' | 'clear' })}>
                    <option value="give">give</option>
                    <option value="clear">clear</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-effect-target">目标</label>
                  <input id="legacy-effect-target" className="input" value={effect.target}
                    onChange={(event) => setEffect({ ...effect, target: event.target.value })} />
                </div>
              </div>
              {effect.action === 'give' ? (
                <>
                  <div className="grid-3" style={{ marginTop: 12 }}>
                    <div className="field">
                      <label className="field-label" htmlFor="legacy-effect-name">效果</label>
                      <input id="legacy-effect-name" className="input" value={effect.effect}
                        onChange={(event) => setEffect({ ...effect, effect: event.target.value })} />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="legacy-effect-seconds">秒数</label>
                      <input id="legacy-effect-seconds" className="input" value={effect.seconds}
                        onChange={(event) => setEffect({ ...effect, seconds: event.target.value })} />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="legacy-effect-amplifier">等级</label>
                      <input id="legacy-effect-amplifier" className="input" value={effect.amplifier}
                        onChange={(event) => setEffect({ ...effect, amplifier: event.target.value })} />
                    </div>
                  </div>
                  <label className="checkbox-row" style={{ marginTop: 12 }}>
                    <input type="checkbox" checked={effect.hideParticles}
                      onChange={(event) => setEffect({ ...effect, hideParticles: event.target.checked })} />
                    隐藏粒子
                  </label>
                </>
              ) : null}
            </>
          ) : null}

          {tab === 'enchant' ? (
            <div className="grid-3">
              <div className="field">
                <label className="field-label" htmlFor="legacy-enchant-target">目标</label>
                <input id="legacy-enchant-target" className="input" value={enchant.target}
                  onChange={(event) => setEnchant({ ...enchant, target: event.target.value })} />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="legacy-enchant-name">附魔</label>
                <input id="legacy-enchant-name" className="input" value={enchant.enchantment}
                  onChange={(event) => setEnchant({ ...enchant, enchantment: event.target.value })} />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="legacy-enchant-level">等级</label>
                <input id="legacy-enchant-level" className="input" value={enchant.level}
                  onChange={(event) => setEnchant({ ...enchant, level: event.target.value })} />
              </div>
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
