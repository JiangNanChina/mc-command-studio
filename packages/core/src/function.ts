import { error } from './diagnostics'
import { resourceId } from './escape'
import type { BuildResult, Diagnostic } from './types'

export interface FunctionOptions {
  name: string
  argumentsEnabled: boolean
  arguments: string
}

export function createDefaultFunctionOptions(): FunctionOptions {
  return {
    name: 'mcstudio:main',
    argumentsEnabled: false,
    arguments: '{}'
  }
}

export function buildFunctionCommand(options: FunctionOptions): BuildResult {
  const diagnostics: Diagnostic[] = []
  const name = resourceId(options.name.trim())
  if (!/^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(name)) {
    diagnostics.push(error('function.name', '函数名必须是 namespace:path 格式', 'name'))
  }
  const parts = ['function', name]
  if (options.argumentsEnabled) {
    const args = options.arguments.trim()
    if (!args.startsWith('{') || !args.endsWith('}')) {
      diagnostics.push(error('function.arguments', '函数参数必须是 { ... } 形式的 SNBT', 'arguments'))
    }
    parts.push(args)
  }
  return { text: parts.join(' '), diagnostics }
}
