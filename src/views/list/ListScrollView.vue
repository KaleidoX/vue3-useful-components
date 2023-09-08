<template>
  <ListScroll :api="api" :params="params" showNone>
    <template v-slot="{ list }">
      <ul class="px-4">
        <li class="my-3 p-4 shadow rounded-lg" v-for="item in list" :key="item" v-text="item"></li>
      </ul>
    </template>
  </ListScroll>
</template>

<script lang="ts">
import { ref } from 'vue'
import { createList } from '@/api/base.ts'

export default {
  name: 'ListScrollView',
  setup() {
    const params = ref({ rows: 20 })
    return { params, api: createList }
  }
}
</script>
