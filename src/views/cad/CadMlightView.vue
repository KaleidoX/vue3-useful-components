<template>
  <PreviewSection
    title="mlightcad/cad-viewer — 浏览器端 CAD 图纸查看"
    description="完全运行在浏览器端的 DXF/DWG 查看与编辑器，无后端服务。默认加载示例图纸，可通过顶部菜单打开本地文件或拖拽打开。"
  >
    <CadViewer
      locale="zh"
      theme="light"
      :url="sampleUrl"
      :height="viewerHeight + 'px'"
    />
  </PreviewSection>
</template>

<script lang="ts" setup>
import PreviewSection from '@/views/components/PreviewSection.vue'
import { usePreviewContentHeight } from '@/composables/usePreviewContentHeight'
defineOptions({
  name: 'CadMlightView'
})

// 示例图纸走 public 静态资源，BASE_URL 前缀与 GitHub Pages 子路径部署保持一致；
// cad-viewer 内部用 new URL() 解析文件名，需要完整绝对地址
const sampleUrl = new URL(
  `${import.meta.env.BASE_URL}cad-samples/block-color.dxf`,
  window.location.origin
).href

const { editorHeight: viewerHeight } = usePreviewContentHeight(80)
</script>
