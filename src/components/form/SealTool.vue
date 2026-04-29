<template>
  <div class="seal-tool">
    <button class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600" @click="dialogVisible = true">
      插入电子签章
    </button>

    <Teleport to="body">
      <div v-if="dialogVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="dialogVisible = false">
        <div class="w-[480px] rounded-xl bg-white p-6 shadow-2xl">
          <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
            插入电子签章
          </h3>
          <p class="mb-2 text-xs text-gray-400">
            选择纯色背景的印章图片，自动提取。全程本地处理，无需上传服务器。
          </p>
          <div class="h-[240px] flex cursor-pointer items-center justify-center overflow-hidden border-2 border-blue-300 rounded border-dashed bg-gray-50" @click="selectImage">
            <span v-if="!sealImg && !converting" class="text-gray-400">点击选择印章图片</span>
            <span v-if="converting" class="text-blue-500">{{ converting }}</span>
            <img v-if="sealImg" class="max-h-full max-w-full" :src="sealImg" />
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button class="border rounded px-4 py-2 hover:bg-gray-50" @click="dialogVisible = false">取消</button>
            <button class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600" @click="insertSeal">插入</button>
          </div>
        </div>
      </div>
    </Teleport>
    <input ref="fileInputRef" type="file" accept="image/png,image/jpeg" class="hidden" @change="onFileSelected" />
  </div>
</template>

<script lang="ts" setup>
import { removeBackground } from '@imgly/background-removal'

defineOptions({ name: 'SealTool' })

const props = withDefaults(defineProps<{
  publicPath?: string
}>(), {
  publicPath: ''
})

const emit = defineEmits<{
  insert: [data: { id: string; src: string; name: string; size: number }]
}>()

const dialogVisible = ref(false)
const sealImg = ref<string | null>(null)
const converting = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement>()
const selectedBlob = ref<Blob | null>(null)

function selectImage() {
  fileInputRef.value?.click()
}

async function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    sealImg.value = null
    converting.value = '加载组件中...'
    const img = await removeBackground(file, {
      ...(props.publicPath ? { publicPath: props.publicPath } : {}),
      progress: () => { converting.value = '提取中，请稍候...' },
    })
    sealImg.value = URL.createObjectURL(img)
    selectedBlob.value = img
  } catch {
    converting.value = '提取失败，请重试'
  } finally {
    converting.value = null
  }
}

async function insertSeal() {
  if (!sealImg.value || !selectedBlob.value) return
  const id = `seal-${Date.now()}`
  emit('insert', {
    id,
    src: sealImg.value,
    name: `seal-${id}.png`,
    size: selectedBlob.value.size,
  })
  dialogVisible.value = false
  sealImg.value = null
  selectedBlob.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}
</script>
