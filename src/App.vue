<template>
  <!-- <div v-show="showBackNav" class="sticky top-0 z-10 top-safe">
    <van-nav-bar
      :title="navTitle"
      left-text="返回"
      @click-left="navBack"
      safeareainsettop
      left-arrow
    />
  </div> -->
  <el-config-provider :locale="localeElement">
    <div class="mx-auto max-w-[1600px] px-4 py-6 lg:p-8 sm:px-6">
      <div class="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <LayoutNav class="lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)]" />
        <LayoutMain>
          <RouterView v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component" v-if="Component" />
            </transition>
          </RouterView>
        </LayoutMain>
      </div>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { usePageBack } from '@/utils/page'

import zhCn from 'element-plus/es/locale/lang/zh-cn.mjs'
import LayoutNav from '@/views/components/LayoutNav.vue'
import LayoutMain from '@/views/components/LayoutMain.vue'
import 'dayjs/locale/zh-cn'

const localeElement = zhCn

usePageBack()
</script>

<style>
body {
  @apply bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_50%,#ffffff_100%)] text-slate-900;
}
</style>
