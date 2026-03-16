<template>
  <div class="loading-wave">
    <div class="wave-container">
      <div v-for="i in 5" :key="i" class="wave-bar" :style="{ '--i': i }"></div>
    </div>
    <div class="loading-text">加载中...</div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'LoadingType5'
})
</script>
<style scoped lang="scss">
.loading-wave {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.wave-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 40px;
}

.wave-bar {
  width: 6px;
  height: 100%;
  background: var(--el-color-primary, #409eff);
  border-radius: 3px;
  animation: wave 1s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.1s);
}

.loading-text {
  font-size: 14px;
  color: #666;
}

@keyframes wave {
  0%,
  100% {
    transform: scaleY(0.4);
  }
  50% {
    transform: scaleY(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .wave-bar {
    animation: none;
    transform: scaleY(0.6);
  }
}
</style>
