import { flushPromises, mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import EditorBlockNote from '../index.vue'
import { blockNoteTableFixture } from '../blockNoteTableFixture'

describe('EditorBlockNote', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        matches: false,
        removeEventListener: vi.fn(),
        removeListener: vi.fn()
      }))
    })
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: vi.fn(() => document.querySelector('td'))
    })
  })

  it('mounts, merges, splits and unmounts the isolated React editor tree', async () => {
    const wrapper = mount(EditorBlockNote, {
      props: { modelValue: structuredClone(blockNoteTableFixture) }
    })
    await flushPromises()
    await vi.waitFor(() => expect(wrapper.find('.bn-editor').exists()).toBe(true))

    const component = wrapper.vm as unknown as {
      mergeSampleCells: () => boolean
      splitSampleCell: () => boolean
    }
    expect(component.mergeSampleCells()).toBe(true)
    await vi.waitFor(() => expect(wrapper.findAll('td')).toHaveLength(6))
    expect(component.splitSampleCell()).toBe(true)
    await vi.waitFor(() => expect(wrapper.findAll('td')).toHaveLength(9))

    wrapper.unmount()
  })
})
