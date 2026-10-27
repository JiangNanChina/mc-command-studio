#!/usr/bin/env node
/**
 * 1.13.2 注册表门禁：粒子必须是 1.13 的 48 种，attribute 必须为空。
 */
import { readFile } from 'node:fs/promises'

const manifest = JSON.parse(await readFile('packs/1.13.2/manifest.json', 'utf8'))
const registries = JSON.parse(await readFile('packs/1.13.2/registries.json', 'utf8'))
const errors = []

if (manifest.engine !== 'nbt') errors.push(`engine 应为 nbt，实际 ${manifest.engine}`)
if (manifest.packFormat !== 4) errors.push(`packFormat 应为 4，实际 ${manifest.packFormat}`)
if ((registries.particle_type ?? []).length !== 48) {
  errors.push(`particle_type 应为 48，实际 ${(registries.particle_type ?? []).length}`)
}
if ((registries.attribute ?? []).length !== 0) {
  errors.push(`attribute 应为空，实际 ${(registries.attribute ?? []).length}`)
}
if ((registries.entity_type ?? []).length !== 144) {
  errors.push(`entity_type 应为 144，实际 ${(registries.entity_type ?? []).length}`)
}
if ((registries.enchantment ?? []).length !== 34) {
  errors.push(`enchantment 应为 34，实际 ${(registries.enchantment ?? []).length}`)
}
if ((registries.mob_effect ?? []).length !== 30) {
  errors.push(`mob_effect 应为 30，实际 ${(registries.mob_effect ?? []).length}`)
}

if (errors.length > 0) {
  console.error('✗ 1.13.2 注册表校验失败')
  for (const error of errors) console.error(`  - ${error}`)
  process.exitCode = 1
} else {
  console.log('✓ 1.13.2 注册表校验通过（48 粒子 / 0 属性 / 144 实体 / 34 附魔 / 30 效果）')
}
