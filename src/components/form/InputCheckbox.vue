<template>
  <div
    class="h-6 w-6 flex items-center justify-center border rounded-md border-solid color-base-100"
    :class="checked ? 'bg-success border-success' : 'bg-base-100 border-border'"
  >
    <i class="i-ep:select"></i>
  </div>
</template>

<script lang="ts">
export default {
  name: 'InputCheckbox',
  props: {
    checked: {
      type: Boolean,
      default: false
    }
  }
}
</script>
