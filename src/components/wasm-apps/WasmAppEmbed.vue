<template>
  <section class="flex flex-col gap-3">
    <!-- 资源缺失引导卡片 -->
    <div
      v-if="resourceMissing"
      class="flex flex-col items-center justify-center gap-3 border border-gray-300 rounded-lg border-dashed bg-gray-50 p-10 text-center"
      :style="{ minHeight: '320px' }"
    >
      <span class="i-lucide:package-open text-3xl text-gray-400" />
      <p class="text-gray-700 font-medium">未找到 {{ title }} 的 WebAssembly 资源</p>
      <p class="text-sm text-gray-500">静态资源不随仓库分发，请先运行下载脚本：</p>
      <code class="rounded bg-gray-200 px-3 py-1.5 text-sm">pnpm run fetch:wasm-apps</code>
    </div>

    <!-- iframe 嵌入 -->
    <div
      v-else
      class="relative min-h-120 w-full overflow-hidden border border-gray-200 rounded-lg"
      :style="{ height: embedHeight }"
    >
      <iframe
        v-show="loaded"
        :src="appUrl"
        :title="title"
        class="h-full w-full border-0"
        allow="fullscreen"
        @load="loaded = true"
      />
      <div
        v-if="!loaded"
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50 text-sm text-gray-500"
      >
        <span class="i-lucide:loader-circle animate-spin text-2xl" />
        <span>{{ title }} 加载中…（wasm 体积较大，首次加载需较长时间）</span>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
/**
 * 外部静态 WASM 应用（WordCraft / PdfCraft / CADCraft）的 iframe 嵌入组件。
 * 静态资源由 scripts/fetch-wasm-apps.sh 下载到 public/wasm-apps/<appDir>/，
 * 这里基于 BASE_URL 拼出同源地址，并在资源缺失时显示引导卡片。
 */
defineOptions({
  name: 'WasmAppEmbed'
})

const props = defineProps<{
  /** public/wasm-apps/ 下的应用目录名 */
  appDir: string
  title: string
  description?: string
  /** 嵌入区高度，默认按视口自适应并设下限 */
  height?: string
}>()

const appUrl = `${import.meta.env.BASE_URL}wasm-apps/${props.appDir}/index.html`

// 外层布局不是固定高度链（LayoutMain 的内容区随内容撑开），不能依赖 flex-1 拉伸，
// 这里消费布局提供的统一高度基准 --preview-content-height，与 CadViewer 的自适应策略一致
const embedHeight = computed(() => {
  if (props.height) return props.height
  return 'calc(var(--preview-content-height, 80vh) - 120px)'
})

const loaded = ref(false)
const resourceMissing = ref(false)

onMounted(async () => {
  try {
    // 开发模式下 vite 对缺失路径做 SPA fallback（返回 200 + 项目 index.html），
    // 因此除了状态码，还要校验响应内容确实是 wasm 应用的入口（title 与本应用一致）。
    const res = await fetch(appUrl)
    if (!res.ok) {
      resourceMissing.value = true
      return
    }
    const html = await res.text()
    resourceMissing.value = !html.toLowerCase().includes(`<title>${props.title.toLowerCase()}`)
  } catch {
    // 预检失败（网络/缓存边缘情况）不阻断渲染，仍交给 iframe 尝试
    resourceMissing.value = false
  }
})
</script>
