<template>
  <button
    type="button"
    class="border rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50"
    :class="
      variant === 'primary'
        ? 'border-primary bg-primary text-white hover:bg-primary/85'
        : 'border-base-400 bg-white text-slate-700 hover:bg-base-300/70'
    "
  >
    <slot />
  </button>
</template>

<script lang="ts" setup>
/**
 * 预览页操作按钮的统一样式，收敛此前两套并存的手写类串
 * （灰描边 rounded border-gray-300 与蓝底/白底描边 rounded-xl 各一套）。
 * 状态文本（如 mergeStatus）保持普通 span，不在此组件范围。
 */
defineOptions({
  name: 'PreviewButton'
})

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary'
  }>(),
  {
    variant: 'secondary'
  }
)
</script>
