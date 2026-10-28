import { compareVersions } from './version'

/** Item component codecs changed independently of the NBT/components engine boundary. */
export interface VersionCapabilities {
  itemComponents: boolean
  textComponents: 'json-string' | 'snbt'
  enchantments: 'levels' | 'inline'
  customModelData: 'integer' | 'compound'
}

/** An omitted version preserves the current release syntax used by existing callers. */
export function getVersionCapabilities(gameVersion = '26.3'): VersionCapabilities {
  const modernComponents = compareVersions(gameVersion, '1.21.5') >= 0
  return {
    itemComponents: compareVersions(gameVersion, '1.20.5') >= 0,
    textComponents: modernComponents ? 'snbt' : 'json-string',
    enchantments: modernComponents ? 'inline' : 'levels',
    // 1.21.4 expanded the integer into floats/flags/strings/colors lists.
    customModelData: compareVersions(gameVersion, '1.21.4') >= 0 ? 'compound' : 'integer'
  }
}
