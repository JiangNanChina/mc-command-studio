import type { McStudioApi } from '../../shared/types'

declare global {
  interface Window {
    mcstudio?: McStudioApi
  }
}

export {}
