import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { BaseUrl } from './base'

import NProgress from '@/utils/nprogress'

const router = createRouter({
  history: createWebHistory(BaseUrl),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/video',
      name: 'video',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/VideoView.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
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
  next()
})
router.afterEach(() => {
  NProgress.done()
})

export default router
