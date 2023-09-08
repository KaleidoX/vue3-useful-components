<template>
  <h1 class="px-4">preview all components used</h1>
  <ul class="px-4">
    <li class="my-4" v-for="item in previewList" :key="item.path">
      <router-link :to="item.path" v-text="item.name"></router-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
const previewList = [
  {
    path: '/video',
    name: 'PlayVideo'
  },
  {
    path: '/list/scroll',
    name: 'ListScroll'
  },
  {
    path: '/list/none',
    name: 'ListNone'
  }
]
</script>
