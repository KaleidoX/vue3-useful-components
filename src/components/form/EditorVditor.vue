<template>
  <div class="editor" :class="{ 'editor-simple': simple, 'hidden-toolbar': hiddenToolbar }">
    <div class="editor" ref="editor" :style="styles"></div>
    <div class="text-right" v-if="maxLength">限制{{ maxLength }}个字</div>
  </div>
</template>

<script lang="ts" setup>
import { type CSSProperties } from 'vue'
import 'vditor/dist/index.css'
import Vditor from 'vditor'

type VditorOptions = NonNullable<ConstructorParameters<typeof Vditor>[1]>

defineOptions({
  name: 'EditorVditor'
})

const editor = ref()
let vditor: Vditor

const getVditor = () => {
  return vditor
}

const props = defineProps({
  /* 编辑器的内容 */
  modelValue: {
    type: String
  },
  /* 高度 */
  height: {
    type: Number,
    default: null
  },
  /* 最小高度 */
  minHeight: {
    type: Number,
    default: 160
  },
  /* 只读 */
  readOnly: {
    type: Boolean,
    default: false
  },
  /* 上传文件大小限制(MB) */
  fileSize: {
    type: Number,
    default: 5
  },
  /* 类型（base64格式、url格式） */
  type: {
    type: String,
    default: 'url'
  },
  maxLength: Number,
  /* 占位提示信息 */
  placeholder: {
    type: String,
    default: '请输入内容'
  },
  hiddenToolbar: {
    type: Boolean,
    default: false
  },
  simple: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['ready', 'update:modelValue'])

const toolbar: VditorOptions['toolbar'] = props.simple
  ? ['upload']
  : [
      'bold',
      'italic',
      'strike',
      'link',
      '|',
      'quote',
      'code',
      '|',
      'ordered-list',
      'list',
      '|',
      'indent',
      'outdent',
      '|',
      'headings',
      '|',
      'undo',
      'redo',
      '|',
      'upload', // 链接、图片、视频
      'table'
    ]

const options: VditorOptions = {
  height: props.height,
  minHeight: props.minHeight,
  placeholder: props.placeholder,
  theme: 'classic',
  after: () => {
    setContents(props.modelValue)
  },
  blur(value: string) {
    content.value = value
  },
  mode: 'wysiwyg',
  debugger: false,
  customWysiwygToolbar: (type: string, element: HTMLElement) => {
    console.log('customWysiwygToolbar :>> ', type, element)
  },
  toolbar,
  toolbarConfig: {
    hide: false,
    pin: true
  },
  counter: {
    enable: true,
    max: props.maxLength,
    type: 'markdown'
  },
  cache: {
    enable: false
  },
  comment: {
    enable: true,
    add: (id: string, text: string, commentsData: unknown) => {
      console.log('id, text, commentsData :>> ', id, text, commentsData)
    },
    remove: (ids: string[]) => {
      console.log('ids :>> ', ids)
    },
    scroll: (top: number) => {
      console.log('top :>> ', top)
    },
    adjustTop: (commentsData: unknown) => {
      console.log('commentsData :>> ', commentsData)
    }
  },
  image: {
    isPreview: true,
    preview: (bom: unknown) => {
      console.log('image bom :>> ', bom)
    }
  },
  link: {
    isOpen: true,
    click: (bom: unknown) => {
      console.log('link bom :>> ', bom)
    }
  },
  resize: {
    enable: true
  },
  outline: {
    enable: true,
    position: 'left'
  }
}

const styles = computed(() => {
  const style: CSSProperties = {}
  if (props.minHeight) {
    style.minHeight = `${props.minHeight}px`
  }
  if (props.height) {
    style.height = `${props.height}px`
  }
  return style
})

const content = ref(props.modelValue ?? '')
watchDebounced(
  content,
  () => {
    emit('update:modelValue', content.value)
  },
  { debounce: 200, maxWait: 5000 }
)

watch(
  () => props.modelValue,
  (v) => {
    if (!v) {
      clearContent()
    } else if (v !== content.value) {
      setContents(v)
    }
  },
  { immediate: true }
)

// 设置内容
function setContents(mdContent?: string) {
  if (mdContent && vditor) {
    vditor.setValue(mdContent)
    content.value = mdContent
  }
}
// 清空内容
function clearContent() {
  if (vditor) {
    vditor.setValue('')
  }
}

function init() {
  vditor = new Vditor(editor.value, options)
  emit('ready', vditor)
}

onMounted(() => {
  init()
})
onUnmounted(() => {
  vditor?.destroy()
  // @ts-expect-error 注销 vditor 实例
  vditor = undefined
})

// 定义组件接口
defineExpose({
  getvditor: getVditor,
  clearContent
})
</script>

<style lang="scss">
.editor {
  position: relative;
}
</style>
