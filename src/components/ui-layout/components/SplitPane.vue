<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import ResizeHandle from './ResizeHandle.vue'
import { useResize } from '../composables/useResize'
import type { LayoutSize, SplitNode } from '../domain'

const props = defineProps<{
  node: SplitNode
}>()

const emit = defineEmits<{
  'resize-end': [nodeId: string, sizes: LayoutSize[]]
  collapse: [nodeId: string, childIndex: number]
}>()

function sizeToFlex(s: LayoutSize): string {
  if (s.type === 'px') return `0 0 ${s.value}px`
  if (s.type === 'ratio') return `${s.value} ${s.value} 0`
  if (s.type === 'auto') return `1 1 0`
  return '0 0 auto'
}

function isCollapsed(index: number): boolean {
  return props.node.childStates?.[index]?.collapsed ?? false
}

function getCollapsedSize(index: number): number {
  return props.node.childStates?.[index]?.collapsedSize ?? 0
}

const containerRef = ref<HTMLElement | null>(null)

function getContainerSize(): number {
  if (!containerRef.value) return 800
  const rect = containerRef.value.getBoundingClientRect()
  return props.node.direction === 'horizontal' ? rect.width : rect.height
}

function sizesToPixelArray(): number[] {
  const total = getContainerSize()
  if (total <= 0) return props.node.sizes.map(() => 0)
  const pxTotal = props.node.sizes.filter((s) => s.type === 'px').reduce((a, s) => a + s.value, 0)
  const flexSpace = Math.max(0, total - pxTotal)
  const ratioTotal = props.node.sizes
    .filter((s) => s.type === 'ratio')
    .reduce((a, s) => a + s.value, 0)
  const autoCount = props.node.sizes.filter((s) => s.type === 'auto').length
  const unitCount = Math.max(1, ratioTotal + autoCount)

  return props.node.sizes.map((s, i) => {
    if (isCollapsed(i)) return getCollapsedSize(i)
    if (s.type === 'px') return s.value
    if (s.type === 'ratio') return (s.value / unitCount) * flexSpace
    if (s.type === 'auto') return (1 / unitCount) * flexSpace
    return 0
  })
}

const initialPx = sizesToPixelArray()
const { localSizes, isDragging, onPointerDown } = useResize(initialPx, {
  minSizes: props.node.minSizes,
  maxSizes: props.node.maxSizes,
  direction: props.node.direction,
  onEnd: handleResizeEnd
})

const holdPixel = ref(false)

watch(
  () => props.node.sizes,
  () => {
    holdPixel.value = false
  }
)

function handleResizeEnd() {
  const total = localSizes.value.reduce((a, b) => a + b, 0)
  if (total <= 0) return
  const newSizes: LayoutSize[] = localSizes.value.map((s) => ({
    type: 'ratio' as const,
    value: s / total
  }))
  holdPixel.value = true
  emit('resize-end', props.node.id, newSizes)
}

function handlePointerDown(index: number, event: PointerEvent) {
  const total = getContainerSize()
  if (total > 0) {
    const px = sizesToPixelArray()
    initialPx.splice(0, initialPx.length, ...px)
    localSizes.value = [...px]
  }
  onPointerDown(index, event)
}

const localFlex = computed(() => {
  if (isDragging.value || holdPixel.value) {
    return localSizes.value.map((s) => `0 0 ${s}px`)
  }
  return props.node.sizes.map((s, i) => {
    if (isCollapsed(i)) return `0 0 ${getCollapsedSize(i)}px`
    return sizeToFlex(s)
  })
})
</script>

<template>
  <div
    ref="containerRef"
    class="ui-layout-split-pane h-full w-full flex overflow-hidden bg-slate-50 dark:bg-[#0d1117]"
    :class="node.direction === 'horizontal' ? 'flex-row' : 'flex-col'"
  >
    <template v-for="(child, index) in node.children" :key="child.id">
      <div
        v-if="index > 0"
        class="relative z-10 flex shrink-0 items-center gap-0 transition-colors duration-200"
      >
        <!-- Collapse button -->
        <button
          class="h-full w-[14px] flex shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-[10px] text-slate-400 leading-none hover:bg-slate-100 dark:text-[#484f58] hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-[#c9d1d9]"
          :class="node.direction === 'horizontal' ? '' : 'w-full h-[14px]'"
          :aria-label="`Collapse left panel ${index - 1}`"
          @click="emit('collapse', node.id, index - 1)"
        >
          {{ node.direction === 'horizontal' ? '«' : '»' }}
        </button>
        <!-- Resize handle -->
        <div
          :class="[
            node.direction === 'horizontal'
              ? 'w-[1px] cursor-col-resize h-full bg-slate-200 hover:bg-blue-400 dark:bg-white/8 dark:hover:bg-blue-500/60'
              : 'h-[1px] cursor-row-resize w-full bg-slate-200 hover:bg-blue-400 dark:bg-white/8 dark:hover:bg-blue-500/60',
            isDragging ? 'bg-blue-400 dark:bg-blue-500/60' : ''
          ]"
        >
          <ResizeHandle
            :active="isDragging"
            :direction="node.direction"
            @resize-start="(e) => handlePointerDown(index - 1, e)"
          />
        </div>
        <!-- Collapse button (other side) -->
        <button
          class="h-full w-[14px] flex shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-[10px] text-slate-400 leading-none hover:bg-slate-100 dark:text-[#484f58] hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-[#c9d1d9]"
          :class="node.direction === 'horizontal' ? '' : 'w-full h-[14px]'"
          @click="emit('collapse', node.id, index)"
        >
          {{ node.direction === 'horizontal' ? '»' : '«' }}
        </button>
      </div>
      <div class="overflow-hidden" :style="{ flex: localFlex[index], contain: 'layout style' }">
        <div v-if="isCollapsed(index)" class="h-full w-full flex items-center justify-center">
          <button
            class="h-full w-full cursor-pointer border-none bg-slate-100 text-[10px] text-slate-400 dark:bg-[#161b22] hover:bg-slate-200 dark:text-[#8b949e] dark:hover:bg-[#1c2129]"
            @click="emit('collapse', node.id, index)"
          >
            {{ node.direction === 'horizontal' ? '▶' : '▼' }}
          </button>
        </div>
        <slot v-else :name="child.id" />
      </div>
    </template>
  </div>
</template>
