<template>
  <div :style="{ height: height || '400px' }">
    <Slate
      :editor="editor"
      :decorate="DEFAULT_DECORATE_FN"
      :render-element="DEFAULT_ELEMENT_RENDER"
      :render-leaf="DEFAULT_LEAF_RENDER"
      :render-text="DEFAULT_TEXT_RENDER"
      :render-chunk="DEFAULT_CHUNK_RENDER"
      :render-placeholder="DEFAULT_PLACEHOLDER_RENDER"
      @valuechange="handleChange"
    >
      <Editable class="min-h-[200px] p-4 outline-none" :placeholder="placeholder" />
    </Slate>
  </div>
</template>

<script lang="ts" setup>
import { createEditor } from 'slate'
import { Slate, Editable, DEFAULT_ELEMENT_RENDER, DEFAULT_LEAF_RENDER, DEFAULT_TEXT_RENDER, DEFAULT_CHUNK_RENDER, DEFAULT_PLACEHOLDER_RENDER, DEFAULT_DECORATE_FN } from 'slate-vue3'
import { withDOM } from 'slate-vue3/dom'
import { withHistory } from 'slate-vue3/history'

defineOptions({ name: 'EditorSlate' })

const props = withDefaults(defineProps<{
  modelValue?: any[]
  height?: string
  placeholder?: string
}>(), {
  modelValue: () => [],
  height: '400px',
  placeholder: '请输入内容...'
})

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
}>()

const editor = withHistory(withDOM(createEditor()))

const initialValue = props.modelValue.length > 0
  ? [...props.modelValue]
  : [{ type: 'paragraph', children: [{ text: '基于 Slate.js + slate-vue3 的编辑器。' }] }]

editor.children = initialValue as any
editor.onChange()

function handleChange() {
  emit('update:modelValue', [...(editor.children as any[])])
}

defineExpose({ getEditor: () => editor })
</script>
