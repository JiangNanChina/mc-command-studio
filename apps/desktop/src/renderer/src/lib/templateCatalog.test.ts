import { describe, expect, it } from 'vitest'
import { TEMPLATE_CATEGORY_ORDER } from '@mcstudio/content'
import { isBalancedCompound } from '@mcstudio/core'
import { COMMAND_TEMPLATES, templatesInCategory } from './templateCatalog'

describe('command template catalog', () => {
  it('has entries for all five separate template categories', () => {
    expect(TEMPLATE_CATEGORY_ORDER).toEqual([
      'JSON 相关',
      '特殊 NBT 物品/方块',
      '复合物品/方块',
      '特殊 NBT 实体',
      '复合实体'
    ])
    for (const category of TEMPLATE_CATEGORY_ORDER) {
      expect(templatesInCategory(category).length).toBeGreaterThan(0)
    }
  })

  it('keeps template ids unique and all raw NBT presets balanced', () => {
    expect(new Set(COMMAND_TEMPLATES.map((template) => template.id)).size).toBe(COMMAND_TEMPLATES.length)
    for (const template of COMMAND_TEMPLATES) {
      if (template.target.command === 'give' && template.target.rawNbt) {
        expect(isBalancedCompound(template.target.rawNbt), template.id).toBe(true)
      }
      if (template.target.command === 'setblock' && template.target.nbt) {
        expect(isBalancedCompound(template.target.nbt), template.id).toBe(true)
      }
      if (template.target.command === 'summon' && template.target.nbt) {
        expect(isBalancedCompound(template.target.nbt), template.id).toBe(true)
      }
    }
  })

  it('filters template names and descriptions by search text', () => {
    expect(templatesInCategory('特殊 NBT 实体', '蠹虫').map((template) => template.id)).toEqual(['entity-silverfish'])
    expect(templatesInCategory('复合实体', '命令方块').map((template) => template.id)).toEqual(['complex-minecart'])
  })
})
