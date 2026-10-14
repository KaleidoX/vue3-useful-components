import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import EditorCanvasEditorView from '../EditorCanvasEditorView.vue'

vi.mock('@/components/form/EditorCanvasEditor/index.vue', () => ({
  default: {
    name: 'EditorCanvasEditor',
    props: ['content'],
    template: '<div class="canvas-editor-stub" />'
  }
}))

describe('EditorCanvasEditorView', () => {
  it('explains the shared selection path and exposes a remount verification action', () => {
    const wrapper = mount(EditorCanvasEditorView, {
      global: { stubs: { EvaluationTable: true } }
    })

    expect(wrapper.text()).toContain('选中 A1:B2')
    expect(wrapper.get('button').text()).toContain('导出并重建')
  })
})
