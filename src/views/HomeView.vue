<template>
  <div class="columns-1 gap-3 lg:columns-3 sm:columns-2 xl:columns-4">
    <article
      v-for="group in groupedRoutes"
      :key="group.key"
      class="mb-3 break-inside-avoid border border-base-400/80 rounded-2xl bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4"
    >
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-[10px] text-slate-400 font-semibold tracking-[0.16em] uppercase">
            {{ group.key }}
          </p>
          <h3 class="mt-1 text-base text-slate-900 font-semibold">{{ group.label }}</h3>
        </div>
        <span class="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs text-primary font-semibold">
          {{ group.items.length }} 项
        </span>
      </div>
      <p class="mt-1.5 text-xs text-slate-500 leading-5">{{ group.description }}</p>
      <div class="mt-3 space-y-1">
        <router-link
          v-for="item in group.items"
          :key="item.path"
          :to="item.path"
          class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-700 transition-colors duration-200 hover:bg-primary-100 hover:text-primary"
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
