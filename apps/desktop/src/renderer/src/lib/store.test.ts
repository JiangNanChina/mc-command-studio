import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createProjectFile, type VersionPack } from '@mcstudio/core'
import { DEFAULT_SETTINGS } from '../../../shared/types'
import { useAppStore } from '../store'
import { normalizeProjectPayload } from '../store/normalize'

const { api } = vi.hoisted(() => ({
  api: {
    packs: { load: vi.fn() },
    settings: { update: vi.fn() },
    project: {
      save: vi.fn(), saveAs: vi.fn(), autosave: vi.fn(), clearAutosave: vi.fn(), getAutosave: vi.fn()
    }
  }
}))
vi.mock('./api', () => ({ getApi: () => api }))
vi.mock('./customPresets', () => ({ loadPresetBundle: () => ({}), applyPresetBundle: vi.fn() }))

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

function pack(id: string): VersionPack {
  return { manifest: { id, gameVersion: id } } as VersionPack
}

const initial = useAppStore.getInitialState()
const store = () => useAppStore.getState()

beforeEach(async () => {
  vi.clearAllMocks()
  api.project.clearAutosave.mockResolvedValue(undefined)
  api.project.autosave.mockResolvedValue(undefined)
  api.project.save.mockResolvedValue({ path: 'project.mcstudio', name: 'project' })
  api.project.saveAs.mockResolvedValue({ path: 'project.mcstudio', name: 'project' })
  api.settings.update.mockImplementation(async (patch) => ({ ...DEFAULT_SETTINGS, ...patch }))
  api.packs.load.mockImplementation(async (id) => ({ ok: true, pack: pack(id) }))
  useAppStore.setState({ ...initial, ...normalizeProjectPayload({}), pack: pack('26.3'), booted: true }, true)
  store().newProject()
  await store().flushPersistence()
  vi.clearAllMocks()
})

