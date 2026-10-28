import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { equipmentSlotLabel, itemFieldName, itemFieldOptions, nbtAttributeOptions, withItemFieldValue } from './itemFieldLabels'

function registry(version: string): Record<string, string[]> {
  const path = join(process.cwd(), 'packs', version, 'registries.json')
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, string[]>
}

describe('give field Chinese labels', () => {
  it('translates current, generic, and legacy camelCase attribute IDs without changing IDs', () => {
    expect(itemFieldName('attribute', 'minecraft:attack_damage')).toBe('攻击伤害')
    expect(itemFieldName('attribute', 'minecraft:generic.attack_damage')).toBe('攻击伤害')
    expect(itemFieldName('attribute', 'horse.jumpStrength')).toBe('跳跃力度')
    expect(itemFieldOptions('attribute', ['attack_damage'])).toEqual([
      { value: 'minecraft:attack_damage', label: '攻击伤害' }
    ])
  })

  it('labels extended and enhanced potion variants while preserving resource IDs', () => {
    expect(itemFieldName('potion', 'minecraft:long_night_vision')).toBe('夜视药水（延长）')
    expect(itemFieldName('potion', 'minecraft:strong_healing')).toBe('治疗药水（增强）')
    expect(itemFieldOptions('potion', ['strong_healing'])[0].value).toBe('minecraft:strong_healing')
  })

  it('labels enchantments, effects, entities, and equipment slots in Chinese', () => {
    expect(itemFieldName('enchantment', 'minecraft:sharpness')).toBe('锋利')
    expect(itemFieldName('effect', 'minecraft:speed')).toBe('迅捷')
    expect(itemFieldName('entity', 'minecraft:zombie')).toBe('僵尸')
    expect(equipmentSlotLabel('mainhand')).toBe('主手')
  })

  it('keeps custom namespaced IDs editable and visibly marked as custom', () => {
    expect(itemFieldName('attribute', 'my_pack:bonus')).toBe('自定义属性：my_pack:bonus')
    expect(itemFieldOptions('entity', ['my_pack:custom_mob'])[0].value).toBe('my_pack:custom_mob')
  })

  it('provides real legacy AttributeName choices only before the 1.16 registry change', () => {
    const legacy = nbtAttributeOptions([], '1.13.2')
    expect(legacy).toContainEqual({ value: 'generic.attackDamage', label: '攻击伤害' })
    expect(legacy).toContainEqual({ value: 'horse.jumpStrength', label: '跳跃力度' })
    expect(legacy.some((option) => option.value === 'generic.attackKnockback')).toBe(false)
    expect(nbtAttributeOptions([], '1.15.2').some((option) => option.value === 'generic.attackKnockback')).toBe(true)
    expect(legacy.every((option) => !option.value.startsWith('minecraft:'))).toBe(true)
    expect(legacy.every((option) => /[\u3400-\u9fff]/.test(option.label))).toBe(true)
    expect(nbtAttributeOptions(['generic.attack_damage'], '1.16')).toEqual([
      { value: 'minecraft:generic.attack_damage', label: '攻击伤害' }
    ])
    expect(nbtAttributeOptions(['my_pack:bonus'], '1.20.4')[0].value).toBe('my_pack:bonus')
  })

  it('uses Chinese primary option labels and preserves loaded custom or legacy values exactly', () => {
    const base = itemFieldOptions('attribute', ['attack_damage', 'my_pack:bonus'])
    expect(base[1]).toEqual({ value: 'my_pack:bonus', label: '自定义属性' })
    const legacy = withItemFieldValue('attribute', base, 'generic.attackDamage')
    expect(legacy.at(-1)).toEqual({ value: 'generic.attackDamage', label: '攻击伤害' })
    expect(withItemFieldValue('attribute', legacy, 'generic.attackDamage')).toBe(legacy)
    expect(withItemFieldValue('entity', [], 'my_pack:pet')).toEqual([
      { value: 'my_pack:pet', label: '自定义实体' }
    ])
  })

  it.each(['1.20.4', '26.3'])('covers every %s potion registry entry', (version) => {
    const potions = registry(version).potion
    expect(potions.length).toBeGreaterThan(0)
    for (const id of potions) {
      expect(itemFieldName('potion', id), `${version}/${id}`).not.toContain('未收录')
    }
  })

  it.each(['1.12.2', '1.20.4', '26.3'])('keeps every %s selector option label Chinese', (version) => {
    const data = registry(version)
    const groups = [
      ['attribute', 'attribute'], ['potion', 'potion'], ['enchantment', 'enchantment'],
      ['mob_effect', 'effect'], ['entity_type', 'entity']
    ] as const
    for (const [key, kind] of groups) {
      for (const option of itemFieldOptions(kind, data[key] ?? [])) {
        expect(option.label, `${version}/${key}/${option.value}`).toMatch(/[\u3400-\u9fff]/)
        expect(option.label, `${version}/${key}/${option.value}`).not.toContain(option.value)
        expect(option.label, `${version}/${key}/${option.value}`).not.toContain('未收录')
      }
    }
  })
})
