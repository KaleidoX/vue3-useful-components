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

<script lang="ts" setup>
export interface TypeChangeListInfo<A = unknown, B = unknown> {
  type: string
  key?: string
  keyValue?: A
  newValue?: B
}

defineOptions({
  name: 'ListScroll'
})

const props = defineProps({
  api: Function,
  params: Object,
  showNone: {
    type: Boolean,
    default: true
  }
})

const list: Ref<unknown[]> = ref([])
const loading = ref(false)
const finished = ref(false)
const error = ref(false)
const refreshing = ref(false)

let page = 1
let pageCount = 1

if (props.params) {
  watch(() => props.params, onRefresh, { deep: true })
}

function onLoad() {
  if (!props.api) {
    return
  }
  if (page > pageCount) {
    finished.value = true
    return
  }
  props
    .api({
      ...unref(props.params),
      page: page
    })
    .then(({ list: dataList, pageCount: dataPageCount }: { list: []; pageCount: number }) => {
      if (refreshing.value) {
        list.value = []
        refreshing.value = false
      }
      list.value = list.value.concat(dataList)
      pageCount = dataPageCount
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
  pageCount = 1
  onLoad()
}
const handleChangeList = (changeInfo: TypeChangeListInfo) => {
  if (!changeInfo) {
    onRefresh()
    return
  }
  switch (changeInfo.type) {
    case 'delete': {
      if (!changeInfo.key) {
        return
      }
      for (let index = 0; index < list.value.length; index++) {
        const element = list.value[index]
        // @ts-expect-error 这里是一个通用模块 使用 unknown 作为安全类型
        if (element[changeInfo.key] === changeInfo.keyValue) {
          list.value.splice(index, 1)
          break
        }
      }
      break
    }
    case 'update': {
      if (!changeInfo.key) {
        return
      }
      for (let index = 0; index < list.value.length; index++) {
        const element = list.value[index]
        // @ts-expect-error 这里是一个通用模块 使用 unknown 作为安全类型
        if (element[changeInfo.key] === changeInfo.keyValue) {
          list.value.splice(index, 1, changeInfo.newValue)
          break
        }
      }
      break
    }
    case 'push': {
      if (changeInfo.newValue) {
        list.value.push(changeInfo.newValue)
      }
      break
    }
    case 'refresh':
      onRefresh()
      break
  }
}
provide('changeList', handleChangeList)
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
