<template>
  <div class="loading-demo">
    <div class="loading-grid">
      <div class="loading-item">
        <LoadingType1 />
      </div>
      <div class="loading-item">
        <LoadingType2 />
      </div>
      <div class="loading-item">
        <LoadingType3 />
      </div>
      <div class="loading-item">
        <LoadingType4 />
      </div>
      <div class="loading-item">
        <LoadingType5 />
      </div>
      <div class="loading-item">
        <LoadingType6 />
      </div>
      <div class="loading-item">
        <LoadingType7 />
      </div>
      <div class="loading-item">
        <LoadingType8 />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import LoadingType1 from '@/components/loading/type1.vue'
import LoadingType2 from '@/components/loading/type2.vue'
import LoadingType3 from '@/components/loading/type3.vue'
import LoadingType4 from '@/components/loading/type4.vue'
import LoadingType5 from '@/components/loading/type5.vue'
import LoadingType6 from '@/components/loading/type6.vue'
import LoadingType7 from '@/components/loading/type7.vue'
import LoadingType8 from '@/components/loading/type8.vue'

defineOptions({
  name: 'LoadingView'
})
</script>
<style scoped lang="scss">
.loading-demo {
  padding: 20px;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}

.loading-item {
  height: 160px;
  background: #f5f7fa;
  border-radius: 12px;
  overflow: hidden;
}
</style>
