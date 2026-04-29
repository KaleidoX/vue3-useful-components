<template>
  <div v-if="visible" class="comment">
    <div class="comment__header">
      <span>批注</span>
      <span class="comment__close" @click="visible = false">✕</span>
    </div>
    <el-scrollbar class="comment__body">
      <div class="comment__main">
        <p class="comment__empty">暂无批注</p>
        <p class="comment__hint">选中文本后通过右键菜单添加批注</p>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'CanvasCommentPanel' })
const visible = defineModel<boolean>('visible', { default: false })
</script>

<style scoped>
.comment { width: 220px; flex-shrink: 0; background: #fff; border-left: 1px solid #ddd; display: flex; flex-direction: column; overflow-y: auto; }
.comment__header { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; font-size: 12px; font-weight: 600; border-bottom: 1px solid #eee; }
.comment__close { cursor: pointer; }
.comment__main { padding: 8px; font-size: 12px; color: #999; }
.comment__empty { font-size: 13px; color: #666; margin-bottom: 4px; }
.comment__hint { font-size: 11px; color: #bbb; }
</style>