describe('document persistence and history', () => {
  it('keeps template edits separate from command drafts and restores them from projects', async () => {
    store().setCount(7)
    store().updateSummon({ nbt: '{NoAI:1b}' })
    store().openTemplate('nbt-head')
    expect(store().activeCommandId).toBe('template:nbt-head')
    store().clearHistory()
    store().updateTemplateDraft({ count: '3' })
    store().undo()
    expect(store().templateDrafts['26.3:nbt-head'].count).toBe('1')
    store().redo()
    expect(store().templateDrafts['26.3:nbt-head'].count).toBe('3')
    store().openTemplate('complex-potion')
    store().openTemplate('nbt-head')
    expect(store().templateDrafts['26.3:nbt-head'].count).toBe('3')
    expect(store().give.count).toBe(7)
    expect(store().summon.nbt).toBe('{NoAI:1b}')
    const content = store().serializeProject()
    store().newProject()
    expect(store().templateDrafts).toEqual({})
    await store().applyProjectContent(content, null, 'restored')
    expect(store().activeCommandId).toBe('template:nbt-head')
    expect(store().templateDrafts['26.3:nbt-head'].count).toBe('3')
  })

  it('tracks every datapack edit after the first autosave', async () => {
    const start = store().documentRevision
    store().updateDatapackMeta({ description: 'first edit' })
    await store().autosave()
    store().updateDatapackMeta({ description: 'second edit' })
    await store().autosave()
    expect(store().documentRevision).toBe(start + 2)
    expect(api.project.autosave).toHaveBeenCalledTimes(2)
    expect(JSON.parse(api.project.autosave.mock.calls[1][0]).data.datapack.description).toBe('second edit')
  })

  it('saves and restores quick fields, including command switches and undo', async () => {
    store().selectCommand('locate')
    store().clearHistory()
    store().setQuickValue('locate', 'id', 'minecraft:ancient_city')
    const content = store().serializeProject()
    store().undo()
    expect(store().quickDrafts.locate).toBeUndefined()
    store().redo()
    expect(store().quickDrafts.locate.id).toBe('minecraft:ancient_city')
    store().selectCommand('give')
    store().selectCommand('locate')
    expect(store().quickDrafts.locate.id).toBe('minecraft:ancient_city')
    await store().applyProjectContent(content, null, 'restored')
    expect(store().quickDrafts.locate.id).toBe('minecraft:ancient_city')
  })

  it('keeps UI events out of document revisions and redo history', () => {
    store().setCount(2)
    store().undo()
    const revision = store().documentRevision
    const redo = store().historyFuture
    store().showToast('updated')
    store().setSearch('diamond')
    store().setUpdate({ status: 'downloading', percent: 50 })
    expect(store().documentRevision).toBe(revision)
    expect(store().historyFuture).toBe(redo)
    store().redo()
    expect(store().give.count).toBe(2)
  })

  it('groups typing as patches and invalidates redo for a new edit', () => {
    store().setCount(2)
    store().setCount(3)
    expect(store().historyPast).toHaveLength(1)
    store().undo()
    expect(store().give.count).toBe(1)
    store().redo()
    expect(store().give.count).toBe(3)
    store().undo()
    store().setCount(4)
    expect(store().historyFuture).toHaveLength(0)
  })

  it('preserves edits made while a save is in flight and writes recovery', async () => {
    const saving = deferred<{ path: string; name: string }>()
    api.project.saveAs.mockReturnValueOnce(saving.promise)
    store().setCount(2)
    const pending = store().saveProject()
    await Promise.resolve()
    store().setCount(3)
    saving.resolve({ path: 'project.mcstudio', name: 'project' })
    expect(await pending).toBe(true)
    expect(store().dirty).toBe(true)
    expect(JSON.parse(api.project.saveAs.mock.calls[0][0]).data.give.count).toBe(2)
    expect(JSON.parse(api.project.autosave.mock.calls.at(-1)![0]).data.give.count).toBe(3)
    expect(api.project.clearAutosave).not.toHaveBeenCalled()
  })

  it('does not apply an old save result to a newly created project', async () => {
    const saving = deferred<{ path: string; name: string }>()
    api.project.saveAs.mockReturnValueOnce(saving.promise)
    store().setCount(2)
    const pending = store().saveProject()
    await Promise.resolve()
    store().newProject()
    store().setCount(4)
    saving.resolve({ path: 'old.mcstudio', name: 'old' })
    await pending
    await store().flushPersistence()
    expect(store().projectPath).toBeNull()
    expect(store().projectName).toBe('未命名项目')
    expect(store().give.count).toBe(4)
    expect(store().dirty).toBe(true)
  })

  it('recovers edits made while the old recovery file is being cleared', async () => {
    const clearing = deferred<void>()
    api.project.clearAutosave.mockReturnValueOnce(clearing.promise)
    store().setCount(2)
    const pending = store().saveProject()
    await vi.waitFor(() => expect(api.project.clearAutosave).toHaveBeenCalledTimes(1))
    store().setCount(3)
    clearing.resolve()
    await pending
    expect(store().dirty).toBe(true)
    expect(JSON.parse(api.project.autosave.mock.calls.at(-1)![0]).data.give.count).toBe(3)
  })

  it('follows a preceding Save As destination for a queued normal save', async () => {
    const saving = deferred<{ path: string; name: string }>()
    useAppStore.setState({ projectPath: 'A.mcstudio' })
    api.project.saveAs.mockReturnValueOnce(saving.promise)
    store().setCount(2)
    const first = store().saveProject(true)
    await Promise.resolve()
    store().setCount(3)
    const second = store().saveProject()
    saving.resolve({ path: 'B.mcstudio', name: 'B' })
    await first
    await second
    expect(api.project.save.mock.calls[0][1]).toBe('B.mcstudio')
    expect(JSON.parse(api.project.save.mock.calls[0][0]).data.give.count).toBe(3)
    expect(store().dirty).toBe(false)
  })

  it('reports autosave failure, and can save again after a failed write', async () => {
    store().setCount(2)
    api.project.autosave.mockRejectedValueOnce(new Error('disk full'))
    await expect(store().autosave()).rejects.toThrow('disk full')
    await store().autosave()
    expect(api.project.autosave).toHaveBeenCalledTimes(2)
    expect(store().dirty).toBe(true)
  })

  it('preserves createdAt across edits and saves', () => {
    const createdAt = JSON.parse(store().serializeProject()).createdAt
    store().setCount(2)
    expect(JSON.parse(store().serializeProject()).createdAt).toBe(createdAt)
  })

  it('keeps the recovery file until a restored project is explicitly saved or discarded', async () => {
    api.project.getAutosave.mockResolvedValueOnce({
      content: JSON.stringify(createProjectFile('Recovery', '26.3', {})), savedAt: ''
    })
    await store().restoreAutosave()
    expect(api.project.clearAutosave).not.toHaveBeenCalled()
    expect(store().dirty).toBe(true)
    expect(store().projectName).toBe('Recovery')
  })

  it('does not overwrite newer recovery with a stale autosave queued during a save', async () => {
    const saving = deferred<{ path: string; name: string }>()
    api.project.saveAs.mockReturnValueOnce(saving.promise)
    store().setCount(2)
    const save = store().saveProject()
    await Promise.resolve()
    store().setCount(3)
    const recovery = store().autosave()
    store().setCount(4)
    saving.resolve({ path: 'project.mcstudio', name: 'project' })
    await save
    await recovery
    expect(api.project.autosave.mock.calls.map(([content]) => JSON.parse(content).data.give.count)).toEqual([4, 4])
  })
})

