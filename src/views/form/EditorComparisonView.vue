<template>
  <section class="space-y-6">
    <header class="rounded-[28px] bg-slate-900 px-6 py-7 text-white">
      <p class="text-xs text-sky-300 font-semibold tracking-[0.2em] uppercase">Editor matrix</p>
      <h2 class="mt-2 text-2xl font-semibold">编辑器表格合并能力对比</h2>
      <p class="mt-3 max-w-3xl text-sm text-slate-300 leading-6">
        “支持方式”描述引擎能力来源；只有完成合并、保存、重新挂载验证后，持久化状态才会标记为“已验证”。
      </p>
    </header>

    <div class="overflow-x-auto border border-slate-200 rounded-[24px] bg-white">
      <table class="min-w-[1120px] w-full border-collapse text-left text-sm">
        <thead class="bg-slate-50 text-xs text-slate-500 tracking-wide uppercase">
          <tr>
            <th class="px-4 py-3">编辑器</th>
            <th class="px-4 py-3">类型 / 格式</th>
            <th class="px-4 py-3">支持方式</th>
            <th class="px-4 py-3">持久化</th>
            <th class="px-4 py-3">维护状态</th>
            <th class="px-4 py-3">许可证</th>
            <th class="px-4 py-3">备注</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="editor in editors" :key="editor.path" class="align-top hover:bg-slate-50/70">
            <td class="px-4 py-4">
              <router-link :to="editor.path" class="text-primary font-semibold hover:underline">
                {{ editor.title }}
              </router-link>
              <div class="mt-1 text-xs text-slate-400">
                {{ editor.capability.staticDeployment ? '可纯静态部署' : '需要服务端' }}
              </div>
            </td>
            <td class="px-4 py-4 text-slate-600">
              {{ kindLabels[editor.capability.kind] }} / {{ editor.capability.contentFormat }}
            </td>
            <td class="px-4 py-4">
              <span
                class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="supportClasses[editor.capability.mergeSupport]"
              >
                {{ supportLabels[editor.capability.mergeSupport] }}
              </span>
            </td>
            <td class="px-4 py-4 text-slate-600">
              {{ persistenceLabels[editor.capability.persistence] }}
            </td>
            <td class="px-4 py-4 text-slate-600">
              {{ editor.capability.maintenance === 'active' ? '积极维护' : '维护有限' }}
              <div class="mt-1 text-xs text-slate-400">
                核验于 {{ editor.capability.maintenanceCheckedAt }}
              </div>
            </td>
            <td class="px-4 py-4 text-slate-600">{{ editor.capability.license }}</td>
            <td class="max-w-sm px-4 py-4 text-slate-500 leading-6">
              {{ editor.capability.notes }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  EditorCapabilityMeta,
  EditorKind,
  TableMergePersistence,
  TableMergeSupport
} from '@/router/editorCapabilities'
import { previewRouteGroups } from '@/router/routes'

defineOptions({ name: 'EditorComparisonView' })

interface EditorComparisonItem {
  path: string
  title: string
  capability: EditorCapabilityMeta
}

const kindLabels: Record<EditorKind, string> = {
  spreadsheet: '电子表格',
  document: '文档',
  'rich-text': '富文本',
  block: '块编辑器',
  markdown: 'Markdown'
}

const supportLabels: Record<TableMergeSupport, string> = {
  'built-in': '内置',
  'official-extension': '官方扩展',
  'third-party-extension': '第三方扩展',
  experimental: '实验性',
  unsupported: '不支持'
}

const supportClasses: Record<TableMergeSupport, string> = {
  'built-in': 'bg-emerald-100 text-emerald-700',
  'official-extension': 'bg-sky-100 text-sky-700',
  'third-party-extension': 'bg-violet-100 text-violet-700',
  experimental: 'bg-amber-100 text-amber-700',
  unsupported: 'bg-slate-100 text-slate-500'
}

const persistenceLabels: Record<TableMergePersistence, string> = {
  'round-trip': '已验证回读',
  'runtime-only': '仅运行时',
  'not-verified': '待验证',
  unsupported: '不适用'
}

const formGroup = previewRouteGroups.find((group) => group.key === 'form')

const editors: EditorComparisonItem[] = (formGroup?.children ?? []).flatMap((route) => {
  const capability = route.meta?.editorCapability
  if (!capability) return []

  return [
    {
      path: `/form/${String(route.path)}`,
      title: String(route.meta?.title ?? route.name ?? route.path),
      capability
    }
  ]
})
</script>
