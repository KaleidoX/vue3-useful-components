import { createRouter, createWebHashHistory } from 'vue-router'
import { BaseUrl } from './base'
import { previewRoutes } from './routes'

import NProgress from '@/utils/nprogress'

const router = createRouter({
  history: createWebHashHistory(BaseUrl),
  routes: [
    {
      path: '',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'home',
      meta: { inHomeLayout: true },
      component: () => import('@/views/HomeView.vue')
    },
    ...previewRoutes
  ]
})

router.beforeEach(async (to) => {
  NProgress.start()
  if (to.meta.title) {
    document.title = `${import.meta.env.VITE_APP_TITLE}-${to.meta.title}`
  } else {
    document.title = import.meta.env.VITE_APP_TITLE
  }
  return true
})
router.afterEach(() => {
  NProgress.done()
})

export default router
