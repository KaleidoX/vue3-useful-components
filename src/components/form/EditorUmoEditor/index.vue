<template>
  <div ref="wrapperRef" :style="{ height: height || '600px' }">
    <UmoEditor
      ref="umoEditorRef"
      v-bind="config"
      @created="onCreated"
      @changed="onChanged"
    />
  </div>
</template>

<script lang="ts" setup>
import '@umoteam/editor/style'
import { UmoEditor } from '@umoteam/editor'

defineOptions({ name: 'EditorUmoEditor', inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string
    height?: string
    config?: Record<string, unknown>
  }>(),
  {
    modelValue: '',
    height: '600px',
    config: () => ({})
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  ready: [editor: unknown]
}>()

const editorInstance = ref<unknown>(null)
const content = ref(props.modelValue)

interface UmoEditorApi {
  setContent: (
    content: string,
    options?: { emitUpdate?: boolean; focusPosition?: 'start' | 'end' | 'all' | number | false }
  ) => void
  getContent: (format?: 'html' | 'json' | 'text') => unknown
}

interface UmoEditorEvent {
  editor: {
    getHTML: () => string
  }
}

const umoEditorRef = ref<UmoEditorApi>()
let isMounted = false
let isInitialized = false

function initializeContent() {
  if (!isMounted || isInitialized || !editorInstance.value || !umoEditorRef.value) return
  isInitialized = true
  umoEditorRef.value.setContent(props.modelValue, {
    emitUpdate: false,
    focusPosition: false
  })
  emit('ready', editorInstance.value)
}

function onCreated({ editor }: UmoEditorEvent) {
  editorInstance.value = editor
  initializeContent()
}

function onChanged({ editor }: UmoEditorEvent) {
  const value = editor.getHTML()
  content.value = value
  emit('update:modelValue', value)
}

watch(
  () => props.modelValue,
  (v) => {
    if (v === content.value) return
    content.value = v
    umoEditorRef.value?.setContent(v, {
      emitUpdate: false,
      focusPosition: false
    })
  }
)

onMounted(() => {
  isMounted = true
  initializeContent()
})

const wrapperRef = ref<HTMLElement>()
defineExpose({
  getContent: () => (umoEditorRef.value?.getContent('html') as string | undefined) ?? content.value,
  getEditor: () => editorInstance.value
})
</script>
