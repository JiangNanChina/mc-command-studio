import { describe, expect, it } from 'vitest'
import { mcIconIndex, mcName } from './mcAssets'

describe('legacy minecraft asset aliases', () => {
  it('maps 1.13 item and block names', () => {
    expect(mcName('items', 'minecraft:grass')).toBe('草')
    expect(mcName('items', 'minecraft:grass_path')).toBe('土径')
    expect(mcName('items', 'minecraft:rose_red')).toBe('玫瑰红染料')
    expect(mcName('blocks', 'minecraft:grass')).toBe('草方块')
    expect(mcName('items', 'minecraft:chain')).toBe('锁链')
  })

  it('maps old icons to current atlas entries', () => {
    expect(mcIconIndex('items', 'minecraft:grass')).toBeTypeOf('number')
    expect(mcIconIndex('blocks', 'minecraft:grass_path')).toBeTypeOf('number')
    expect(mcIconIndex('entities', 'minecraft:boat')).toBeTypeOf('number')
    expect(mcIconIndex('entities', 'minecraft:tropical_fish.type.betty')).toBeTypeOf('number')
    expect(mcIconIndex('entities', 'minecraft:villager.armorer')).toBeTypeOf('number')
    expect(mcIconIndex('enchantments', 'minecraft:sweeping')).toBeTypeOf('number')
  })

  it('maps entity variants', () => {
    expect(mcName('entities', 'minecraft:zombie_pigman')).toBe('僵尸猪人')
    expect(mcName('entities', 'minecraft:tropical_fish.type.betty')).toBe('热带鱼')
    expect(mcName('entities', 'minecraft:villager.armorer')).toBe('村民（盔甲匠）')
  })
})
