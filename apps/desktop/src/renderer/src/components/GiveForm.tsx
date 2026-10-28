import { useShallow } from 'zustand/react/shallow'
import { useState } from 'react'
import { Gift, Package, Plus, Crosshair, Hash, Layers, ClipboardPaste, Pickaxe, SlidersHorizontal, Sparkles, FlaskConical, Save } from 'lucide-react'
import { COMMAND_MAP, ITEM_COMPONENTS } from '@mcstudio/content'
import { SELECTOR_BASES, serializeSelector } from '@mcstudio/core'
import { ComponentsEditor } from './ComponentsEditor'
import { GiveImportDialog } from './GiveImportDialog'
import { McIcon } from './McIcon'
import { mcName } from '../lib/mcAssets'
import { CustomPresetBar } from './CustomPresetBar'
import { useAppStore } from '../store'

const meta = COMMAND_MAP.get('give')

const COMPONENT_GROUPS = [
  { id: 'basic', label: '基础', icon: Package, description: '数量、耐久、名称、描述与物品标签。', kinds: ['custom_name', 'item_name', 'lore', 'damage', 'max_damage', 'max_stack_size', 'item_tags', 'custom_data'] },
  { id: 'attributes', label: '属性', icon: SlidersHorizontal, description: '物品持有或穿戴时应用的属性修饰器。', kinds: ['attribute_modifiers'] },
  { id: 'enchantments', label: '附魔', icon: Sparkles, description: '添加多项附魔并分别设置等级。', kinds: ['enchantments'] },
  { id: 'advanced', label: '进阶', icon: Pickaxe, description: '无法破坏、稀有度、模型数据及冒险模式限制。', kinds: ['unbreakable', 'rarity', 'enchantment_glint_override', 'custom_model_data', 'can_break', 'can_place_on'] },
  { id: 'special', label: '特殊物品', icon: FlaskConical, description: '设置药水效果、刷怪蛋生物与刷怪笼参数。', kinds: ['potion_contents', 'entity_data', 'block_entity_data'] }
] as const

