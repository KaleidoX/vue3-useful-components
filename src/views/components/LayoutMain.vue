<template>
  <main
    class="min-w-0 border border-white/80 rounded-2xl bg-white/92 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
    :style="{ '--preview-content-height': contentHeight + 'px' }"
  >
    <header
      class="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-base-400/70 px-4 py-3 lg:px-5"
    >
      <p class="text-[10px] text-slate-400 font-semibold tracking-[0.2em] uppercase">
        {{ currentGroup?.label || 'overview' }}
      </p>
      <h2 class="text-lg text-slate-900 font-semibold leading-6">
        {{ currentTitle }}
      </h2>
      <p
        class="max-w-[60%] truncate text-xs text-slate-500"
        :title="currentDescription"
      >
        {{ currentDescription }}
      </p>
      <span
        class="ml-auto hidden max-w-[280px] truncate rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500 font-medium sm:inline-block"
        :title="route.path"
      >
        {{ route.path }}
      </span>
    </header>
    <div class="p-4 lg:p-5">
      <slot />
    </div>
  </main>
</template>

<script setup lang="ts">
import { previewRouteGroups } from '@/router/routes'

interface PreviewItem {
  path: string
  name: string
  title: string
}

interface PreviewGroup {
  key: string
  label: string
  description: string
  items: PreviewItem[]
}

const route = useRoute()

const groupedRoutes = computed<PreviewGroup[]>(() => {
  return previewRouteGroups.map((group) => ({
    key: group.key,
    label: group.label,
    description: group.description,
    items: group.children.map((item) => ({
      path: `/${group.path}/${String(item.path)}`,
      name: String(item.name ?? item.path),
      title: String(item.meta?.title ?? item.name ?? item.path)
    }))
  }))
})

const currentGroup = computed(() => {
  return groupedRoutes.value.find((group) => route.path.startsWith(`/${group.key}/`))
})

const currentTitle = computed(() => {
  return String(route.meta?.title ?? '通过路由直接预览组件')
})

const currentDescription = computed(() => {
  if (route.meta?.title) {
    return String(
      route.meta?.description ??
        currentGroup.value?.description ??
        '当前组件通过 vue-router 的嵌套视图直接渲染在右侧内容区。'
    )
  }

  return '右侧区域直接使用 RouterView 渲染组件页面；左侧分组和菜单项则完全由 route 配置生成。'
})

// 满高演示组件的统一高度基准：视口高 − 骨架固定开销
// （外层 py-4 上下共 32px + 页头一行约 45px + 内容卡片 padding 上下 + 预留路径徽标换行余量）
const { height: winHeight } = useWindowSize()
const contentHeight = computed(() => Math.max(360, winHeight.value - 140))
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
