import type { Diagnostic, Severity } from './types'

export function diagnostic(
  severity: Severity,
  code: string,
  message: string,
  field?: string
): Diagnostic {
  return { severity, code, message, field }
}

export function error(code: string, message: string, field?: string): Diagnostic {
  return diagnostic('error', code, message, field)
}

export function warn(code: string, message: string, field?: string): Diagnostic {
  return diagnostic('warn', code, message, field)
}

export function info(code: string, message: string, field?: string): Diagnostic {
  return diagnostic('info', code, message, field)
}

export function hasErrors(diagnostics: Diagnostic[]): boolean {
  return diagnostics.some((item) => item.severity === 'error')
}

export function hasWarnings(diagnostics: Diagnostic[]): boolean {
  return diagnostics.some((item) => item.severity === 'warn')
}
