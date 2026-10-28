import { describe, expect, it } from 'vitest'
import { mcIconIndex, mcName, mcNameIndex } from './mcAssets'
import names from '../data/mc-names.json'

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

  it('maps 1.19 pottery shards and chain items', () => {
    expect(mcName('items', 'minecraft:pottery_shard_archer')).toBe('弓箭手陶片')
    expect(mcIconIndex('items', 'minecraft:pottery_shard_archer')).toBeTypeOf('number')
    expect(mcIconIndex('items', 'minecraft:chain')).toBeTypeOf('number')
    expect(mcIconIndex('entities', 'minecraft:potion')).toBeTypeOf('number')
  })
})

describe('Chinese primary Minecraft asset labels', () => {
  it('names all wall banner colors in Chinese', () => {
    expect(mcName('blocks', 'minecraft:blue_wall_banner')).toBe('蓝色墙上的旗帜')
    expect(mcName('blocks', 'minecraft:light_gray_wall_banner')).toBe('淡灰色墙上的旗帜')
    const banners = Object.keys(names.blocks).filter((id) => id.endsWith('_wall_banner'))
    expect(banners).toHaveLength(16)
    for (const id of banners) expect(mcName('blocks', id)).toMatch(/墙上的旗帜$/)
  })

  it('combines known sound sources with Chinese event descriptions', () => {
    expect(mcName('sounds', 'minecraft:block.amethyst_block.break')).toBe('紫水晶块：破坏')
    expect(mcName('sounds', 'minecraft:block.bamboo_wood_button.click_on')).toBe('竹按钮：按下')
    expect(mcName('sounds', 'minecraft:entity.skeleton_horse.gallop_water')).toBe('骷髅马：水中疾驰')
    expect(mcName('sounds', 'minecraft:item.crossbow.loading_end')).toBe('弩：装填完成')
  })

  it('translates ambient loops, moods, and known music contexts', () => {
    expect(mcName('sounds', 'minecraft:ambient.basalt_deltas.loop')).toBe('玄武岩三角洲：循环环境音')
    expect(mcName('sounds', 'minecraft:ambient.crimson_forest.mood')).toBe('绯红森林：氛围音')
    expect(mcName('sounds', 'minecraft:music.menu')).toBe('主菜单：背景音乐')
    expect(mcName('sounds', 'minecraft:ui.button.click')).toBe('按钮：点击')
    expect(mcName('sounds', 'minecraft:intentionally_empty')).toBe('静音')
  })

  it('returns explicit category fallbacks instead of guessing unknown or custom resource names', () => {
    expect(mcName('items', 'minecraft:not_a_real_item')).toBe('未收录的物品')
    expect(mcName('blocks', 'minecraft:not_a_real_block')).toBe('未收录的方块')
    expect(mcName('entities', 'minecraft:not_a_real_entity')).toBe('未收录的实体')
    expect(mcName('entities', 'minecraft:tropical_fish.type.not_a_real_variant')).toBe('未收录的实体')
    expect(mcName('entities', 'minecraft:villager.not_a_real_profession')).toBe('未收录的实体')
    expect(mcName('sounds', 'minecraft:block.amethyst_block.not_a_real_event')).toBe('未收录的声音')
    expect(mcName('sounds', 'my_pack:entity.zombie.step')).toBe('自定义声音')
    expect(mcName('items', 'my_pack:diamond')).toBe('自定义物品')
  })

  it('keeps every bundled sound label Chinese and localizes direct name index consumers', () => {
    const sounds = mcNameIndex('sounds')
    expect(Object.keys(sounds)).toEqual(Object.keys(names.sounds))
    for (const [id, label] of Object.entries(sounds)) {
      expect(label, id).toMatch(/[\u3400-\u9fff]/)
      if (!/[\u3400-\u9fff]/.test(names.sounds[id as keyof typeof names.sounds])) {
        expect(label, id).not.toBe(names.sounds[id as keyof typeof names.sounds])
      }
    }
    expect(mcNameIndex('blocks').black_wall_banner).toBe('黑色墙上的旗帜')
  })
})
