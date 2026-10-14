<template>
  <div class="grid grid-cols-1 gap-10 p-10 lg:grid-cols-2">
    <section>
      <h2 class="mb-2 text-xl font-semibold">完整模式：当前 Markdown 契约受限</h2>
      <p class="mb-3 text-sm text-amber-700">
        底层 ProseMirror 表格能在运行时合并单元格，但 GFM Markdown 不保存 rowspan/colspan；销毁重建会丢失合并语义，因此本页不会开放合并按钮。
      </p>
      <EditorMilkdown v-model="content1" :height="editorHeight" />
    </section>
    <section>
      <h2 class="mb-2 text-xl font-semibold">简洁模式：CommonMark</h2>
      <EditorMilkdown v-model="content2" :height="editorHeight" simple />
    </section>
  </div>
</template>

<script lang="ts" setup>
import EditorMilkdown from '@/components/form/EditorMilkdown/index.vue'

import TestContent from '@/views/form/assets/test.md?raw'
import { tableMergeFixtureMarkdown } from './fixtures/tableMergeFixture'

defineOptions({
  name: 'EditorMilkdownView'
})
const content1 = ref(tableMergeFixtureMarkdown)
const content2 = ref(TestContent)

const { width, height } = useWindowSize()

const safeAreaInsetTop = parseInt(
  document.documentElement.style.getPropertyValue('--safe-area-inset-top') || '0px'
)
const safeAreaInsetBottom = parseInt(
  document.documentElement.style.getPropertyValue('--safe-area-inset-bottom') || '0px'
)

const editorHeight = computed(() => {
  const fullHeight = height.value - (46 + 4 * 10 * 2 + safeAreaInsetTop + safeAreaInsetBottom)
  return width.value > 1024 ? fullHeight : Math.ceil((fullHeight - 4 * 10) / 2)
})
</script>
