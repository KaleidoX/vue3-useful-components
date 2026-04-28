<template>
  <div class="editor-tiptap" :class="{ 'hidden-toolbar': hiddenToolbar }" :style="styles">
    <div v-if="editor && !hiddenToolbar" class="tiptap-toolbar">
      <template v-if="simple">
        <button @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }"><b>B</b></button>
        <button @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }"><i>I</i></button>
        <button @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }"><s>S</s></button>
        <span class="divider" />
        <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ active: editor.isActive('heading', { level: 2 }) }">H2</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ active: editor.isActive('heading', { level: 3 }) }">H3</button>
        <span class="divider" />
        <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ active: editor.isActive('bulletList') }">•</button>
        <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ active: editor.isActive('orderedList') }">1.</button>
      </template>
      <template v-else>
        <button @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }"><b>B</b></button>
        <button @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }"><i>I</i></button>
        <button @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }"><s>S</s></button>
        <button @click="editor.chain().focus().toggleCode().run()" :class="{ active: editor.isActive('code') }">&lt;/&gt;</button>
        <span class="divider" />
        <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ active: editor.isActive('heading', { level: 1 }) }">H1</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ active: editor.isActive('heading', { level: 2 }) }">H2</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ active: editor.isActive('heading', { level: 3 }) }">H3</button>
        <span class="divider" />
        <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ active: editor.isActive('bulletList') }">•</button>
        <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ active: editor.isActive('orderedList') }">1.</button>
        <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ active: editor.isActive('blockquote') }">"</button>
        <button @click="editor.chain().focus().toggleCodeBlock().run()" :class="{ active: editor.isActive('codeBlock') }">{}</button>
        <span class="divider" />
        <button @click="editor.chain().focus().setHorizontalRule().run()">—</button>
        <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()">↩</button>
        <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()">↪</button>
      </template>
    </div>
    <EditorContent :editor="editor" class="tiptap-content" />
    <div class="text-right" v-if="maxLength">限制{{ maxLength }}个字</div>
  </div>
</template>

<script lang="ts" setup>
import { type CSSProperties } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'

defineOptions({
  name: 'EditorTiptap'
})

const props = defineProps({
  modelValue: { type: String },
  height: { type: Number, default: null },
  minHeight: { type: Number, default: 160 },
  readOnly: { type: Boolean, default: false },
  maxLength: Number,
  placeholder: { type: String, default: '请输入内容' },
  hiddenToolbar: { type: Boolean, default: false },
  simple: { type: Boolean, default: false }
})
const emit = defineEmits(['ready', 'update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  editable: !props.readOnly,
  extensions: [
    StarterKit.configure(),
    Image.configure({ inline: true }),
    Placeholder.configure({ placeholder: props.placeholder })
  ],
  onUpdate: () => {
    // HTML getter
    emit('update:modelValue', editor.value?.getHTML() ?? '')
  },
  onCreate: () => {
    emit('ready', editor.value)
  }
})

const getEditor = () => editor.value

watch(() => props.modelValue, (value) => {
  const isSame = editor.value?.getHTML() === value
  if (isSame) return
  editor.value?.commands.setContent(value ?? '')
})

watch(() => props.readOnly, (val) => { editor.value?.setEditable(!val) })

const styles = computed(() => {
  const style: CSSProperties = {}
  if (props.minHeight) style.minHeight = `${props.minHeight}px`
  if (props.height) style.height = `${props.height}px`
  return style
})

function clearContent() {
  editor.value?.commands.clearContent()
}

onUnmounted(() => { editor.value?.destroy() })

defineExpose({ getEditor, clearContent })
</script>

<style lang="scss">
.editor-tiptap {
  position: relative;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tiptap-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 6px 8px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 6px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    font-size: 13px;
    cursor: pointer;
    color: #374151;
    &:hover { background: #e5e7eb; }
    &.active { background: #d1d5db; border-color: #9ca3af; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }
  .divider { width: 1px; background: #d1d5db; margin: 2px 4px; }
}

.tiptap-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;

  .ProseMirror {
    padding: 12px 16px;
    outline: none;
    min-height: 160px;
    p.is-editor-empty:first-child::before {
      color: #adb5bd;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
  }
}

.hidden-toolbar {
  .tiptap-toolbar { display: none !important; }
}
</style>
