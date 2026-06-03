<template>
  <div class="menu-item">
    <div title="表格" @click="toggleDropdown('table')">
      <i class="i-lucide:table" />
      <div v-show="ds.table" class="table-picker" @click.stop>
        <div class="table-picker-title">{{ tr }}×{{ tc }}</div>
        <div v-for="r in 10" :key="r" class="table-picker-row">
          <div
            v-for="c in 10"
            :key="c"
            class="table-picker-cell"
            :class="{ active: r <= tr && c <= tc }"
            @mouseenter="
              tr = r
              tc = c
            "
            @click="insertTable"
          />
        </div>
      </div>
    </div>
    <div title="图片" @click="imgRef?.click()"><i class="i-lucide:image" /></div>
    <input ref="imgRef" type="file" accept="image/*" class="hidden" @change="onImage" />
    <div title="超链接" @click="showHyperlink = true"><i class="i-lucide:link" /></div>
    <div title="分割线" @click="exec('executeSeparator', [])"><i class="i-lucide:minus" /></div>
    <div title="代码块" @click="showCodeblock = true"><i class="i-lucide:code-xml" /></div>
    <div title="分页" @click="exec('executePageBreak')"><i class="i-lucide:scissors" /></div>
    <div title="LaTeX" @click="showLatex = true"><i class="i-lucide:sigma" /></div>
    <div title="日期" @click="insertDate"><i class="i-lucide:calendar" /></div>

    <!-- 超链接弹窗 -->
    <Teleport to="body">
      <div v-if="showHyperlink" class="dialog-overlay" @click.self="showHyperlink = false">
        <div class="dialog-box">
          <div class="dialog-title">超链接</div>
          <input v-model="hl.text" class="dialog-input" placeholder="文本" />
          <input v-model="hl.url" class="dialog-input" placeholder="链接" />
          <div class="dialog-actions">
            <button class="dialog-btn" @click="showHyperlink = false">取消</button>
            <button class="dialog-btn primary" @click="doHyperlink">确定</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 代码块弹窗 -->
    <Teleport to="body">
      <div v-if="showCodeblock" class="dialog-overlay" @click.self="showCodeblock = false">
        <div class="dialog-box">
          <div class="dialog-title">代码块</div>
          <textarea v-model="cbText" class="dialog-textarea" rows="8" placeholder="请输入代码" />
          <div class="dialog-actions">
            <button class="dialog-btn" @click="showCodeblock = false">取消</button>
            <button class="dialog-btn primary" @click="doCodeblock">确定</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- LaTeX 弹窗 -->
    <Teleport to="body">
      <div v-if="showLatex" class="dialog-overlay" @click.self="showLatex = false">
        <div class="dialog-box">
          <div class="dialog-title">LaTeX 公式</div>
          <input v-model="latexStr" class="dialog-input" placeholder="例: \\frac{a}{b}" />
          <div class="dialog-actions">
            <button class="dialog-btn" @click="showLatex = false">取消</button>
            <button class="dialog-btn primary" @click="doLatex">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'CanvasInsertTool' })
import { useCanvasEditor } from '../injection'
const { exec } = useCanvasEditor()
const ds = reactive<Record<string, boolean>>({})
const tr = ref(3)
const tc = ref(3)
const imgRef = ref<HTMLInputElement>()

const showHyperlink = ref(false)
const showCodeblock = ref(false)
const showLatex = ref(false)
const hl = reactive({ text: '', url: '' })
const cbText = ref('')
const latexStr = ref('')

function toggleDropdown(k: string) {
  ds[k] = !ds[k]
}
function insertTable() {
  exec('executeInsertTable', tr.value, tc.value)
  ds.table = false
  tr.value = 3
  tc.value = 3
}

function onImage() {
  const file = imgRef.value?.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    exec('executeImage', { value: reader.result, width: 400, height: 300 })
    if (imgRef.value) imgRef.value.value = ''
  }
  reader.readAsDataURL(file)
}

function doHyperlink() {
  if (!hl.text || !hl.url) return
  exec('executeHyperlink', { url: hl.url, valueList: [{ value: hl.text, size: 16 }] })
  showHyperlink.value = false
  hl.text = ''
  hl.url = ''
}
function doCodeblock() {
  if (!cbText.value) return
  const lines = cbText.value.split('\n')
  exec('executeInsertElementList', [
    { value: '\n' },
    ...lines.map((l) => ({ value: l })),
    { value: '\n' }
  ])
  showCodeblock.value = false
  cbText.value = ''
}
function doLatex() {
  if (!latexStr.value) return
  exec('executeInsertElementList', [{ type: 'latex', value: latexStr.value }])
  showLatex.value = false
  latexStr.value = ''
}

function insertDate() {
  const d = new Date()
  const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  exec('executeInsertElementList', [
    { type: 'date', value: '', dateFormat: 'yyyy-MM-dd', valueList: [{ value: s }] }
  ])
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
}
.dialog-box {
  width: 400px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}
.dialog-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}
.dialog-input {
  width: 100%;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 8px;
  margin-bottom: 8px;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}
.dialog-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  font-family: monospace;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.dialog-btn {
  height: 32px;
  padding: 0 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
}
.dialog-btn.primary {
  background: #1a73e8;
  color: #fff;
  border-color: #1a73e8;
}
</style>
