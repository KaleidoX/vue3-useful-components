<template>
  <div class="">
    <div class="h-40 w-40">
      <LoadingType1 />
    </div>
    <div class="h-40 w-40">
      <LoadingType2 />
    </div>
    <div class="h-40 w-40">
      <LoadingType3 />
    </div>
  </div>
</template>
<script setup lang="ts">
import LoadingType1 from '@/components/loading/type1.vue'
import LoadingType2 from '@/components/loading/type2.vue'
import LoadingType3 from '@/components/loading/type3.vue'

defineOptions({
  name: 'LoadingView'
})
</script>
<style scoped lang="scss"></style>
