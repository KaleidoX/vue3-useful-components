<script setup lang="ts">
import {
  LayoutRenderer,
  useLayoutStore,
  createContainerNode,
  createPanelNode,
  createSplitNode,
  generateId
} from '@/components/ui-layout'
import type { LayoutNode, PanelDefinition } from '@/components/ui-layout'
import { resizeNode } from '@/components/ui-layout/engine/actions/resize'
import { splitNode } from '@/components/ui-layout/engine/actions/split'
import { addPanel } from '@/components/ui-layout/engine/actions/add-panel'
import { closePanel } from '@/components/ui-layout/engine/actions/close-panel'
import { activatePanel } from '@/components/ui-layout/engine/actions/activate-panel'
import { toggleCollapse } from '@/components/ui-layout/engine/actions/toggle-collapse'

defineOptions({
  name: 'LayoutDemoView',
})

// --- Demo panel components ---
const DemoPanelA = defineComponent({
  name: 'DemoPanelA',
  props: { label: { type: String, default: '' } },
  setup(props) {
    const count = ref(0)
    return () =>
      h('div', { class: 'p-5 h-full' }, [
        h('h3', { class: 'text-lg font-semibold mb-3' }, [
          `面板 A${props.label ? ` - ${props.label}` : ''}`
        ]),
        h('p', { class: 'text-sm text-slate-500 mb-4' }, `计数: ${count.value}`),
        h(
          'button',
          {
            class:
              'px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 cursor-pointer border-none',
            onClick: () => count.value++
          },
          '点击 +1'
        )
      ])
  }
})

const DemoPanelB = defineComponent({
  name: 'DemoPanelB',
  setup() {
    const name = ref('')
    return () =>
      h('div', { class: 'p-5 h-full' }, [
        h('h3', { class: 'text-lg font-semibold mb-3' }, '属性面板'),
        h('p', { class: 'text-sm text-slate-500' }, '这是一个属性面板的内容区域。'),
        h('div', { class: 'mt-4 space-y-2' }, [
          h('label', { class: 'block text-[12px] text-slate-400' }, '名称'),
          h('input', {
            class:
              'w-full px-2 py-1 text-sm border border-slate-200 rounded dark:border-white/10 dark:bg-white/5 outline-none',
            placeholder: '输入名称...',
            value: name.value,
            onInput: (e: Event) => (name.value = (e.target as HTMLInputElement).value)
          }),
          h('label', { class: 'block text-[12px] text-slate-400 mt-2' }, '描述'),
          h('textarea', {
            class:
              'w-full px-2 py-1 text-sm border border-slate-200 rounded dark:border-white/10 dark:bg-white/5 outline-none resize-none',
            rows: 3,
            placeholder: '输入描述...'
          })
        ])
      ])
  }
})

const DemoPanelC = defineComponent({
  name: 'DemoPanelC',
  setup() {
    const logs = ref([
      { text: 'System ready.', color: 'text-blue-500' },
      { text: 'Layout initialized.', color: 'text-green-500' },
      { text: 'Waiting for input...', color: 'text-slate-400' }
    ])
    const input = ref('')
    function submit() {
      if (!input.value.trim()) return
      logs.value.push({ text: `> ${input.value}`, color: 'text-slate-600 dark:text-[#c9d1d9]' })
      input.value = ''
    }
    return () =>
      h('div', { class: 'p-5 h-full flex flex-col' }, [
        h('h3', { class: 'text-lg font-semibold mb-3' }, '控制台'),
        h(
          'div',
          {
            class:
              'flex-1 text-[12px] font-mono bg-slate-100 dark:bg-white/5 p-3 rounded overflow-auto'
          },
          logs.value.map((log, i) =>
            h('div', { key: i, class: log.color }, log.text)
          )
        ),
        h('div', { class: 'flex gap-2 mt-2' }, [
          h('input', {
            class:
              'flex-1 px-2 py-1 text-sm border border-slate-200 rounded dark:border-white/10 dark:bg-white/5 outline-none',
            placeholder: '输入命令...',
            value: input.value,
            onInput: (e: Event) => (input.value = (e.target as HTMLInputElement).value),
            onKeydown: (e: KeyboardEvent) => {
              if (e.key === 'Enter') submit()
            }
          }),
          h(
            'button',
            {
              class:
                'px-3 py-1 text-xs bg-slate-200 rounded hover:bg-slate-300 cursor-pointer border-none dark:bg-white/10 dark:hover:bg-white/20 dark:text-[#c9d1d9]',
              onClick: submit
            },
            '发送'
          )
        ])
      ])
  }
})

