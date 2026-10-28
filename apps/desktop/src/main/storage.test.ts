import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const mocks = vi.hoisted(() => ({ userData: '', failRename: false }))
vi.mock('electron', () => ({ app: { getPath: () => mocks.userData } }))
vi.mock('node:fs/promises', async (importOriginal) => {
  const original = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...original,
    rename: vi.fn(async (source: string, target: string) => {
      if (mocks.failRename) {
        mocks.failRename = false
        throw new Error('simulated rename failure')
      }
      await original.rename(source, target)
    })
  }
})

import {
  addRecentProject,
  clearAutosave,
  flushStorage,
  readAutosave,
  readProjectFile,
  readSettings,
  updateSettings,
  writeAutosave,
  writeProjectFile
} from './storage'

beforeEach(async () => {
  mocks.userData = await mkdtemp(join(tmpdir(), 'mcstudio-storage-'))
  mocks.failRename = false
})

afterEach(async () => {
  await flushStorage()
  await rm(mocks.userData, { recursive: true, force: true })
})

describe('settings persistence', () => {
  it('preserves independent settings and recent projects across concurrent updates', async () => {
    await Promise.all([
      updateSettings({ theme: 'light' }),
      updateSettings({ autoUpdate: false }),
      addRecentProject('D:/world/a.mcstudio', 'A'),
      addRecentProject('D:/world/b.mcstudio', 'B'),
      updateSettings({ lastPackId: '1.20.4' })
    ])
    const settings = await readSettings()
    expect(settings).toMatchObject({ theme: 'light', autoUpdate: false, lastPackId: '1.20.4' })
    expect(settings.recentProjects.map((project) => project.name)).toEqual(['B', 'A'])
  })

  it('repairs malformed fields without discarding valid settings', async () => {
    await writeFile(join(mocks.userData, 'settings.json'), JSON.stringify({
      theme: 'light', autoUpdate: 'no', updateChannel: 'invalid',
      recentProjects: [null, {}, { name: 'A', path: 'a.mcstudio', openedAt: '2026-10-28T00:00:00.000Z' }]
    }))
    const settings = await readSettings()
    expect(settings.theme).toBe('light')
    expect(settings.autoUpdate).toBe(true)
    expect(settings.updateChannel).toBe('stable')
    expect(settings.recentProjects.map((project) => project.name)).toEqual(['A'])
    await writeFile(join(mocks.userData, 'settings.json'), '[]')
    expect((await readSettings()).theme).toBe('dark')
  })

  it('keeps ten unique recent projects after overlapping additions', async () => {
    await Promise.all(Array.from({ length: 12 }, (_, index) =>
      addRecentProject(`project-${index}.mcstudio`, `Project ${index}`)
    ))
    await addRecentProject('project-11.mcstudio', 'Updated')
    const { recentProjects } = await readSettings()
    expect(recentProjects).toHaveLength(10)
    expect(new Set(recentProjects.map((project) => project.path)).size).toBe(10)
    expect(recentProjects[0].name).toBe('Updated')
  })
})

describe('atomic project writes', () => {
  it('preserves the last complete file and removes temporary files if replacement fails', async () => {
    const path = join(mocks.userData, 'world.mcstudio')
    await writeProjectFile(path, '{"name":"original"}')
    mocks.failRename = true
    await expect(writeProjectFile(path, '{"name":"new"}')).rejects.toThrow('simulated rename failure')
    expect(await readFile(path, 'utf8')).toBe('{"name":"original"}')
    expect(await readdir(mocks.userData)).toEqual(['world.mcstudio'])
    // A failed write must not poison the queue for subsequent saves.
    await writeProjectFile(path, '{"name":"retry"}')
    expect((await readProjectFile(path)).name).toBe('retry')
  })

  it('serializes writes to the same target and returns the actual file path', async () => {
    const path = join(mocks.userData, 'world')
    const saves = Array.from({ length: 8 }, (_, revision) =>
      writeProjectFile(path, JSON.stringify({ revision }))
    )
    expect(await Promise.all(saves)).toEqual(Array(8).fill(`${path}.mcstudio`))
    expect(JSON.parse(await readFile(`${path}.mcstudio`, 'utf8'))).toEqual({ revision: 7 })
    expect((await readdir(mocks.userData)).some((name) => name.endsWith('.tmp'))).toBe(false)
  })
})

describe('autosave recovery', () => {
  it('commits recovery content and timestamp in one atomic record', async () => {
    const content = '{"name":"Recovery","give":{"count":2}}'
    await writeAutosave(content)
    const record = JSON.parse(await readFile(join(mocks.userData, 'autosave.json'), 'utf8'))
    expect(record).toMatchObject({ autosaveVersion: 1, content })
    expect(await readAutosave()).toEqual({ content, savedAt: record.savedAt })
    expect(await readdir(mocks.userData)).toEqual(['autosave.json'])
  })

  it('reads recovery records created by older releases', async () => {
    await writeFile(join(mocks.userData, 'autosave.json'), '{"name":"Legacy"}')
    await writeFile(join(mocks.userData, 'autosave-meta.json'), '{"savedAt":"2026-10-28T00:00:00.000Z"}')
    expect(await readAutosave()).toEqual({
      content: '{"name":"Legacy"}', savedAt: '2026-10-28T00:00:00.000Z'
    })
  })

  it('queues clearing after an in-flight save and removes legacy metadata', async () => {
    await writeFile(join(mocks.userData, 'autosave-meta.json'), '{}')
    await Promise.all([writeAutosave('{"name":"Pending"}'), clearAutosave()])
    expect(await readAutosave()).toBeNull()
    expect(await readdir(mocks.userData)).toEqual([])
  })
})
