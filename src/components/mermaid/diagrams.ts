/**
 * Mermaid 渲染引擎对照语料。
 *
 * 语料固定写死（压力项由循环生成后固定下来），两个引擎拿到逐字符相同的输入。
 * 覆盖日常最常见的九种图，另加一张多子图并联的复杂流程图，以及两项压力图：
 * - 复杂流程图：四个并行研发子图 + 多级评审回退，子图跨线、命名子图与判断分支都有，
 *   是最接近真实业务文档的形态，用来观察引擎在中等复杂度下的表现
 * - 大流程图：节点与连线的数量级远超常见文档，用来观察布局算法的增长曲线
 * - 长时序图：参与者多、消息密集，用来观察文本测量的累计成本
 *
 * 选择原则：两边都必须能正确解析。pele 声称支持 Mermaid 12.1 的全部内置类型，
 * 但两边的语法宽容度仍有差异，加新语料后要先在页面上确认两边都渲染成功。
 */

export interface DiagramCase {
  /** 稳定标识，用于结果行 key 与预览选中 */
  id: string
  /** 展示名 */
  label: string
  /** 预期的 Mermaid 图类型，已按 normalizeDiagramType 的口径归一 */
  expectedType: string
  /** 是否为压力项，表格里单独标注 */
  stress?: boolean
  code: string
}

function buildStressFlowchart(): string {
  const lines = ['flowchart TD']
  const groupCount = 12
  const perGroup = 6
  for (let g = 0; g < groupCount; g++) {
    lines.push(`  subgraph G${g}[模块 ${g + 1}]`)
    for (let i = 0; i < perGroup; i++) {
      lines.push(`    N${g}_${i}[节点 ${g + 1}-${i + 1}]`)
    }
    lines.push('  end')
    for (let i = 0; i < perGroup - 1; i++) {
      lines.push(`  N${g}_${i} --> N${g}_${i + 1}`)
    }
  }
  // 模块之间串成一条主干，避免出现 12 个互不相连的孤岛
  for (let g = 0; g < groupCount - 1; g++) {
    lines.push(`  N${g}_${perGroup - 1} --> N${g + 1}_0`)
  }
  return lines.join('\n')
}

function buildStressSequence(): string {
  const participants = 12
  const messagesPerStep = 50
  const lines = ['sequenceDiagram', '  autonumber']
  for (let p = 0; p < participants; p++) {
    lines.push(`  participant P${p} as 参与者${p + 1}`)
  }
  for (let i = 0; i < messagesPerStep; i++) {
    const from = i % participants
    const to = (i * 5 + 3) % participants
    lines.push(`  P${from}->>P${to}: 第 ${i + 1} 条消息，携带一段较长的文本内容用于测量文本宽度`)
  }
  return lines.join('\n')
}

