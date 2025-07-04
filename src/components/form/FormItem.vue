<template>
  <div
    class="flex items-center"
    :class="{ 'px-5 rounded-full': props.round, 'shadow-base': props.shadow, 'bg-base-200': props.background }"
  >
    <label v-if="props.label" class="mr-3 whitespace-nowrap">{{ props.label }}</label>
    <slot>
      <input
        class="min-w-0 flex-1"
        :class="{ 'cursor-pointer-events-none': props.disabled }"
        type="text"
        v-model="value"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        autocomplete="off"
        @focus="($event) => emit('focus', $event)"
        @focusin="($event) => emit('focusin', $event)"
        @focusout="($event) => emit('focusout', $event)"
      />
    </slot>
    <i v-if="props.arrowDown" class="i-ep:arrow-down-bold ml-3 color-primary"></i>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'FormItem'
})
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: String,
  placeholder: String,
  autocomplete: {
    type: String,
    default: 'off'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  round: {
    type: Boolean,
    default: true
  },
  background: {
    type: Boolean,
    default: false
  },
  shadow: {
    type: Boolean,
    default: false
  },
  arrowDown: {
    type: Boolean,
    default: false
  }
})

const value = defineModel('modelValue')

const emit = defineEmits(['focus', 'focusin', 'focusout'])
</script>
