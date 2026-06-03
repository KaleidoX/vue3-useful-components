<template>
  <div class="editor-tinymce" :class="{ 'hidden-toolbar': hiddenToolbar }" :style="styles">
    <Editor
      :init="editorConfig"
      :initial-value="modelValue"
      :disabled="readOnly"
      output-format="html"
      license-key="gpl"
      @init="handleInit"
    />
    <div class="text-right" v-if="maxLength">限制{{ maxLength }}个字</div>
  </div>
</template>

<script lang="ts" setup>
import { type CSSProperties } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import type { Editor as TinyMCEInstance } from 'tinymce'
/* Import TinyMCE */
import tinymce from 'tinymce'

/* Default icons are required. After that, import custom icons if applicable */
import 'tinymce/icons/default/icons.min.js'

/* Required TinyMCE components */
import 'tinymce/themes/silver/theme.min.js'
import 'tinymce/models/dom/model.min.js'

/* Import a skin (can be a custom skin instead of the default) */
import 'tinymce/skins/ui/oxide/skin.js'

/* Import plugins */
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/code'
import 'tinymce/plugins/emoticons'
import 'tinymce/plugins/emoticons/js/emojis'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/image'
import 'tinymce/plugins/link'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/media'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/table'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/wordcount'

/* content UI CSS is required */
import 'tinymce/skins/ui/oxide/content.js'

/* The default content CSS can be changed or replaced with appropriate CSS for the editor content. */
import 'tinymce/skins/content/default/content.js'

defineOptions({
  name: 'EditorTinyMCE'
})
;(window as unknown as Record<string, unknown>).tinymce = tinymce

let editorInstance: TinyMCEInstance | null = null

const getEditor = () => {
  return editorInstance
}

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

const simplePlugins = ['lists', 'link']
const normalPlugins =
  'advlist anchor autolink charmap code emoticons fullscreen image link lists media preview searchreplace table visualblocks wordcount'

const simpleToolbar = 'bold italic underline | bullist numlist | link'
const normalToolbar =
  'undo redo | blocks fontsize | bold italic underline strikethrough forecolor backcolor | link image media table | align | numlist bullist indent outdent | removeformat charmap emoticons | fullscreen preview'

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
      editorInstance.setContent(v)
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

const editorConfig = computed(() => ({
  height: props.height || 360,
  min_height: props.minHeight,
  menubar: false,
  promotion: false,
  base_url: '',
  plugins: props.simple ? simplePlugins : normalPlugins,
  toolbar: props.simple ? simpleToolbar : normalToolbar,
  toolbar_mode: 'sliding',
  placeholder: props.placeholder,
  readonly: props.readOnly,
  setup: (editor: TinyMCEInstance) => {
    editor.on('init', () => {
      if (props.modelValue) editor.setContent(props.modelValue)
    })
    editor.on('input change', () => {
      content.value = editor.getContent()
    })
  }
}))

function clearContent() {
  if (editorInstance) {
    editorInstance.setContent('')
    content.value = ''
  }
}

function handleInit(_evt: unknown, editor: TinyMCEInstance) {
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
.editor-tinymce {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  .tox-tinymce {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .tox-editor-container {
    flex: 1;
    min-height: 0;
  }
  &.hidden-toolbar {
    .tox-editor-header {
      display: none !important;
    }
    .tox-tinymce {
      border: 1px solid #d1d5db !important;
    }
  }
}
</style>
