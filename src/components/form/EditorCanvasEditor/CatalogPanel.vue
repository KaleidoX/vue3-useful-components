<template>
  <div v-if="visible" class="catalog">
    <div class="catalog__header">
      <span>目录</span>
      <span class="catalog__close" @click="visible = false">✕</span>
    </div>
    <el-scrollbar class="catalog__body">
      <div ref="containerRef" class="catalog__main" />
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'CanvasCatalogPanel' })
import { useCanvasEditor } from './injection'

const visible = defineModel<boolean>('visible', { default: false })
const { editor, exec } = useCanvasEditor()
const containerRef = ref<HTMLElement>()

async function refresh() {
  const catalog = await (editor.value as any)?.command?.getCatalog?.()
  if (!containerRef.value || !catalog) return
  containerRef.value.innerHTML = ''
  const render = (parent: HTMLElement, items: any[]) => {
    for (const item of items) {
      const el = document.createElement('div')
      el.className = 'catalog-item'
      const span = document.createElement('span')
      span.textContent = item.name
      span.onclick = () => exec('executeLocationCatalog', item.id)
      el.appendChild(span)
      if (item.subCatalog?.length) render(el, item.subCatalog)
      parent.appendChild(el)
    }
  }
  render(containerRef.value, catalog)
}

watch(visible, (v) => {
  if (v) nextTick(refresh)
})
defineExpose({ refresh })
</script>

<style scoped>
.catalog {
  width: 200px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.catalog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  border-bottom: 1px solid #eee;
}
.catalog__close {
  cursor: pointer;
}
.catalog__main {
  padding: 4px 0;
}
</style>

<style>
.catalog-item {
  padding: 2px 0;
}
.catalog-item span {
  display: block;
  padding: 3px 12px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
  margin: 0 8px 0 0;
}
.catalog-item span:hover {
  background: #e8e8e8;
}
.catalog-item .catalog-item {
  padding-left: 12px;
}
</style>
