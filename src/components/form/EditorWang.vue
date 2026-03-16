<template>
  <div class="editor" :style="{ height: props.height }">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editor"
      :defaultConfig="toolbar"
      :mode="props.simple ? 'simple' : 'default'"
    />
    <Editor v-model="modelValue" :defaultConfig="options" @onCreated="handleCreated" />
    <div class="text-right" v-if="maxLength">限制{{ maxLength }}个字</div>
  </div>
</template>

<script lang="ts" setup>
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { uploadImage } from '@/api/upload'
import { formatUploadBase } from '@/utils/format'

import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

interface IMentionData {
  id: string
  value: string
  [key: string]: string | undefined
}

const editor = shallowRef<IDomEditor>()

const getWang = () => {
  return editor.value
}

const modelValue = defineModel<string>()

const props = defineProps({
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

const toolbar: Partial<IToolbarConfig> = props.simple
  ? { toolbarKeys: ['insertImage'] }
  : {
      toolbarKeys: [
        // 菜单 key
        'headerSelect',

        // 分割线
        '|',

        // 菜单 key
        'bold',
        'italic',

        // 菜单组，包含多个菜单
        {
          key: 'group-more-style', // 必填，要以 group 开头
          title: '更多样式', // 必填
          iconSvg: '<svg>....</svg>', // 可选
          menuKeys: ['through', 'code', 'clearStyle'] // 下级菜单 key ，必填
        }
        // 继续配置其他菜单...
      ]
    }

const mentionAtValues: IMentionData[] = [
  { id: '1', value: 'Fredrik Sundqvist' },
  { id: '2', value: 'Patrik Sjölin' }
]
const mentionHashValues: IMentionData[] = [
  { id: '3', value: 'Fredrik Sundqvist 2' },
  { id: '4', value: 'Patrik Sjölin 2' }
]

const options: IEditorConfig = {
  placeholder: props.placeholder,
  readOnly: props.readOnly,
  autoFocus: true,
  scroll: true,
  maxLength: props.maxLength,
  hoverbarKeys: {
    link: {
      // 重写 link 元素的 hoverbar
      menuKeys: ['editLink', 'unLink', 'viewLink']
    },
    image: {
      // 清空 image 元素的 hoverbar
      menuKeys: []
    }
  },
  customAlert: (info, type) => {
    console.log('EdirtorWang customAlert :>> ', info, type);
  },
}

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
  if (editor.value) {
    if (editor.value.getText().trim() === '') {
      return ''
    } else {
      return editor.value.getHtml()
    }
  } else {
    return ''
  }
}
// 设置内容
function setContents(html: string) {
  editor.value?.setHtml(html || '<p></p>')
}
// 清空内容
function clearContent() {
  editor.value?.clear()
}
// 增加 mention
function addMention(mention: { id: string; value: string }[]) {}

function handleCreated(editorInstance: IDomEditor) {
  console.log('editor.getAllMenuKeys() :>> ', editorInstance.getAllMenuKeys())
  editor.value = editorInstance
  emit('ready', getWang())
}

// 定义组件接口
defineExpose({
  getWang,
  addMention,
  clearContent
})
</script>

<style lang="scss">
.editor {
  position: relative;
}
</style>
