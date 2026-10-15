<template>
  <WasmAppEmbed
    app-dir="gridcraft"
    title="GridCraft"
    description="纯 Rust 重写的 Microsoft Excel 风格电子表格，egui 渲染、WebAssembly 运行，支持 xlsx/csv 读写与公式计算。"
  />
</template>

<script lang="ts" setup>
defineOptions({
  name: 'GridcraftView'
})
</script>
