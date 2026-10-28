import { compareVersions } from './version'

/** Item component codecs changed independently of the NBT/components engine boundary. */
export interface VersionCapabilities {
  itemComponents: boolean
  textComponents: 'json-string' | 'snbt'
  enchantments: 'levels' | 'inline'
  customModelData: 'integer' | 'compound'
  attributeModifiers: 'legacy' | 'wrapped' | 'list'
  attributeTypeFormat: 'generic' | 'bare'
  blockPredicates: 'wrapped' | 'list'
}

/** An omitted version preserves the current release syntax used by existing callers. */
export function getVersionCapabilities(gameVersion = '26.3'): VersionCapabilities {
  const modernComponents = compareVersions(gameVersion, '1.21.5') >= 0
  return {
    itemComponents: compareVersions(gameVersion, '1.20.5') >= 0,
    textComponents: modernComponents ? 'snbt' : 'json-string',
    enchantments: modernComponents ? 'inline' : 'levels',
    // 1.21.4 expanded the integer into floats/flags/strings/colors lists.
    customModelData: compareVersions(gameVersion, '1.21.4') >= 0 ? 'compound' : 'integer',
    // 1.20.5 uses UUIDs, 1.21.1 introduces modifier IDs, and 1.21.5 removes the wrapper.
    attributeModifiers: compareVersions(gameVersion, '1.21.5') >= 0
      ? 'list'
      : compareVersions(gameVersion, '1.21.1') >= 0 ? 'wrapped' : 'legacy',
    // Attribute registry IDs dropped the generic. prefix in 1.21.2.
    attributeTypeFormat: compareVersions(gameVersion, '1.21.2') >= 0 ? 'bare' : 'generic',
    blockPredicates: modernComponents ? 'list' : 'wrapped'
  }
}
