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
export default {
  name: 'ImageVan',
  props: {
    src: String,
    alt: String,
    fit: {
      type: String,
      default: 'contain',
      validator(value) {
        // 这个值必须匹配下列字符串中的一个
        return ['fill', 'contain', 'cover', 'none', 'scale-down'].indexOf(value) !== -1
      }
    },
    lazy: {
      type: Boolean,
      default: false
    }
  }
}
</script>
