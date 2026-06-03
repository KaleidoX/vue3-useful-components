import { ref, reactive } from 'vue'

export type FlowMode = 'simple' | 'complex'

export interface InfoNodeData {
  id: string
  title: string
  subtitle: string
  status: 'success' | 'warning' | 'danger'
  statusLabel: string
}

export interface FormNodeData {
  id: string
  title: string
  inputValue: string
  selectValue: string
  toggleValue: boolean
}

export interface FlowEdgeData {
  id: string
  source: string
  target: string
}

export interface SimpleNodeData {
  id: string
  label: string
  row: number
  col: number
}

/* ── 固定数据源 ────────────────────────────────────────────── */

const INFO_NODES: InfoNodeData[] = [
  { id: 'info-1', title: '服务器 A', subtitle: '运行中 · CPU 45%', status: 'success', statusLabel: '正常' },
  { id: 'info-2', title: '服务器 B', subtitle: '高负载 · CPU 92%', status: 'warning', statusLabel: '警告' },
  { id: 'info-3', title: '服务器 C', subtitle: '已离线 · 无响应', status: 'danger', statusLabel: '异常' },
  { id: 'info-4', title: '数据库主库', subtitle: '连接数 32/100', status: 'success', statusLabel: '正常' },
  { id: 'info-5', title: '数据库从库', subtitle: '复制延迟 3s', status: 'warning', statusLabel: '警告' },
  { id: 'info-6', title: '缓存集群', subtitle: '命中率 98.5%', status: 'success', statusLabel: '正常' },
  { id: 'info-7', title: 'Redis 主节点', subtitle: '内存使用 78%', status: 'success', statusLabel: '正常' },
  { id: 'info-8', title: 'Redis 从节点', subtitle: '同步延迟 1s', status: 'warning', statusLabel: '注意' },
  { id: 'info-9', title: '消息队列', subtitle: '积压 1200 条', status: 'warning', statusLabel: '警告' },
  { id: 'info-10', title: 'CDN 节点-华北', subtitle: '带宽使用 45%', status: 'success', statusLabel: '正常' },
  { id: 'info-11', title: 'CDN 节点-华南', subtitle: '带宽使用 82%', status: 'warning', statusLabel: '警告' },
  { id: 'info-12', title: '负载均衡器', subtitle: '活跃连接 2.4k', status: 'success', statusLabel: '正常' },
  { id: 'info-13', title: 'API 网关', subtitle: 'QPS 12,500', status: 'success', statusLabel: '正常' },
  { id: 'info-14', title: '认证服务', subtitle: '响应时间 45ms', status: 'success', statusLabel: '正常' },
  { id: 'info-15', title: '日志收集器', subtitle: '磁盘使用 65%', status: 'success', statusLabel: '正常' },
  { id: 'info-16', title: '监控系统', subtitle: '告警规则 28 条', status: 'success', statusLabel: '正常' },
  { id: 'info-17', title: '定时任务', subtitle: '失败任务 3 个', status: 'danger', statusLabel: '异常' },
  { id: 'info-18', title: '文件存储', subtitle: '已用 2.1TB/5TB', status: 'success', statusLabel: '正常' },
  { id: 'info-19', title: '搜索索引', subtitle: '索引延迟 5s', status: 'warning', statusLabel: '注意' },
  { id: 'info-20', title: '备份系统', subtitle: '上次备份 2h 前', status: 'success', statusLabel: '正常' },
]

const FORM_NODES: FormNodeData[] = [
  { id: 'form-1', title: '用户信息', inputValue: '张三', selectValue: 'option1', toggleValue: true },
  { id: 'form-2', title: '系统配置', inputValue: '生产环境', selectValue: 'option2', toggleValue: false },
  { id: 'form-3', title: '通知设置', inputValue: 'admin@test.com', selectValue: 'option1', toggleValue: true },
  { id: 'form-4', title: '权限管理', inputValue: '1024', selectValue: 'option3', toggleValue: false },
  { id: 'form-5', title: '日志过滤', inputValue: 'ERROR', selectValue: 'option2', toggleValue: true },
  { id: 'form-6', title: '告警规则', inputValue: 'CPU > 80%', selectValue: 'option1', toggleValue: true },
  { id: 'form-7', title: '备份策略', inputValue: '每天 03:00', selectValue: 'option2', toggleValue: false },
  { id: 'form-8', title: '缓存策略', inputValue: 'TTL 3600', selectValue: 'option3', toggleValue: true },
  { id: 'form-9', title: '限流配置', inputValue: '1000 req/s', selectValue: 'option1', toggleValue: false },
  { id: 'form-10', title: '部署设置', inputValue: 'v2.3.1', selectValue: 'option2', toggleValue: true },
]

/* ── 布局常量 ──────────────────────────────────────────────── */

