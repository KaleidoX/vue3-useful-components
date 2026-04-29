<template>
  <div class="canvas-editor-root" :style="{ height: height || '600px' }">
    <slot name="toolbar" :show-search="showSearch">
      <Toolbar v-model:show-search="showSearch" />
    </slot>

    <SearchPanel v-if="showSearch" @close="showSearch = false" />

    <div class="canvas-body">
      <CatalogPanel ref="catalogRef" v-model:visible="showCatalog" />
      <div ref="editorRef" class="editor" />
      <CommentPanel v-model:visible="showComment" />
    </div>

    <FooterBar v-model:show-catalog="showCatalog" />
  </div>
</template>

<script lang="ts" setup>
import Editor from '@hufe921/canvas-editor'
import type { IElement } from '@hufe921/canvas-editor'
import floatingToolbarPlugin from '@hufe921/canvas-editor-plugin-floating-toolbar'
import { CANVAS_EDITOR_KEY } from './injection'
import type { CanvasEditorContext, RangeStylePayload, PageState } from './injection'
import Toolbar from './Toolbar.vue'
import SearchPanel from './toolbar/SearchPanel.vue'
import CatalogPanel from './CatalogPanel.vue'
import CommentPanel from './CommentPanel.vue'
import FooterBar from './FooterBar.vue'
import './toolbar.scss'

defineOptions({ name: 'EditorCanvasEditor' })

const props = defineProps<{ height?: string; content?: { value: string; size?: number; bold?: boolean }[] }>()
const emit = defineEmits<{ ready: [editor: Editor] }>()

const editorRef = ref<HTMLDivElement>()
const editor = shallowRef<any>(null)
const rangeStyle = reactive<RangeStylePayload>({})

function exec(name: string, ...args: any[]) {
  return editor.value?.command?.[name]?.(...args)
}

// ---- page state ----
const currentPage = ref(1)
const totalPages = ref(1)
const wordCount = ref(0)
const lineCount = ref(0)
const colCount = ref(0)
const isPaging = ref(true)
const modeNames = ['编辑模式', '整洁模式', '只读模式', '表单模式', '打印模式', '设计模式', '涂鸦模式']
const modeKeys = ['edit', 'clean', 'readonly', 'form', 'print', 'design', 'graffiti']
let modeIndex = 0
const currentMode = ref(modeNames[0])

function cycleMode() {
  modeIndex = (modeIndex + 1) % modeNames.length
  currentMode.value = modeNames[modeIndex]
  exec('executeMode', modeKeys[modeIndex])
}
function togglePageMode() {
  isPaging.value = !isPaging.value
  exec('executePageMode', isPaging.value ? 'paging' : 'continuity')
}

const pageState: PageState = { currentPage, totalPages, wordCount, lineCount, colCount, currentMode, isPaging, cycleMode, togglePageMode }

provide<CanvasEditorContext>(CANVAS_EDITOR_KEY, { editor, exec, rangeStyle, pageState })

// ---- ui state ----
const showSearch = ref(false)
const showCatalog = ref(false)
const showComment = ref(false)
const catalogRef = ref<InstanceType<typeof CatalogPanel>>()

onMounted(() => {
  if (!editorRef.value) return

  const initialData: IElement[] = props.content?.length
    ? props.content.map(item => ({ value: item.value, size: item.size, bold: item.bold }))
    : [
        { value: 'Canvas Editor', size: 40, bold: true },
        { value: '' },
        { value: '基于 Canvas 渲染的富文本编辑器。支持分页、表格、图片、数学公式等。' }
      ]

  const instance = new Editor(editorRef.value, initialData)
  try { instance.use(floatingToolbarPlugin) } catch { /* */ }

  const listener = (instance as any).listener
  if (listener) {
    if (listener.rangeStyleChange !== undefined) {
      listener.rangeStyleChange = (payload: any) => {
        Object.assign(rangeStyle, pickRangeStyle(payload))
      }
    }
    if (listener.visiblePageNoListChange !== undefined) {
      listener.visiblePageNoListChange = (payload: number[]) => {
        if (payload.length > 0) {
          currentPage.value = payload[0]
          totalPages.value = Math.max(...payload)
        }
      }
    }
    if (listener.positionContextChange !== undefined) {
      listener.positionContextChange = (payload: any) => {
        const ctx = payload?.value ?? payload
        if (ctx?.index !== undefined) colCount.value = ctx.index + 1
        if (ctx?.rowNo !== undefined) lineCount.value = ctx.rowNo + 1
      }
    }
    if (listener.contentChange !== undefined) {
      const original = listener.contentChange
      listener.contentChange = () => {
        original?.()
        void refreshWordCount()
        if (showCatalog.value) catalogRef.value?.refresh()
      }
    }
    if (listener.pageModeChange !== undefined) {
      listener.pageModeChange = (mode: string) => {
        isPaging.value = mode === 'paging'
      }
    }
  }

  editor.value = instance
  emit('ready', instance)
})

function pickRangeStyle(p: any): RangeStylePayload {
  return { bold: p.bold, italic: p.italic, underline: p.underline, strikeout: p.strikeout, font: p.font, size: p.size }
}

async function refreshWordCount() {
  try {
    const count = await editor.value?.command?.getWordCount?.()
    if (typeof count === 'number') wordCount.value = count
  } catch { /* */ }
}

onUnmounted(() => editor.value?.destroy())
defineExpose({ getEditor: () => editor.value })
</script>

<style scoped>
.canvas-editor-root { display: flex; flex-direction: column; background: #f0f0f0; overflow: hidden; }
.canvas-body { display: flex; flex: 1; min-height: 0; }
.editor { flex: 1; min-width: 0; min-height: 0; overflow: auto; display: flex; justify-content: center; }
</style>
