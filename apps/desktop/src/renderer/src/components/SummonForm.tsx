import { useMemo, useState } from 'react'
import { Braces, Crosshair, Ghost, MapPin } from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import { mcId, mcName } from '../lib/mcAssets'
import { McIcon } from './McIcon'
import { RegistryPickerDialog } from './RegistryPickerDialog'
import { useAppStore } from '../store'

const QUICK_ENTITIES = [
  'minecraft:zombie',
  'minecraft:armor_stand',
  'minecraft:item',
  'minecraft:tnt',
  'minecraft:arrow'
]

const meta = COMMAND_MAP.get('summon')

export function SummonForm() {
  const state = useAppStore()
  const summon = state.summon
  const [pickerOpen, setPickerOpen] = useState(false)
  const entities = useMemo(() => {
    const list = state.pack?.registries.entity_type ?? []
    return list.map((id) => mcId(id))
  }, [state.pack])

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / summon</div>
          <div className="hero">
            <div className="hero-icon">
              <Ghost size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '召唤实体'}
                <span className="hero-id">summon</span>
              </h1>
              <p className="hero-sub">
                {meta?.description ?? '在指定位置生成一个实体，可用 NBT 调整生命、装备、AI 等。'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Ghost size={15} />
            实体
          </div>
          <div className="card-hint">{entities.length} 个实体类型</div>
        </div>
        <div className="card-body">
          <div className="item-select">
            <McIcon category="entities" id={summon.entity} size={38} />
            <div className="item-main">
              <div className="item-name">{mcName('entities', summon.entity)}</div>
              <div className="item-sub">{summon.entity}</div>
            </div>
            <button type="button" className="btn" onClick={() => setPickerOpen(true)}>
              选择实体
            </button>
          </div>
          <div className="row wrap" style={{ marginTop: 10 }}>
            {QUICK_ENTITIES.map((id) => (
              <button
                key={id}
                type="button"
                className={`chip${summon.entity === id ? ' active' : ''}`}
                onClick={() => state.updateSummon({ entity: id })}
              >
                <McIcon category="entities" id={id} size={16} />
                {mcName('entities', id)}
              </button>
            ))}
          </div>
          <div className="hint" style={{ marginTop: 8 }}>
            来自当前 26.3 实体注册表；模组实体可用通用构建器或手动输入。
          </div>
        </div>
      </div>

      {pickerOpen ? (
        <RegistryPickerDialog
          title="选择实体"
          category="entities"
          ids={entities}
          current={summon.entity}
          onSelect={(id) => state.updateSummon({ entity: id })}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <MapPin size={15} />
            位置
          </div>
          <label className="checkline">
            <input
              type="checkbox"
              checked={summon.usePosition}
              onChange={(event) => state.updateSummon({ usePosition: event.target.checked })}
            />
            指定坐标
          </label>
        </div>
        <div className="card-body">
          <div className="grid-3">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <div className="field" key={axis}>
                <label className="field-label" htmlFor={`summon-${axis}`}>
                  {axis.toUpperCase()}
                </label>
                <input
                  id={`summon-${axis}`}
                  className="input"
                  value={summon.position[axis]}
                  disabled={!summon.usePosition}
                  placeholder="~"
                  onChange={(event) => state.updateSummonPosition({ [axis]: event.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="hint" style={{ marginTop: 8 }}>
            支持绝对坐标（0）、相对坐标（~1）和局部坐标（^）；默认生成在命令执行位置。
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Braces size={15} />
            NBT
          </div>
          <div className="card-hint">可选，需要坐标参数</div>
        </div>
        <div className="card-body">
          <textarea
            className="textarea"
            placeholder='例如 {NoAI:1b,CustomName:"\\"测试\\"",PersistenceRequired:1b}'
            value={summon.nbt}
            disabled={!summon.usePosition}
            onChange={(event) => state.updateSummon({ nbt: event.target.value })}
          />
          <div className="hint" style={{ marginTop: 6 }}>
            实体 NBT 仍使用 SNBT；如果未开启“指定坐标”，该内容不会写入命令。
          </div>
          <div className="divider" />
          <div className="hint">
            示例：
            <code className="code-inline" style={{ marginLeft: 6 }}>
              summon minecraft:zombie ~ ~ ~ {'{NoAI:1b}'}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
