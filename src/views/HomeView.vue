<template>
  <h1 class="px-4">preview all components used</h1>
  <ul class="px-4">
    <li class="my-4" v-for="item in previewList" :key="item.path">
      <router-link class="block" :to="item.path">{{ item.name }}</router-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineOptions({
  name: 'HomeView'
})

const router = useRouter()

const previewList = router
  .getRoutes()
  .filter((item) => item.name)
  .map((item) => {
    return {
      path: item.path,
      name: item.name,
      title: item.meta?.title
    }
  })
</script>