export const SIMPLE_COLS = 5
export const SIMPLE_GAP_X = 160
export const SIMPLE_GAP_Y = 70

export const COMPLEX_COLS = 4
export const COMPLEX_GAP_X = 220
export const COMPLEX_INFO_GAP_Y = 110
export const COMPLEX_FORM_START_Y = COMPLEX_INFO_GAP_Y * Math.ceil(INFO_NODES.length / COMPLEX_COLS) + 60

/* ── composable ────────────────────────────────────────────── */

export function useFlowData() {
  const mode = ref<FlowMode>('simple')
  const nodeCount = ref(10)
  const infoData = reactive<InfoNodeData[]>(INFO_NODES.map((n) => ({ ...n })))
  const formData = reactive<FormNodeData[]>(FORM_NODES.map((n) => ({ ...n })))

  /** 简单模式的网格节点数据 */
  function getSimpleNodes(): SimpleNodeData[] {
    const nodes: SimpleNodeData[] = []
    for (let i = 0; i < nodeCount.value; i++) {
      nodes.push({
        id: String(i + 1),
        label: `N${i + 1}`,
        row: Math.floor(i / SIMPLE_COLS),
        col: i % SIMPLE_COLS,
      })
    }
    return nodes
  }

  /** 简单模式的边 */
  function getSimpleEdges(): FlowEdgeData[] {
    const edges: FlowEdgeData[] = []
    for (let i = 0; i < nodeCount.value - 1; i++) {
      edges.push({ id: `e-${i + 1}-${i + 2}`, source: String(i + 1), target: String(i + 2) })
      if (i % 7 === 0 && i + 5 < nodeCount.value) {
        edges.push({ id: `e-cross-${i + 1}-${i + 6}`, source: String(i + 1), target: String(i + 6) })
      }
    }
    return edges
  }

  /** 复杂模式的 InfoCard 节点位置 */
  function getInfoPosition(index: number) {
    return {
      x: 50 + (index % COMPLEX_COLS) * COMPLEX_GAP_X,
      y: 50 + Math.floor(index / COMPLEX_COLS) * COMPLEX_INFO_GAP_Y,
    }
  }

  /** 复杂模式的 FormNode 节点位置 */
  function getFormPosition(index: number) {
    return {
      x: 50 + (index % COMPLEX_COLS) * COMPLEX_GAP_X,
      y: COMPLEX_FORM_START_Y + Math.floor(index / COMPLEX_COLS) * 140,
    }
  }

  /** 复杂模式的边 */
  function getComplexEdges(): FlowEdgeData[] {
    const edges: FlowEdgeData[] = []
    // Info 之间顺序连接
    for (let i = 0; i < infoData.length - 1; i++) {
      edges.push({ id: `e-${infoData[i].id}-${infoData[i + 1].id}`, source: infoData[i].id, target: infoData[i + 1].id })
    }
    // Info 跨行连接
    for (let i = 0; i < infoData.length; i += COMPLEX_COLS) {
      if (i + COMPLEX_COLS < infoData.length) {
        edges.push({ id: `e-cross-${infoData[i].id}-${infoData[i + COMPLEX_COLS].id}`, source: infoData[i].id, target: infoData[i + COMPLEX_COLS].id })
      }
    }
    // 桥接: 最后 Info → 第一个 Form
    edges.push({ id: `e-bridge-${infoData[infoData.length - 1].id}-${formData[0].id}`, source: infoData[infoData.length - 1].id, target: formData[0].id })
    // Form 之间顺序连接
    for (let i = 0; i < formData.length - 1; i++) {
      edges.push({ id: `e-${formData[i].id}-${formData[i + 1].id}`, source: formData[i].id, target: formData[i + 1].id })
    }
    // Form 跨行连接
    for (let i = 0; i < formData.length; i += COMPLEX_COLS) {
      if (i + COMPLEX_COLS < formData.length) {
        edges.push({ id: `e-cross-${formData[i].id}-${formData[i + COMPLEX_COLS].id}`, source: formData[i].id, target: formData[i + COMPLEX_COLS].id })
      }
    }
    return edges
  }

  /** Form 节点状态更新 */
  function updateFormInput(id: string, value: string) {
    const node = formData.find((n) => n.id === id)
    if (node) node.inputValue = value
  }
  function updateFormSelect(id: string, value: string) {
    const node = formData.find((n) => n.id === id)
    if (node) node.selectValue = value
  }
  function updateFormToggle(id: string, value: boolean) {
    const node = formData.find((n) => n.id === id)
    if (node) node.toggleValue = value
  }

  return {
    mode,
    nodeCount,
    infoData,
    formData,
    getSimpleNodes,
    getSimpleEdges,
    getInfoPosition,
    getFormPosition,
    getComplexEdges,
    updateFormInput,
    updateFormSelect,
    updateFormToggle,
  }
}
