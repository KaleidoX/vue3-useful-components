import type { InjectionKey } from 'vue'

import type { ILayoutManager } from '../core/types'

export const LayoutContextSymbol: InjectionKey<ILayoutManager> = Symbol('LayoutContext')
