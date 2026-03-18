<template>
  <main class="min-w-0">
    <section
      class="relative overflow-hidden border border-white/70 rounded-[30px] bg-[#0f172a] px-6 py-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:px-8"
    >
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(92,157,222,0.42),transparent_34%),radial-gradient(circle_at_left_center,rgba(28,117,255,0.28),transparent_30%)]"
      ></div>
      <div class="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl">
          <p class="text-xs text-white/60 font-semibold tracking-[0.32em] uppercase">
            {{ currentGroup?.label || 'overview' }}
          </p>
          <h2 class="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            {{ currentTitle }}
          </h2>
          <p class="mt-4 text-sm text-slate-300 leading-7 sm:text-base">
            {{ currentDescription }}
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div class="border border-white/10 rounded-2xl bg-white/8 px-4 py-3 backdrop-blur-sm">
            <div class="text-2xl font-semibold">{{ groupedRoutes.length }}</div>
            <div class="mt-1 text-xs text-white/55 tracking-[0.2em] uppercase">groups</div>
          </div>
          <div class="border border-white/10 rounded-2xl bg-white/8 px-4 py-3 backdrop-blur-sm">
            <div class="text-2xl font-semibold">{{ totalRoutes }}</div>
            <div class="mt-1 text-xs text-white/55 tracking-[0.2em] uppercase">routes</div>
          </div>
          <div
            class="col-span-2 border border-white/10 rounded-2xl bg-white/8 px-4 py-3 backdrop-blur-sm sm:col-span-1"
          >
            <div class="truncate text-lg font-semibold">{{ route.path }}</div>
            <div class="mt-1 text-xs text-white/55 tracking-[0.2em] uppercase">current</div>
          </div>
        </div>
      </div>
    </section>

    <section
      class="mt-6 border border-white/80 rounded-[30px] bg-white/92 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:p-6 sm:p-5"
    >
      <slot />
    </section>
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

const totalRoutes = computed(() => {
  return groupedRoutes.value.reduce((total, group) => total + group.items.length, 0)
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
      currentGroup.value?.description ?? '当前组件通过 vue-router 的嵌套视图直接渲染在右侧内容区。'
    )
  }

  return '右侧区域直接使用 RouterView 渲染组件页面；左侧分组和菜单项则完全由 route 配置生成。'
})
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
