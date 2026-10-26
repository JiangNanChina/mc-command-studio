import { describe, expect, it } from 'vitest'
import {
  buildKillCommand,
  buildListCommand,
  buildMsgCommand,
  buildSayCommand,
  buildSeedCommand,
  createDefaultSocialOptions
} from './social'

describe('social commands', () => {
  it('broadcasts say messages', () => {
    expect(buildSayCommand('服务器将在 5 分钟后重启').text).toBe(
      'say 服务器将在 5 分钟后重启'
    )
    expect(buildSayCommand('').diagnostics.some((item) => item.code === 'social.message')).toBe(
      true
    )
  })

  it('sends private messages', () => {
    expect(buildMsgCommand({ base: '@s' }, '你好').text).toBe('msg @s 你好')
  })

  it('kills targets', () => {
    expect(buildKillCommand({ base: '@e', type: 'minecraft:item' }).text).toBe(
      'kill @e[type=minecraft:item]'
    )
  })

  it('lists players and seeds', () => {
    expect(buildListCommand(false).text).toBe('list')
    expect(buildListCommand(true).text).toBe('list uuids')
    expect(buildSeedCommand().text).toBe('seed')
  })

  it('has stable defaults', () => {
    expect(createDefaultSocialOptions().target.base).toBe('@a')
  })
})
