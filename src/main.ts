import 'normalize.css'
import 'virtual:uno.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { clickBack } from './utils/page'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('click-back', clickBack)

app.mount('#app')
