<template>
  <div class="p-5">
    <EditorQuill v-model="content1" />
  </div>
  <div class="p-5">
    <EditorQuill v-model="content2" simple />
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'EditorQuillView'
})
const content1 = ref('')
const content2 = ref('')
</script>
