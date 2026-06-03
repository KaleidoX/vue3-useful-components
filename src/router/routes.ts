import type { RouteRecordRaw } from 'vue-router'

export interface PreviewRouteGroup {
  key: string
  path: string
  label: string
  description: string
  children: RouteRecordRaw[]
}

const routeMeta = (title: string, description?: string) => ({
  title,
  description,
  inHomeLayout: true
})

export const previewRouteGroups: PreviewRouteGroup[] = [
  {
    key: 'form',
    path: 'form',
    label: '表单编辑',
    description: '富文本与编辑器能力统一归类，适合直接在右侧预览交互效果。',
    children: [
      {
        path: 'conversion',
        name: 'FormEditorConversion',
        component: () => import('@/views/form/EditorConversionView.vue'),
        meta: routeMeta('格式转换')
      },
      {
        path: 'editor-sheetjs',
        name: 'FormEditorSheetJS',
        component: () => import('@/views/form/EditorSheetJSView.vue'),
        meta: routeMeta('SheetJS电子表格')
      },
      {
        path: 'editor-univer-sheet',
        name: 'FormEditorUniverSheet',
        component: () => import('@/views/form/EditorUniverView.vue'),
        meta: routeMeta('Univer电子表格')
      },
      {
        path: 'editor-univer-doc',
        name: 'FormEditorUniverDoc',
        component: () => import('@/views/form/EditorUniverDocView.vue'),
        meta: routeMeta('Univer文档')
      },
      {
        path: 'editor-umo',
        name: 'FormEditorUmoEditor',
        component: () => import('@/views/form/EditorUmoEditorView.vue'),
        meta: routeMeta('Umo编辑器')
      },
      {
        path: 'editor-canvas',
        name: 'FormEditorCanvasEditor',
        component: () => import('@/views/form/EditorCanvasEditorView.vue'),
        meta: routeMeta('Canvas编辑器', '基于 Canvas 渲染的富文本编辑器，支持分页模式。')
      },
      {
        path: 'editor-slate',
        name: 'FormEditorSlate',
        component: () => import('@/views/form/EditorSlateView.vue'),
        meta: routeMeta('Slate编辑器', '高度可定制的富文本编辑器框架，slate-vue3 提供 Vue3 绑定。')
      },
      {
        path: 'editor-ckeditor5',
        name: 'FormEditorCKEditor5',
        component: () => import('@/views/form/EditorCKEditor5View.vue'),
        meta: routeMeta('CKEditor5编辑器')
      },
      {
        path: 'editor-editorjs',
        name: 'FormEditorEditorJs',
        component: () => import('@/views/form/EditorEditorJsView.vue'),
        meta: routeMeta('EditorJS编辑器')
      },
      {
        path: 'editor-milkdown',
        name: 'FormEditorMilkdown',
        component: () => import('@/views/form/EditorMilkdownView.vue'),
        meta: routeMeta('Milkdown编辑器')
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
        path: 'editor-tiptap',
        name: 'FormEditorTiptap',
        component: () => import('@/views/form/EditorTiptapView.vue'),
        meta: routeMeta('Tiptap编辑器')
      },
      {
        path: 'editor-tinymce',
        name: 'FormEditorTinyMCE',
        component: () => import('@/views/form/EditorTinyMCEView.vue'),
        meta: routeMeta('TinyMCE编辑器')
      },
      {
        path: 'editor-trix',
        name: 'FormEditorTrix',
        component: () => import('@/views/form/EditorTrixView.vue'),
        meta: routeMeta('Trix编辑器')
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
  },
  {
    key: 'perf',
    path: 'perf',
    label: '性能监控',
    description: '可拖拽浮动性能监控面板，覆盖 FPS、Web Vitals、网络请求、路由性能和自定义埋点。',
    children: [
      {
        path: 'panel',
        name: 'PerfPanel',
        component: () => import('@/views/perf/PerfView.vue'),
        meta: routeMeta('性能监控面板')
      }
    ]
  },
  {
    key: 'layout',
    path: 'layout',
    label: '布局组件',
    description: '可拖拽分割的面板布局系统，支持标签页、停靠、撤销/重做。',
    children: [
      {
        path: 'demo',
        name: 'LayoutDemo',
        component: () => import('@/views/layout/LayoutDemoView.vue'),
        meta: routeMeta('布局系统演示')
      }
    ]
  },
  {
    key: 'flow',
    path: 'flow',
    label: '流程编辑器',
    description: '7 种流程编辑器引擎对比（SVG / Canvas），基本流图 + 交互演示。',
    children: [
      {
        path: 'vue-flow',
        name: 'FlowVueFlow',
        component: () => import('@/views/flow/FlowVueFlowView.vue'),
        meta: routeMeta('Vue Flow', 'SVG 编辑器 · Vue 3 原生 · 节点即 Vue 组件')
      },
      {
        path: 'antv-x6',
        name: 'FlowAntvX6',
        component: () => import('@/views/flow/FlowAntvX6View.vue'),
        meta: routeMeta('AntV X6', 'SVG 编辑器 · 企业级 MVC · 虚拟渲染')
      },
      {
        path: 'logicflow',
        name: 'FlowLogicFlow',
        component: () => import('@/views/flow/FlowLogicFlowView.vue'),
        meta: routeMeta('LogicFlow', 'SVG 编辑器 · 自执行引擎 · BPMN 适配')
      },
      {
        path: 'g6',
        name: 'FlowG6',
        component: () => import('@/views/flow/FlowG6View.vue'),
        meta: routeMeta('G6', 'Canvas 可视化 · 三模式渲染 · 布局算法丰富')
      },
      {
        path: 'konva',
        name: 'FlowKonva',
        component: () => import('@/views/flow/FlowKonvaView.vue'),
        meta: routeMeta('Konva.js', 'Canvas 引擎 · 声明式图层 · 自建编辑器')
      },
      {
        path: 'pixi',
        name: 'FlowPixi',
        component: () => import('@/views/flow/FlowPixiView.vue'),
        meta: routeMeta('PixiJS', 'WebGL/Canvas 引擎 · 高性能渲染 · 自建编辑器')
      },
      {
        path: 'fabric',
        name: 'FlowFabric',
        component: () => import('@/views/flow/FlowFabricView.vue'),
        meta: routeMeta('Fabric.js', 'Canvas 引擎 · 对象模型丰富 · 自建编辑器')
      }
    ]
  },
  {
    key: 'virtual',
    path: 'virtual',
    label: '虚拟滚动',
    description: '6 种虚拟滚动方案效果与性能对比。',
    children: [
      {
        path: 'vfor-list',
        name: 'VirtualVForList',
        component: () => import('@/views/virtual/VForListView.vue'),
        meta: routeMeta('v-for 列表')
      },
      {
        path: 'vueuse-list',
        name: 'VirtualVueuseList',
        component: () => import('@/views/virtual/VueuseListView.vue'),
        meta: routeMeta('VueUse 列表')
      },
      {
        path: 'virtual-scroller-list',
        name: 'VirtualVirtualScrollerList',
        component: () => import('@/views/virtual/VirtualScrollerListView.vue'),
        meta: routeMeta('VirtualScroller 列表')
      },
      {
        path: 'tanstack-list',
        name: 'VirtualTanStackList',
        component: () => import('@/views/virtual/TanStackListView.vue'),
        meta: routeMeta('TanStack 列表')
      },
      {
        path: 'el-table-v2-list',
        name: 'VirtualElTableV2List',
        component: () => import('@/views/virtual/ElTableV2ListView.vue'),
        meta: routeMeta('ElTableV2 列表')
      },
      {
        path: 'ag-grid-list',
        name: 'VirtualAgGridList',
        component: () => import('@/views/virtual/AgGridListView.vue'),
        meta: routeMeta('AG Grid 列表')
      },
      {
        path: 'vfor-tree',
        name: 'VirtualVForTree',
        component: () => import('@/views/virtual/VForTreeView.vue'),
        meta: routeMeta('v-for 树')
      },
      {
        path: 'vueuse-tree',
        name: 'VirtualVueuseTree',
        component: () => import('@/views/virtual/VueuseTreeView.vue'),
        meta: routeMeta('VueUse 树')
      },
      {
        path: 'virtual-scroller-tree',
        name: 'VirtualVirtualScrollerTree',
        component: () => import('@/views/virtual/VirtualScrollerTreeView.vue'),
        meta: routeMeta('VirtualScroller 树')
      },
      {
        path: 'tanstack-tree',
        name: 'VirtualTanStackTree',
        component: () => import('@/views/virtual/TanStackTreeView.vue'),
        meta: routeMeta('TanStack 树')
      },
      {
        path: 'el-table-v2-tree',
        name: 'VirtualElTableV2Tree',
        component: () => import('@/views/virtual/ElTableV2TreeView.vue'),
        meta: routeMeta('ElTableV2 树')
      },
      {
        path: 'ag-grid-tree',
        name: 'VirtualAgGridTree',
        component: () => import('@/views/virtual/AgGridTreeView.vue'),
        meta: routeMeta('AG Grid 树')
      },
      {
        path: 'vfor-table',
        name: 'VirtualVForTable',
        component: () => import('@/views/virtual/VForTableView.vue'),
        meta: routeMeta('v-for 表格')
      },
      {
        path: 'vueuse-table',
        name: 'VirtualVueuseTable',
        component: () => import('@/views/virtual/VueuseTableView.vue'),
        meta: routeMeta('VueUse 表格')
      },
      {
        path: 'virtual-scroller-table',
        name: 'VirtualVirtualScrollerTable',
        component: () => import('@/views/virtual/VirtualScrollerTableView.vue'),
        meta: routeMeta('VirtualScroller 表格')
      },
      {
        path: 'tanstack-table',
        name: 'VirtualTanStackTable',
        component: () => import('@/views/virtual/TanStackTableView.vue'),
        meta: routeMeta('TanStack 表格')
      },
      {
        path: 'el-table-v2-table',
        name: 'VirtualElTableV2Table',
        component: () => import('@/views/virtual/ElTableV2TableView.vue'),
        meta: routeMeta('ElTableV2 表格')
      },
      {
        path: 'ag-grid-table',
        name: 'VirtualAgGridTable',
        component: () => import('@/views/virtual/AgGridTableView.vue'),
        meta: routeMeta('AG Grid 表格')
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
