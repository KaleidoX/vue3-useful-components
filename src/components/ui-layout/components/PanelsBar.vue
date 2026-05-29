<script setup lang="ts">
import type { PanelDefinition } from '../core/types'
import type { PanelNode } from '../domain'

const props = defineProps<{
  panels: PanelNode[]
  activeId: string
  definitions: PanelDefinition[]
}>()

const emit = defineEmits<{
  select: [panelId: string]
  close: [panelId: string]
}>()

function getTitle(panel: PanelNode): string {
  const def = props.definitions.find((d) => d.type === panel.componentType)
  return def?.title ?? panel.componentType
}
</script>

<template>
  <div
    class="flex shrink-0 select-none overflow-x-auto border-b border-slate-200 bg-slate-100 dark:border-white/[0.06] dark:bg-[#161b22]"
  >
    <div
      v-for="panel in panels"
      :key="panel.id"
      class="h-[32px] min-w-0 flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-r border-slate-200 px-3 text-[12px] transition-colors duration-150 dark:border-white/[0.04]"
      :class="
        panel.id === activeId
          ? 'bg-white text-slate-800 border-t border-t-blue-500 dark:bg-[#0d1117] dark:text-[#e6edf3] dark:border-t-[#2563eb]'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-[#8b949e] dark:hover:bg-[#1c2129] dark:hover:text-[#c9d1d9]'
      "
      @click="emit('select', panel.id)"
    >
      <span class="overflow-hidden text-ellipsis">{{ getTitle(panel) }}</span>
      <button
        class="cursor-pointer rounded-sm border-none bg-transparent p-0 text-[11px] leading-none opacity-0 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-[#e6edf3]"
        :class="
          panel.id === activeId
            ? 'opacity-100 text-slate-400 dark:text-[#8b949e]'
            : 'text-slate-300 dark:text-[#484f58]'
        "
        @click.stop="emit('close', panel.id)"
      >
        &times;
      </button>
    </div>
  </div>
</template>
