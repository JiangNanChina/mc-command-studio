import { describe, expect, it } from 'vitest'
import {
  buildKillCommand,
  buildKickCommand,
  buildListCommand,
  buildMeCommand,
  buildMsgCommand,
  buildOpCommand,
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

  it('builds me, kick and op commands', () => {
    expect(buildMeCommand('正在建造').text).toBe('me 正在建造')
    expect(buildKickCommand({ base: '@a' }, '请勿刷屏').text).toBe('kick @a 请勿刷屏')
    expect(buildKickCommand({ base: '@a' }, '').text).toBe('kick @a')
    expect(buildOpCommand({ base: '@p' }, true).text).toBe('op @p')
    expect(buildOpCommand({ base: '@p' }, false).text).toBe('deop @p')
  })
})
