<template>
  <form
    class="h-12.5 flex items-center rounded-2xl bg-base-300 pl-5"
    @submit.stop.prevent="submitSearch"
  >
    <el-input class="h-11 min-w-0 flex-1" v-model="value" :placeholder="placeholder" clearable />
    <button class="ml-3 h-11 w-13 rounded-2xl bg-primary color-white" type="submit">
      <i class="i-ep:search text-3xl"></i>
    </button>
  </form>
</template>

<script lang="ts">
export default {
  name: 'InputSearch',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: String
  },
  setup(props, { emit }) {
    const value = ref('')
    const submitSearch = () => {
      emit('update:modelValue', value.value)
    }
    return { value, submitSearch }
  }
}
</script>

<style lang="scss" scoped>
.el-input {
  --el-input-height: 44px;
  :deep() {
    .el-input__wrapper {
      border: none;
      background: none;
      box-shadow: none;
    }
  }
}
</style>
