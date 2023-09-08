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
    <i v-if="arrowDown" class="ml-3 i-ep:arrow-down-bold color-primary"></i>
  </div>
</template>

<script>
export default {
  name: 'FormItem',
  props: {
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
  },
  setup(props, { emit }) {
    const value = useVModel(props, 'modelValue', emit)
    return { value }
  }
}
</script>
