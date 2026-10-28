import { useShallow } from 'zustand/react/shallow'
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
  buildSound,
  buildTeleport,
  buildAdmin,
  buildWorld,
  buildSimple,
  buildGamemode,
  buildBlock,
  buildMisc,
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
  createDefaultEnchant,
  createDefaultSound,
  createDefaultTeleport,
  createDefaultAdmin,
  createDefaultWorld,
  createDefaultSimple,
  createDefaultGamemode,
  createDefaultBlock,
  createDefaultMisc
} from '@mcstudio/core'
import { useAppStore } from '../store'
import { CustomPresetBar } from './CustomPresetBar'

type LegacyTab = 'testfor' | 'blockdata' | 'entitydata' | 'replaceitem' | 'give' | 'testforblock' | 'testforblocks' | 'achievement' | 'trigger' | 'setidletimeout' | 'save' | 'stats' | 'scoreboard' | 'execute' | 'advancement' | 'clear' | 'worldborder' | 'spreadplayers' | 'title' | 'particle' | 'summon' | 'gamerule' | 'xp' | 'tellraw' | 'effect' | 'enchant' | 'sound' | 'teleport' | 'admin' | 'world' | 'simple' | 'gamemode' | 'block' | 'misc'

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
  { id: 'enchant', label: 'enchant' },
  { id: 'sound', label: 'sound' },
  { id: 'teleport', label: 'teleport' },
  { id: 'admin', label: 'admin' },
  { id: 'world', label: 'world' },
  { id: 'simple', label: 'simple' },
  { id: 'gamemode', label: 'gamemode' },
  { id: 'block', label: 'block' },
  { id: 'misc', label: 'misc' }
]

