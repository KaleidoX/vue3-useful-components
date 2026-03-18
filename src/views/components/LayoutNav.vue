<template>
  <aside
    class="flex flex-col overflow-hidden border border-white/70 rounded-[30px] bg-white/90 shadow-[0_20px_60px_rgba(28,117,255,0.1)] backdrop-blur"
  >
    <div class="border-b border-base-400/70 px-5 py-5">
      <div class="flex items-center gap-3">
        <div
          class="h-12 w-12 flex items-center justify-center rounded-2xl bg-primary-100 text-primary"
        >
          <i class="i-custom:logo text-2xl"></i>
        </div>
        <div>
          <p class="text-xs text-slate-400 font-semibold tracking-[0.28em] uppercase">
            vue-router driven
          </p>
          <h1 class="mt-1 text-xl text-slate-900 font-semibold">组件预览</h1>
        </div>
      </div>
      <p class="mt-4 text-sm text-slate-500 leading-6">
        左侧菜单和右侧展示共用同一份路由配置，新增 route 后会自动进入对应分组。
      </p>
    </div>
    <div class="flex-1 overflow-y-auto px-3 py-3">
      <section v-for="group in groupedRoutes" :key="group.key" class="mb-3 last:mb-0">
        <div class="mb-2 flex items-center justify-between px-3">
          <div>
            <div class="text-[11px] text-slate-400 font-semibold tracking-[0.24em] uppercase">
              {{ group.key }}
            </div>
            <div class="mt-1 text-sm text-slate-800 font-semibold">{{ group.label }}</div>
          </div>
          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500 font-semibold">
            {{ group.items.length }}
          </span>
        </div>

        <div class="space-y-1">
          <router-link
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            class="block border rounded-2xl px-4 py-3 text-sm transition-all duration-200"
            :class="
              isActivePath(item.path)
                ? 'border-primary/20 bg-primary-100 text-primary shadow-[inset_4px_0_0_0_#1c75ff]'
                : 'border-transparent text-slate-600 hover:border-base-400 hover:bg-base-300/70 hover:text-slate-900'
            "
          >
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="truncate font-semibold">{{ item.title }}</div>
                <div class="mt-1 truncate text-xs text-slate-400">{{ item.name }}</div>
              </div>
              <i class="i-mdi-chevron-right text-base text-slate-300"></i>
            </div>
          </router-link>
        </div>
      </section>
    </div>
  </aside>
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

const isActivePath = (path: string) => route.path === path
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
