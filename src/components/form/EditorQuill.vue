<template>
  <div class="editor" :class="{ 'editor-simple': simple, 'hidden-toolbar': hiddenToolbar }">
    <div class="editor" ref="editor" :style="styles"></div>
    <div class="text-right" v-if="maxLength">限制{{ maxLength }}个字</div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import 'quill/dist/quill.snow.css'
import Quill from 'quill'
import 'quill-image-uploader/dist/quill.imageUploader.min.css'
import ImageUploader from 'quill-image-uploader/src/quill.imageUploader.js'
import BlotFormatter from 'quill-blot-formatter/dist/quill-blot-formatter.min.js'
import Mention from 'quill-mention/dist/quill.mention.esm.js'
import { uploadImage } from '@/api/upload.ts'
import { formatUploadBase } from '@/utils/format.js'

defineOptions({
  name: 'EditorQuill'
})

// console.log(Quill, Quill.register)
if (!Quill.imports['modules/imageUploader']) {
  Quill.register('modules/imageUploader', ImageUploader)
}
if (!Quill.imports['modules/blotFormatter']) {
  Quill.register('modules/blotFormatter', BlotFormatter)
}
if (!Quill.imports['modules/mention']) {
  Quill.register('modules/mention', Mention)
}

const editor = ref()
let quill

const getQuill = () => {
  return quill
}
const getModule = (moduleName) => {
  return getQuill().getModule(moduleName)
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
const toolbar = props.simple
  ? [['image']]
  : [
      ['bold', 'italic', 'underline', 'strike'], // 加粗 斜体 下划线 删除线
      ['blockquote', 'code-block'], // 引用  代码块
      [{ list: 'ordered' }, { list: 'bullet' }], // 有序、无序列表
      [{ indent: '-1' }, { indent: '+1' }], // 缩进
      [{ size: ['small', false, 'large', 'huge'] }], // 字体大小
      [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题
      [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
      [{ align: [] }], // 对齐方式
      ['clean'], // 清除文本格式
      ['link', 'image', 'video'] // 链接、图片、视频
    ]
const options = {
  theme: 'snow',
  bounds: document.body,
  debug: 'error',
  placeholder: props.placeholder,
  readOnly: props.readOnly,
  modules: {
    toolbar,
    imageUploader: {
      upload: (file) => {
        return new Promise((resolve, reject) => {
          if (!handleBeforeUpload(file)) {
            return reject('error')
          }
          uploadImage(file)
            .then((res) => {
              resolve(formatUploadBase(res.url))
            })
            .catch((err) => {
              reject(err)
            })
        })
      }
    },
    blotFormatter: {},
    mention: {
      mentionDenotationChars: ['@'],
      spaceAfterInsert: false,
      // eslint-disable-next-line no-unused-vars
      source: function (searchTerm, renderList, mentionChar) {}
    }
  }
  // formats: ['bold', 'italic', 'mention']
}

const styles = computed(() => {
  let style = {}
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
      quill.pasteHTML(v || '<p></p>')
    }
  },
  { immediate: true }
)

// 上传前校检格式和大小
function handleBeforeUpload(file) {
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

// 清空内容
function clearContent() {
  const quill = getQuill()
  if (quill) {
    quill.pasteHTML('')
    quill.setSelection(0, 0)
  }
}
// 增加 mention
function addMention(mention) {
  const quill = getQuill()
  const deltaMention = quill
    .getModule('mention')
    .insertItem({ denotationChar: '@', ...mention }, true)
    .filter((item) => item.insert)
  quill.setContents(deltaMention)
  quill.setSelection(quill.getLength() + 1)
}

function init() {
  quill = new Quill(editor.value, options)
  quill.pasteHTML(content.value)
  quill.on('text-change', function () {
    const html = quill.root.innerHTML
    content.value = html
  })
  emit('ready', quill)
}

onMounted(() => {
  init()
})

// 定义组件接口
defineExpose({
  getQuill,
  getModule,
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
.quill-img {
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
