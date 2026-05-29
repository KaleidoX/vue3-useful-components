<script setup lang="ts">
defineProps<{
  active: boolean
  direction: 'horizontal' | 'vertical'
}>()

const emit = defineEmits<{
  'resize-start': [event: PointerEvent]
}>()
</script>

<template>
  <div
    class="absolute z-10"
    :class="{
      'w-[4px] h-full top-0 -left-[1px]': direction === 'horizontal',
      'h-[4px] w-full left-0 -top-[1px]': direction === 'vertical'
    }"
    @pointerdown="(e) => emit('resize-start', e)"
  />
</template>
