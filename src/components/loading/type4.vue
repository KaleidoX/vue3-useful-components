<template>
  <div class="loading-pulse">
    <div class="pulse-container">
      <div class="pulse-dot"></div>
      <div class="pulse-ring"></div>
    </div>
    <div class="loading-text">加载中...</div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'LoadingType4'
})
</script>
<style scoped lang="scss">
.loading-pulse {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.pulse-container {
  position: relative;
  width: 40px;
  height: 40px;
}

.pulse-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  background: var(--el-color-primary, #409eff);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-dot 1.5s ease-in-out infinite;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  border: 2px solid var(--el-color-primary, #409eff);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  animation: pulse-ring 1.5s ease-out infinite;
}

.loading-text {
  font-size: 14px;
  color: #666;
  animation: text-pulse 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

@keyframes text-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pulse-dot,
  .pulse-ring,
  .loading-text {
    animation: none;
  }

  .pulse-ring {
    opacity: 0.3;
  }
}
</style>
