<template>
  <section class="relative h-full min-h-0 flex flex-col bg-slate-50 text-slate-800">
    <div class="z-10 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
      <div class="flex flex-wrap items-end gap-x-4 gap-y-3">
        <label class="grid min-w-32 gap-1 text-sm text-slate-700 font-medium">
          布局方向
          <select v-model="controls.direction" class="flow-select" @change="requestLayout">
            <option v-for="direction in DIRECTION_VALUES" :key="direction" :value="direction">
              {{ direction }}
            </option>
          </select>
        </label>

        <label class="grid min-w-32 gap-1 text-sm text-slate-700 font-medium">
          边路由
          <select v-model="controls.edgeRouting" class="flow-select" @change="requestLayout">
            <option
              v-for="edgeRouting in EDGE_ROUTING_VALUES"
              :key="edgeRouting"
              :value="edgeRouting"
            >
              {{ edgeRouting }}
            </option>
          </select>
        </label>

        <label class="grid min-w-32 gap-1 text-sm text-slate-700 font-medium">
          同层节点间距
          <select v-model.number="controls.nodeSpacing" class="flow-select" @change="requestLayout">
            <option
              v-for="nodeSpacing in NODE_SPACING_VALUES"
              :key="nodeSpacing"
              :value="nodeSpacing"
            >
              {{ nodeSpacing }} px
            </option>
          </select>
        </label>

        <label class="grid min-w-36 gap-1 text-sm text-slate-700 font-medium">
          层间节点间距
          <select
            v-model.number="controls.layerSpacing"
            class="flow-select"
            @change="requestLayout"
          >
            <option
              v-for="layerSpacing in LAYER_SPACING_VALUES"
              :key="layerSpacing"
              :value="layerSpacing"
            >
              {{ layerSpacing }} px
            </option>
          </select>
        </label>

        <p
          v-if="isLoading"
          class="flex items-center gap-2 pb-1 text-sm text-blue-700"
          role="status"
        >
          <span class="i-lucide:loader-circle animate-spin" aria-hidden="true" />
          正在计算布局
        </p>
      </div>

      <div
        v-if="error"
        class="mt-3 flex flex-wrap items-center gap-3 border-t border-red-100 pt-3 text-sm text-red-700"
        role="alert"
      >
        <span>布局失败：{{ error }}</span>
        <button class="flow-retry-button" type="button" @click="requestLayout">重试</button>
      </div>
    </div>

    <div class="relative min-h-0 flex-1">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :edge-types="edgeTypes"
        :default-edge-options="defaultEdgeOptions"
        :nodes-draggable="false"
        :pan-on-scroll="true"
        :zoom-on-scroll="true"
        zoom-activation-key-code="Control"
      >
        <Background />
        <Controls position="bottom-left" />
        <template #node-default="props">
          <div class="elk-flow-node">{{ props.data.label }}</div>
        </template>
      </VueFlow>
    </div>
  </section>
</template>

<script lang="ts" setup>
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import { MarkerType, useNodesInitialized, useVueFlow, VueFlow } from '@vue-flow/core'
import type { EdgeTypesObject } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import ElkSectionsEdge from './edges/ElkSectionsEdge.vue'
import {
  DEFAULT_LAYOUT_CONTROLS,
  DIRECTION_VALUES,
  EDGE_ROUTING_VALUES,
  LAYER_SPACING_VALUES,
  NODE_SPACING_VALUES
} from './elkjsWorkerGraph'
import type { LayoutControls } from './elkjsWorkerGraph'
import { useElkjsWorkerLayout } from './composables/useElkjsWorkerLayout'

defineOptions({
  name: 'FlowElkjsWorker'
})

const controls = ref<LayoutControls>({ ...DEFAULT_LAYOUT_CONTROLS })
const { nodes, edges, isLoading, error, layout, dispose } = useElkjsWorkerLayout()
const { fitView } = useVueFlow()
const nodesInitialized = useNodesInitialized()

const edgeTypes: EdgeTypesObject = markRaw({ 'elk-sections': ElkSectionsEdge })
const defaultEdgeOptions = { markerEnd: MarkerType.ArrowClosed }
let active = true
let initialFitDone = false
let layoutRequestId = 0

function fitLayout() {
  if (!active || !initialFitDone || isLoading.value || error.value || nodes.value.length === 0)
    return
  fitView({ padding: 0.2 })
}

async function requestLayout() {
  const currentRequestId = ++layoutRequestId
  await layout({ ...controls.value })
  if (!isCurrentLayoutRequest(currentRequestId)) return

  await nextTick()
  if (!isCurrentLayoutRequest(currentRequestId)) return

  fitLayout()
}

function isCurrentLayoutRequest(requestId: number) {
  return active && requestId === layoutRequestId
}

watch(nodesInitialized, (initialized) => {
  if (!active || !initialized || initialFitDone) return
  initialFitDone = true
  fitView({ padding: 0.2 })
})

onMounted(requestLayout)

onBeforeUnmount(() => {
  active = false
  layoutRequestId += 1
  dispose()
})
</script>

<style scoped>
.flow-select {
  min-height: 2.5rem;
  border: 1px solid rgb(203 213 225);
  border-radius: 0.375rem;
  background: white;
  padding: 0.375rem 2rem 0.375rem 0.625rem;
  color: rgb(30 41 59);
  outline: none;
}

.flow-select:focus-visible,
.flow-retry-button:focus-visible {
  outline: 2px solid rgb(37 99 235);
  outline-offset: 2px;
}

.flow-retry-button {
  min-height: 2.25rem;
  border: 1px solid rgb(185 28 28);
  border-radius: 0.375rem;
  padding: 0.25rem 0.75rem;
  font-weight: 600;
  transition:
    background-color 180ms ease-out,
    color 180ms ease-out;
}

.flow-retry-button:hover {
  background: rgb(254 242 242);
}

.elk-flow-node {
  box-sizing: border-box;
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  border: 1px solid rgb(37 99 235);
  border-radius: 0.375rem;
  background: white;
  color: rgb(30 64 175);
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 3px 8px rgb(15 23 42 / 12%);
}

:deep(.vue-flow__node-default) {
  box-sizing: border-box;
  width: 160px;
  height: 56px;
  padding: 0;
  border: 0;
}

@media (max-width: 640px) {
  .flow-select {
    width: 100%;
  }
}
</style>
