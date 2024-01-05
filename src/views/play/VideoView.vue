<template>
  <PlayVideo
    class="aspect-video"
    :src="src"
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
