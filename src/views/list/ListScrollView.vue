<template>
  <ListScroll :api="createList" :params="params" showNone>
    <template v-slot="{ list }">
      <ul class="px-4">
        <li class="my-3 rounded-lg p-4 shadow" v-for="item in list" :key="item" v-text="item"></li>
      </ul>
    </template>
  </ListScroll>
</template>

<script lang="ts" setup>
import { createList } from '@/api/base'

defineOptions({
  name: 'ListScrollView'
})

const params = ref({ rows: 20 })
</script>
