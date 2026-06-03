<template>
  <div
    ref="containerRef"
    :style="{ width: '100%', height: height || '600px', overflow: 'hidden' }"
  />
</template>

<script lang="ts" setup>
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import type { FUniver, Univer } from '@univerjs/presets'
import '@univerjs/preset-sheets-core/lib/index.css'

defineOptions({ name: 'EditorUniverSheet' })

const props = withDefaults(
  defineProps<{
    height?: string
    data?: object
  }>(),
  {
    height: '600px'
  }
)

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
      [LocaleType.ZH_CN]: mergeLocales(UniverPresetSheetsCoreZhCN)
    },
    presets: [UniverSheetsCorePreset({ container: containerRef.value })]
  })

  univerAPI.createWorkbook(props.data || {})
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
