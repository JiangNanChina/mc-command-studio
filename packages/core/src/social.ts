import { containsControlCharacters } from './escape'
import { error, warn } from './diagnostics'
import { serializeSelector, type Selector } from './selector'
import type { BuildResult, Diagnostic } from './types'

export interface SocialOptions {
  message: string
  target: Selector
  uuids: boolean
  reason: string
}

export function createDefaultSocialOptions(): SocialOptions {
  return {
    message: '你好，MC 指令工坊',
    target: { base: '@a' },
    uuids: false,
    reason: '违反服务器规则'
  }
}

function validateMessage(message: string, field: string, diagnostics: Diagnostic[]): void {
  if (!message.trim()) {
    diagnostics.push(error('social.message', '消息不能为空', field))
  }
  if (message.length > 256) {
    diagnostics.push(warn('social.length', '消息超过 256 字符，部分客户端可能截断', field))
  }
  if (containsControlCharacters(message)) {
    diagnostics.push(warn('social.control', '消息包含不可见控制字符', field))
  }
}

export function buildSayCommand(message: string): BuildResult {
  const diagnostics: Diagnostic[] = []
  validateMessage(message, 'message', diagnostics)
  return { text: `say ${message}`, diagnostics }
}

export function buildMsgCommand(target: Selector, message: string): BuildResult {
  const diagnostics: Diagnostic[] = []
  const selector = serializeSelector(target)
  diagnostics.push(...selector.diagnostics)
  validateMessage(message, 'message', diagnostics)
  return { text: `msg ${selector.text} ${message}`, diagnostics }
}

export function buildKillCommand(target: Selector): BuildResult {
  const diagnostics: Diagnostic[] = []
  const selector = serializeSelector(target)
  diagnostics.push(...selector.diagnostics)
  if (!selector.text.trim()) {
    diagnostics.push(error('social.target', '目标不能为空', 'target'))
  }
  return { text: `kill ${selector.text}`, diagnostics }
}

export function buildListCommand(uuids: boolean): BuildResult {
  return { text: uuids ? 'list uuids' : 'list', diagnostics: [] }
}

export function buildSeedCommand(): BuildResult {
  return { text: 'seed', diagnostics: [] }
}

export function buildMeCommand(action: string): BuildResult {
  const diagnostics: Diagnostic[] = []
  validateMessage(action, 'action', diagnostics)
  return { text: `me ${action}`, diagnostics }
}

export function buildKickCommand(target: Selector, reason: string): BuildResult {
  const diagnostics: Diagnostic[] = []
  const selector = serializeSelector(target)
  diagnostics.push(...selector.diagnostics)
  if (!selector.text.trim()) {
    diagnostics.push(error('social.target', '目标不能为空', 'target'))
  }
  const trimmed = reason.trim()
  return { text: `kick ${selector.text}${trimmed ? ` ${trimmed}` : ''}`, diagnostics }
}

export function buildOpCommand(target: Selector, op: boolean): BuildResult {
  const diagnostics: Diagnostic[] = []
  const selector = serializeSelector(target)
  diagnostics.push(...selector.diagnostics)
  if (!selector.text.trim()) {
    diagnostics.push(error('social.target', '目标不能为空', 'target'))
  }
  return { text: `${op ? 'op' : 'deop'} ${selector.text}`, diagnostics }
}
