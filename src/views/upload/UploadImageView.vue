<template>
  <section class="mt-5 px-4">
    <UploadImageVant v-model="uploadListVant" />
  </section>
  <section class="mt-5 px-4">
    <UploadImageElement v-model="uploadListElement" />
  </section>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'UploadImageView'
})

const uploadListVant = ref([])
const uploadListElement = ref([])
</script>
