import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const joditMock = vi.hoisted(() => {
  const handlers = new Map<string, () => void>()
  const instance = {
    value: '',
    editor: document.createElement('div'),
    o: {},
    events: {
      on: vi.fn((name: string, handler: () => void) => handlers.set(name, handler)),
      off: vi.fn()
    },
    execCommand: vi.fn(),
    getInstance: vi.fn(),
    synchronizeValues: vi.fn(),
    setReadOnly: vi.fn(),
    destruct: vi.fn()
  }
  return { handlers, instance, make: vi.fn(() => instance) }
})

vi.mock('jodit', () => ({ Jodit: { make: joditMock.make } }))

import EditorJodit from '../index.vue'

describe('EditorJodit', () => {
  beforeEach(() => {
    joditMock.handlers.clear()
    joditMock.instance.value = ''
    joditMock.instance.editor.innerHTML = ''
    vi.clearAllMocks()
  })

  it('owns the core lifecycle and synchronizes HTML v-model', async () => {
    const wrapper = mount(EditorJodit, {
      props: { modelValue: '<p>before</p>', height: 360, readOnly: false }
    })

    expect(joditMock.make).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ height: 360, readonly: false })
    )
    expect(joditMock.instance.value).toBe('<p>before</p>')
    expect(wrapper.emitted('ready')?.[0]?.[0]).toBe(joditMock.instance)

    joditMock.instance.value = '<table><tbody><tr><td rowspan="2">A1</td></tr></tbody></table>'
    joditMock.handlers.get('change')?.()
    const updates = wrapper.emitted('update:modelValue') ?? []
    expect(updates[updates.length - 1]?.[0]).toContain('rowspan="2"')

    await wrapper.setProps({ modelValue: '<p>outside</p>', readOnly: true })
    expect(joditMock.instance.value).toBe('<p>outside</p>')
    expect(joditMock.instance.setReadOnly).toHaveBeenCalledWith(true)

    wrapper.unmount()
    expect(joditMock.instance.destruct).toHaveBeenCalledOnce()
  })

  it('uses Jodit native table commands for the deterministic merge demo', () => {
    const selected = new Set<HTMLTableCellElement>()
    joditMock.instance.editor.innerHTML =
      '<table><tbody><tr><td>A1</td><td>A2</td><td>A3</td></tr><tr><td>B1</td><td>B2</td><td>B3</td></tr></tbody></table>'
    const tableModule = {
      addSelection: (cell: HTMLTableCellElement) => selected.add(cell),
      getAllSelectedCells: () => [...selected],
      mergeSelected: vi.fn(),
      removeSelection: (cell: HTMLTableCellElement) => selected.delete(cell)
    }
    joditMock.instance.getInstance.mockReturnValue(tableModule)
    const wrapper = mount(EditorJodit)

    expect(wrapper.vm.mergeSampleCells()).toBe(true)
    expect([...selected].map((cell) => cell.textContent)).toEqual(['A1', 'A2', 'B1', 'B2'])
    expect(tableModule.mergeSelected).toHaveBeenCalledWith(
      joditMock.instance.editor.querySelector('table')
    )
  })
})
