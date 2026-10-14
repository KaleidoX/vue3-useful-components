<template>
  <div class="editor-ckeditor" :class="{ 'hidden-toolbar': hiddenToolbar }" :style="styles">
    <ckeditor
      :editor="ClassicEditor"
      :config="editorConfig"
      v-model="content"
      :disabled="readOnly"
      @ready="handleReady"
    />
    <div class="text-right" v-if="maxLength">限制{{ maxLength }}个字</div>
  </div>
</template>

<script lang="ts" setup>
import { type CSSProperties } from 'vue'

import { ClassicEditor } from 'ckeditor5'

import { Ckeditor } from '@ckeditor/ckeditor5-vue'
import { createCKEditor5Config } from './ckeditor5Config'
import 'ckeditor5/ckeditor5.css'

defineOptions({
  name: 'EditorCKEditor5'
})

let editorInstance: ClassicEditor | null = null

const getEditor = () => editorInstance

const props = defineProps({
  modelValue: { type: String },
  height: { type: Number, default: null },
  minHeight: { type: Number, default: 160 },
  readOnly: { type: Boolean, default: false },
  maxLength: Number,
  placeholder: { type: String, default: '请输入内容' },
  hiddenToolbar: { type: Boolean, default: false },
  simple: { type: Boolean, default: false }
})
const emit = defineEmits(['ready', 'update:modelValue'])

const content = ref(props.modelValue ?? '')

watchDebounced(content, () => emit('update:modelValue', content.value), {
  debounce: 200,
  maxWait: 5000
})

watch(
  () => props.modelValue,
  (v) => {
    if (!v) clearContent()
    else if (v !== content.value && editorInstance) {
      editorInstance.setData(v)
      content.value = v
    }
  },
  { immediate: true }
)

const styles = computed(() => {
  const style: CSSProperties = {}
  if (props.minHeight) style.minHeight = `${props.minHeight}px`
  if (props.height) style.height = `${props.height}px`
  return style
})

const editorConfig = computed(() =>
  createCKEditor5Config({ simple: props.simple, placeholder: props.placeholder })
)

function clearContent() {
  if (editorInstance) {
    editorInstance.setData('')
    content.value = ''
  }
}

function handleReady(editor: ClassicEditor) {
  editorInstance = editor
  emit('ready', editor)
}

onUnmounted(() => {
  editorInstance?.destroy()
  editorInstance = null
})

defineExpose({ getEditor, clearContent })
</script>

<style lang="scss">
.editor-ckeditor {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .ck-editor {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
  }

  .ck-editor__main {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .ck-content {
    min-height: 160px;
  }

  &.hidden-toolbar {
    .ck-editor__top {
      display: none !important;
    }
    .ck-editor__main {
      border: 1px solid #d1d5db !important;
      border-radius: 4px;
    }
  }
}
</style>
