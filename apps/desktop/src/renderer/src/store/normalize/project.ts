// 将项目文件归一化为完整 ProjectPayload；只做聚合。
import {
  createDefaultCommandBlockOptions
} from '@mcstudio/core'
import { emptyGeneric } from '../defaults'
import type { ProjectPayload } from '../model'
import { normalizeQuickDrafts } from '../../lib/quickCommands'
import {
  normalizeGive,
  normalizeNbtGive,
  normalizeGamemode,
  normalizeSocial,
  normalizeEffect,
  normalizeEnchant,
  normalizeXp,
  normalizeClear,
  normalizeTellraw,
  normalizeTitle,
  normalizeSound,
  normalizeSummon,
  normalizeTeleport,
  normalizeRotate,
  normalizeDamage,
  normalizeRide,
  normalizeExecute,
  normalizeAttribute,
  normalizeTag,
  normalizeSetblock,
  normalizeFill,
  normalizeClone,
  normalizeWorld,
  normalizeGamerule,
  normalizeWorldborder,
  normalizeTeam,
  normalizeSpawnpoint,
  normalizeWorldSpawn,
  normalizeForceload,
  normalizeParticle,
  normalizeScoreboard,
  normalizeBossbar,
  normalizeDatapack,
  normalizeAutomation,
  normalizeItemCommand,
  normalizeDataCommand,
  normalizeLoot,
  normalizeChain,
  normalizeRandom,
  normalizeTick,
  normalizeSpreadplayers
} from './index'

export function normalizeProjectPayload(input: unknown): ProjectPayload {
  const data = (input ?? {}) as Partial<ProjectPayload>
  return {
    activeCommandId: typeof data.activeCommandId === 'string' ? data.activeCommandId : null,
    quickDrafts: normalizeQuickDrafts(data.quickDrafts),
    give: normalizeGive(data.give),
    nbtGive: normalizeNbtGive(data.nbtGive),
    gamemode: normalizeGamemode(data.gamemode),
    damage: normalizeDamage(data.damage),
    rotate: normalizeRotate(data.rotate),
    spreadplayers: normalizeSpreadplayers(data.spreadplayers),
    ride: normalizeRide(data.ride),
    random: normalizeRandom(data.random),
    tick: normalizeTick(data.tick),
    social: normalizeSocial(data.social),
    summon: normalizeSummon(data.summon),
    setblock: normalizeSetblock(data.setblock),
    execute: normalizeExecute(data.execute),
    teleport: normalizeTeleport(data.teleport),
    effect: normalizeEffect(data.effect),
    fill: normalizeFill(data.fill),
    clone: normalizeClone(data.clone),
    chain: normalizeChain(data.chain),
    enchant: normalizeEnchant(data.enchant),
    xp: normalizeXp(data.xp),
    tellraw: normalizeTellraw(data.tellraw),
    title: normalizeTitle(data.title),
    sound: normalizeSound(data.sound),
    bossbar: normalizeBossbar(data.bossbar),
    scoreboard: normalizeScoreboard(data.scoreboard),
    particle: normalizeParticle(data.particle),
    world: normalizeWorld(data.world),
    tag: normalizeTag(data.tag),
    clear: normalizeClear(data.clear),
    gamerule: normalizeGamerule(data.gamerule),
    worldborder: normalizeWorldborder(data.worldborder),
    team: normalizeTeam(data.team),
    spawnpoint: normalizeSpawnpoint(data.spawnpoint),
    worldSpawn: normalizeWorldSpawn(data.worldSpawn),
    forceload: normalizeForceload(data.forceload),
    attribute: normalizeAttribute(data.attribute),
    automation: normalizeAutomation(data.automation),
    itemCommand: normalizeItemCommand(data.itemCommand),
    dataCommand: normalizeDataCommand(data.dataCommand),
    loot: normalizeLoot(data.loot),
    datapack: normalizeDatapack(data.datapack),
    generic:
      data.generic && Array.isArray(data.generic.steps)
        ? {
            root: typeof data.generic.root === 'string' ? data.generic.root : null,
            steps: data.generic.steps
              .filter((step) => step && typeof step.name === 'string')
              .map((step) => ({ name: step.name, value: step.value }))
          }
        : emptyGeneric(),
    commandBlock: {
      ...createDefaultCommandBlockOptions(),
      ...(data.commandBlock ?? {})
    },
    outputMode: data.outputMode === 'command-block' ? 'command-block' : 'command'
  }
}
