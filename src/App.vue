<template>
  <div v-show="showBackNav" class="sticky top-0 z-10 top-safe">
    <van-nav-bar
      :title="navTitle"
      left-text="返回"
      @click-left="navBack"
      safeareainsettop
      left-arrow
    />
  </div>
  <i class="i-custom:logo text-xl"></i>
  <el-config-provider :locale="localeElement">
    <RouterView />
  </el-config-provider>
</template>

<script>
import { usePageBack } from '@/utils/page'

import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'dayjs/locale/zh-cn'

export default {
  name: 'App',
  setup() {
    return {
      localeElement: zhCn,
      ...usePageBack()
    }
  }
}
</script>
