import './index.scss'

export default {
  functional: true,
  name: 'LayoutSquare',
  props: {
    ratio: [String, Number]
  },
  render: (h, context) => {
    const aspectStyle = () => {
      const computedRatio = Number(this.ratio)
      return computedRatio ? { paddingBottom: (1 / computedRatio) * 100 + '%' } : undefined
    }
    return h('div', { staticClass: 'square' }, [
      h('div', { staticClass: 'square__sizer', style: aspectStyle() }),
      h('div', { staticClass: 'square__content' }, context.children)
    ])
  }
}
