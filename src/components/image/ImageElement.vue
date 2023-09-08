<template>
  <el-image :src="src" :fit="fit" :preview-src-list="previewSrcList" :loading="lazyLoading">
    <template #error>
      <div class="color-6 flex h-full w-full items-center justify-center bg-slate-100 text-3xl">
        <i class="i-ep:picture"></i>
      </div>
    </template>
  </el-image>
</template>

<script lang="ts">
export default {
  name: 'ImageElement',
  props: {
    src: String,
    alt: String,
    fit: {
      type: String,
      default: 'contain',
      validator: (value: string) => {
        // 这个值必须匹配下列字符串中的一个
        return ['fill', 'contain', 'cover', 'none', 'scale-down'].indexOf(value) !== -1
      }
    },
    previewSrcList: Array,
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
}
</script>

<style>
.el-image {
  display: block;
}
</style>
