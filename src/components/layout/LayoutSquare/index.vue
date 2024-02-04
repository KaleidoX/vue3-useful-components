<template>
  <div class="square">
    <div class="square__sizer" :style="aspectStyle"></div>
    <div class="square__content"><slot /></div>
  </div>
</template>

<script lang="ts">
import './index.scss'

export default {
  name: 'LayoutSquare',
  props: {
    ratio: [String, Number]
  },
  computed: {
    aspectStyle() {
      const computedRatio = Number(this.ratio)
      return computedRatio ? { paddingBottom: (1 / computedRatio) * 100 + '%' } : void 0
    }
  }
}
</script>
