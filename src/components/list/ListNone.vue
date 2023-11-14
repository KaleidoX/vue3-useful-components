<template>
  <van-config-provider :theme-vars="themeVars">
    <van-empty :description="description">
      <template #image>
        <img src="@/assets/images/list/bg-none.svg" alt="" />
      </template>
    </van-empty>
  </van-config-provider>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'ListNone'
})

defineProps({
  description: {
    type: String,
    default: '暂无数据'
  }
})

const maxWidth = window.innerWidth - 60
const themeVars = {
  emptyImageSize: `${maxWidth > 490 ? 490 : maxWidth}px`
}
</script>
