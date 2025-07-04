<template>
  <div class="loading-next">
    <div class="loading-next-box">
      <div class="loading-next-box-warp">
        <div class="loading-next-box-item"></div>
        <div class="loading-next-box-item"></div>
        <div class="loading-next-box-item"></div>
        <div class="loading-next-box-item"></div>
        <div class="loading-next-box-item"></div>
        <div class="loading-next-box-item"></div>
        <div class="loading-next-box-item"></div>
        <div class="loading-next-box-item"></div>
        <div class="loading-next-box-item"></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'LoadingType2'
})
</script>
<style scoped lang="scss">
.loading-next {
  width: 100%;
  height: 100%;
  position: relative;
  .loading-next-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .loading-next-box-warp {
    width: 80px;
    height: 80px;
    .loading-next-box-item {
      width: 33.333333%;
      height: 33.333333%;
      background: var(--el-color-primary);
      float: left;
      animation: loading-next-animation 1.2s infinite ease;
      border-radius: 1px;

      &:nth-child(7) {
        animation-delay: 0s;
      }
      &:nth-child(4),
      &:nth-child(8) {
        animation-delay: 0.1s;
      }
      &:nth-child(1),
      &:nth-child(5),
      &:nth-child(9) {
        animation-delay: 0.2s;
      }
      &:nth-child(2),
      &:nth-child(6) {
        animation-delay: 0.3s;
      }
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}
@keyframes loading-next-animation {
  0%,
  70%,
  100% {
    transform: scale3D(1, 1, 1);
  }
  35% {
    transform: scale3D(0, 0, 1);
  }
}
</style>
