<template>
  <input class="p-0" v-model="data" :enterkeyhint="enterkeyhint" :type="type" />
</template>

<script>
export default {
  name: 'InputDebounce',
  // inheritAttrs: false,
  props: {
    modelValue: String,
    type: {
      type: String,
      default: 'text',
      validator(value) {
        // The value must match one of these strings
        return ['text', 'tel', 'number', 'password', 'search', 'email', 'color'].includes(value)
      }
    },
    enterkeyhint: {
      type: String,
      default: 'enter',
      validator(value) {
        // The value must match one of these strings
        return ['enter', 'done', 'go', 'next', 'previous', 'search', 'send'].includes(value)
      }
    },
    updateDebounce: {
      type: Number,
      default: 200
    },
    updateMaxWait: {
      type: Number,
      default: 5000
    }
  },
  setup(props, { emit }) {
    const data = ref(props.modelValue ?? '')
    watchDebounced(
      data,
      () => {
        emit('update:modelValue', data.value)
      },
      { debounce: props.updateDebounce, maxWait: props.updateMaxWait }
    )
    return { data }
  }
}
</script>
