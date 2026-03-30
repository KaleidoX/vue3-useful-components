import type { RouteRecordRaw } from 'vue-router'

export interface PreviewRouteGroup {
  key: string
  path: string
  label: string
  description: string
  children: RouteRecordRaw[]
}

const routeMeta = (title: string) => ({ title, inHomeLayout: true })

export const previewRouteGroups: PreviewRouteGroup[] = [
  {
    key: 'form',
    path: 'form',
    label: '表单编辑',
    description: '富文本与编辑器能力统一归类，适合直接在右侧预览交互效果。',
    children: [
      {
        path: 'editor-editorjs',
        name: 'FormEditorEditorJs',
        component: () => import('@/views/form/EditorEditorJsView.vue'),
        meta: routeMeta('EditorJS编辑器')
      },
      {
        path: 'editor-notectl',
        name: 'FormEditorNotectl',
        component: () => import('@/views/form/EditorNotectlView.vue'),
        meta: routeMeta('Notectl编辑器')
      },
      {
        path: 'editor-quill',
        name: 'FormEditorQuill',
        component: () => import('@/views/form/EditorQuillView.vue'),
        meta: routeMeta('富文本编辑器')
      },
      {
        path: 'editor-vditor',
        name: 'FormEditorVditor',
        component: () => import('@/views/form/EditorVditorView.vue'),
        meta: routeMeta('Vditor编辑器')
      },
      {
        path: 'editor-wang',
        name: 'FormEditorWang',
        component: () => import('@/views/form/EditorWangView.vue'),
        meta: routeMeta('WangEditor编辑器')
      }
    ]
  },
  {
    key: 'list',
    path: 'list',
    label: '列表展示',
    description: '列表、空状态和滚动加载示例统一收口，方便快速切换查看。',
    children: [
      {
        path: 'scroll',
        name: 'ListScroll',
        component: () => import('@/views/list/ListScrollView.vue'),
        meta: routeMeta('滚动加载列表')
      },
      {
        path: 'none',
        name: 'ListNone',
        component: () => import('@/views/list/ListNoneView.vue'),
        meta: routeMeta('无数据列表')
      }
    ]
  },
  {
    key: 'play',
    path: 'play',
    label: '媒体播放',
    description: '视频与播放器示例通过同一套右侧内容区直接预览。',
    children: [
      {
        path: 'video',
        name: 'PlayVideo',
        component: () => import('@/views/play/VideoView.vue'),
        meta: routeMeta('视频组件预览')
      },
      {
        path: 'xg',
        name: 'PlayXG',
        component: () => import('@/views/play/XGView.vue'),
        meta: routeMeta('西瓜视频组件预览')
      }
    ]
  },
  {
    key: 'upload',
    path: 'upload',
    label: '上传能力',
    description: '上传相关组件按路由自动进入左侧菜单，右侧直接展示真实页面。',
    children: [
      {
        path: 'image',
        name: 'UploadImage',
        component: () => import('@/views/upload/UploadImageView.vue'),
        meta: routeMeta('上传图片组件')
      }
    ]
  },
  {
    key: 'loading',
    path: 'loading',
    label: '状态反馈',
    description: '加载态与状态反馈能力集中显示，便于统一浏览与对比。',
    children: [
      {
        path: 'view',
        name: 'LoadingView',
        component: () => import('@/views/loading/view.vue'),
        meta: routeMeta('加载组件')
      }
    ]
  }
]

export const previewRoutes: RouteRecordRaw[] = previewRouteGroups.flatMap((group) => {
  return group.children.map((child) => ({
    ...child,
    path: `/${group.path}/${String(child.path)}`,
    meta: {
      ...child.meta,
      groupKey: group.key,
      groupLabel: group.label,
      groupDescription: group.description,
      fullPath: `/${group.path}/${String(child.path)}`
    }
  }))
})
