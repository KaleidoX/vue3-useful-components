<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-10 border-t border-t-base-400 border-t-solid bg-base-100 pb-safe"
    v-show="showNav"
  >
    <div class="h-16.5 flex">
      <router-link
        class="flex flex-1 flex-col items-center justify-center"
        v-for="item in navList"
        :key="item.link"
        :to="item.link"
      >
        <i class="h-6 w-6" :class="item.icon"></i>
        <span class="mt-1 text-xs">{{ item.name }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script lang="ts">
export interface TypeNavBarItem {
  link: string
  icon: string
  name: string
}

export default {
  name: 'NavBar',
  props: {
    activeIndex: {
      type: Number,
      default: 0
    },
    navList: {
      type: Array as PropType<TypeNavBarItem[]>,
      default: () => [] as TypeNavBarItem[]
    }
  },
  setup() {
    const route = useRoute()
    const showNav = computed(() => !route.meta.hiddenNav)
    return { showNav }
  }
}
</script>

<style lang="scss" scoped>
.router-link-active {
  color: theme('colors.primary.DEFAULT');
}
</style>
