<template>
  <Milkdown />
</template>

<script lang="ts" setup>
import { Milkdown, useEditor } from '@milkdown/vue'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { Crepe } from '@milkdown/crepe'

const props = defineProps<{
  modelValue?: string
  simple?: boolean
}>()
const emit = defineEmits<{
  ready: [editor: unknown]
  'update:modelValue': [value: string]
}>()

const { get, loading } = useEditor((root) => {
  if (props.simple) {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, props.modelValue || '')
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown: string) => {
          emit('update:modelValue', markdown)
        })
      })
      .use(commonmark)
      .use(listener)
  }
  const crepe = new Crepe({
    root,
    defaultValue: props.modelValue || ''
  })
  crepe.on((api) => {
    api.markdownUpdated((_ctx, markdown: string) => {
      emit('update:modelValue', markdown)
    })
  })
  return crepe
})

watch(loading, (isLoading) => {
  if (!isLoading) emit('ready', get())
})

watch(() => props.modelValue, (value) => {
  const editor = get()
  if (!editor) return
  editor.action((ctx) => {
    const current = ctx.get(defaultValueCtx)
    if (current !== value) {
      ctx.set(defaultValueCtx, value ?? '')
    }
  })
})

const instance = get()
defineExpose({
  getEditor: () => instance,
  clearContent: () => {
    instance?.action((ctx) => { ctx.set(defaultValueCtx, '') })
  }
})

onUnmounted(() => { get()?.destroy() })
</script>
