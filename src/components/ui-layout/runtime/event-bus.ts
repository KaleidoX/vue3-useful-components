import type { LayoutEvents } from '../core/types'

type Handler<T> = (payload: T) => void

export class EventBus {
  private _handlers = new Map<string, Set<(...args: unknown[]) => void>>()

  on<E extends keyof LayoutEvents>(event: E, handler: Handler<LayoutEvents[E]>): () => void {
    if (!this._handlers.has(event)) {
      this._handlers.set(event, new Set())
    }
    this._handlers.get(event)!.add(handler as (...args: unknown[]) => void)
    return () => {
      this._handlers.get(event)?.delete(handler as (...args: unknown[]) => void)
    }
  }

  emit<E extends keyof LayoutEvents>(event: E, payload: LayoutEvents[E]): void {
    this._handlers.get(event)?.forEach((h) => h(payload))
  }

  off<E extends keyof LayoutEvents>(event: E, handler: Handler<LayoutEvents[E]>): void {
    this._handlers.get(event)?.delete(handler as (...args: unknown[]) => void)
  }
}
