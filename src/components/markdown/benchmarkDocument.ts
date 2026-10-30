/**
 * 流式 Markdown 基准语料生成器。
 *
 * 两个库必须渲染完全相同的输入才有可比性，因此语料由固定 seed 的伪随机数生成，
 * 同一 targetChars 下每次运行结果逐字节一致，也便于跨轮次、跨会话复现结果。
 *
 * 语料覆盖 GFM 常见结构（标题 / 段落 / 有序无序列表 / 引用 / 表格 / 围栏代码 / 分隔线），
 * 段落里混入强调、行内代码、链接等行内标记，避免只用纯文本低估解析成本。
 */

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ZH_PHRASES = [
  '流式渲染的关键在于把解析成本摊到每个增量上',
  '增量更新时只有尾部节点需要重新计算',
  '长文档下节点数量会直接影响布局与重绘开销',
  '虚拟化只保留视口附近的节点，滚动时按需挂载',
  '批处理渲染把一次性的挂载压力拆成多个时间片',
  '文本节点合并能显著减少 DOM 操作次数',
  '代码块的语法高亮通常是最重的一段计算',
  '表格的列宽计算会触发额外的布局查询',
  '引用块嵌套层级过深时样式匹配会变慢',
  '列表项的标记符号由文档结构决定',
  '首屏可见性优先策略会推迟离屏节点的渲染',
  '增量解析只重算最后一个未闭合的语法块',
  '测量帧间隔比测量总耗时更能反映卡顿',
  '长任务会阻塞输入响应与合成线程的提交',
  '布局偏移通常来自异步插入的图片或代码块',
  '内存占用随节点规模线性增长',
  '重复挂载卸载会放大垃圾回收的压力',
  '同一份语料下的对比才有意义',
  '滑动窗口式的节点回收需要稳定的高度测量',
  '渲染管线中的样式计算与布局是串行的'
]

const EN_WORDS = [
  'streaming',
  'incremental',
  'parser',
  'renderer',
  'virtualization',
  'viewport',
  'batch',
  'layout',
  'paint',
  'commit',
  'scheduler',
  'microtask',
  'frame',
  'budget',
  'throttle',
  'latency',
  'throughput',
  'allocation',
  'token',
  'chunk'
]

const INLINE_MARKS = [
  '`ref()`',
  '`nextTick`',
  '`requestAnimationFrame`',
  '**增量解析**',
  '**视口优先**',
  '_摊薄成本_',
  '_稳态_',
  '~~已废弃~~',
  '[文档](https://example.com/guide)',
  '[基准](https://example.com/benchmark)'
]

const CODE_SNIPPETS = [
  "const value = ref('')",
  'const nodes = shallowRef<Node[]>([])',
  'watch(source, (next) => { render(next) })',
  'await nextTick()',
  'requestAnimationFrame(() => commit())',
  'if (pending) return schedule(flush)',
  'measure(() => mount(pane))',
  'const chunk = text.slice(offset, offset + size)'
]

type BlockKind = 'heading' | 'paragraph' | 'ul' | 'ol' | 'quote' | 'table' | 'code' | 'hr'

/** 固定循环顺序，保证任意长度语料都覆盖全部结构类型 */
const BLOCK_CYCLE: BlockKind[] = [
  'heading',
  'paragraph',
  'paragraph',
  'ul',
  'paragraph',
  'code',
  'paragraph',
  'quote',
  'paragraph',
  'table',
  'paragraph',
  'ol',
  'paragraph',
  'hr'
]

export interface BenchmarkDocOptions {
  /** 目标字符数，实际结果会略超出（追加完整块直到达标） */
  targetChars?: number
  seed?: number
}

/** 默认 500K 字符：与页面「500K 文档」选项保持一致 */
export const DEFAULT_TARGET_CHARS = 500 * 1024

function pick<T>(rand: () => number, list: readonly T[]): T {
  return list[Math.floor(rand() * list.length) % list.length]
}

function buildSentence(rand: () => number, index: number): string {
  const zh = `${pick(rand, ZH_PHRASES)}，${pick(rand, ZH_PHRASES)}。`
  const en = `Chunk ${index} keeps the ${pick(rand, EN_WORDS)} ${pick(rand, EN_WORDS)} under control.`
  return rand() > 0.35 ? zh : en
}

