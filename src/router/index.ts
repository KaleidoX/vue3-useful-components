import { createRouter, createWebHashHistory } from 'vue-router'
import { BaseUrl } from './base'

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
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/form',
      children: [
        {
          path: 'editor-quill',
          name: 'FormEditorQuill',
          component: () => import('@/views/form/EditorQuillView.vue'),
          meta: { title: '富文本编辑器', backLink: '/home' }
        }
      ]
    },
    {
      path: '/list',
      children: [
        {
          path: 'scroll',
          name: 'ListScroll',
          component: () => import('@/views/list/ListScrollView.vue'),
          meta: { title: '滚动加载列表', backLink: '/home' }
        },
        {
          path: 'none',
          name: 'ListNone',
          component: () => import('@/views/list/ListNoneView.vue'),
          meta: { title: '无数据列表', backLink: '/home' }
        }
      ]
    },
    {
      path: '/play',
      children: [
        {
          path: 'video',
          name: 'PlayVideo',
          component: () => import('@/views/play/VideoView.vue'),
          meta: { title: '视频组件预览', backLink: '/home' }
        },
        {
          path: 'xg',
          name: 'PlayXG',
          component: () => import('@/views/play/XGView.vue'),
          meta: { title: '西瓜视频组件预览', backLink: '/home' }
        }
      ]
    },
    {
      path: '/upload',
      children: [
        {
          path: 'image',
          name: 'UploadImage',
          component: () => import('@/views/upload/UploadImageView.vue'),
          meta: { title: '上传图片组件', backLink: '/home' }
        }
      ]
    },
    {
      path: '/loading',
      children: [
        {
          path: 'view',
          name: 'LoadingView',
          component: () => import('@/views/loading/view.vue'),
          meta: { title: '加载组件', backLink: '/home' }
        }
      ]
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
