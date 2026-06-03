import type { VNode } from 'vue'
import type { Text } from 'slate-vue3/core'
import type { VNodeChild } from 'vue'
import type { RenderElementProps } from 'slate-vue3'

export type ElementRenderer = (props: RenderElementProps) => VNode

export type ElementRendererRegistry = Record<string, ElementRenderer>

export type LeafWrapper = (leaf: Text, content: VNodeChild) => VNodeChild

export type LeafWrapperRegistry = {
  [K in keyof Text]?: LeafWrapper
} & Record<string, LeafWrapper | undefined>
