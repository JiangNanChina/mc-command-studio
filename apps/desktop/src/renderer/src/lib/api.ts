import type { McStudioApi } from '../../../shared/types'

export function getApi(): McStudioApi {
  const api = window.mcstudio
  if (!api) {
    throw new Error('未检测到桌面桥接。请通过 Electron 启动 MC 指令工坊。')
  }
  return api
}

export function hasDesktopApi(): boolean {
  return Boolean(window.mcstudio)
}
