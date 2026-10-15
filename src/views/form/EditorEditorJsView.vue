<template>
  <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <EditorEditorJs v-model="content1" :height="editorHeight" />
    <EditorEditorJs v-model="content2" :height="editorHeight" simple />
  </section>
</template>

<script lang="ts" setup>
import { usePreviewContentHeight } from '@/composables/usePreviewContentHeight'
import TestContent from '@/views/form/assets/test.html?raw'

const content1 = ref(TestContent)
const content2 = ref(TestContent)

const { width, contentHeight } = usePreviewContentHeight()

const editorHeight = computed(() => {
  const fullHeight = contentHeight.value - 60
  return width.value > 1024 ? fullHeight : Math.ceil((fullHeight - 4 * 10) / 2)
})
</script>
