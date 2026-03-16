<template>
  <div class="loading-skeleton">
    <div class="skeleton-card" v-for="i in 3" :key="i">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-content">
        <div class="skeleton-line skeleton-line-short"></div>
        <div class="skeleton-line"></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'LoadingType6'
})
</script>
<style scoped lang="scss">
.loading-skeleton {
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e4e7ed 25%, #ebeef5 50%, #e4e7ed 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.skeleton-line {
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, #e4e7ed 25%, #ebeef5 50%, #e4e7ed 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  &.skeleton-line-short {
    width: 60%;
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-avatar,
  .skeleton-line {
    animation: none;
    background: #e4e7ed;
  }
}
</style>
