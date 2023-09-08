<template>
  <div v-show="showBackNav" class="sticky top-0 top-safe z-10">
    <van-nav-bar
      :title="navTitle"
      left-text="返回"
      left-arrow
      @click-left="navBack"
      safeAreaInsetTop
    />
  </div>
  <RouterView />
</template>

<script>
import { usePageBack } from '@/utils/page'

export default {
  name: 'App',
  setup() {
    return {
      ...usePageBack()
    }
  }
}
</script>
