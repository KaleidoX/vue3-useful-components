<script setup lang="ts">
interface Props {
  title: string
  maxCount?: number
  count: number
  contentType: string
  enableMemo: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: 100000,
})

const emit = defineEmits<{
  'update:count': [value: number]
  'update:contentType': [value: string]
  'update:enableMemo': [value: boolean]
}>()

const countSteps = computed(() => {
  if (props.maxCount <= 10000) {
    return [100, 500, 1000, 5000, 10000]
  }
  return [1000, 5000, 10000, 50000, 100000]
})

const contentTypeOptions = [
  { label: '纯文本', value: 'plain' },
  { label: 'ElCheckbox', value: 'el-checkbox' },
  { label: '原生Checkbox', value: 'native-checkbox' },
  { label: '复杂组件', value: 'complex' },
  { label: '动态高度', value: 'dynamic' },
]

const countSliderValue = ref(props.count)
const renderTime = ref<number | null>(null)

const scrollContainerRef = ref<HTMLElement | null>(null)
provide('scrollContainer', scrollContainerRef)

const selectedStep = ref(countSteps.value.indexOf(props.count) >= 0 ? props.count : countSteps.value[2])

function getClosestStep(val: number): number {
  return countSteps.value.reduce((prev, curr) =>
    Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev,
  )
}

function onSliderChange(val: number | number[]) {
  const v = Array.isArray(val) ? val[0] : val
  const step = getClosestStep(v)
  if (step === countSliderValue.value) return
  selectedStep.value = step
  countSliderValue.value = step
  emit('update:count', step)
}

const renderTimeDisplay = computed(() => {
  if (renderTime.value === null) return '—'
  return `${renderTime.value.toFixed(1)} ms`
})

async function measureRender(fn: () => void): Promise<number> {
  const start = performance.now()
  fn()
  await nextTick()
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve(performance.now() - start)
      })
    })
  })
}

onMounted(async () => {
  renderTime.value = await measureRender(() => {})
})

watch(
  () => [props.count, props.contentType, props.enableMemo],
  async () => {
    renderTime.value = await measureRender(() => {})
  },
)

defineExpose({ scrollContainerRef, measureRender })
</script>

<template>
  <div class="virtual-demo-layout">
    <div class="mb-4">
      <h2 class="mb-1 text-xl font-bold">{{ title }}</h2>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-4 rounded-lg bg-gray-50 p-3">
      <div class="flex items-center gap-2">
        <span class="whitespace-nowrap text-sm text-gray-600">数据量</span>
        <ElSlider
          :model-value="countSliderValue"
          :min="countSteps[0]"
          :max="countSteps[countSteps.length - 1]"
          :step="1"
          :show-tooltip="false"
          class="w-32!"
          @input="onSliderChange"
        />
        <span class="w-14 text-right text-sm font-mono">{{ count.toLocaleString() }}</span>
      </div>

      <div class="flex flex-wrap items-center gap-1">
        <ElRadioGroup
          :model-value="contentType"
          size="small"
          @update:model-value="(val) => emit('update:contentType', String(val))"
        >
          <ElRadioButton
            v-for="opt in contentTypeOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </ElRadioButton>
        </ElRadioGroup>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">v-memo</span>
        <ElSwitch
          :model-value="enableMemo"
          size="small"
          @update:model-value="(val) => emit('update:enableMemo', Boolean(val))"
        />
      </div>

      <div class="ml-auto flex items-center gap-2">
        <span class="text-sm text-gray-600">渲染耗时</span>
        <span class="text-sm text-blue-600 font-bold font-mono">{{ renderTimeDisplay }}</span>
      </div>
    </div>

    <div class="virtual-demo-content">
      <slot />
    </div>
  </div>
</template>
