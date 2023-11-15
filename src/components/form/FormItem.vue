<template>
  <div
    class="flex items-center"
    :class="{ 'px-5 rounded-full': round, 'shadow-base': shadow, 'bg-base-200': background }"
  >
    <label v-if="label" class="mr-3 whitespace-nowrap">{{ label }}</label>
    <slot>
      <input
        class="min-w-0 flex-1"
        :class="{ 'cursor-pointer-events-none': disabled }"
        type="text"
        v-model="value"
        :placeholder="placeholder"
        :disabled="disabled"
        autocomplete="off"
        @focus="$emit('focus')"
        @focusin="$emit('focusin')"
        @focusout="$emit('focusout')"
      />
    </slot>
    <i v-if="arrowDown" class="i-ep:arrow-down-bold ml-3 color-primary"></i>
  </div>
</template>

<script>
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

const value = useVModel(props, 'modelValue', emit)
</script>
