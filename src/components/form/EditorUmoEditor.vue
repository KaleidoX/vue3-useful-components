<template>
  <div ref="wrapperRef" :style="{ height: height || '600px' }">
    <UmoEditor v-model="content" :config="mergedConfig" @ready="onReady" />
  </div>
</template>

<script lang="ts" setup>
import '@umoteam/editor/style'
import { UmoEditor } from '@umoteam/editor'

defineOptions({ name: 'EditorUmoEditor', inheritAttrs: false })

const props = withDefaults(defineProps<{
  modelValue?: string
  height?: string
  config?: Record<string, unknown>
}>(), {
  modelValue: '',
  height: '600px',
  config: () => ({})
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  ready: [editor: unknown]
}>()

const editorInstance = ref<unknown>(null)
const content = ref(props.modelValue)

const mergedConfig = computed(() => ({
  page: { show: false },
  document: { title: '文档' },
  editor: { placeholder: '请输入内容...' },
  toolbar: { enable: true },
  ...props.config
}))

function onReady(editor: unknown) {
  editorInstance.value = editor
  emit('ready', editor)
}

watch(content, (v) => emit('update:modelValue', v))
watch(() => props.modelValue, (v) => { if (v !== content.value) content.value = v })

const wrapperRef = ref<HTMLElement>()
defineExpose({ getContent: () => content.value, getEditor: () => editorInstance.value })
</script>
