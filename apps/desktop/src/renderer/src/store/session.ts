import type { Draft } from 'immer'
import type { AppStore } from '../store'
import { getApi } from '../lib/api'

type SessionActions = Pick<AppStore, 'setSearch' | 'setCategory' | 'setTheme' | 'updateSettings' | 'setUpdate' | 'checkForUpdates' | 'downloadUpdate' | 'installUpdate' | 'skipUpdate'>

function applyTheme(theme: 'dark' | 'light'): void {
  document.documentElement.dataset.theme = theme
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function createSessionSlice(
  set: (update: Partial<AppStore> | ((draft: Draft<AppStore>) => void)) => void,
  get: () => AppStore
): SessionActions {
  return {
    setSearch: (value) => {
      set((state) => {
        state.search = value
      })
    },

    setCategory: (value) => {
      set((state) => {
        state.category = value
      })
    },

    setTheme: async (theme) => {
      applyTheme(theme)
      set((state) => {
        state.settings.theme = theme
      })
      try {
        const next = await getApi().settings.update({ theme })
        set((state) => {
          state.settings = next
        })
      } catch (error) {
        get().showToast(`主题保存失败：${messageOf(error)}`, 'error')
      }
    },

    updateSettings: async (patch) => {
      try {
        const next = await getApi().settings.update(patch)
        set((state) => {
          state.settings = next
        })
        if (patch.theme) applyTheme(patch.theme)
      } catch (error) {
        get().showToast(`设置保存失败：${messageOf(error)}`, 'error')
      }
    },

    setUpdate: (update) => {
      set((state) => {
        state.update = update
      })
    },

    checkForUpdates: async (manual = true) => {
      try {
        const update = await getApi().updater.check(manual)
        set((state) => {
          state.update = update
        })
      } catch (error) {
        get().showToast(`检查更新失败：${messageOf(error)}`, 'error')
      }
    },

    downloadUpdate: async () => {
      try {
        const update = await getApi().updater.download()
        set((state) => {
          state.update = update
        })
      } catch (error) {
        get().showToast(`下载更新失败：${messageOf(error)}`, 'error')
      }
    },

    installUpdate: async () => {
      try {
        await getApi().updater.install()
      } catch (error) {
        get().showToast(`安装更新失败：${messageOf(error)}`, 'error')
      }
    },

    skipUpdate: async (version) => {
      try {
        const update = await getApi().updater.skip(version)
        set((state) => {
          state.update = update
        })
        get().showToast(`已跳过 ${version}，可在设置中重新检查`, 'info')
      } catch (error) {
        get().showToast(`操作失败：${messageOf(error)}`, 'error')
      }
    },


  }
}