export function GiveForm() {
  const state = useAppStore(useShallow((state) => ({
    give: state.give,
    pack: state.pack,
    setDialog: state.setDialog,
    setTarget: state.setTarget,
    setCount: state.setCount,
    replaceComponent: state.replaceComponent,
    removeComponent: state.removeComponent,
    addComponent: state.addComponent,
    showToast: state.showToast,
    applyGiveImport: state.applyGiveImport
  })))
  const [importOpen, setImportOpen] = useState(false)
  const [componentGroup, setComponentGroup] = useState<(typeof COMPONENT_GROUPS)[number]['id']>('basic')
  const selectorPreview = serializeSelector(state.give.target)
  const itemComponents = state.give.item.components
  const enchantments = state.pack?.registries.enchantment ?? []
  const activeGroup = COMPONENT_GROUPS.find((group) => group.id === componentGroup) ?? COMPONENT_GROUPS[0]
  const visibleComponents = itemComponents
    .map((component, index) => ({ component, index }))
    .filter(({ component }) => activeGroup.kinds.includes(component.kind as never))
  const availableComponents = ITEM_COMPONENTS.filter(
    (component) => activeGroup.kinds.includes(component.kind as never)
      && !itemComponents.some((item) => item.kind === component.kind)
  )

  const applySavedPlan = (value: string): void => {
    try {
      const plan: unknown = JSON.parse(value)
      if (!plan || typeof plan !== 'object') throw new Error()
      const candidate = plan as { item?: { id?: unknown; components?: unknown }; count?: unknown; target?: unknown }
      if (typeof candidate.item?.id !== 'string' || !Array.isArray(candidate.item.components)
        || typeof candidate.count !== 'number' || !candidate.target || typeof candidate.target !== 'object') throw new Error()
      state.applyGiveImport(plan as Parameters<typeof state.applyGiveImport>[0])
      state.showToast('已载入物品方案', 'success')
    } catch {
      state.showToast('物品方案格式无效，无法载入', 'error')
    }
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">命令库 / 常用 / give</div>
          <div className="hero">
            <div className="hero-icon">
              <Gift size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? '给予物品'}
                <span className="hero-id">give</span>
              </h1>
              <p className="hero-sub">
                {meta?.description ?? '把物品直接放进玩家背包，可附加自定义名称、描述、附魔等组件。'}
              </p>
            </div>
          </div>
        </div>
        <button type="button" className="btn" onClick={() => setImportOpen(true)}>
          <ClipboardPaste size={15} />
          从命令导入
        </button>
      </div>

      <div className="give-preset-toolbar">
        <div className="card-title"><Save size={15} />物品方案</div>
        <CustomPresetBar storageKey="give:modern" label="物品方案"
          value={JSON.stringify(state.give)} onApply={applySavedPlan} />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Crosshair size={15} />
            目标
          </div>
          <div className="card-hint">支持玩家名与目标选择器</div>
        </div>
        <div className="card-body">
          <div className="selector-card">
            <div style={{ minWidth: 0 }}>
              <div className="field-label">当前选择器</div>
              <div className="selector-preview">{selectorPreview.text}</div>
              <div className="hint">
                {selectorPreview.diagnostics.length > 0
                  ? selectorPreview.diagnostics[0].message
                  : '未填写的条件不会出现在命令中'}
              </div>
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => state.setDialog('selector', true)}
            >
              编辑选择器
            </button>
          </div>
          <div className="row wrap" style={{ marginTop: 10 }}>
            {SELECTOR_BASES.filter((base) => ['@s', '@p', '@a', '@r'].includes(base.value)).map(
              (base) => (
                <button
                  key={base.value}
                  type="button"
                  className={`chip${state.give.target.base === base.value ? ' active' : ''}`}
                  title={base.hint}
                  onClick={() => state.setTarget({ ...state.give.target, base: base.value })}
                >
                  {base.value}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Package size={15} />
            物品与数量
          </div>
          <div className="card-hint">物品 ID 来自当前版本注册表</div>
        </div>
        <div className="card-body">
          <div className="item-select">
            <McIcon category="items" id={state.give.item.id} size={38} />
            <div className="item-main">
              <div className="item-name">{mcName('items', state.give.item.id)}</div>
              <div className="item-sub">
                <span className="id">{state.give.item.id}</span>
                {' · '}
                {itemComponents.length > 0 ? `已附加 ${itemComponents.length} 个组件` : '未附加组件'}
              </div>
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => state.setDialog('itemPicker', true)}
            >
              选择物品
            </button>
          </div>

          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="field">
              <label className="field-label" htmlFor="give-count">
                <Hash size={13} />
                数量
              </label>
              <input
                id="give-count"
                className="input"
                type="number"
                min={1}
                max={99}
                value={state.give.count}
                onChange={(event) => state.setCount(Math.max(1, Number(event.target.value) || 1))}
              />
              <div className="hint">数量为 1 时会省略该参数。</div>
            </div>
            <div className="field">
              <div className="field-label">预览</div>
              <div className="selector-preview" style={{ paddingTop: 8 }}>
                {state.give.item.id}
                {itemComponents.length > 0 ? '[…]' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Layers size={15} />
            {activeGroup.label}设置
            <span className="badge">{visibleComponents.length}</span>
          </div>
          <div className="card-hint">{activeGroup.description}</div>
        </div>
        <div className="card-body">
          <div className="segmented-control give-component-tabs" role="tablist" aria-label="物品设置类别">
            {COMPONENT_GROUPS.map((group) => {
              const Icon = group.icon
              const count = itemComponents.filter((component) => group.kinds.includes(component.kind as never)).length
              return (
                <button key={group.id} type="button" role="tab" aria-selected={componentGroup === group.id}
                  className={`give-component-tab${componentGroup === group.id ? ' active' : ''}`}
                  onClick={() => setComponentGroup(group.id)}>
                  <Icon size={14} />{group.label}{count > 0 ? <span className="badge">{count}</span> : null}
                </button>
              )
            })}
          </div>

          <ComponentsEditor
            components={visibleComponents.map(({ component }) => component)}
            enchantments={enchantments}
            entities={state.pack?.registries.entity_type ?? []}
            attributes={state.pack?.registries.attribute ?? []}
            potions={state.pack?.registries.potion ?? []}
            effects={state.pack?.registries.mob_effect ?? []}
            gameVersion={state.pack?.manifest.gameVersion}
            onReplace={(index, component) => state.replaceComponent(visibleComponents[index].index, component)}
            onRemove={(index) => state.removeComponent(visibleComponents[index].index)}
          />

          <div className="row wrap" style={{ marginTop: 14 }}>
            <select
              className="select"
              value=""
              aria-label="添加组件"
              disabled={availableComponents.length === 0}
              onChange={(event) => {
                const kind = event.target.value as (typeof ITEM_COMPONENTS)[number]['kind']
                if (kind) state.addComponent(kind)
              }}
            >
              <option value="">
                {availableComponents.length === 0 ? '所有组件都已添加' : '+ 添加组件…'}
              </option>
              {availableComponents.map((component) => (
                <option key={component.kind} value={component.kind}>
                  {component.name}（{component.kind}）
                </option>
              ))}
            </select>
          </div>

          <div className="divider" />
          <div className="hint">
            示例：
            <code className="code-inline" style={{ marginLeft: 6 }}>
              give @s diamond_sword[custom_name={'{text:"Excalibur",color:"gold",italic:false}'}]
            </code>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-ghost"
        style={{ marginTop: 14 }}
        onClick={() =>
          state.showToast('在右侧输出面板复制命令，或按 Ctrl+Enter 直接复制。', 'info')
        }
      >
        <Plus size={14} />
        如何复制？
      </button>

      {importOpen ? <GiveImportDialog onClose={() => setImportOpen(false)} /> : null}
    </div>
  )
}
