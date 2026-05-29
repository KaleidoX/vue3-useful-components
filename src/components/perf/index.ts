import type { App } from 'vue'
import type { Router } from 'vue-router'
import type { AxiosInstance } from 'axios'
import { usePerfStore } from './store'

export interface IPerfInstallOptions {
  router: Router
  axios: AxiosInstance
}

export function installPerfMonitor(app: App, options: IPerfInstallOptions) {
  const store = usePerfStore()
  store.installRouterHook(options.router)
  store.installInterceptor(options.axios)
  store.init()
}

export { usePerfStore } from './store'
export { default as PerfPanel } from './Panel.vue'
export type * from './types'
