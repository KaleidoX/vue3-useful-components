<template>
  <input class="p-0" v-model="data" />
</template>

<script lang="ts" setup>
defineOptions({
  name: 'InputDebounce'
})
const props = defineProps({
  modelValue: String,
  updateDebounce: {
    type: Number,
    default: 200
  },
  updateMaxWait: {
    type: Number,
    default: 5000
  }
})
const emit = defineEmits(['update:modelValue'])
const data = ref(props.modelValue ?? '')
watchDebounced(
  data,
  () => {
    emit('update:modelValue', data.value)
  },
  { debounce: props.updateDebounce, maxWait: props.updateMaxWait }
)
</script>
