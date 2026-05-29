import 'normalize.css'
import 'virtual:uno.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { clickBack } from './utils/page'
import { installPerfMonitor } from '@/components/perf'
import request from '@/utils/request'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.directive('click-back', clickBack)

installPerfMonitor(app, { router, axios: request })

app.mount('#app')
