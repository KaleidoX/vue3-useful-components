<template>
  <section class="grid grid-cols-1 gap-10 p-10 lg:grid-cols-2">
    <EditorCKEditor5 v-model="content1" :height="editorHeight" />
    <EditorCKEditor5 v-model="content2" :height="editorHeight" simple />
  </section>
</template>

<script lang="ts" setup>
import TestContent from '@/views/form/assets/test.html?raw'

defineOptions({
  name: 'EditorCKEditor5View'
})
const content1 = ref(TestContent)
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
