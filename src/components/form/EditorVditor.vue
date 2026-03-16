<template>
  <div class="editor" :class="{ 'editor-simple': simple, 'hidden-toolbar': hiddenToolbar }">
    <div class="editor" ref="editor" :style="styles"></div>
    <div class="text-right" v-if="maxLength">限制{{ maxLength }}个字</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, type CSSProperties } from 'vue'
import 'vditor/dist/index.css'
import Vditor from 'vditor'
import { uploadImage } from '@/api/upload'
import { formatUploadBase } from '@/utils/format'

interface IMentionData {
  id: string
  value: string
  [key: string]: string | undefined
}

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

const toolbar: IOptions['toolbar'] = props.simple
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

const mentionAtValues: IMentionData[] = [
  { id: '1', value: 'Fredrik Sundqvist' },
  { id: '2', value: 'Patrik Sjölin' }
]
const mentionHashValues: IMentionData[] = [
  { id: '3', value: 'Fredrik Sundqvist 2' },
  { id: '4', value: 'Patrik Sjölin 2' }
]

const options: IOptions = {
  height: props.height,
  minHeight: props.minHeight,
  placeholder: props.placeholder,
  theme: 'classic',
  after: () => {
    setContents(props.modelValue)
  },
  blur(value) {
    content.value = value
  },
  mode: 'wysiwyg',
  debugger: false,
  customWysiwygToolbar: (type, element) => {
    console.log('customWysiwygToolbar :>> ', type, element)
  },
  toolbar: toolbar,
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
    add: (id, text, commentsData) => {
      console.log('id, text, commentsData :>> ', id, text, commentsData)
    },
    remove: (ids) => {
      console.log('ids :>> ', ids)
    },
    scroll: (top) => {
      console.log('top :>> ', top)
    },
    adjustTop: (commentsData) => {
      console.log('commentsData :>> ', commentsData)
    }
  },
  image: {
    isPreview: true,
    preview: (bom) => {
      console.log('image bom :>> ', bom)
    }
  },
  link: {
    isOpen: true,
    click: (bom) => {
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

// 上传前校检格式和大小
function handleBeforeUpload(file: File) {
  const type = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg']
  const isJPG = type.includes(file.type)
  //检验文件格式
  if (!isJPG) {
    ElMessage.error({ message: '图片格式错误!' })
    return false
  }
  // 校检文件大小
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize
    if (!isLt) {
      ElMessage.error({ message: `上传文件大小不能超过 ${props.fileSize} MB!` })
      return false
    }
  }
  return true
}
// 获取内容
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getContents() {
  if (vditor) {
    return vditor.getValue() || ''
  } else {
    return ''
  }
}
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
// 增加 mention
function addMention(mention: { id: string; value: string }[]) {
  console.log('mention :>> ', mention)
  // const vditor = getVditor()
  // const deltaMention = getModule('mention').insertItem({ denotationChar: '@', ...mention }, true)
  // if (deltaMention) {
  //   vditor.setContents(deltaMention)
  //   vditor.setSelection(vditor.getLength() + 1)
  // }
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
  // getModule,
  addMention,
  clearContent
})
</script>

<style lang="scss">
.editor-img-uploader {
  display: none;
}
.editor {
  position: relative;
  &.hidden-toolbar {
    .ql-toolbar {
      display: none;
    }
    .ql-container.ql-snow {
      border: 1px solid #d1d5db !important;
    }
  }
}
.editor,
.ql-toolbar {
  white-space: pre-wrap !important;
  line-height: normal !important;
}
.ql-container .ql-editor {
  min-height: 160px;
}
.editor-simple {
  .ql-toolbar {
    height: 0;
    padding: 0;
    border: none;
    .ql-image {
      position: absolute;
      right: 8px;
      bottom: 8px;
      z-index: 10;
    }
  }
  .ql-container.ql-snow {
    border: 1px solid #d1d5db !important;
  }
}
.vditor-img {
  display: none;
}
.ql-snow {
  .ql-tooltip {
    &[data-mode='link']::before {
      content: '请输入链接地址:';
    }
    &.ql-editing a.ql-action::after {
      border-right: 0;
      content: '保存';
      padding-right: 0;
    }
    &[data-mode='video']::before {
      content: '请输入视频地址:';
    }
  }
  .ql-picker {
    &.ql-size {
      .ql-picker-label,
      .ql-picker-item {
        &::before {
          content: '14px';
        }
        &[data-value='small']::before {
          content: '10px';
        }
        &[data-value='large']::before {
          content: '18px';
        }
        &[data-value='huge']::before {
          content: '32px';
        }
      }
    }
    &.ql-header {
      .ql-picker-label,
      .ql-picker-item {
        &::before {
          content: '文本';
        }
        &[data-value='1']::before {
          content: '标题1';
        }
        &[data-value='2']::before {
          content: '标题2';
        }
        &[data-value='3']::before {
          content: '标题3';
        }
        &[data-value='4']::before {
          content: '标题4';
        }
        &[data-value='5']::before {
          content: '标题5';
        }
        &[data-value='6']::before {
          content: '标题6';
        }
      }
    }
    &.ql-font {
      .ql-picker-label,
      .ql-picker-item {
        &::before {
          content: '标准字体';
        }
        &[data-value='serif']::before {
          content: '衬线字体';
        }
        &[data-value='monospace']::before {
          content: '等宽字体';
        }
      }
    }
  }
}
</style>
