<template>
  <WasmAppEmbed
    app-dir="pdfcraft"
    title="PdfCraft"
    description="纯 Rust 从零实现的 PDF 阅读与编辑器，egui 渲染、WebAssembly 运行，书签、缩略图、文本抽取与页面编辑。"
  />
</template>

<script lang="ts" setup>
defineOptions({
  name: 'PdfcraftView'
})
</script>