export const DIAGRAM_CASES: DiagramCase[] = [
  {
    id: 'flowchart',
    label: '流程图',
    expectedType: 'flowchart',
    code: `flowchart LR
  A[开始] --> B{是否已登录}
  B -- 是 --> C[加载用户数据]
  B -- 否 --> D[跳转登录页]
  C --> E[渲染仪表盘]
  D --> E
  E --> F([结束])`
  },
  {
    id: 'flowchart-complex',
    label: '复杂流程图',
    expectedType: 'flowchart',
    code: `flowchart TD
  Start([产品立项])
  A[需求分析]
  B[总体方案设计]

  Start --> A
  A --> B

  %% 并行研发
  B --> S1
  B --> E1
  B --> SW1
  B --> P1

  subgraph Structure["结构研发"]
    S1[结构设计]
    S2[结构验证]
    S3{通过?}
    S1 --> S2
    S2 --> S3
    S3 -- 否 --> S1
  end

  subgraph Electronic["电子研发"]
    E1[电子设计]
    E2[电路验证]
    E3{通过?}
    E1 --> E2
    E2 --> E3
    E3 -- 否 --> E1
  end

  subgraph Software["软件研发"]
    SW1[软件开发]
    SW2[软件验证]
    SW3{通过?}
    SW1 --> SW2
    SW2 --> SW3
    SW3 -- 否 --> SW1
  end

  subgraph Process["工艺研发"]
    P1[工艺设计]
    P2[工艺验证]
    P3{通过?}
    P1 --> P2
    P2 --> P3
    P3 -- 否 --> P1
  end

  %% 聚合
  S3 -- 是 --> Merge
  E3 -- 是 --> Merge
  SW3 -- 是 --> Merge
  P3 -- 是 --> Merge
  Merge{{设计成果聚合}}

  %% 系统级评审
  Merge --> Review
  Review[系统设计评审]
  Review --> ReviewOK{通过?}
  ReviewOK -- 否 --> B

  %% 样机
  ReviewOK -- 是 --> Prototype
  Prototype[样机制造]

  %% 系统测试
  Prototype --> Test
  Test[整机测试]
  Test --> Result{通过?}
  Result -- 否 --> B
  Result -- 是 --> Release

  Release[版本发布]
  Output[输出]
  Release --> Output
  Output --> End([完成])`
  },
  {
    id: 'sequence',
    label: '时序图',
    expectedType: 'sequence',
    code: `sequenceDiagram
  participant U as 用户
  participant W as 前端
  participant S as 服务端
  participant D as 数据库
  U->>W: 提交表单
  W->>S: POST /api/submit
  S->>D: INSERT INTO records
  D-->>S: 插入成功
  S-->>W: 200 OK
  W-->>U: 显示成功提示`
  },
  {
    id: 'class',
    label: '类图',
    expectedType: 'classDiagram',
    code: `classDiagram
  class Repository {
    +String name
    +List~Item~ items
    +find(id) Item
    +save(item) void
  }
  class Item {
    +String id
    +String title
    +Date createdAt
  }
  class User {
    +String id
    +String email
  }
  Repository "1" --> "*" Item : contains
  User "1" --> "*" Item : owns`
  },
  {
    id: 'state',
    label: '状态图',
    expectedType: 'stateDiagram',
    code: `stateDiagram-v2
  [*] --> 待提交
  待提交 --> 审核中: 提交
  审核中 --> 已通过: 通过
  审核中 --> 已驳回: 驳回
  已驳回 --> 待提交: 修改后重新提交
  已通过 --> [*]`
  },
  {
    id: 'er',
    label: 'ER 图',
    expectedType: 'erDiagram',
    code: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ ORDER_ITEM : contains
  PRODUCT ||--o{ ORDER_ITEM : "referenced by"
  CUSTOMER {
    string id PK
    string name
    string email
  }
  ORDER {
    string id PK
    string customer_id FK
    date created_at
  }`
  },
  {
    id: 'gantt',
    label: '甘特图',
    expectedType: 'gantt',
    code: `gantt
  title 发布计划
  dateFormat YYYY-MM-DD
  section 设计
  需求梳理 :done, d1, 2026-01-05, 5d
  交互设计 :active, d2, after d1, 6d
  section 开发
  前端实现 :d3, after d2, 12d
  后端实现 :d4, after d2, 14d
  section 验收
  联调测试 :d5, after d4, 7d
  上线 :milestone, after d5, 0d`
  },
  {
    id: 'pie',
    label: '饼图',
    expectedType: 'pie',
    code: `pie showData
  title 浏览器占比
  "Chrome" : 62
  "Safari" : 20
  "Edge" : 9
  "Firefox" : 3
  "其他" : 6`
  },
  {
    id: 'mindmap',
    label: '思维导图',
    expectedType: 'mindmap',
    code: `mindmap
  root((渲染性能))
    解析
      增量解析
      语法容错
    渲染
      节点数量
      布局成本
      重绘范围
    测量
      帧间隔
      长任务
      内存占用`
  },
  {
    id: 'journey',
    label: '用户旅程',
    expectedType: 'journey',
    code: `journey
  title 下单流程
  section 浏览
    打开商品页: 5: 用户
    加入购物车: 4: 用户
  section 结算
    填写地址: 3: 用户
    选择支付: 2: 用户, 系统
  section 完成
    支付成功: 5: 系统`
  },
  {
    id: 'gitGraph',
    label: 'Git 图',
    expectedType: 'gitGraph',
    code: `gitGraph
  commit id: "init"
  commit id: "feat: 基础布局"
  branch develop
  checkout develop
  commit id: "feat: 流式渲染"
  commit id: "fix: 节点复用"
  checkout main
  merge develop
  commit id: "release: 1.0.0"`
  },
  {
    id: 'stress-flowchart',
    label: '大流程图',
    expectedType: 'flowchart',
    stress: true,
    code: buildStressFlowchart()
  },
  {
    id: 'stress-sequence',
    label: '长时序图',
    expectedType: 'sequence',
    stress: true,
    code: buildStressSequence()
  }
]
