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

router.beforeEach(async (to, from) => {
  // beforeEach是router的钩子函数，在进入路由前执行
  // console.log(to);
  NProgress.start()
  if (to.meta.title) {
    //判断是否有标题
    document.title = `${import.meta.env.VITE_APP_TITLE}-${to.meta.title}`
  } else {
    document.title = import.meta.env.VITE_APP_TITLE
  }
  // TODO: can do auth user
  console.log('to, from :>> ', to, from);
})
router.afterEach(() => {
  NProgress.done()
})

export default router
