<template>
  <el-image :src="src" :fit="fit" :previewSrcList="previewSrcList" :loading="lazyLoading">
    <template #error>
      <div class="h-full w-full flex items-center justify-center bg-slate-100 text-3xl color-6">
        <i class="i-ep:picture"></i>
      </div>
    </template>
  </el-image>
</template>

<script lang="ts">
import type { ImageFit } from 'vant'

export default defineComponent({
  name: 'ImageElement',
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
  computed: {
    lazyLoading() {
      return this.lazy ? 'lazy' : 'eager'
    }
  }
})
</script>

<style>
.el-image {
  display: block;
}
</style>