// Panel definitions
const panelDefs: PanelDefinition[] = [
  { type: 'panel-a', component: DemoPanelA, title: '面板 A' },
  { type: 'panel-b', component: DemoPanelB, title: '属性面板' },
  { type: 'panel-c', component: DemoPanelC, title: '控制台' }
]

// Build default layout
function buildDefaultLayout(): LayoutNode {
  const c1 = createContainerNode(
    'main_container',
    'tabs',
    [createPanelNode('p1', 'panel-a', { label: 'Main' }), createPanelNode('p2', 'panel-c')],
    'p1'
  )
  const c2 = createContainerNode('side_container', 'tabs', [createPanelNode('p3', 'panel-b')], 'p3')
  return createSplitNode('root', 'horizontal', [c1, c2], [
    { type: 'ratio', value: 3 },
    { type: 'ratio', value: 1 }
  ])
}

const store = useLayoutStore()
if (!store.root) {
  store.setRoot(buildDefaultLayout())
}

const currentRoot = computed(() => store.root)
const layoutVersion = computed(() => store.version)

// --- Event handlers ---
function handleResizeEnd(nodeId: string, sizes: any[]) {
  if (!currentRoot.value) return
  store.setRoot(resizeNode(currentRoot.value, nodeId, sizes))
}

function handleCollapse(nodeId: string, childIndex: number) {
  if (!currentRoot.value) return
  store.setRoot(toggleCollapse(currentRoot.value, nodeId, childIndex))
}

function handlePanelSelect(containerId: string, panelId: string) {
  if (!currentRoot.value) return
  store.setRoot(activatePanel(currentRoot.value, containerId, panelId))
}

function handlePanelClose(containerId: string, panelId: string) {
  if (!currentRoot.value) return
  store.setRoot(closePanel(currentRoot.value, containerId, panelId))
}

function handleUndo() {
  store.undo()
}

function handleRedo() {
  store.redo()
}

function handleSplit(containerId: string) {
  if (!currentRoot.value) return
  store.setRoot(splitNode(currentRoot.value, containerId, 'vertical'))
}

function handleAddPanel(containerId: string) {
  if (!currentRoot.value) return
  const p = createPanelNode(generateId(), 'panel-a', { label: '新增' })
  store.setRoot(addPanel(currentRoot.value, containerId, p))
}
</script>

<template>
  <div class="h-[75vh] min-h-[400px] flex flex-col bg-slate-50 dark:bg-[#0d1117]">
    <!-- Toolbar -->
    <div
      class="h-[40px] flex shrink-0 select-none items-center gap-2 border-b border-slate-200 bg-white px-4 dark:border-white/[0.06] dark:bg-[#161b22]"
    >
      <button
        class="cursor-pointer border border-slate-200 rounded bg-white px-3 py-1 text-xs dark:border-white/10 dark:bg-transparent hover:bg-slate-50 dark:text-[#c9d1d9] dark:hover:bg-white/5"
        @click="handleUndo"
      >
        撤销
      </button>
      <button
        class="cursor-pointer border border-slate-200 rounded bg-white px-3 py-1 text-xs dark:border-white/10 dark:bg-transparent hover:bg-slate-50 dark:text-[#c9d1d9] dark:hover:bg-white/5"
        @click="handleRedo"
      >
        重做
      </button>
      <div class="h-5 w-px bg-slate-200 dark:bg-white/10" />
      <button
        class="cursor-pointer border border-blue-200 rounded bg-blue-50 px-3 py-1 text-xs text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-500/20"
        @click="handleSplit('main_container')"
      >
        拆分 Main
      </button>
      <button
        class="cursor-pointer border border-blue-200 rounded bg-blue-50 px-3 py-1 text-xs text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-500/20"
        @click="handleAddPanel('main_container')"
      >
        添加面板
      </button>
      <div class="flex-1" />
      <span class="text-[11px] text-slate-400">版本: {{ layoutVersion }}</span>
    </div>
    <!-- Render area -->
    <div class="flex-1 overflow-hidden">
      <LayoutRenderer
        v-if="currentRoot"
        :node="currentRoot"
        :definitions="panelDefs"
        @resize-end="handleResizeEnd"
        @collapse="handleCollapse"
        @panel-select="handlePanelSelect"
        @panel-close="handlePanelClose"
      />
      <div v-else class="h-full w-full flex items-center justify-center text-sm text-slate-400">
        暂无布局
      </div>
    </div>
  </div>
</template>
