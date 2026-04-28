<template>
  <div class="editor-milkdown" :class="{ 'hidden-toolbar': hiddenToolbar }" :style="styles">
    <MilkdownProvider>
      <MilkdownEditor
        :model-value="modelValue"
        :simple="simple"
        @update:model-value="emit('update:modelValue', $event)"
        @ready="emit('ready', $event)"
      />
    </MilkdownProvider>
    <div class="text-right" v-if="maxLength">限制{{ maxLength }}个字</div>
  </div>
</template>

<script lang="ts" setup>
import { type CSSProperties } from 'vue'
import { MilkdownProvider } from '@milkdown/vue'
import MilkdownEditor from './MilkdownEditor.vue'

import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

defineOptions({
  name: 'EditorMilkdown'
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

const styles = computed(() => {
  const style: CSSProperties = {}
  if (props.minHeight) style.minHeight = `${props.minHeight}px`
  if (props.height) style.height = `${props.height}px`
  return style
})
</script>

<style lang="scss">
.editor-milkdown {
  position: relative;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: auto;

  .milkdown {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .editor {
    padding: 12px 16px;
    outline: none;
    min-height: 160px;
  }

  &.hidden-toolbar {
    .crepe-toolbar { display: none !important; }
  }
}
</style>
