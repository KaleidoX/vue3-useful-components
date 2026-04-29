<template>
  <Teleport to="body">
    <div v-if="show" class="dialog-overlay" @click.self="cancel">
      <div class="dialog-box">
        <div class="dialog-title">{{ title }}</div>
        <slot />
        <div class="dialog-actions">
          <button class="dialog-btn" @click="cancel">取消</button>
          <button class="dialog-btn primary" @click="confirm">确定</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
defineProps<{ show: boolean; title: string }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
function confirm() { emit('confirm') }
function cancel() { emit('cancel') }
</script>

<style scoped>
.dialog-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); }
.dialog-box { width: 400px; max-height: 80vh; background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); }
.dialog-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
.dialog-btn { height: 32px; padding: 0 16px; border: 1px solid #ddd; border-radius: 4px; background: #fff; font-size: 13px; cursor: pointer; }
.dialog-btn.primary { background: #1a73e8; color: #fff; border-color: #1a73e8; }
:slotted(input) { width: 100%; height: 32px; border: 1px solid #ddd; border-radius: 4px; padding: 0 8px; margin-bottom: 8px; font-size: 13px; outline: none; box-sizing: border-box; }
:slotted(textarea) { width: 100%; border: 1px solid #ddd; border-radius: 4px; padding: 8px; margin-bottom: 8px; font-size: 13px; font-family: monospace; outline: none; resize: vertical; box-sizing: border-box; }
</style>
