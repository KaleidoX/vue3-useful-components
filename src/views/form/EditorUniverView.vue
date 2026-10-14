<template>
  <div class="p-6 space-y-10">
    <section>
      <h2 class="mb-4 text-2xl font-bold">Univer — 电子表格</h2>
      <p class="mb-4 text-gray-500">
        完整在线电子表格，支持公式、图表、条件格式等。需 react/react-dom 依赖。
      </p>
      <p class="mb-3 text-sm text-gray-600">
        使用同一份 3×3 数据验证内置合并。电子表格按标准语义合并时只保留左上角 A1，拆分不会恢复
        A2、B1、B2。
      </p>
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
          :disabled="!univerAPI || isMerged"
          @click="mergeRange"
        >
          合并 A1:B2
        </button>
        <button
          type="button"
          class="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
          :disabled="!univerAPI || !isMerged"
          @click="splitRange"
        >
          拆分 A1:B2
        </button>
        <button
          type="button"
          class="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
          :disabled="!univerAPI"
          @click="rebuildEditor"
        >
          导出并重建
        </button>
        <button
          type="button"
          class="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          @click="resetFixture"
        >
          重置 3×3
        </button>
        <span class="text-sm text-gray-500">{{ mergeStatus }}</span>
      </div>
      <EditorUniverSheet
        :key="editorKey"
        :data="workbookData"
        height="650px"
        @ready="onReady"
      />
    </section>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :rows="evalRows" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import EditorUniverSheet from '@/components/form/EditorUniverSheet/index.vue'
import {
  createUniverTableMergeFixture,
  hasUniverMergeRange
} from '@/components/form/EditorUniverSheet/univerTableMergeFixture'
import type { FUniver, IWorkbookData } from '@univerjs/presets'
import EvaluationTable from './components/EvaluationTable.vue'

defineOptions({ name: 'EditorUniverView' })

const workbookData = ref<IWorkbookData>(createUniverTableMergeFixture())
const editorKey = ref(0)
const univerAPI = shallowRef<FUniver | null>(null)
const isMerged = ref(false)
const mergeStatus = computed(() =>
  isMerged.value ? '工作簿已包含 A1:B2 合并范围' : '当前为 3×3 未合并工作表'
)

function onReady(api: FUniver) {
  univerAPI.value = api
  const snapshot = api.getActiveWorkbook()?.save()
  isMerged.value = snapshot ? hasUniverMergeRange(snapshot) : false
}

function getFixtureRange() {
  return univerAPI.value?.getActiveWorkbook()?.getActiveSheet().getRange('A1:B2')
}

function mergeRange() {
  getFixtureRange()?.merge({ defaultMerge: true })
  isMerged.value = true
}

function splitRange() {
  getFixtureRange()?.breakApart()
  isMerged.value = false
}

function rebuildEditor() {
  const snapshot = univerAPI.value?.getActiveWorkbook()?.save()
  if (!snapshot) return
  workbookData.value = structuredClone(snapshot)
  isMerged.value = hasUniverMergeRange(snapshot)
  univerAPI.value = null
  editorKey.value += 1
}

function resetFixture() {
  workbookData.value = createUniverTableMergeFixture()
  univerAPI.value = null
  isMerged.value = false
  editorKey.value += 1
}

const evalRows = [
  ['Univer Sheet', '★★★★★', '★★★', '★', 'Apache-2.0', '★★★★★', '★★★★', '★★★★']
]
</script>
