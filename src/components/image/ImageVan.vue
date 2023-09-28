<template>
  <van-image
    class="overflow-hidden"
    :src="src"
    :fit="fit"
    :alt="alt"
    block
    :lazy-load="lazy"
  ></van-image>
</template>

<script lang="ts">
import 'vant/es/image-preview/style'
import { showImagePreview } from 'vant'
import type { ImageFit } from 'vant'

export default defineComponent({
  name: 'ImageVan',
  props: {
    src: String,
    alt: String,
    fit: {
      type: String as PropType<ImageFit>,
      default: 'contain',
      validator: (value: string) => {
        // 这个值必须匹配下列字符串中的一个
        return ['fill', 'contain', 'cover', 'none', 'scale-down'].indexOf(value) !== -1
      }
    },
    previewSrcList: Array as PropType<string[]>,
    lazy: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const previewImage = () => {
      if (props.previewSrcList && props.previewSrcList.length) {
        const startPosition = props.src ? props.previewSrcList.indexOf(props.src) : 0
        showImagePreview({
          images: props.previewSrcList,
          startPosition
        })
      }
    }
    return { previewImage }
  }
})
</script>
