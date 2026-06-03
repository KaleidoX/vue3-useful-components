<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ContainerNode } from '../domain'
import type { PanelDefinition } from '../core/types'
import PanelsBar from './PanelsBar.vue'
import PanelHost from './PanelHost.vue'

const props = defineProps<{
  node: ContainerNode
  definitions: PanelDefinition[]
}>()

const emit = defineEmits<{
  'panel-select': [containerId: string, panelId: string]
  'panel-close': [containerId: string, panelId: string]
}>()

const collapsed = ref(props.node.collapsed ?? false)

const activePanel = computed(() => props.node.panels.find((p) => p.id === props.node.activeId))

const activeDef = computed(() =>
  props.definitions.find((d) => d.type === activePanel.value?.componentType)
)

function getTitle(type: string): string {
  return props.definitions.find((d) => d.type === type)?.title ?? type
}

function handleDockClick(panelId: string) {
  emit('panel-select', props.node.id, panelId === props.node.activeId ? '' : panelId)
}

const showContent = computed(
  () => !collapsed.value && (props.node.type !== 'dock' || props.node.activeId !== '')
)
</script>

<template>
  <div class="h-full w-full flex flex-col overflow-hidden bg-white dark:bg-[#0d1117]">
    <!-- Dock: icon strip header -->
    <div v-if="node.type === 'dock'" class="flex shrink-0 flex-col select-none">
      <div
        v-for="panel in node.panels"
        :key="panel.id"
        class="h-[32px] flex cursor-pointer items-center gap-1.5 border-b border-slate-200 px-2 text-[11px] transition-colors dark:border-white/[0.04]"
        :class="
          panel.id === node.activeId
            ? 'bg-blue-50 text-slate-800 border-l-[2px] border-l-blue-500 dark:bg-[#1c2230] dark:text-[#e6edf3] dark:border-l-blue-500'
            : 'text-slate-500 hover:bg-slate-50 dark:text-[#8b949e] dark:hover:bg-white/5'
        "
        @click="handleDockClick(panel.id)"
      >
        <span class="text-[11px]">{{ getTitle(panel.componentType) }}</span>
      </div>
    </div>

    <!-- Stack header -->
    <div
      v-if="node.type === 'stack' && node.panels.length > 0"
      class="h-[28px] flex shrink-0 select-none items-center gap-1 border-b border-slate-200 bg-slate-100 px-2 text-[11px] dark:border-white/[0.06] dark:bg-[#161b22]"
    >
      <template v-for="(panel, i) in node.panels" :key="panel.id">
        <button v-if="i > 0" class="border-none bg-none p-0 text-slate-300 dark:text-[#30363d]">
          ›
        </button>
        <button
          class="h-[20px] cursor-pointer rounded border-none px-2 text-[11px] transition-colors"
          :class="
            panel.id === node.activeId
              ? 'bg-blue-500 text-white'
              : 'bg-transparent text-slate-500 hover:bg-slate-200 dark:text-[#8b949e] dark:hover:bg-white/5'
          "
          @click="emit('panel-select', node.id, panel.id)"
        >
          {{ getTitle(panel.componentType) }}
        </button>
      </template>
    </div>

    <!-- Tabs bar -->
    <PanelsBar
      v-if="node.type === 'tabs' && node.panels.length > 0"
      :panels="node.panels"
      :active-id="node.activeId"
      :definitions="definitions"
      @select="(panelId) => emit('panel-select', node.id, panelId)"
      @close="(panelId) => emit('panel-close', node.id, panelId)"
    />

    <!-- Content -->
    <div v-if="showContent" class="relative flex-1 overflow-hidden">
      <PanelHost v-if="activePanel" :node="activePanel" :definition="activeDef" />
      <div
        v-else
        class="h-full w-full flex items-center justify-center text-sm text-slate-300 dark:text-[#484f58]"
      />
    </div>
  </div>
</template>
