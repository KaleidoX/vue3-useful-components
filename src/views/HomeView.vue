<template>
  <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
    <article
      v-for="group in groupedRoutes"
      :key="group.key"
      class="border border-base-400/80 rounded-[28px] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5"
    >
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-[11px] text-slate-400 font-semibold tracking-[0.24em] uppercase">
            {{ group.key }}
          </p>
          <h3 class="mt-2 text-xl text-slate-900 font-semibold">{{ group.label }}</h3>
        </div>
        <span class="rounded-full bg-primary-100 px-3 py-1 text-xs text-primary font-semibold">
          {{ group.items.length }} 项
        </span>
      </div>
      <p class="mt-3 text-sm text-slate-500 leading-6">{{ group.description }}</p>
      <div class="mt-5 space-y-2">
        <router-link
          v-for="item in group.items"
          :key="item.path"
          :to="item.path"
          class="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 transition-colors duration-200 hover:bg-primary-100 hover:text-primary"
        >
          <span class="truncate font-medium">{{ item.title }}</span>
          <i class="i-mdi-arrow-top-right text-base"></i>
        </router-link>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { previewRouteGroups } from '@/router/routes'

defineOptions({
  name: 'HomeView'
})

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
</script>