export function LegacyToolsForm() {
  const state = useAppStore(useShallow((state) => ({
    pack: state.pack,
    showToast: state.showToast
  })))
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
  const [sound, setSound] = useState(createDefaultSound)
  const [teleport, setTeleport] = useState(createDefaultTeleport)
  const [admin, setAdmin] = useState(createDefaultAdmin)
  const [world, setWorld] = useState(createDefaultWorld)
  const [simple, setSimple] = useState(createDefaultSimple)
  const [gamemode, setGamemode] = useState(createDefaultGamemode)
  const [block, setBlock] = useState(createDefaultBlock)
  const [misc, setMisc] = useState(createDefaultMisc)
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
    if (tab === 'sound') return buildSound(sound)
    if (tab === 'teleport') return buildTeleport(teleport)
    if (tab === 'admin') return buildAdmin(admin)
    if (tab === 'world') return buildWorld(world)
    if (tab === 'simple') return buildSimple(simple)
    if (tab === 'gamemode') return buildGamemode(gamemode)
    if (tab === 'block') return buildBlock(block)
    if (tab === 'misc') return buildMisc(misc)
    return buildReplaceitem(replaceitem)
  }, [tab, testfor, blockdata, entitydata, replaceitem, give, testforblock, testforblocks, achievement, trigger, idle, save, stats, scoreboard, execute, advancement, clear, worldborder, spreadplayers, title, particle, summon, gamerule, xp, tellraw, effect, enchant, sound, teleport, admin, world, simple, gamemode, block, misc])

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

          {tab === 'sound' ? (
            <>
              <div className="grid-2">
                <div className="field">
                  <label className="field-label" htmlFor="legacy-sound-action">动作</label>
                  <select id="legacy-sound-action" className="select" value={sound.action}
                    onChange={(event) => setSound({ ...sound, action: event.target.value as 'play' | 'stop' })}>
                    <option value="play">playsound</option>
                    <option value="stop">stopsound</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-sound-target">目标</label>
                  <input id="legacy-sound-target" className="input" value={sound.target}
                    onChange={(event) => setSound({ ...sound, target: event.target.value })} />
                </div>
              </div>
              <div className="grid-3" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-sound-name">声音</label>
                  <input id="legacy-sound-name" className="input" value={sound.sound}
                    onChange={(event) => setSound({ ...sound, sound: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-sound-source">声道</label>
                  <input id="legacy-sound-source" className="input" value={sound.source}
                    onChange={(event) => setSound({ ...sound, source: event.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-sound-volume">音量</label>
                  <input id="legacy-sound-volume" className="input" value={sound.volume}
                    onChange={(event) => setSound({ ...sound, volume: event.target.value })} />
                </div>
              </div>
              {sound.action === 'play' ? (
                <div className="grid-3" style={{ marginTop: 12 }}>
                  {(['x', 'y', 'z', 'pitch', 'minVolume'] as const).map((key) => (
                    <div className="field" key={key}>
                      <label className="field-label" htmlFor={`legacy-sound-${key}`}>{key}</label>
                      <input id={`legacy-sound-${key}`} className="input" value={sound[key]}
                        onChange={(event) => setSound({ ...sound, [key]: event.target.value })} />
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          {tab === 'teleport' ? (
            <>
              <div className="grid-2">
                <div className="field">
                  <label className="field-label" htmlFor="legacy-tp-command">命令</label>
                  <select id="legacy-tp-command" className="select" value={teleport.command}
                    onChange={(event) => setTeleport({ ...teleport, command: event.target.value as 'tp' | 'teleport' })}>
                    <option value="tp">tp</option>
                    <option value="teleport">teleport</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-tp-mode">模式</label>
                  <select id="legacy-tp-mode" className="select" value={teleport.mode}
                    onChange={(event) => setTeleport({ ...teleport, mode: event.target.value as 'coords' | 'entity' })}>
                    <option value="coords">坐标</option>
                    <option value="entity">实体</option>
                  </select>
                </div>
              </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-tp-target">目标</label>
                  <input id="legacy-tp-target" className="input" value={teleport.target}
                    onChange={(event) => setTeleport({ ...teleport, target: event.target.value })} />
                </div>
              {teleport.mode === 'entity' ? (
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="legacy-tp-destination">目标实体</label>
                  <input id="legacy-tp-destination" className="input" value={teleport.destination}
                    onChange={(event) => setTeleport({ ...teleport, destination: event.target.value })} />
                </div>
              ) : (
                <div className="grid-3" style={{ marginTop: 12 }}>
                  {(['x', 'y', 'z', 'yaw', 'pitch'] as const).map((key) => (
                    <div className="field" key={key}>
                      <label className="field-label" htmlFor={`legacy-tp-${key}`}>{key}</label>
                      <input id={`legacy-tp-${key}`} className="input" value={teleport[key]}
                        onChange={(event) => setTeleport({ ...teleport, [key]: event.target.value })} />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}

          {tab === 'admin' ? (
            <>
              <div className="grid-2">
                <div className="field">
                  <label className="field-label" htmlFor="legacy-admin-action">动作</label>
                  <select id="legacy-admin-action" className="select" value={admin.action}
                    onChange={(event) => setAdmin({ ...admin, action: event.target.value as typeof admin.action })}>
                    <option value="ban">ban</option>
                    <option value="ban-ip">ban-ip</option>
                    <option value="banlist">banlist</option>
                    <option value="pardon">pardon</option>
                    <option value="pardon-ip">pardon-ip</option>
                    <option value="whitelist">whitelist</option>
                    <option value="op">op</option>
                    <option value="deop">deop</option>
                    <option value="kick">kick</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="legacy-admin-target">目标</label>
                  <input id="legacy-admin-target" className="input" value={admin.target}
                    onChange={(event) => setAdmin({ ...admin, target: event.target.value })} />
                </div>
              </div>
              {admin.action === 'banlist' ? (
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="legacy-admin-list">列表</label>
                  <select id="legacy-admin-list" className="select" value={admin.listType}
                    onChange={(event) => setAdmin({ ...admin, listType: event.target.value as 'players' | 'ips' })}>
                    <option value="players">players</option>
                    <option value="ips">ips</option>
                  </select>
                </div>
              ) : null}
              {admin.action === 'whitelist' ? (
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="legacy-admin-whitelist">白名单动作</label>
                  <select id="legacy-admin-whitelist" className="select" value={admin.whitelistAction}
                    onChange={(event) => setAdmin({ ...admin, whitelistAction: event.target.value as typeof admin.whitelistAction })}>
                    <option value="add">add</option>
                    <option value="remove">remove</option>
                    <option value="list">list</option>
                  </select>
                </div>
              ) : null}
              {['ban', 'ban-ip', 'kick'].includes(admin.action) ? (
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="legacy-admin-reason">原因</label>
                  <input id="legacy-admin-reason" className="input" value={admin.reason}
                    onChange={(event) => setAdmin({ ...admin, reason: event.target.value })} />
                </div>
              ) : null}
            </>
          ) : null}

          {tab === 'world' ? (
            <>
              <div className="field">
                <label className="field-label" htmlFor="legacy-world-action">类型</label>
                <select id="legacy-world-action" className="select" value={world.action}
                  onChange={(event) => setWorld({ ...world, action: event.target.value as typeof world.action })}>
                  <option value="time">time</option>
                  <option value="weather">weather</option>
                  <option value="difficulty">difficulty</option>
                </select>
              </div>
              {world.action === 'time' ? (
                <div className="grid-2" style={{ marginTop: 12 }}>
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-world-time-action">时间动作</label>
                    <select id="legacy-world-time-action" className="select" value={world.timeAction}
                      onChange={(event) => setWorld({ ...world, timeAction: event.target.value as typeof world.timeAction })}>
                      <option value="set">set</option>
                      <option value="add">add</option>
                      <option value="query">query</option>
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-world-time-value">时间</label>
                    <input id="legacy-world-time-value" className="input" value={world.timeValue}
                      onChange={(event) => setWorld({ ...world, timeValue: event.target.value })} />
                  </div>
                  {world.timeAction === 'query' ? (
                    <div className="field">
                      <label className="field-label" htmlFor="legacy-world-time-query">查询类型</label>
                      <select id="legacy-world-time-query" className="select" value={world.timeQuery}
                        onChange={(event) => setWorld({ ...world, timeQuery: event.target.value as typeof world.timeQuery })}>
                        <option value="daytime">daytime</option>
                        <option value="gametime">gametime</option>
                        <option value="day">day</option>
                      </select>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {world.action === 'weather' ? (
                <div className="grid-2" style={{ marginTop: 12 }}>
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-world-weather">天气</label>
                    <select id="legacy-world-weather" className="select" value={world.weather}
                      onChange={(event) => setWorld({ ...world, weather: event.target.value as typeof world.weather })}>
                      <option value="clear">clear</option>
                      <option value="rain">rain</option>
                      <option value="thunder">thunder</option>
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-world-duration">持续时间（秒）</label>
                    <input id="legacy-world-duration" className="input" value={world.duration}
                      onChange={(event) => setWorld({ ...world, duration: event.target.value })} />
                  </div>
                </div>
              ) : null}
              {world.action === 'difficulty' ? (
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="legacy-world-difficulty">难度</label>
                  <select id="legacy-world-difficulty" className="select" value={world.difficulty}
                    onChange={(event) => setWorld({ ...world, difficulty: event.target.value as typeof world.difficulty })}>
                    <option value="peaceful">peaceful</option>
                    <option value="easy">easy</option>
                    <option value="normal">normal</option>
                    <option value="hard">hard</option>
                  </select>
                </div>
              ) : null}
            </>
          ) : null}

          {tab === 'simple' ? (
            <>
              <div className="field">
                <label className="field-label" htmlFor="legacy-simple-action">命令</label>
                <select id="legacy-simple-action" className="select" value={simple.action}
                  onChange={(event) => setSimple({ ...simple, action: event.target.value as typeof simple.action })}>
                  <option value="help">help</option>
                  <option value="list">list</option>
                  <option value="seed">seed</option>
                  <option value="reload">reload</option>
                  <option value="save-all">save-all</option>
                  <option value="save-off">save-off</option>
                  <option value="save-on">save-on</option>
                  <option value="stop">stop</option>
                  <option value="toggledownfall">toggledownfall</option>
                  <option value="me">me</option>
                  <option value="say">say</option>
                  <option value="tell">tell</option>
                </select>
              </div>
              {simple.action === 'help' ? (
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="legacy-simple-help">命令（可选）</label>
                  <input id="legacy-simple-help" className="input" value={simple.helpCommand}
                    onChange={(event) => setSimple({ ...simple, helpCommand: event.target.value })} />
                </div>
              ) : null}
              {simple.action === 'tell' ? (
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="legacy-simple-target">目标</label>
                  <input id="legacy-simple-target" className="input" value={simple.target}
                    onChange={(event) => setSimple({ ...simple, target: event.target.value })} />
                </div>
              ) : null}
              {['me', 'say', 'tell'].includes(simple.action) ? (
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="legacy-simple-message">消息</label>
                  <input id="legacy-simple-message" className="input" value={simple.message}
                    onChange={(event) => setSimple({ ...simple, message: event.target.value })} />
                </div>
              ) : null}
            </>
          ) : null}

          {tab === 'gamemode' ? (
            <div className="grid-3">
              <div className="field">
                <label className="field-label" htmlFor="legacy-gm-action">命令</label>
                <select id="legacy-gm-action" className="select" value={gamemode.action}
                  onChange={(event) => setGamemode({ ...gamemode, action: event.target.value as typeof gamemode.action })}>
                  <option value="gamemode">gamemode</option>
                  <option value="defaultgamemode">defaultgamemode</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="legacy-gm-mode">模式</label>
                <select id="legacy-gm-mode" className="select" value={gamemode.mode}
                  onChange={(event) => setGamemode({ ...gamemode, mode: event.target.value as typeof gamemode.mode })}>
                  <option value="survival">survival</option>
                  <option value="creative">creative</option>
                  <option value="adventure">adventure</option>
                  <option value="spectator">spectator</option>
                </select>
              </div>
              {gamemode.action === 'gamemode' ? (
                <div className="field">
                  <label className="field-label" htmlFor="legacy-gm-target">目标</label>
                  <input id="legacy-gm-target" className="input" value={gamemode.target}
                    onChange={(event) => setGamemode({ ...gamemode, target: event.target.value })} />
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === 'block' ? (
            <>
              <div className="field">
                <label className="field-label" htmlFor="legacy-block-action">操作</label>
                <select id="legacy-block-action" className="select" value={block.action}
                  onChange={(event) => {
                    const action = event.target.value as typeof block.action
                    setBlock({ ...block, action, mode: action === 'clone' ? 'normal' : 'replace' })
                  }}>
                  <option value="setblock">setblock</option>
                  <option value="fill">fill</option>
                  <option value="clone">clone</option>
                </select>
              </div>
              <div className="grid-3" style={{ marginTop: 12 }}>
                {(['x1', 'y1', 'z1', 'x2', 'y2', 'z2'] as const).map((key) => (
                  <div className="field" key={key}>
                    <label className="field-label" htmlFor={`legacy-block-${key}`}>{key}</label>
                    <input id={`legacy-block-${key}`} className="input" value={block[key]}
                      onChange={(event) => setBlock({ ...block, [key]: event.target.value })} />
                  </div>
                ))}
              </div>
              {block.action !== 'clone' ? (
                <div className="grid-2" style={{ marginTop: 12 }}>
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-block-name">方块</label>
                    <input id="legacy-block-name" className="input" value={block.block}
                      onChange={(event) => setBlock({ ...block, block: event.target.value })} />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-block-data">数据值</label>
                    <input id="legacy-block-data" className="input" value={block.data}
                      onChange={(event) => setBlock({ ...block, data: event.target.value })} />
                  </div>
                </div>
              ) : (
                <div className="grid-3" style={{ marginTop: 12 }}>
                  {(['x', 'y', 'z'] as const).map((key) => (
                    <div className="field" key={key}>
                      <label className="field-label" htmlFor={`legacy-block-${key}`}>{key}</label>
                      <input id={`legacy-block-${key}`} className="input" value={block[key]}
                        onChange={(event) => setBlock({ ...block, [key]: event.target.value })} />
                    </div>
                  ))}
                  <div className="field">
                    <label className="field-label" htmlFor="legacy-block-mask">掩码</label>
                    <select id="legacy-block-mask" className="select" value={block.mask}
                      onChange={(event) => setBlock({ ...block, mask: event.target.value })}>
                      <option value="replace">replace</option>
                      <option value="masked">masked</option>
                      <option value="filtered">filtered</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="legacy-block-mode">模式</label>
                <select id="legacy-block-mode" className="select" value={block.mode}
                  onChange={(event) => setBlock({ ...block, mode: event.target.value })}>
                  {(block.action === 'clone'
                    ? ['normal', 'force', 'move']
                    : ['replace', 'destroy', 'keep']
                  ).map((mode) => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>
            </>
          ) : null}

          {tab === 'misc' ? (
            <>
              <div className="field">
                <label className="field-label" htmlFor="legacy-misc-action">命令</label>
                <select id="legacy-misc-action" className="select" value={misc.action}
                  onChange={(event) => setMisc({ ...misc, action: event.target.value as typeof misc.action })}>
                  <option value="function">function</option>
                  <option value="recipe-give">recipe give</option>
                  <option value="recipe-take">recipe take</option>
                  <option value="locate">locate</option>
                  <option value="spawnpoint">spawnpoint</option>
                  <option value="setworldspawn">setworldspawn</option>
                  <option value="kill">kill</option>
                  <option value="debug-start">debug start</option>
                  <option value="debug-stop">debug stop</option>
                </select>
              </div>
              {['function', 'locate', 'recipe-give', 'recipe-take'].includes(misc.action) ? (
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="legacy-misc-id">函数/配方/结构 ID</label>
                  <input id="legacy-misc-id" className="input" value={misc.id}
                    onChange={(event) => setMisc({ ...misc, id: event.target.value })} />
                </div>
              ) : null}
              {['recipe-give', 'recipe-take', 'spawnpoint', 'kill'].includes(misc.action) ? (
                <div className="field" style={{ marginTop: 12 }}>
                  <label className="field-label" htmlFor="legacy-misc-target">目标</label>
                  <input id="legacy-misc-target" className="input" value={misc.target}
                    onChange={(event) => setMisc({ ...misc, target: event.target.value })} />
                </div>
              ) : null}
              {['spawnpoint', 'setworldspawn'].includes(misc.action) ? (
                <div className="grid-3" style={{ marginTop: 12 }}>
                  {(['x', 'y', 'z'] as const).map((key) => (
                    <div className="field" key={key}>
                      <label className="field-label" htmlFor={`legacy-misc-${key}`}>{key}</label>
                      <input id={`legacy-misc-${key}`} className="input" value={misc[key]}
                        onChange={(event) => setMisc({ ...misc, [key]: event.target.value })} />
                    </div>
                  ))}
                </div>
              ) : null}
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
