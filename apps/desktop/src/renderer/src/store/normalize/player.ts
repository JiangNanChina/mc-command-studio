// 玩家/物品/消息类命令命令的容错归一化。
import {
  createDefaultNbtGiveOptions,
  createDefaultGamemodeOptions,
  createDefaultSocialOptions,
  createDefaultEffectOptions,
  createDefaultEnchantOptions,
  createDefaultGiveOptions,
  createDefaultClearOptions,
  createDefaultSoundOptions,
  createDefaultTellrawOptions,
  createDefaultTitleOptions,
  createDefaultXpOptions,
  type EffectOptions,
  type EnchantOptions,
  type GiveOptions,
  type ClearOptions,
  type NbtGiveOptions,
  type GamemodeOptions,
  type SocialOptions,
  type SoundOptions,
  type TellrawOptions,
  type TitleOptions,
  type XpOptions
} from '@mcstudio/core'
import { normalizePosition, normalizeTextSegment } from './common'

export function normalizeGive(input: Partial<GiveOptions> | undefined): GiveOptions {
  const fallback = createDefaultGiveOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    item:
      input.item && typeof input.item.id === 'string'
        ? {
            id: input.item.id,
            components: Array.isArray(input.item.components) ? input.item.components : []
          }
        : fallback.item,
    count:
      typeof input.count === 'number' && Number.isFinite(input.count)
        ? Math.max(1, Math.floor(input.count))
        : 1
  }
}

export function normalizeNbtGive(input: Partial<NbtGiveOptions> | undefined): NbtGiveOptions {
  const fallback = createDefaultNbtGiveOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    item: typeof input.item === 'string' ? input.item : fallback.item,
    count: typeof input.count === 'string' ? input.count : fallback.count,
    name: typeof input.name === 'string' ? input.name : '',
    lore: typeof input.lore === 'string' ? input.lore : '',
    enchantments: Array.isArray(input.enchantments)
      ? input.enchantments
          .filter((entry) => entry && typeof entry.id === 'string')
          .map((entry) => ({
            id: entry.id,
            level: typeof entry.level === 'string' ? entry.level : '1'
          }))
      : [],
    unbreakable: Boolean(input.unbreakable)
  }
}

export function normalizeGamemode(input: Partial<GamemodeOptions> | undefined): GamemodeOptions {
  const fallback = createDefaultGamemodeOptions()
  if (!input) return fallback
  const modes: GamemodeOptions['mode'][] = ['survival', 'creative', 'adventure', 'spectator']
  return {
    mode: modes.includes(input.mode as GamemodeOptions['mode'])
      ? (input.mode as GamemodeOptions['mode'])
      : 'creative',
    target: input.target?.base ? input.target : fallback.target
  }
}

export function normalizeSocial(input: Partial<SocialOptions> | undefined): SocialOptions {
  const fallback = createDefaultSocialOptions()
  if (!input) return fallback
  return {
    message: typeof input.message === 'string' ? input.message : fallback.message,
    target: input.target?.base ? input.target : fallback.target,
    uuids: Boolean(input.uuids),
    reason: typeof input.reason === 'string' ? input.reason : fallback.reason
  }
}

export function normalizeEffect(input: Partial<EffectOptions> | undefined): EffectOptions {
  const fallback = createDefaultEffectOptions()
  if (!input) return fallback
  return {
    action: input.action === 'clear' ? 'clear' : 'give',
    target: input.target?.base ? input.target : fallback.target,
    effect: typeof input.effect === 'string' ? input.effect : fallback.effect,
    duration: typeof input.duration === 'string' ? input.duration : fallback.duration,
    amplifier: typeof input.amplifier === 'string' ? input.amplifier : fallback.amplifier,
    hideParticles: Boolean(input.hideParticles),
    permanent: Boolean(input.permanent)
  }
}

export function normalizeEnchant(input: Partial<EnchantOptions> | undefined): EnchantOptions {
  const fallback = createDefaultEnchantOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    enchantment: typeof input.enchantment === 'string' ? input.enchantment : fallback.enchantment,
    level: typeof input.level === 'string' ? input.level : fallback.level
  }
}

export function normalizeXp(input: Partial<XpOptions> | undefined): XpOptions {
  const fallback = createDefaultXpOptions()
  if (!input) return fallback
  return {
    action:
      input.action === 'set' || input.action === 'query' ? input.action : 'add',
    target: input.target?.base ? input.target : fallback.target,
    amount: typeof input.amount === 'string' ? input.amount : fallback.amount,
    unit: input.unit === 'levels' ? 'levels' : 'points'
  }
}

export function normalizeClear(input: Partial<ClearOptions> | undefined): ClearOptions {
  const fallback = createDefaultClearOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    allItems: input.allItems !== false,
    item: typeof input.item === 'string' ? input.item : fallback.item,
    maxCountEnabled: Boolean(input.maxCountEnabled),
    maxCount: typeof input.maxCount === 'string' ? input.maxCount : fallback.maxCount
  }
}

export function normalizeTellraw(input: Partial<TellrawOptions> | undefined): TellrawOptions {
  const fallback = createDefaultTellrawOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    segments:
      Array.isArray(input.segments) && input.segments.length > 0
        ? input.segments.map(normalizeTextSegment)
        : fallback.segments
  }
}

export function normalizeTitle(input: Partial<TitleOptions> | undefined): TitleOptions {
  const fallback = createDefaultTitleOptions()
  if (!input) return fallback
  return {
    target: input.target?.base ? input.target : fallback.target,
    action:
      input.action === 'subtitle' || input.action === 'actionbar' ? input.action : 'title',
    segments:
      Array.isArray(input.segments) && input.segments.length > 0
        ? input.segments.map(normalizeTextSegment)
        : fallback.segments,
    times: Boolean(input.times),
    fadeIn: typeof input.fadeIn === 'string' ? input.fadeIn : fallback.fadeIn,
    stay: typeof input.stay === 'string' ? input.stay : fallback.stay,
    fadeOut: typeof input.fadeOut === 'string' ? input.fadeOut : fallback.fadeOut
  }
}

export function normalizeSound(input: Partial<SoundOptions> | undefined): SoundOptions {
  const fallback = createDefaultSoundOptions()
  if (!input) return fallback
  const sources: SoundOptions['source'][] = [
    'master',
    'music',
    'record',
    'weather',
    'block',
    'hostile',
    'neutral',
    'player',
    'ambient',
    'voice'
  ]
  return {
    action: input.action === 'stop' ? 'stop' : 'play',
    target: input.target?.base ? input.target : fallback.target,
    sound: typeof input.sound === 'string' ? input.sound : fallback.sound,
    source: sources.includes(input.source as SoundOptions['source'])
      ? (input.source as SoundOptions['source'])
      : 'master',
    position: normalizePosition(input.position),
    volume: typeof input.volume === 'string' ? input.volume : fallback.volume,
    pitch: typeof input.pitch === 'string' ? input.pitch : fallback.pitch,
    minVolume: typeof input.minVolume === 'string' ? input.minVolume : fallback.minVolume,
    stopMode:
      input.stopMode === 'source' || input.stopMode === 'sound' ? input.stopMode : 'all'
  }
}
