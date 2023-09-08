<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
    <slot name="header"></slot>
    <van-list
      :class="{ 'hidden-finish': showNone && !list.length }"
      v-model:loading="loading"
      v-model:error="error"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <ListNone v-if="showNone && !list.length" />
      <slot :list="list"></slot>
    </van-list>
    <slot name="footer"></slot>
  </van-pull-refresh>
</template>

<script>
export default {
  name: 'ListScroll',
  props: {
    api: Function,
    params: Object,
    showNone: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const list = ref([])
    const loading = ref(false)
    const finished = ref(false)
    const error = ref(false)
    const refreshing = ref(false)

    let page = 1
    let pageTotal = 1

    if (props.params) {
      watch(() => props.params, onRefresh)
    }

    function onLoad() {
      if (!props.api) {
        return
      }
      if (page > pageTotal) {
        finished.value = true
        return
      }
      props
        .api({
          ...unref(props.params),
          page: page
        })
        .then(({ list: dataList, pageCount: dataPageTotal }) => {
          if (refreshing.value) {
            list.value = []
            refreshing.value = false
          }
          list.value = list.value.concat(dataList)
          pageTotal = dataPageTotal
          page += 1
        })
        .catch(() => {
          error.value = true
        })
        .finally(() => {
          loading.value = false
        })
    }
    function onRefresh() {
      // 清空列表数据
      refreshing.value = true
      finished.value = false
      error.value = false
      // 重新加载数据
      // 将 loading 设置为 true，表示处于加载状态
      loading.value = true
      page = 1
      pageTotal = 1
      onLoad()
    }
    function handleChangeList(changeInfo) {
      if (!changeInfo) {
        onRefresh()
        return
      }
      switch (changeInfo.type) {
        case 'delete': {
          for (let index = 0; index < list.value.length; index++) {
            const element = list.value[index]
            if (element[changeInfo.key] === changeInfo.keyValue) {
              list.value.splice(index, 1)
              break
            }
          }
          break
        }
        case 'update': {
          for (let index = 0; index < list.value.length; index++) {
            const element = list.value[index]
            if (element[changeInfo.key] === changeInfo.keyValue) {
              list.value.splice(index, 1, changeInfo.newValue)
              break
            }
          }
          break
        }
        case 'push': {
          list.value.push(changeInfo.newValue)
          break
        }
        case 'refresh':
          onRefresh()
        default:
          break
      }
    }
    provide('changeList', handleChangeList)
    return { list, loading, finished, error, refreshing, onLoad, onRefresh, handleChangeList }
  }
}
</script>

<style lang="scss">
.van-pull-refresh {
  overflow: unset !important;
}
.van-pull-refresh__head {
  pointer-events: none;
}
.hidden-finish .van-list__finished-text {
  display: none;
}
</style>
