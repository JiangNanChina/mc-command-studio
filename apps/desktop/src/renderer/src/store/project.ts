import { createProjectFile, parseProjectFile } from '@mcstudio/core'
import type { Draft } from 'immer'
import type { AppStore } from '../store'
import { getApi } from '../lib/api'
import { applyPresetBundle, loadPresetBundle } from '../lib/customPresets'
import { normalizeProjectPayload } from './normalize'
import { projectPayload } from './document'

type ProjectActions = Pick<AppStore,
  | 'newProject' | 'setProjectName' | 'serializeProject' | 'applyProjectContent'
  | 'saveProject' | 'openProject' | 'openProjectPath' | 'autosave'
  | 'flushPersistence' | 'restoreAutosave' | 'dismissAutosave'>

interface ProjectContext {
  set: (update: Partial<AppStore> | ((draft: Draft<AppStore>) => void)) => void
  get: () => AppStore
  enqueuePersistence: <T>(operation: () => Promise<T>) => Promise<T>
  waitForPersistence: () => Promise<unknown>
  setReplacing: (value: boolean) => void
  nextPackRequest: () => number
  isCurrentPackRequest: (request: number) => boolean
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function createProjectSlice(context: ProjectContext): ProjectActions {
  const { set, get, enqueuePersistence, waitForPersistence, setReplacing, nextPackRequest, isCurrentPackRequest } = context
  return {
    newProject: () => {
      nextPackRequest()
      setReplacing(true)
      try {
        set((state) => {
          Object.assign(state, normalizeProjectPayload({}))
          state.projectSession += 1
          state.projectCreatedAt = new Date().toISOString()
          state.projectName = '未命名项目'
          state.projectPath = null
          state.dirty = false
          state.autosaveAvailable = false
        })
      } finally { setReplacing(false) }
      get().clearHistory()
      void enqueuePersistence(() => getApi().project.clearAutosave())
        .catch((error) => get().showToast(`清理恢复文件失败：${messageOf(error)}`, 'error'))
      get().showToast('已新建项目', 'info')
    },

    setProjectName: (name) => {
      set((state) => {
        state.projectName = name.trim() || '未命名项目'
        state.dirty = true
      })
    },

    serializeProject: () => {
      const state = get()
      const payload = projectPayload(state)
      const file = createProjectFile(
        state.projectName,
        state.activePackId,
        payload,
        loadPresetBundle()
      )
      file.createdAt = state.projectCreatedAt
      return `${JSON.stringify(file, null, 2)}\n`
    },

    applyProjectContent: async (content, path, fallbackName, preserveAutosave = false) => {
      const parsed = parseProjectFile(JSON.parse(content))
      if (!parsed.ok || !parsed.project) {
        throw new Error(parsed.error ?? '项目文件无法解析')
      }
      const project = parsed.project
      const payload = normalizeProjectPayload(project.data)
      const session = get().projectSession
      const request = nextPackRequest()
      let pack = get().pack
      if (!pack || project.packId !== get().activePackId) {
        const result = await getApi().packs.load(project.packId)
        if (!result.ok) throw new Error(result.error)
        pack = result.pack
      }
      if (!isCurrentPackRequest(request) || session !== get().projectSession) return false
      applyPresetBundle(project.presets)
      setReplacing(true)
      try {
        set((state) => {
          Object.assign(state, payload)
          state.pack = pack
          state.activePackId = project.packId
          state.bootError = null
          state.projectSession += 1
          state.projectCreatedAt = project.createdAt
          state.projectName = project.name || fallbackName
          state.projectPath = path
          state.dirty = false
          state.autosaveAvailable = false
        })
      } finally { setReplacing(false) }
      get().clearHistory()
      if (!preserveAutosave) await enqueuePersistence(() => getApi().project.clearAutosave())
      const presetCount = Object.values(project.presets ?? {}).reduce<number>(
        (total, value) => total + (Array.isArray(value) ? value.length : 0),
        0
      )
      get().showToast(
        presetCount > 0
          ? `项目已打开，已恢复 ${presetCount} 条自定义预设`
          : '项目已打开（未包含自定义预设）',
        'success'
      )
      return true
    },

    saveProject: async (saveAs = false) => {
      const snapshot = get()
      const content = snapshot.serializeProject()
      try {
        return await enqueuePersistence(async () => {
          const api = getApi()
          if (get().projectSession !== snapshot.projectSession) return false
          // A preceding Save As may have changed the destination while this save waited.
          const destination = get().projectPath
          const result = saveAs || !destination
            ? await api.project.saveAs(content, snapshot.projectName)
            : await api.project.save(content, destination)
          if (!result) return false
          if (get().projectSession !== snapshot.projectSession) return true
          const unchanged = get().documentRevision === snapshot.documentRevision
          setReplacing(true)
          try {
            set((state) => {
              state.projectPath = result.path
              if (unchanged) {
                state.projectName = result.name
                state.dirty = false
                state.autosaveAvailable = false
              }
            })
          } finally { setReplacing(false) }
          if (unchanged) await api.project.clearAutosave()
          if (get().dirty && get().projectSession === snapshot.projectSession) {
            await api.project.autosave(get().serializeProject())
          }
          get().showToast('已保存：' + result.name, 'success')
          return true
        })
      } catch (error) {
        get().showToast('保存失败：' + messageOf(error), 'error')
        return false
      }
    },

    openProject: async () => {
      try {
        const result = await getApi().project.open()
        if (!result) return
        await get().applyProjectContent(result.content, result.path, result.name)
      } catch (error) {
        get().showToast(`打开失败：${messageOf(error)}`, 'error')
      }
    },

    openProjectPath: async (path) => {
      try {
        const result = await getApi().project.openPath(path)
        if (!result) return
        await get().applyProjectContent(result.content, result.path, result.name)
      } catch (error) {
        get().showToast(`打开失败：${messageOf(error)}`, 'error')
      }
    },

    autosave: async () => {
      const snapshot = get()
      if (!snapshot.dirty) return
      await enqueuePersistence(async () => {
        if (get().projectSession !== snapshot.projectSession || !get().dirty) return
        // Serialize when the write reaches the queue, so an older queued task
        // cannot overwrite a newer recovery snapshot written during a save.
        await getApi().project.autosave(get().serializeProject())
        set({ lastAutosaveAt: new Date().toISOString() })
      })
    },

    flushPersistence: async () => {
      let revision: number
      do {
        await waitForPersistence()
        revision = get().documentRevision
        if (get().dirty) await get().autosave()
        await waitForPersistence()
      } while (get().documentRevision !== revision)
    },

    restoreAutosave: async () => {
      try {
        const session = get().projectSession
        const request = nextPackRequest()
        const autosave = await getApi().project.getAutosave()
        if (get().projectSession !== session || !isCurrentPackRequest(request)) return
        if (!autosave) {
          set((state) => {
            state.autosaveAvailable = false
          })
          return
        }
        if (!(await get().applyProjectContent(autosave.content, null, '自动恢复的项目', true))) return
        set((state) => {
          state.dirty = true
          state.autosaveAvailable = false
        })
        get().showToast('已恢复自动保存的内容，请另存为新项目', 'success')
      } catch (error) {
        get().showToast(`恢复失败：${messageOf(error)}`, 'error')
      }
    },

    dismissAutosave: async () => {
      await getApi().project.clearAutosave()
      set((state) => {
        state.autosaveAvailable = false
      })
    },

  }
}
