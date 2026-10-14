<template>
  <div class="grid grid-cols-1 gap-10 p-10 lg:grid-cols-2">
    <section>
      <h2 class="mb-2 text-xl font-semibold">完整模式：官方 Table 插件</h2>
      <p class="mb-3 text-sm text-gray-600">
        在表格中选中 A1:B2，通过浮动表格工具栏的“合并单元格”操作；随后重建编辑器验证 HTML
        回读，并可从同一按钮拆分。
      </p>
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          @click="rebuildEditor"
        >
          重建编辑器
        </button>
        <span class="text-sm text-gray-500">{{ mergeStatus }}</span>
      </div>
      <EditorCKEditor5
        :key="editorKey"
        ref="editorRef"
        v-model="content1"
        :height="editorHeight"
      />
    </section>
    <section>
      <h2 class="mb-2 text-xl font-semibold">简洁模式：保持无表格入口</h2>
      <EditorCKEditor5 v-model="content2" :height="editorHeight" simple />
    </section>
  </div>
</template>

<script lang="ts" setup>
import EditorCKEditor5 from '@/components/form/EditorCKEditor5/index.vue'
import TestContent from '@/views/form/assets/test.html?raw'
import { tableMergeFixtureHtml } from './fixtures/tableMergeFixture'

defineOptions({
  name: 'EditorCKEditor5View'
})
const editorRef = ref<InstanceType<typeof EditorCKEditor5>>()
const editorKey = ref(0)
const content1 = ref(tableMergeFixtureHtml)
const content2 = ref(TestContent)
const mergeStatus = computed(() =>
  /(?:rowspan|colspan)=["']2["']/.test(content1.value)
    ? '当前 HTML 已包含合并跨度'
    : '当前为 3×3 未合并表格'
)

function rebuildEditor() {
  content1.value = editorRef.value?.getEditor()?.getData() ?? content1.value
  editorKey.value += 1
}

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
