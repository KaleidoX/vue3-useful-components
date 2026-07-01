<template>
  <div class="menu-item">
    <div class="menu-item__title" @click="toggleDropdown('title')">
      <span>{{ currentTitle }}</span>
      <div v-show="ds.title" class="menu-options" @click.stop>
        <li v-for="t in titleList" :key="t.key" @click="applyTitle(t)">{{ t.label }}</li>
      </div>
    </div>
    <div title="左对齐" @click="exec('executeRowFlex', 0)"><i class="i-lucide:align-left" /></div>
    <div title="居中" @click="exec('executeRowFlex', 1)"><i class="i-lucide:align-center" /></div>
    <div title="右对齐" @click="exec('executeRowFlex', 2)"><i class="i-lucide:align-right" /></div>
    <div title="两端对齐" @click="exec('executeRowFlex', 3)">
      <i class="i-lucide:align-justify" />
    </div>
    <div title="分散对齐" @click="exec('executeRowFlex', 4)">
      <i class="i-lucide:align-center-vertical" />
    </div>
    <div class="menu-item__row-margin" @click="toggleDropdown('rowmargin')">
      <span>行距</span>
      <div v-show="ds.rowmargin" class="menu-options" @click.stop>
        <li v-for="r in rowMarginList" :key="r.value" @click="applyRowMargin(r.value)">
          {{ r.label }}
        </li>
      </div>
    </div>
    <div class="menu-item__list" @click="toggleDropdown('list')">
      <span>列表</span>
      <div v-show="ds.list" class="menu-options" @click.stop>
        <li @click="applyList(0)">无序列表</li>
        <li @click="applyList(1)">有序列表</li>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'CanvasParagraphTool' })
import { useCanvasEditor } from '../injection'
const { exec } = useCanvasEditor()
const ds = reactive<Record<string, boolean>>({})
const currentTitle = ref('正文')

const titleList = [
  { key: 'body', level: '' as string | null, label: '正文' },
  { key: 'h1', level: '1', label: '标题 1' },
  { key: 'h2', level: '2', label: '标题 2' },
  { key: 'h3', level: '3', label: '标题 3' },
  { key: 'h4', level: '4', label: '标题 4' },
  { key: 'h5', level: '5', label: '标题 5' },
  { key: 'h6', level: '6', label: '标题 6' }
]
const rowMarginList = [
  { value: 1, label: '1.0' },
  { value: 1.25, label: '1.25' },
  { value: 1.5, label: '1.5' },
  { value: 1.75, label: '1.75' },
  { value: 2, label: '2.0' },
  { value: 2.5, label: '2.5' },
  { value: 3, label: '3.0' }
]

function toggleDropdown(k: string) {
  ds[k] = !ds[k]
}
function applyTitle(t: (typeof titleList)[number]) {
  exec('executeTitle', t.level)
  currentTitle.value = t.label
  ds.title = false
}

function applyRowMargin(value: number) {
  exec('executeRowMargin', value)
  ds.rowmargin = false
}

function applyList(type: 0 | 1) {
  exec('executeList', type, null)
  ds.list = false
}
</script>
