export interface CustomPreset {
  name: string
  value: string
}

const PREFIX = 'mcstudio:presets:'

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
