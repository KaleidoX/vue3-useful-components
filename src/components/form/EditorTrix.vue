<template>
  <div class="editor-trix" :class="{ 'hidden-toolbar': hiddenToolbar, 'trix-simple': simple }" :style="styles">
    <div v-if="!hiddenToolbar" class="trix-toolbar-wrapper">
      <trix-toolbar :id="toolbarId" class="trix-toolbar"></trix-toolbar>
    </div>
    <div class="trix-editor-wrapper">
      <trix-editor
        :ref="setEditorRef"
        :toolbar="hiddenToolbar ? undefined : toolbarId"
        :placeholder="placeholder"
      />
    </div>
    <div class="text-right" v-if="maxLength">限制{{ maxLength }}个字</div>
  </div>
</template>

<script lang="ts" setup>
import { type CSSProperties } from 'vue'
import 'trix'
import 'trix/dist/trix.css'

defineOptions({
  name: 'EditorTrix'
})

const toolbarId = `trix-toolbar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
let editorElement: HTMLElement | null = null

const setEditorRef = (el: unknown) => {
  editorElement = el as HTMLElement | null
}

const getEditor = () => {
  return editorElement
}

const props = defineProps({
  modelValue: {
    type: String
  },
  height: {
    type: Number,
    default: null
  },
  minHeight: {
    type: Number,
    default: 160
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  maxLength: Number,
  placeholder: {
    type: String,
    default: '请输入内容'
  },
  hiddenToolbar: {
    type: Boolean,
    default: false
  },
  simple: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['ready', 'update:modelValue'])

const content = ref(props.modelValue ?? '')

watchDebounced(
  content,
  () => {
    emit('update:modelValue', content.value)
  },
  { debounce: 200, maxWait: 5000 }
)

watch(
  () => props.modelValue,
  (v) => {
    if (!v) {
      clearContent()
    } else if (v !== content.value && editorElement) {
      // @ts-expect-error Trix editor set value
      editorElement.editor.loadHTML(v)
      content.value = v
    }
  },
  { immediate: true }
)

watch(
  () => props.readOnly,
  (val) => {
    if (editorElement) {
      editorElement.setAttribute('contenteditable', val ? 'false' : 'true')
    }
  }
)

const styles = computed(() => {
  const style: CSSProperties = {}
  if (props.minHeight) {
    style.minHeight = `${props.minHeight}px`
  }
  if (props.height) {
    style.height = `${props.height}px`
  }
  return style
})

function clearContent() {
  if (editorElement) {
    // @ts-expect-error Trix editor set value
    editorElement.editor.loadHTML('')
    content.value = ''
  }
}

function handleTrixChange() {
  if (editorElement) {
    // @ts-expect-error Trix editor get value
    content.value = editorElement.value
  }
}

function handleTrixInit() {
  if (props.modelValue && editorElement) {
    // @ts-expect-error Trix editor set value
    editorElement.editor?.loadHTML(props.modelValue)
    content.value = props.modelValue
  }
  emit('ready', editorElement)
}

function setupListeners() {
  if (!editorElement) return
  editorElement.addEventListener('trix-change', handleTrixChange)
  editorElement.addEventListener('trix-initialize', handleTrixInit)
}

function teardownListeners() {
  if (!editorElement) return
  editorElement.removeEventListener('trix-change', handleTrixChange)
  editorElement.removeEventListener('trix-initialize', handleTrixInit)
}

onMounted(() => {
  if (editorElement) {
    setupListeners()
  }
})

onUnmounted(() => {
  teardownListeners()
})

defineExpose({
  getEditor,
  clearContent
})
</script>

<style lang="scss">
.editor-trix {
  position: relative;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .trix-toolbar-wrapper {
    flex-shrink: 0;
  }

  .trix-toolbar {
    border: none;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;

    .trix-button-row {
      flex-wrap: wrap;
    }

    .trix-button-group {
      border: none;
      margin-bottom: 0;
    }
  }

  .trix-editor-wrapper {
    flex: 1;
    overflow: hidden;
    min-height: 0;

    trix-editor {
      min-height: 160px;
      outline: none;
      border: none !important;
      overflow-y: auto !important;
      display: block;
      height: 100%;
    }
  }

  &.hidden-toolbar {
    .trix-toolbar-wrapper {
      display: none !important;
    }
  }

  &.trix-simple {
    .trix-button-group--block-tools,
    .trix-button-group--file-tools {
      display: none !important;
    }
  }
}

.trix-button-group--file-tools {
  display: none !important;
}
</style>
