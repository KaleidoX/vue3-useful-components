<template>
  <section class="grid gap-5">
    <UploadImageVant v-model="uploadListVant" />
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
