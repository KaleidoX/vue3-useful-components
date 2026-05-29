<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

import type { PanelDefinition } from '../core/types'
import type { PanelNode } from '../domain'

const props = defineProps<{
  node: PanelNode
  definition?: PanelDefinition
}>()

const resolvedComponent = computed<Component | null>(() => {
  if (!props.definition) return null
  const comp = props.definition.component
  if (typeof comp === 'object' && comp !== null) return comp as Component
  if (typeof comp === 'function') return comp as Component
  return null
})

const cachePolicy = computed(() => ({
  keepAlive: props.node.cachePolicy?.keepAlive !== false,
  maxAge: props.node.cachePolicy?.maxAge
}))
</script>

<template>
  <div class="h-full w-full bg-white text-slate-800 dark:bg-[#0d1117] dark:text-[#e6edf3]">
    <KeepAlive v-if="cachePolicy.keepAlive">
      <component :is="resolvedComponent" :key="node.id" v-bind="node.props ?? {}" />
    </KeepAlive>
    <component :is="resolvedComponent" v-else v-bind="node.props ?? {}" />
  </div>
</template>
