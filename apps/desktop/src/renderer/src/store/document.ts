import type { Patch } from 'immer'
import type { ProjectPayload } from './model'
import { normalizeProjectPayload } from './normalize'

// The same field list drives persistence and history. UI/session fields never enter it.
const projectFields = Object.keys(normalizeProjectPayload({})) as (keyof ProjectPayload)[]
const documentFields = new Set<string>(['projectName', ...projectFields])

export interface HistoryEntry {
  patches: Patch[]
  inversePatches: Patch[]
}

export function projectPayload(state: ProjectPayload): ProjectPayload {
  return Object.fromEntries(projectFields.map((key) => [key, state[key]])) as unknown as ProjectPayload
}

export function documentPatches(patches: Patch[]): Patch[] {
  return patches.filter((patch) => documentFields.has(String(patch.path[0])))
}