function buildParagraph(rand: () => number, index: number): string {
  const sentenceCount = 3 + Math.floor(rand() * 4)
  const sentences: string[] = []
  for (let i = 0; i < sentenceCount; i++) {
    const sentence = buildSentence(rand, index * 10 + i)
    // 约三成句子插入行内标记，保持解析路径完整
    sentences.push(rand() > 0.3 ? sentence : `${sentence} ${pick(rand, INLINE_MARKS)}`)
  }
  return sentences.join(' ')
}

function buildList(rand: () => number, index: number, ordered: boolean): string {
  const itemCount = 3 + Math.floor(rand() * 4)
  const lines: string[] = []
  for (let i = 0; i < itemCount; i++) {
    const marker = ordered ? `${i + 1}.` : '-'
    const extra = rand() > 0.6 ? ` ${pick(rand, INLINE_MARKS)}` : ''
    lines.push(`${marker} ${buildSentence(rand, index * 10 + i)}${extra}`)
  }
  return lines.join('\n')
}

function buildQuote(rand: () => number, index: number): string {
  return `> ${buildSentence(rand, index)}\n> ${pick(rand, ZH_PHRASES)}。`
}

function buildTable(rand: () => number, index: number): string {
  const header = '| 指标 | 说明 | 量级 |\n| --- | --- | --- |'
  const rows: string[] = []
  for (let i = 0; i < 3 + Math.floor(rand() * 2); i++) {
    rows.push(
      `| 样本 ${index}-${i} | ${pick(rand, ZH_PHRASES)} | ${(rand() * 100).toFixed(2)} ms |`
    )
  }
  return [header, ...rows].join('\n')
}

function buildCode(rand: () => number, index: number): string {
  const lineCount = 5 + Math.floor(rand() * 5)
  const lines: string[] = []
  for (let i = 0; i < lineCount; i++) {
    lines.push(`// step ${index}-${i}\n${pick(rand, CODE_SNIPPETS)}`)
  }
  return ['```ts', ...lines, '```'].join('\n')
}

function buildBlock(rand: () => number, kind: BlockKind, index: number): string {
  switch (kind) {
    case 'heading':
      return `## 章节 ${index} — ${pick(rand, ZH_PHRASES)}`
    case 'ul':
      return buildList(rand, index, false)
    case 'ol':
      return buildList(rand, index, true)
    case 'quote':
      return buildQuote(rand, index)
    case 'table':
      return buildTable(rand, index)
    case 'code':
      return buildCode(rand, index)
    case 'hr':
      return '---'
    case 'paragraph':
    default:
      return buildParagraph(rand, index)
  }
}

/**
 * 生成确定性基准语料。返回的字符串对同一 (targetChars, seed) 完全一致。
 */
export function buildBenchmarkDocument(options: BenchmarkDocOptions = {}): string {
  const targetChars = options.targetChars ?? DEFAULT_TARGET_CHARS
  const rand = mulberry32(options.seed ?? 0x5eed)

  const blocks: string[] = []
  let length = 0
  let blockIndex = 0

  while (length < targetChars) {
    const kind = BLOCK_CYCLE[blockIndex % BLOCK_CYCLE.length]
    const block = buildBlock(rand, kind, blockIndex)
    blocks.push(block)
    // 块之间统一空行分隔，长度按实际拼接结果累计
    length += block.length + 2
    blockIndex++
  }

  return blocks.join('\n\n')
}

/** 把文档切成等长切片，末片取剩余部分；用于模拟流式追加 */
export function sliceChunks(document: string, chunkSize: number): string[] {
  const size = Math.max(1, Math.floor(chunkSize))
  const chunks: string[] = []
  for (let end = size; end < document.length; end += size) {
    chunks.push(document.slice(0, end))
  }
  chunks.push(document)
  return chunks
}

/** UTF-8 字节数，用于在界面上同时展示字符数与体积 */
export function utf8Bytes(text: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text).length
  }
  // 降级估算：CJK 按 3 字节计
  let bytes = 0
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : 3
  }
  return bytes
}
