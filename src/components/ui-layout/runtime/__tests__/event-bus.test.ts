import { describe, expect, it, vi } from 'vitest'

import { EventBus } from '../event-bus'

describe('EventBus', () => {
  it('calls handler on emit', () => {
    const bus = new EventBus()
    const handler = vi.fn()
    bus.on('panel:close', handler)
    bus.emit('panel:close', { containerId: 'c1', panelId: 'p1' })
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ containerId: 'c1', panelId: 'p1' })
  })

  it('returns unsubscribe function', () => {
    const bus = new EventBus()
    const handler = vi.fn()
    const unsub = bus.on('panel:close', handler)
    unsub()
    bus.emit('panel:close', { containerId: 'c1', panelId: 'p1' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not cross-trigger between events', () => {
    const bus = new EventBus()
    const handlerA = vi.fn()
    const handlerB = vi.fn()
    bus.on('panel:close', handlerA)
    bus.on('panel:activate', handlerB)
    bus.emit('panel:close', { containerId: 'c1', panelId: 'p1' })
    expect(handlerA).toHaveBeenCalled()
    expect(handlerB).not.toHaveBeenCalled()
  })
})
