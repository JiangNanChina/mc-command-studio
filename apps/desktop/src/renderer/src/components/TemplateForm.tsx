import { useShallow } from 'zustand/react/shallow'
import { useState } from 'react'
import { Braces, MapPin, RotateCcw, Save } from 'lucide-react'
import { COMMAND_TEMPLATES } from '../lib/templateCatalog'
import { createTemplateDraft } from '../lib/templateDraft'
import { normalizeTemplateDrafts, templateDraftKey } from '../lib/templateState'
import { useAppStore } from '../store'
import { CustomPresetBar } from './CustomPresetBar'
import { McIcon } from './McIcon'
import { LocalizedIdInput } from './LocalizedIdInput'
import { BlockPickerDialog } from './BlockPickerDialog'
import { mcName } from '../lib/mcAssets'
import { registryOptions } from '../lib/localizedOptions'

/** Templates own their drafts, so opening a preset never overwrites a user's give/summon draft. */
export function TemplateForm({ templateId }: { templateId: string }) {
  const [blockPickerOpen, setBlockPickerOpen] = useState(false)
  const state = useAppStore(useShallow((store) => ({
    pack: store.pack,
    templateDrafts: store.templateDrafts,
    updateTemplateDraft: store.updateTemplateDraft,
    resetTemplateDraft: store.resetTemplateDraft,
    openTemplate: store.openTemplate,
    setCategory: store.setCategory,
    showToast: store.showToast
  })))
  const template = COMMAND_TEMPLATES.find((entry) => entry.id === templateId)
  const pack = state.pack
  if (!template || !pack) return <div className="content"><p>找不到该模板，请从分类列表重新选择。</p></div>
  const key = templateDraftKey(pack.manifest.id, templateId)
  const draft = state.templateDrafts[key] ?? createTemplateDraft(templateId, pack)
  const command = template.target.command
  const isText = command === 'tellraw' || command === 'title'
  const usesPosition = command === 'setblock' || command === 'summon'
  const usesTarget = command === 'give' || isText
  const components = command === 'give' && pack.manifest.engine === 'components'
  const resourceCategory = command === 'give' ? 'items' : command === 'setblock' ? 'blocks' : 'entities'
  const resourceOptions = registryOptions(resourceCategory,
    pack.registries[command === 'give' ? 'item' : command === 'setblock' ? 'block' : 'entity_type'] ?? [])
  if (draft.itemOrBlockOrEntity && !resourceOptions.some((option) => option.value === draft.itemOrBlockOrEntity)) {
    resourceOptions.push({ value: draft.itemOrBlockOrEntity, label: mcName(resourceCategory, draft.itemOrBlockOrEntity) })
  }
  const dataLabel = isText ? 'JSON 文本组件' : components ? '物品组件（id=SNBT）'
    : command === 'setblock' ? '方块实体 NBT' : command === 'summon' ? '实体 NBT' : '物品 NBT'

  const applySaved = (source: string): void => {
    try {
      const saved = JSON.parse(source)
      if (saved.packId !== pack.manifest.id) throw new Error(`请先切换到方案使用的版本：${saved.packId ?? '未知'}`)
      const savedId = saved.draft?.templateId
      const savedTemplate = COMMAND_TEMPLATES.find((entry) => entry.id === savedId)
      if (!savedTemplate) throw new Error('方案中的模板不存在')
      const savedKey = templateDraftKey(pack.manifest.id, savedId)
      const normalized = normalizeTemplateDrafts({ [savedKey]: saved.draft })[savedKey]
      if (!normalized) throw new Error('模板方案格式无效')
      state.openTemplate(savedId)
      state.updateTemplateDraft(normalized)
      state.setCategory(savedTemplate.category)
      state.showToast('已载入模板方案', 'success')
    } catch (error) {
      state.showToast(error instanceof Error ? error.message : '模板方案无法载入', 'error')
    }
  }

  return (
    <div className="content template-page">
      <div className="page-head">
        <div className="hero">
          <div className="hero-icon"><McIcon category={template.iconCategory} id={template.iconId} size={28} /></div>
          <div>
            <h1 className="hero-title">{template.name}<span className="hero-id">{command}</span></h1>
            <p className="hero-sub">{template.description}</p>
          </div>
        </div>
        <button type="button" className="btn btn-sm" onClick={state.resetTemplateDraft}>
          <RotateCcw size={14} />重置当前模板
        </button>
      </div>

      <p className="template-version-note">{template.category} · Minecraft {pack.manifest.gameVersion}
        <span>按版本独立保留草稿；修改会实时更新右侧命令。</span>
        <span>起始模板支持 Java 1.12.2 及更新版本；专有数据通过下方 JSON / SNBT 编辑。</span>
      </p>

      <div className="give-preset-toolbar">
        <div className="card-title"><Save size={15} />保存与调用</div>
        <CustomPresetBar storageKey="templates" label="模板方案"
          value={JSON.stringify({ packId: pack.manifest.id, draft })} onApply={applySaved} />
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title"><MapPin size={15} />基础设置</div></div>
        <div className="card-body">
          {usesTarget ? <label className="field">
            <span className="field-label">{isText ? '接收玩家' : '目标玩家'}（玩家名 / 选择器）</span>
            <input id="template-target" className="input" value={draft.target} spellCheck={false}
              placeholder="@p" onChange={(event) => state.updateTemplateDraft({ target: event.target.value })} />
          </label> : null}
          {!isText && command !== 'setblock' ? <label className="field">
            <span className="field-label">{command === 'give' ? '选择物品' : '选择实体'}</span>
            <LocalizedIdInput id="template-resource" value={draft.itemOrBlockOrEntity} options={resourceOptions}
              label={command === 'give' ? '模板物品' : '模板实体'}
              onChange={(itemOrBlockOrEntity) => state.updateTemplateDraft({ itemOrBlockOrEntity })} />
          </label> : null}
          {command === 'setblock' ? <div className="field">
            <label className="field-label" htmlFor="template-resource">方块与状态</label>
            <button type="button" className="btn" onClick={() => setBlockPickerOpen(true)}>
              <McIcon category="blocks" id={draft.itemOrBlockOrEntity.split('[')[0]} size={20} />
              {mcName('blocks', draft.itemOrBlockOrEntity.split('[')[0])} · 更换方块
            </button>
            <input id="template-resource" className="input" value={draft.itemOrBlockOrEntity} spellCheck={false}
              aria-describedby="template-block-help"
              onChange={(event) => state.updateTemplateDraft({ itemOrBlockOrEntity: event.target.value })} />
            <span id="template-block-help" className="hint">可使用上方中文列表选方块；需要方块状态时，在此编辑资源 ID 与 [状态=值]。</span>
          </div> : null}
          {command === 'give' ? <label className="field">
            <span className="field-label">物品数量</span>
            <input id="template-count" className="input" type="number" min={1} max={99} value={draft.count}
              onChange={(event) => state.updateTemplateDraft({ count: event.target.value })} />
          </label> : null}
          {usesPosition ? <div className="grid-3">
            {(['x', 'y', 'z'] as const).map((axis) => <label className="field" key={axis}>
              <span className="field-label">{axis.toUpperCase()} 坐标</span>
              <input id={`template-${axis}`} className="input" value={draft[axis]} spellCheck={false}
                onChange={(event) => state.updateTemplateDraft({ [axis]: event.target.value })} />
            </label>)}
          </div> : null}
          {pack.manifest.engine === 'legacy' && (command === 'give' || command === 'setblock') ? <label className="field">
            <span className="field-label">旧版数据值（损耗耐久 / 方块状态）</span>
            <input id="template-legacy-data" className="input" type="number" min={0} value={draft.legacyData}
              onChange={(event) => state.updateTemplateDraft({ legacyData: event.target.value })} />
          </label> : null}
          {usesPosition ? <p className="hint">~ 表示相对执行位置；1 格 = 1 个方块。请先确认放置或召唤的位置。</p> : null}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title"><Braces size={15} />{dataLabel}</div></div>
        <div className="card-body">
          <label className="field" htmlFor="template-data">
            <span className="field-label">{isText ? '文本、颜色、点击事件等字段' : components ? '组件列表，多项用英文逗号分隔，不加外层 [ ]' : '完整的 {…} 复合标签，留空表示不附加数据'}</span>
            <textarea id="template-data" className="textarea template-data-editor" rows={9} value={draft.data}
              spellCheck={false} onChange={(event) => state.updateTemplateDraft({ data: event.target.value })} />
          </label>
          <p className="hint">{isText ? '示例：{"text":"你好","color":"gold"}。点击与悬浮事件请使用当前游戏版本支持的字段。'
            : components ? '组件使用当前版本语法。组件名如 minecraft:profile、minecraft:fireworks；保存方案后可再次调用。'
              : '此处直接编辑 SNBT。常用字段：Health（生命值）、Items（容器物品）、Command（命令）；时间通常以 tick 计，20 tick = 1 秒。'}</p>
        </div>
      </div>
      {blockPickerOpen ? <BlockPickerDialog currentId={draft.itemOrBlockOrEntity.split('[')[0]}
        onClose={() => setBlockPickerOpen(false)}
        onSelect={(block) => state.updateTemplateDraft({ itemOrBlockOrEntity: block.id })} /> : null}
    </div>
  )
}
