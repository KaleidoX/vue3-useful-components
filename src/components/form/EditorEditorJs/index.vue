<template>
  <div class="editor-wrapper" :class="{ 'editor-simple': simple, 'hidden-toolbar': hiddenToolbar }">
    <div class="editor" ref="editorRef" :style="styles"></div>
    <div class="text-right" v-if="maxLength">限制{{ maxLength }}个字</div>
  </div>
</template>

<script lang="ts" setup>
import { type CSSProperties } from 'vue'
import EditorJS, { type EditorConfig } from '@editorjs/editorjs'
import HeaderTool from '@editorjs/header'
import ListTool from '@editorjs/list'
import EmbedTool from '@editorjs/embed'
import ImageTool from '@editorjs/image'

defineOptions({
  name: 'EditorEditorJs'
})

const editorRef = ref()
let editorjs: EditorJS

const getEditorJs = () => {
  return editorjs
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

const toolbar: EditorConfig['tools'] = props.simple
  ? {
      header: HeaderTool,
      list: ListTool
    }
  : {
      header: HeaderTool,
      embed: EmbedTool,
      list: ListTool,
      image: ImageTool
    }

const options = computed<EditorConfig>(() => ({
  minHeight: props.minHeight,
  holder: editorRef.value,
  placeholder: props.placeholder,
  readOnly: props.readOnly,
  inlineToolbar: ['bold', 'italic', 'link'],
  tools: toolbar,
  onChange: async () => {
    const savedData = await editorjs.save()
    content.value = JSON.stringify(savedData)
  }
}))

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
    } else if (v !== content.value) {
      setContents(v)
    }
  },
  { immediate: true }
)

async function getContents() {
  if (editorjs) {
    return JSON.stringify(await editorjs.save())
  }
  return ''
}

async function setContents(htmlOrJson?: string) {
  if (!htmlOrJson || !editorjs) return
  try {
    const data = JSON.parse(htmlOrJson)
    await editorjs.render(data)
  } catch {
    editorjs.blocks.renderFromHTML(htmlOrJson)
  }
  content.value = htmlOrJson
}

function clearContent() {
  if (editorjs) {
    editorjs.blocks.renderFromHTML('')
    content.value = ''
  }
}

async function init() {
  editorjs = new EditorJS(options.value)
  try {
    await editorjs.isReady
    emit('ready', editorjs)
    setContents(props.modelValue)
  } catch (reason) {
    console.log(`Editor.js initialization failed because of ${reason}`)
  }
}

onMounted(() => {
  init()
})
onUnmounted(() => {
  editorjs?.destroy()
  editorjs = undefined as unknown as EditorJS
})

defineExpose({
  getEditorJs,
  getContents,
  clearContent
})
</script>

<style lang="scss">
.editor-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  &.hidden-toolbar {
    .ce-toolbar,
    .ce-inline-toolbar {
      display: none !important;
    }
  }
  &.editor-simple {
    .ce-toolbar__plus,
    .ce-conversion-toolbar {
      display: none !important;
    }
  }
}
.editor {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  overflow-y: auto;
  .codex-editor__redactor {
    padding-bottom: 0 !important;
  }
}
</style>
