import type {
  BlockStates,
  CommandTree,
  ItemComponentDefaults,
  PackManifest,
  Registries
} from '@mcstudio/core'
import type { DatapackExportOptions } from './datapack'

export interface AppInfo {
  name: string
  version: string
  electron: string
  chrome: string
  node: string
  platform: string
  isPackaged: boolean
  isPortable: boolean
  userData: string
  logsPath: string
  packDir: string
  updateFeed: string
}

export type ThemeMode = 'dark' | 'light'

export type CloseReason = 'close' | 'relaunch' | 'update'

export interface BeforeCloseRequest {
  requestId: number
  reason: CloseReason
}

export interface RecentProject {
  name: string
  path: string
  openedAt: string
}

export interface UserSettings {
  theme: ThemeMode
  autoUpdate: boolean
  updateChannel: 'stable' | 'beta'
  skippedVersion: string | null
  lastSeenVersion: string | null
  recentProjects: RecentProject[]
  lastPackId: string | null
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  autoUpdate: true,
  updateChannel: 'stable',
  skippedVersion: null,
  lastSeenVersion: null,
  recentProjects: [],
  lastPackId: '26.3'
}

export interface PackSummary {
  id: string
  gameVersion: string
  dataVersion: number
  packFormat: number
  engine?: 'components' | 'nbt' | 'legacy'
  type: 'release' | 'snapshot'
  builtAt: string
  aliasOf?: string
}

export interface LoadedPack {
  manifest: PackManifest
  commands: CommandTree
  registries: Registries
  blocks: BlockStates
  itemComponents: ItemComponentDefaults
}

export type LoadPackResult =
  | { ok: true; pack: LoadedPack }
  | { ok: false; error: string; hint?: string; packDir?: string }

export type SaveProjectResult = { path: string; name: string } | null

export interface OpenProjectResult {
  path: string
  name: string
  content: string
}

export interface AutosaveResult {
  content: string
  savedAt: string
}

export interface DatapackExportResult {
  path: string
  files: string[]
  functionIds: string[]
}

export type UpdateStatus =
  | 'disabled'
  | 'idle'
  | 'checking'
  | 'not-available'
  | 'available'
  | 'downloading'
  | 'downloaded'
  | 'error'

export interface UpdateState {
  status: UpdateStatus
  version?: string
  percent?: number
  notes?: string
  error?: string
  manual?: boolean
  skipped?: boolean
  channel?: 'stable' | 'beta' | 'test'
}

export type MenuAction =
  | 'new-project'
  | 'open-project'
  | 'open-path'
  | 'save-project'
  | 'save-project-as'
  | 'settings'
  | 'about'
  | 'announcement'
  | 'check-update'
  | 'toggle-theme'
  | 'show-welcome'

export interface McStudioApi {
  app: {
    info: () => Promise<AppInfo>
    openExternal: (url: string) => Promise<void>
    exportDiagnostics: () => Promise<string | null>
    showItemInFolder: (path: string) => Promise<void>
    relaunch: () => Promise<void>
    onBeforeClose: (callback: (request: BeforeCloseRequest) => void) => () => void
    completeClose: (requestId: number, allow: boolean) => Promise<void>
  }
  packs: {
    list: () => Promise<PackSummary[]>
    load: (id: string) => Promise<LoadPackResult>
  }
  project: {
    open: () => Promise<OpenProjectResult | null>
    openPath: (path: string) => Promise<OpenProjectResult | null>
    save: (content: string, path?: string | null) => Promise<SaveProjectResult>
    saveAs: (content: string, suggestedName: string) => Promise<SaveProjectResult>
    autosave: (content: string) => Promise<void>
    getAutosave: () => Promise<AutosaveResult | null>
    clearAutosave: () => Promise<void>
  }
  settings: {
    get: () => Promise<UserSettings>
    update: (patch: Partial<UserSettings>) => Promise<UserSettings>
  }
  clipboard: {
    write: (text: string) => Promise<void>
  }
  datapack: {
    export: (options: DatapackExportOptions) => Promise<DatapackExportResult | null>
  }
  updater: {
    getState: () => Promise<UpdateState>
    check: (manual?: boolean) => Promise<UpdateState>
    download: () => Promise<UpdateState>
    install: () => Promise<void>
    skip: (version: string) => Promise<UpdateState>
    onEvent: (callback: (state: UpdateState) => void) => () => void
  }
  onMenuAction: (callback: (action: MenuAction, payload?: string) => void) => () => void
}
