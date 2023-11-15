<template>
  <PlayVideo
    class="aspect-video"
    :src="videoSrc"
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

<script lang="ts">
// const srcMp4 = 'https://sf1-hscdn-tos.pstatp.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-720p.mp4'
const srcFlv =
  'https://sf1-hscdn-tos.pstatp.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-720p.flv'

export default {
  name: 'VideoView',
  setup() {
    return { videoSrc: srcFlv }
  }
}
</script>
