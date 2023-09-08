<template>
  <h1>preview all components used</h1>
  <ul>
    <li v-for="item in previewList" :key="item.path">
      <router-link :to="item.path" v-text="item.name"></router-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
const previewList = [
  {
    path: '/video',
    name: 'PlayVideo'
  }
]
</script>
