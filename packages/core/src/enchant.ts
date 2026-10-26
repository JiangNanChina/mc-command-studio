import { containsControlCharacters, resourceId } from './escape'
import { error, warn } from './diagnostics'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export interface EnchantOptions {
  target: Selector
  enchantment: string
  level: string
}

export function createDefaultEnchantOptions(): EnchantOptions {
  return {
    target: { base: '@s' },
    enchantment: 'minecraft:sharpness',
    level: '1'
  }
}

export function buildEnchantCommand(options: EnchantOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const target = serializeSelector(options.target)
  diagnostics.push(...target.diagnostics)

  const enchantment = resourceId(options.enchantment.trim())
  if (!options.enchantment.trim()) {
    diagnostics.push(error('enchant.id', '请选择或填写附魔 ID', 'enchantment'))
  }

  const level = options.level.trim()
  if (!level) {
    diagnostics.push(error('enchant.level', '附魔等级不能为空', 'level'))
  } else if (!/^\d+$/.test(level) || Number(level) < 1 || Number(level) > 255) {
    diagnostics.push(error('enchant.level', '附魔等级必须是 1–255 的整数', 'level'))
  }

  const parts = ['enchant', target.text, enchantment]
  if (level) parts.push(level)

  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (containsControlCharacters(text)) {
    diagnostics.push(warn('enchant.control', '命令中包含不可见控制字符'))
  }
  return { text, diagnostics }
}
