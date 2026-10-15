<template>
  <section>
    <header v-if="title || description" :class="compact ? 'mb-2' : 'mb-3'">
      <h3 class="text-lg text-slate-900 font-semibold leading-6">{{ title }}</h3>
      <p v-if="description" class="mt-1 text-sm text-slate-500 leading-6">
        {{ description }}
      </p>
    </header>
    <slot />
  </section>
</template>

<script lang="ts" setup>
/**
 * 预览页内小节的统一头：标题 + 可选描述 + 内容插槽。
 * 页面级标题/描述由 LayoutMain 页头承担，这里只覆盖页内并列小节，
 * 收敛此前 15+ 个视图复制粘贴的 h2/h3 + 描述 p 类串。
 */
defineOptions({
  name: 'PreviewSection'
})

withDefaults(
  defineProps<{
    title?: string
    description?: string
    /** 并列小节较多时收紧头部的下间距 */
    compact?: boolean
  }>(),
  {
    title: '',
    description: '',
    compact: false
  }
)
</script>
