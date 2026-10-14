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

import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

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
const emit = defineEmits(['ready'])

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
    console.log('EditorWang customAlert :>> ', info, type)
  }
}

// 清空内容
function clearContent() {
  editor.value?.clear()
}

function handleCreated(editorInstance: IDomEditor) {
  console.log('editor.getAllMenuKeys() :>> ', editorInstance.getAllMenuKeys())
  editor.value = editorInstance
  emit('ready', getWang())
}

// 定义组件接口
defineExpose({
  getWang,
  clearContent
})
</script>

<style lang="scss">
.editor {
  position: relative;
}
</style>
