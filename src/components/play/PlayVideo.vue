<template>
  <div ref="el" class="video-box relative z-10">
    <!-- placeholder -->
    <div class="h-full w-full"></div>
    <!-- video container -->
    <div :class="classVideoContainer">
      <video id="videoPlayer" class="video-js vjs-big-play-centered" playsinline></video>
    </div>
  </div>
</template>

<script lang="ts">
import 'video.js/dist/video-js.css'
import videojs from 'video.js'
import LangZhHans from 'video.js/dist/lang/zh-Hans.json'
import { isArray, isString } from 'lodash-es'
import './videojs-mpegts'
import { events } from './event'
import type Player from 'video.js/dist/types/player'
videojs.addLanguage('zh-Hans', LangZhHans)
videojs.options.autoSetup = false
videojs.log.level('off')

let player: Player

export default defineComponent({
  name: 'PlayVideo',
  props: {
    src: {
      type: [String, Array],
      default: ''
    },
    coverImage: {
      type: String,
      default: ''
    },
    autoplay: {
      type: [Boolean, String],
      default: false,
      validator: function (value: boolean | string) {
        // 这个值必须匹配下列字符串中的一个
        return [true, false, 'muted', 'play', 'any'].includes(value)
      }
    },
    controls: {
      type: Boolean,
      default: true
    },
    qualityList: {
      type: Array
    },
    loop: {
      type: Boolean,
      default: false
    },
    muted: {
      type: Boolean,
      default: false
    },
    preload: {
      type: String,
      default: 'auto',
      validator: function (value: string) {
        // 这个值必须匹配下列字符串中的一个
        return ['auto', 'metadata', 'none'].includes(value)
      }
    },
    autoFloat: {
      type: Boolean,
      default: true
    },
    rightMenu: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const el = ref(null)
    const { top } = useElementBounding(el)
    const topDebounced = refDebounced(top, 200)
    const isFloat = computed(() => (props.autoFloat && topDebounced.value < 0 ? true : false))
    const classVideoContainer = computed(() =>
      isFloat.value ? 'fixed w-128 h-72 bottom-10 right-10' : 'absolute inset-0 w-full h-full'
    )
    return { el, classVideoContainer }
  },
  data() {
    return {}
  },
  computed: {
    videoSources() {
      const videoSrc = !this.src || this.src === 'nothing' ? '' : this.src
      let sourcesList: { src: string }[] = []

      if (isString(videoSrc) && videoSrc) {
        sourcesList = [
          {
            src: videoSrc as string
            // type: checkSrcType(videoSrc),
          }
        ]
      } else if (isArray(videoSrc)) {
        sourcesList = (videoSrc as string[]).map((item: string) => ({
          src: item
          // type: checkSrcType(item),
        }))
      }
      return sourcesList
    },
    videoOptions() {
      return {
        autoplay: this.autoplay,
        muted: this.muted,
        controls: this.controls,
        sources: this.videoSources,
        poster: this.coverImage,
        language: 'zh-Hans',
        playbackRates: [0.5, 0.75, 1, 1.5, 2],
        mpegtsjs: {
          mediaDataSource: {
            isLive: true,
            cors: true,
            withCredentials: false
          }
        }
      }
    }
  },
  methods: {
    videoInit() {
      if (!this.videoSources.length) {
        return false
      }
      this.$nextTick().then(() => {
        const videoElement = document.getElementById('videoPlayer')
        if (!videoElement) {
          return
        }
        player = videojs(videoElement, this.videoOptions, () => {
          // Stringing video.js events to vue emits.
          events.forEach((eventKey) => {
            player.on(eventKey, (payload: any) => {
              this.$emit(eventKey, payload)
            })
          })
          if (!this.rightMenu && player.tech_.el_) {
            player.tech_.el_.addEventListener('contextmenu', function (e: Event) {
              e.preventDefault()
              e.stopPropagation()
              return false
            })
          }
        })
      })
    },
    videoDestroy() {
      if (player) {
        player.dispose()
        // player = undefined
      }
    },
    getVideoShot() {
      if (!player) {
        return
      }
      const canvas = document.createElement('canvas')
      canvas.width = player.tech_.el_.clientWidth / 2
      canvas.height = player.tech_.el_.clientHeight / 2
      canvas.getContext('2d')?.drawImage(player.tech_.el_, 0, 0, canvas.width, canvas.height)
      return canvas
    },
    getTotalTime() {
      return Math.floor(player?.duration() || 0)
    },
    getPlayTime() {
      return Math.floor(player?.currentTime() || 0)
    },
    setPlayTime(seconds: number = 0) {
      player?.currentTime(seconds)
    }
  },
  watch: {
    videoSources() {
      if (!player) {
        this.videoInit()
        return false
      } else {
        player.pause()
        player.src(this.videoSources)
      }
    },
    coverImage() {
      if (!player) {
        this.videoInit()
      } else {
        player.poster(this.coverImage)
      }
    }
  },
  mounted() {
    this.videoInit()
  },
  beforeUnmount() {
    this.videoDestroy()
  }
})
</script>

<style lang="scss">
.video-box {
  .video-js {
    width: 100%;
    height: 100%;
  }
}
</style>
