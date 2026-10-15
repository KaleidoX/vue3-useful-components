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
    <div class="mx-auto max-w-[2560px] w-full px-4 py-4 lg:px-6">
      <div class="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <LayoutNav class="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]" />
        <LayoutMain>
          <RouterView v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </RouterView>
        </LayoutMain>
      </div>
    </div>
    <PerfPanel />
  </el-config-provider>
</template>

<script setup lang="ts">
import { usePageBack } from '@/utils/page'

import zhCn from 'element-plus/es/locale/lang/zh-cn.mjs'
import LayoutNav from '@/views/components/LayoutNav.vue'
import LayoutMain from '@/views/components/LayoutMain.vue'
import { PerfPanel } from '@/components/perf'
import 'dayjs/locale/zh-cn'

const localeElement = zhCn

usePageBack()
</script>

<style>
/* UnoCSS preflight 未包含 Tailwind 的 universal border-box reset；
   手动补齐，否则 max-w 与 padding 叠加按 content-box 计算导致容器实际宽度超出预期 */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* @mlightcad/cad-viewer 的全局样式把 body 设为 display:flex（html 也没有宽度约束），
   使 #app 按内容收缩、宽视口下内容区无法占满可用宽度；此处以更高优先级还原块级布局 */
html body {
  display: block;
  margin: 0;
}

body {
  @apply bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_50%,#ffffff_100%)] text-slate-900;
}

/* 全站统一滚动条：细、圆角、浅色，覆盖页面滚动与内部 overflow 容器 */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.35) transparent;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background-color: rgba(100, 116, 139, 0.35);
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 116, 139, 0.55);
}

::-webkit-scrollbar-corner {
  background: transparent;
}
</style>
