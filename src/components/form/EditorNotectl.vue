<template>
  <div class="editor" :class="{ 'editor-simple': simple, 'hidden-toolbar': hiddenToolbar }">
    <div class="editor" ref="editor" :style="styles"></div>
    <div class="text-right" v-if="maxLength">限制{{ maxLength }}个字</div>
  </div>
</template>

<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import { ThemePreset, createEditor } from '@notectl/core'
import { STARTER_FONTS } from '@notectl/core/fonts'
import { ToolbarOverflowBehavior } from '@notectl/core/plugins/toolbar'
import { createFullPreset } from '@notectl/core/presets/full'
import { CodeBlockPlugin } from '@notectl/core/plugins/code-block'
import { ImagePlugin } from '@notectl/core/plugins/image'
import { uploadImage } from '@/api/upload'
import { formatUploadBase } from '@/utils/format'
import type { NotectlEditor, NotectlEditorConfig, ToolbarConfig } from '@notectl/core'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface IMentionData {
  id: string
  value: string
  [key: string]: string | undefined
}

defineOptions({
  name: 'EditorNotectl'
})

const editor = ref()
let notectl: NotectlEditor

const getNotectl = () => {
  return notectl
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

const preset = createFullPreset({
  font: { fonts: STARTER_FONTS }
})

const toolbar: ToolbarConfig = props.simple
  ? {
      groups: [[new CodeBlockPlugin(),],[new ImagePlugin()]],
      overflow: ToolbarOverflowBehavior.Flow
    }
  : {
      groups: preset.toolbar,
      overflow: ToolbarOverflowBehavior.Flow
    }

const options: NotectlEditorConfig = {
  ...preset,
  theme: ThemePreset.Light,
  placeholder: props.placeholder,
  toolbar: toolbar
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
async function getContents() {
  const notectl = getNotectl()
  if (notectl) {
    return await notectl.getContentHTML()
  } else {
    return ''
  }
}
// 设置内容
async function setContents(html: string) {
  const notectl = getNotectl()
  if (notectl) {
    await notectl.setContentHTML(html || '<p></p>')
  }
}
// 清空内容
async function clearContent() {
  await setContents('')
}

async function init() {
  notectl = await createEditor(options)
  editor.value.appendChild(notectl)
  setContents(content.value)
  notectl.on('stateChange', async function ({ newState }) {
    console.log('Document changed:', newState.doc)
    content.value = await getContents()
  })
  emit('ready', notectl)
}

onMounted(() => {
  init()
})
onUnmounted(() => {
  notectl?.destroy()
  // @ts-expect-error 注销 notectl 实例
  notectl = undefined
})

// 定义组件接口
defineExpose({
  getNotectl,
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
.notectl-img {
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
