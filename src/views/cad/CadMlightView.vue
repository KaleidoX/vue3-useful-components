<template>
  <section class="p-6">
    <h2 class="mb-4 text-2xl font-bold">mlightcad/cad-viewer — 浏览器端 CAD 图纸查看</h2>
    <p class="mb-4 text-gray-500">
      完全运行在浏览器端的 DXF/DWG 查看与编辑器，无后端服务。默认加载示例图纸，可通过顶部菜单打开本地文件或拖拽打开。
    </p>
    <CadViewer
      locale="zh"
      theme="light"
      :url="sampleUrl"
      :height="viewerHeight + 'px'"
    />
  </section>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'CadMlightView'
})

// 示例图纸走 public 静态资源，BASE_URL 前缀与 GitHub Pages 子路径部署保持一致；
// cad-viewer 内部用 new URL() 解析文件名，需要完整绝对地址
const sampleUrl = new URL(
  `${import.meta.env.BASE_URL}cad-samples/block-color.dxf`,
  window.location.origin
).href

const { height } = useWindowSize()

const viewerHeight = computed(() => Math.max(480, height.value - 220))
</script>
