<template>
  <PlayXG
    class="aspect-video"
    :src="src"
    videoType="mp4"
    coverImage=""
    preload="auto"
    autoplay
    controls
    loop
    autoFloat
    rightMenu
    muted
  />
</template>

<script lang="ts" setup>
import { testMp4 as src } from './videoTestList'

defineOptions({
  name: 'VideoView'
})
</script>
