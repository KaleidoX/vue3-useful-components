<template>
  <div class="loading-bounce">
    <div class="bounce-container">
      <div v-for="i in 3" :key="i" class="bounce-ball" :style="{ '--i': i }"></div>
    </div>
    <div class="loading-text">加载中...</div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'LoadingType8'
})
</script>
<style scoped lang="scss">
.loading-bounce {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.bounce-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 40px;
}

.bounce-ball {
  width: 12px;
  height: 12px;
  background: var(--el-color-primary, #409eff);
  border-radius: 50%;
  animation: bounce 0.8s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.12s);
}

.loading-text {
  font-size: 14px;
  color: #666;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-28px);
  }
  60% {
    transform: translateY(-8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bounce-ball {
    animation: none;
    transform: translateY(-14px);
  }
}
</style>
