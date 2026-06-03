<template>
  <div
    ref="containerRef"
    :style="{ width: '100%', height: height || '600px', overflow: 'hidden' }"
  />
</template>

<script lang="ts" setup>
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import UniverPresetDocsCoreZhCN from '@univerjs/preset-docs-core/locales/zh-CN'
import type { FUniver, Univer } from '@univerjs/presets'
import '@univerjs/preset-docs-core/lib/index.css'

defineOptions({ name: 'EditorUniverDoc' })

const { height = '600px' } = defineProps<{
  height?: string
}>()

const emit = defineEmits<{
  ready: [api: FUniver]
}>()

const containerRef = ref<HTMLElement | null>(null)
let univerInstance: Univer | null = null
let univerAPIInstance: FUniver | null = null

onMounted(() => {
  if (!containerRef.value) return

  const { univer, univerAPI } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: mergeLocales(UniverPresetDocsCoreZhCN)
    },
    presets: [UniverDocsCorePreset({ container: containerRef.value })]
  })

  univerAPI.createUniverDoc({})
  univerInstance = univer
  univerAPIInstance = univerAPI
  emit('ready', univerAPI)
})

onUnmounted(() => {
  univerInstance?.dispose()
  univerAPIInstance?.dispose()
  univerInstance = null
  univerAPIInstance = null
})

const getAPI = () => univerAPIInstance
defineExpose({ getAPI })
</script>
