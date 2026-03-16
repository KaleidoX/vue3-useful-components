<template>
  <div class="loading-dual-ring">
    <div class="dual-ring-container">
      <div class="ring-outer ring"></div>
      <div class="ring-inner ring"></div>
    </div>
    <div class="loading-text">加载中...</div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'LoadingType7'
})
</script>
<style scoped lang="scss">
.loading-dual-ring {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.dual-ring-container {
  position: relative;
  width: 50px;
  height: 50px;
}

.ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  border: 3px solid transparent;
}

.ring-outer {
  width: 50px;
  height: 50px;
  margin: -25px 0 0 -25px;
  border-top-color: var(--el-color-primary, #409eff);
  border-right-color: var(--el-color-primary, #409eff);
  animation: spin-right 1s linear infinite;
}

.ring-inner {
  width: 30px;
  height: 30px;
  margin: -15px 0 0 -15px;
  border-bottom-color: #67c23a;
  border-left-color: #67c23a;
  animation: spin-left 0.8s linear infinite;
}

.loading-text {
  font-size: 14px;
  color: #666;
}

@keyframes spin-right {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spin-left {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ring-outer,
  .ring-inner {
    animation: none;
  }

  .ring-outer {
    border-top-color: var(--el-color-primary, #409eff);
    border-right-color: transparent;
    border-bottom-color: transparent;
    border-left-color: transparent;
  }

  .ring-inner {
    border-bottom-color: #67c23a;
    border-left-color: transparent;
    border-top-color: transparent;
    border-right-color: transparent;
  }
}
</style>
