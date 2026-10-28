import { describe, expect, it } from 'vitest'
import { ITEM_SLOTS, SCORE_CRITERIA, SCORE_SLOTS } from '@mcstudio/core'
import { QUICK_SCHEMAS } from './quickCommands'
import {
  builtinOptionLabel, damageTypeName, itemSlotName, namedOptions,
  scoreboardCriterionName, scoreboardSlotName
} from './localizedOptions'

describe('built-in form option labels', () => {
  it('puts Chinese descriptions before stable enum IDs', () => {
    expect(builtinOptionLabel('structure')).toBe('结构（structure）')
    expect(builtinOptionLabel('minecraft:the_nether')).toBe('下界（minecraft:the_nether）')
    expect(builtinOptionLabel('my_pack:custom')).toBe('my_pack:custom')
  })
  it('labels all suggested item slots, scoreboard slots, and criteria', () => {
    for (const id of ITEM_SLOTS) expect(itemSlotName(id)).toMatch(/[\u3400-\u9fff]/)
    for (const id of SCORE_CRITERIA) expect(scoreboardCriterionName(id)).toMatch(/[\u3400-\u9fff]/)
    for (const id of SCORE_SLOTS) expect(scoreboardSlotName(id)).toMatch(/[\u3400-\u9fff]/)
    expect(itemSlotName('slot.hotbar.0')).toBe('快捷栏第 1 格')
    expect(scoreboardSlotName('sidebar.team.red')).toBe('红色队伍侧边栏')
  })
  it('keeps submitted IDs untouched', () => {
    expect(namedOptions(['minecraft:player_attack'], damageTypeName)).toEqual([
      { value: 'minecraft:player_attack', label: '玩家攻击' }
    ])
    expect(itemSlotName('mod:custom_slot')).toBe('mod:custom_slot')
    expect(scoreboardCriterionName('minecraft.custom:minecraft.jump')).toBe('minecraft.custom:minecraft.jump')
  })
  it('describes every fixed quick-command choice in Chinese', () => {
    for (const schema of Object.values(QUICK_SCHEMAS)) {
      for (const field of schema.fields) {
        for (const id of field.options ?? []) {
          expect(builtinOptionLabel(id)).toMatch(/[\u3400-\u9fff]/)
          expect(builtinOptionLabel(id)).toContain(`（${id}）`)
        }
      }
    }
    expect(builtinOptionLabel('test')).toBe('检测（test）')
  })
})
