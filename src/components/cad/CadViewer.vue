<template>
  <!-- mlightcad 内部的 .ml-cad-viewer-container 是 position:fixed（按视口定位），
       直接嵌入时会顶到页面边缘；transform 会创建新的包含块，把 fixed 子树限制在本容器内，
       使查看器呈现为嵌入区域的尺寸 -->
  <div
    class="relative w-full translate-z-0 overflow-hidden border border-gray-200 rounded-lg bg-gray-100"
    :style="{ height }"
  >
    <component :is="viewerComp" v-if="viewerComp" v-bind="$attrs" />

    <div
      v-else-if="loadError"
      class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 text-sm text-gray-600"
    >
      <span class="i-lucide:alert-triangle text-2xl text-orange-500" />
      <span>CAD 查看器加载失败：{{ loadError }}</span>
      <PreviewButton @click="load">重试</PreviewButton>
    </div>

    <div
      v-else
      class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-gray-500"
    >
      <span class="i-lucide:loader-circle animate-spin text-2xl" />
      <span>CAD 查看器加载中…</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import PreviewButton from '@/views/components/PreviewButton.vue'

/**
 * @mlightcad/cad-viewer 的懒加载包装组件：
 * - 路由进入时才拉取完整查看器 chunk（含 three.js 等）
 * - 加载中显示占位，失败显示错误与重试入口
 * - 透传所有 attrs（locale / url / localFile / background / theme 等）给 MlCadViewer
 */
defineOptions({
  name: 'CadViewer',
  inheritAttrs: false
})

withDefaults(defineProps<{ height?: string }>(), {
  height: '70vh'
})

type CadViewerComponent = unknown
const viewerComp = shallowRef<CadViewerComponent>()
const loadError = ref<string>()

const load = async () => {
  loadError.value = undefined
  try {
    const mod = await import('@mlightcad/cad-viewer')
    viewerComp.value = mod.MlCadViewer
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : String(err)
  }
}

onMounted(load)
</script>
