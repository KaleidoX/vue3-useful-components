<template>
  <WasmAppEmbed
    app-dir="cadcraft"
    title="CADCraft"
    description="纯 Rust 实现的 AutoCAD 风格 CAD 应用，egui 渲染、WebAssembly 运行，命令行驱动的绘图与编辑。"
  />
</template>

<script lang="ts" setup>
defineOptions({
  name: 'CadcraftView'
})
</script>
