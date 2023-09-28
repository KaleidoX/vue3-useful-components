<template>
  <van-config-provider :theme-vars="themeVars">
    <van-empty :description="description">
      <template #image>
        <img src="@/assets/images/list/bg-none.svg" alt="" />
      </template>
    </van-empty>
  </van-config-provider>
</template>

<script lang="ts">
export default defineComponent({
  name: 'ListNone',
  props: {
    description: {
      type: String,
      default: '暂无数据'
    }
  },
  setup() {
    const maxWidth = window.innerWidth - 60
    const themeVars = {
      emptyImageSize: `${maxWidth > 490 ? 490 : maxWidth}px`
    }
    return { themeVars }
  }
})
</script>
