<template>
  <div ref="el" class="video-box relative">
    <div class="h-full w-full"></div>
    <div :class="classVideoContainer">
      <div ref="videoPlayer"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import 'xgplayer/dist/index.min.css'
import Player, { Events } from 'xgplayer'
import Mp4Plugin from 'xgplayer-mp4'
import FlvPlugin from 'xgplayer-flv'
import HlsPlugin from 'xgplayer-hls'

import { events } from './event'

let player: Player = null

defineOptions({
  name: 'PlayXG'
})

const props = defineProps({
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
    type: Array as PropType<{ id: string; src: string }[]>
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
  },
  videoType: {
    type: String,
    default: 'mp4',
    validator: function (value: string) {
      // 这个值必须匹配下列字符串中的一个
      return ['mp4', 'flv', 'hls'].includes(value)
    }
  },
  isLive: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(events)

// 浮动设置
const el = ref(null)
const { top } = useElementBounding(el)
const topDebounced = refDebounced(top, 200)
const isFloat = computed(() => (props.autoFloat && topDebounced.value < 0 ? true : false))
const classVideoContainer = computed(() =>
  isFloat.value ? 'fixed w-128 h-72 bottom-10 right-10 z-10' : 'absolute inset-0 w-full h-full'
)

const videoPlugins = computed(() => {
  if (props.videoType === 'mp4') {
    return [Mp4Plugin]
  } else if (props.videoType === 'flv') {
    return [FlvPlugin]
  } else if (props.videoType === 'hls') {
    return [HlsPlugin]
  } else {
    return []
  }
})

const videoPlayer = ref<HTMLDivElement | null>(null)
const videoOptions = computed(() => {
  return {
    plugins: videoPlugins.value,
    el: videoPlayer.value,
    url: props.src,
    height: '100%',
    width: '100%',
    isLive: props.isLive,
    autoplay: props.autoplay,
    autoplayMuted: props.muted,
    playsinline: true,
    defaultPlaybackRate: 1,
    volume: 1,
    loop: false,
    poster: props.coverImage,
    lang: 'zh-cn',
    fluid: false,
    fitVideoSize: 'fixed',
    videoFillMode: 'contain', // 'auto' | 'fill' | 'fillWidth' | 'fillHeight'
    seekedStatus: 'play',
    /**
     * 播放进度点
     * [{time: 10, text: 'Demo', duration: 5, style: {backgroundColor: 'red'}}]
     * id: 0,         // 唯一标识，用于删除的时候索引
     * time: 10,      // 展示的时间点，例子为在播放到10s钟的时候展示
     * text: 'Demo',  // hover的时候展示文案，可以为空
     * duration: 5,   // 展示时间跨度，单位为s
     * style: { backgroundColor: 'red' }// 指定样式
     */
    progressDot: [],
    /**
     * 预览图
     * {}
     * urls: [],      // 雪碧图url列表
     * pic_num: 128,  // 预览图总帧数
     * row: 10,       // 每张雪碧图包含的预览图行数
     * col: 10,       // 每张雪碧图包含的预览图列数
     * height: 160,   // 预览图每一帧的高度（单位：px）
     * width: 90      // 预览图每一帧的宽度（单位：px）
     */
    thumbnail: null,
    marginControls: false,
    domEventType: 'default',
    controls: props.controls,
    miniprogress: true,
    keyShortcut: true,
    'x5-video-player-type': 'h5',
    'x5-video-player-fullscreen': false,
    'x5-video-orientation': 'portraint',
    mp4plugin: {
      maxBufferLength: 40, // default 40 播放的最大的buffer长度（s）
      minBufferLength: 5, // default 10 播放的最小的buffer长度（s）
      disableBufferBreakCheck: false, // default false 是否开启卡顿超时检测
      waitingTimeOut: '15s', // default 15s 卡顿超时时间
      waitingInBufferTimeOut: '5s', // default 5s 在buffer区间内的卡顿超时时间
      waitJampBufferMaxCnt: 3, // default 3 一次播放中在buffer区间内卡顿超时最多可以seek调整几次
      chunkSize: 15625, // default 15625 第一次请求的数据的size长度
      tickInSeconds: 0.1, // default 0.1 驱动下载的timer的时间间隔
      segmentDuration: '5s', // default 5s 一次下载数据的最小视频时长
      onProcessMinLen: 1024, // default 1024	fetch每次回调数据的最小长度
      retryCount: 2, // default 2	loader请求失败时的重试次数
      retryDelay: 1000, // default 1000	重试的时间间隔（ms）
      timeout: 3000, // default 3000	loader请求的超时时间(ms)
      enableWorker: false, // default false	transmux是否使用worker
      reqOptions: {
        mode: 'cors',
        method: 'GET' // 默认值是GET，也可以是POST
        // headers: {
        //   // 需要带的自定义请求头
        //   'x-test-header': 'rrrr'
        // }
      }
      // ... 其他配置
    }
  }
})

const videoInit = async () => {
  if (!props.src.length) {
    return false
  }
  await nextTick()

  player = new Player(videoOptions.value)
  if (props.qualityList && props.qualityList.length) {
    player.emit(
      'resourceReady',
      props.qualityList.map((item) => ({
        name: item.id,
        url: item.src
      }))
    )
    player.on(Events.DEFINITION_CHANGE, (e: any) => {
      const def = document.querySelector('.xgplayer-definition .icon-text') as HTMLElement
      def.textContent = e.to.name
    })
    events.forEach((eventKey: string) => {
      player.on(eventKey, (payload: any) => {
        emit(eventKey, payload)
      })
    })
  }
}
const videoDestroy = () => {
  if (player) {
    player = null
  }
}
const getVideoShot = () => {
  if (!player) {
    return
  }
  const canvas = document.createElement('canvas')
  canvas.width = player.tech_.el_.clientWidth / 2
  canvas.height = player.tech_.el_.clientHeight / 2
  canvas.getContext('2d')?.drawImage(player.tech_.el_, 0, 0, canvas.width, canvas.height)
  return canvas
}

const getTotalTime = () => {
  return Math.floor(player?.duration())
}
const getPlayTime = () => {
  return Math.floor(player?.currentTime())
}
const setPlayTime = (seconds: number) => {
  player?.currentTime(seconds)
}

defineExpose({
  getVideoShot,
  getPlayTime,
  setPlayTime,
  getTotalTime
})

onMounted(() => {
  videoInit()
})
onBeforeUnmount(() => {
  videoDestroy()
})
</script>
