import type { TemplateDraft } from './templateDraft'
import { COMMAND_TEMPLATES } from './templateCatalog'

export function templateDraftKey(packId: string, templateId: string): string {
  return `${packId}:${templateId}`
}

/** Keep only known templates and string fields when loading older or hand-edited projects. */
export function normalizeTemplateDrafts(value: unknown): Record<string, TemplateDraft> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const entries: [string, TemplateDraft][] = []
  for (const [key, candidate] of Object.entries(value).slice(0, 1000)) {
    if (!candidate || typeof candidate !== 'object') continue
    const draft = candidate as Partial<TemplateDraft>
    if (!COMMAND_TEMPLATES.some((template) => template.id === draft.templateId)) continue
    if (!key.endsWith(`:${draft.templateId}`)) continue
    const stringOr = (input: unknown, fallback: string): string => typeof input === 'string' ? input : fallback
    entries.push([key, {
      templateId: draft.templateId!,
      target: stringOr(draft.target, '@p'),
      count: stringOr(draft.count, '1'),
      x: stringOr(draft.x, '~'),
      y: stringOr(draft.y, '~'),
      z: stringOr(draft.z, '~'),
      data: stringOr(draft.data, ''),
      itemOrBlockOrEntity: stringOr(draft.itemOrBlockOrEntity, ''),
      legacyData: stringOr(draft.legacyData, '0')
    }])
  }
  return Object.fromEntries(entries)
}
