<template>
  <WasmAppEmbed
    app-dir="wordcraft"
    title="WordCraft"
    description="纯 Rust 重写的 Microsoft Word，egui 渲染、WebAssembly 运行，支持 docx/odt/rtf/html/md 读写与 PDF 导出。"
  />
</template>

<script lang="ts" setup>
defineOptions({
  name: 'WordcraftView'
})
</script>
