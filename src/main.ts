import 'normalize.css'
import 'virtual:uno.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { clickBack } from './utils/page'
import { installPerfMonitor } from '@/components/perf'
import request from '@/utils/request'
// cad-viewer 的 MlCadViewer 内部使用 useI18n()，需要在 app 上注册其导出的 i18n 实例
import { i18n as cadViewerI18n } from '@mlightcad/cad-viewer'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(cadViewerI18n)
app.use(router)
app.directive('click-back', clickBack)

installPerfMonitor(app, { router, axios: request })

app.mount('#app')
