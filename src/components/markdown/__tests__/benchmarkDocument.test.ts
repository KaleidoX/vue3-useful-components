import { describe, expect, it } from 'vitest'

import { buildBenchmarkDocument, sliceChunks, utf8Bytes } from '@/components/markdown/benchmarkDocument'

describe('buildBenchmarkDocument', () => {
  it('is deterministic for the same seed and target size', () => {
    const a = buildBenchmarkDocument({ targetChars: 5000, seed: 7 })
    const b = buildBenchmarkDocument({ targetChars: 5000, seed: 7 })

    expect(a).toBe(b)
  })

  it('produces different content for different seeds', () => {
    const a = buildBenchmarkDocument({ targetChars: 5000, seed: 1 })
    const b = buildBenchmarkDocument({ targetChars: 5000, seed: 2 })

    expect(a).not.toBe(b)
  })

  it('reaches the requested length', () => {
    const document = buildBenchmarkDocument({ targetChars: 20000 })

    // 追加完整块直到达标，因此只会超出，不会短于目标
    expect(document.length).toBeGreaterThanOrEqual(20000)
  })

  it('covers the structural blocks the benchmark relies on', () => {
    const document = buildBenchmarkDocument({ targetChars: 20000 })

    expect(document).toMatch(/^## 章节/m)
    expect(document).toContain('```ts')
    expect(document).toMatch(/^\| 指标 \|/m)
    expect(document).toMatch(/^> /m)
    expect(document).toMatch(/^- /m)
    expect(document).toMatch(/^1\. /m)
    expect(document).toContain('---')
  })
})

describe('sliceChunks', () => {
  it('returns cumulative prefixes so each chunk is a valid stream state', () => {
    const chunks = sliceChunks('abcdefghij', 4)

    expect(chunks).toEqual(['abcd', 'abcdefgh', 'abcdefghij'])
  })

  it('ends with the complete document', () => {
    const document = buildBenchmarkDocument({ targetChars: 2000 })
    const chunks = sliceChunks(document, 300)

    expect(chunks[chunks.length - 1]).toBe(document)
  })

  it('produces a single chunk when the size exceeds the document length', () => {
    expect(sliceChunks('abc', 100)).toEqual(['abc'])
  })

  it('treats non-positive sizes as a single-character step', () => {
    expect(sliceChunks('abc', 0)).toEqual(['a', 'ab', 'abc'])
  })
})

describe('utf8Bytes', () => {
  it('counts ASCII as one byte and CJK as three', () => {
    expect(utf8Bytes('abc')).toBe(3)
    expect(utf8Bytes('中')).toBe(3)
  })
})
