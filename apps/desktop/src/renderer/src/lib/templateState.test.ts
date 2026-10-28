import { describe, expect, it } from 'vitest'
import { normalizeProjectPayload } from '../store/normalize'
import { normalizeTemplateDrafts, templateDraftKey } from './templateState'

describe('template draft persistence', () => {
  it('opens older projects without template data', () => {
    expect(normalizeProjectPayload({}).templateDrafts).toEqual({})
  })

  it('restores each version separately and normalizes missing fields', () => {
    const drafts = {
      [templateDraftKey('1.12.2', 'nbt-head')]: { templateId: 'nbt-head', data: '{SkullOwner:"Notch"}' },
      [templateDraftKey('26.3', 'nbt-head')]: { templateId: 'nbt-head', data: 'profile={name:"Notch"}' }
    }
    const normalized = normalizeProjectPayload({ templateDrafts: drafts })
    expect(normalized.templateDrafts['1.12.2:nbt-head'].data).toBe('{SkullOwner:"Notch"}')
    expect(normalized.templateDrafts['26.3:nbt-head'].data).toBe('profile={name:"Notch"}')
    expect(normalized.templateDrafts['26.3:nbt-head'].count).toBe('1')
  })

  it('ignores unknown templates, mismatched keys, and malformed records', () => {
    expect(normalizeTemplateDrafts([])).toEqual({})
    expect(normalizeTemplateDrafts({
      '26.3:unknown': { templateId: 'unknown' },
      '26.3:wrong': { templateId: 'nbt-head' },
      '1.12.2:nbt-head': null
    })).toEqual({})
  })
})
