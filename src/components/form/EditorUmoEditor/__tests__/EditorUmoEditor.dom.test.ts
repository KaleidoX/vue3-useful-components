import { defineComponent, h, onMounted } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  setContent: vi.fn(),
  getContent: vi.fn(() => '<p>saved</p>'),
  editor: { getHTML: vi.fn(() => '<p>changed</p>') }
}))

vi.mock('@umoteam/editor/style', () => ({}))
vi.mock('@umoteam/editor', () => ({
  UmoEditor: defineComponent({
    name: 'UmoEditor',
    props: ['height', 'page', 'document', 'editor', 'toolbar'],
    emits: ['created', 'changed'],
    setup(_, { emit, expose }) {
      expose({ setContent: mocks.setContent, getContent: mocks.getContent })
      onMounted(() => emit('created', { editor: mocks.editor }))
      return () => h('div', { class: 'umo-library-stub' })
    }
  })
}))

import EditorUmoEditor from '../index.vue'

describe('EditorUmoEditor', () => {
  beforeEach(() => vi.clearAllMocks())

  it('passes options as top-level props and initializes content through the public API', async () => {
    const wrapper = mount(EditorUmoEditor, {
      props: { modelValue: '<p>initial</p>' }
    })

    await wrapper.vm.$nextTick()

    const umo = wrapper.findComponent({ name: 'UmoEditor' })
    expect(umo.props('height')).toBeUndefined()
    expect(umo.props('page')).toBeUndefined()
    expect(mocks.setContent).toHaveBeenCalledWith('<p>initial</p>', {
      emitUpdate: false,
      focusPosition: false
    })
  })

  it('emits current HTML when Umo reports a document change', async () => {
    const wrapper = mount(EditorUmoEditor)
    await wrapper.findComponent({ name: 'UmoEditor' }).vm.$emit('changed', {
      editor: mocks.editor
    })

    expect(wrapper.emitted('update:modelValue')).toEqual([['<p>changed</p>']])
  })
})