describe('give draft compatibility', () => {
  it('fills defaults when loading an older NBT give draft', () => {
    const payload = normalizeProjectPayload({
      nbtGive: {
        item: 'minecraft:diamond_sword',
        count: '1',
        name: '',
        lore: '',
        enchantments: [],
        unbreakable: false
      }
    })

    expect(payload.nbtGive).toMatchObject({
      damage: '',
      tags: [],
      attributes: [],
      potion: '',
      potionColor: '',
      potionEffects: [],
      canDestroy: [],
      canPlaceOn: [],
      spawnerEntity: '',
      spawnerDelay: '',
      spawnerMinSpawnDelay: '',
      spawnerMaxSpawnDelay: '',
      spawnerSpawnCount: '',
      spawnerMaxNearbyEntities: '',
      spawnerRequiredPlayerRange: '',
      spawnerSpawnRange: ''
    })
  })

  it('round-trips enhanced NBT item settings through project JSON', () => {
    const defaults = normalizeProjectPayload({}).nbtGive
    const saved = {
      ...defaults,
      damage: '7',
      tags: ['mcstudio:quest_reward'],
      attributes: [{
        attribute: 'minecraft:generic.attack_damage',
        amount: '4',
        operation: 1 as const,
        slot: 'mainhand',
        name: 'mcstudio:power'
      }],
      potion: 'minecraft:water',
      potionColor: '#123456',
      potionEffects: [{ id: 'minecraft:speed', duration: '600', amplifier: '1' }],
      canDestroy: ['minecraft:stone'],
      canPlaceOn: ['minecraft:dirt'],
      spawnerEntity: 'minecraft:zombie',
      spawnerDelay: '10',
      spawnerMinSpawnDelay: '100',
      spawnerMaxSpawnDelay: '500',
      spawnerSpawnCount: '6',
      spawnerMaxNearbyEntities: '8',
      spawnerRequiredPlayerRange: '20',
      spawnerSpawnRange: '5'
    }
    const restored = normalizeProjectPayload(JSON.parse(JSON.stringify({ nbtGive: saved })))

    expect(restored.nbtGive).toEqual(saved)
  })
})

describe('version loading transactions', () => {
  it('keeps a successfully loaded version if persisting the preference fails', async () => {
    api.settings.update.mockRejectedValueOnce(new Error('disk full'))
    expect(await store().loadPack('1.20.4')).toBe(true)
    expect(store().activePackId).toBe('1.20.4')
    expect(store().bootError).toBeNull()
    expect(store().toast?.message).toContain('偏好保存失败')
  })

  it('keeps the current version and reports failed version loads', async () => {
    api.packs.load.mockResolvedValueOnce({ ok: false, error: 'damaged pack' })
    expect(await store().loadPack('1.20.4')).toBe(false)
    expect(store().activePackId).toBe('26.3')
    expect(store().toast?.message).toContain('damaged pack')
  })

  it('only commits the last requested version when responses complete out of order', async () => {
    const old = deferred<{ ok: true; pack: VersionPack }>()
    const latest = deferred<{ ok: true; pack: VersionPack }>()
    api.packs.load.mockReturnValueOnce(old.promise).mockReturnValueOnce(latest.promise)
    const first = store().loadPack('1.20.4')
    const second = store().loadPack('1.21.1')
    latest.resolve({ ok: true, pack: pack('1.21.1') })
    expect(await second).toBe(true)
    old.resolve({ ok: true, pack: pack('1.20.4') })
    expect(await first).toBe(false)
    expect(store().activePackId).toBe('1.21.1')
    expect(store().pack?.manifest.id).toBe('1.21.1')
  })

  it('keeps the current document intact when a project version fails to load', async () => {
    store().setCount(7)
    const content = JSON.stringify(createProjectFile('other', 'missing', { give: { count: 3 } }))
    api.packs.load.mockResolvedValueOnce({ ok: false, error: 'missing pack' })
    await expect(store().applyProjectContent(content, null, 'other')).rejects.toThrow('missing pack')
    expect(store().activePackId).toBe('26.3')
    expect(store().give.count).toBe(7)
    expect(store().projectName).toBe('未命名项目')
  })

  it('does not report recovery success when a new project supersedes restoration', async () => {
    const loading = deferred<{ ok: true; pack: VersionPack }>()
    api.packs.load.mockReturnValueOnce(loading.promise)
    api.project.getAutosave.mockResolvedValueOnce({
      content: JSON.stringify(createProjectFile('Recovery', '1.20.4', {})), savedAt: ''
    })
    const pending = store().restoreAutosave()
    await vi.waitFor(() => expect(api.packs.load).toHaveBeenCalled())
    store().newProject()
    loading.resolve({ ok: true, pack: pack('1.20.4') })
    await pending
    expect(store().dirty).toBe(false)
    expect(store().projectName).toBe('未命名项目')
    expect(store().toast?.message).toBe('已新建项目')
  })

  it('ignores recovery content fetched after the user starts a new project', async () => {
    const fetching = deferred<{ content: string; savedAt: string }>()
    api.project.getAutosave.mockReturnValueOnce(fetching.promise)
    const pending = store().restoreAutosave()
    store().newProject()
    fetching.resolve({ content: JSON.stringify(createProjectFile('Old', '26.3', {})), savedAt: '' })
    await pending
    expect(store().projectName).toBe('未命名项目')
    expect(store().dirty).toBe(false)
  })
})
