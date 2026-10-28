export interface CustomPreset {
  name: string
  value: string
}

const PREFIX = 'mcstudio:presets:'

export const PRESET_KEYS = [
  'give:modern',
  'give:legacy',
  'templates',
  'legacy:block',
  'legacy:entity',
  'legacy:item',
  'ooc:layout'
] as const

export function loadPresets(key: string): CustomPreset[] {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`)
    if (!raw) return []
    const value = JSON.parse(raw)
    if (!Array.isArray(value)) return []
    return value.filter(
      (item): item is CustomPreset =>
        item && typeof item.name === 'string' && typeof item.value === 'string'
    )
  } catch {
    return []
  }
}

export function savePresets(key: string, presets: CustomPreset[]): void {
  localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(presets.slice(0, 30)))
}

export function addPreset(key: string, preset: CustomPreset): CustomPreset[] {
  const name = preset.name.trim()
  if (!name || !preset.value.trim()) return loadPresets(key)
  const next = loadPresets(key).filter((item) => item.name !== name)
  next.unshift({ name, value: preset.value })
  savePresets(key, next)
  return next
}

export function removePreset(key: string, name: string): CustomPreset[] {
  const next = loadPresets(key).filter((item) => item.name !== name)
  savePresets(key, next)
  return next
}

export function renamePreset(key: string, from: string, to: string): CustomPreset[] {
  const name = to.trim()
  if (!name) return loadPresets(key)
  const next = loadPresets(key).map((item) =>
    item.name === from ? { ...item, name } : item
  )
  savePresets(key, next)
  return next
}

export function exportPresets(key: string): string {
  return JSON.stringify(loadPresets(key), null, 2)
}

export function importPresets(key: string, source: string): CustomPreset[] {
  try {
    const value = JSON.parse(source)
    if (!Array.isArray(value)) return loadPresets(key)
    const imported = value.filter(
      (item): item is CustomPreset =>
        item && typeof item.name === 'string' && typeof item.value === 'string'
    )
    const next = [...imported, ...loadPresets(key)]
    const unique = new Map<string, CustomPreset>()
    for (const preset of next) {
      if (!unique.has(preset.name)) unique.set(preset.name, preset)
    }
    const output = [...unique.values()].slice(0, 30)
    savePresets(key, output)
    return output
  } catch {
    return loadPresets(key)
  }
}

export function loadPresetBundle(): Record<string, CustomPreset[]> {
  return Object.fromEntries(PRESET_KEYS.map((key) => [key, loadPresets(key)]))
}

export function applyPresetBundle(bundle: unknown): void {
  if (!bundle || typeof bundle !== 'object') return
  for (const key of PRESET_KEYS) {
    const value = (bundle as Record<string, unknown>)[key]
    if (!Array.isArray(value)) continue
    const presets = value.filter(
      (item): item is CustomPreset =>
        !!item &&
        typeof item === 'object' &&
        typeof (item as CustomPreset).name === 'string' &&
        typeof (item as CustomPreset).value === 'string'
    )
    savePresets(key, presets.slice(0, 30))
  }
  window.dispatchEvent(new CustomEvent('mcstudio:presets-changed'))
}
