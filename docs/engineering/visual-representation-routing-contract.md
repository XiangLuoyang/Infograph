# Visual Representation Routing Contract · HTML图形选择与生成协议

> **Stage: proposed / 未实现为独立Agent Skill。** 本文把已有五维设计方法论、跨学科图型目录和可复用HTML渲染器连接起来，供后续自建 Infograph Skill。它不代表已通过浏览器/领域规范测试。

## 0. 目标

给定任意可视化任务，**先明确图形语义，再选择专业图型，再选择渲染器**。不允许因为 ECharts 或 Mermaid “容易生成”，就把所有信息逼进折线图/节点图。

```text
user intent / audience / accuracy
        ↓
Domain & Semantic Model
        ↓
Representation Type ID + evidence gate
        ↓
Encoding + composition + projection + layout
        ↓
Renderer + interaction + material
        ↓
QA (semantic > geometry > interaction > aesthetics)
```

## 1. 结构化输入建议

```json
{
  "task": {
    "objective": "解释一个复杂对象的零件装配关系",
    "audience": "技术评审与管理者",
    "reading_context": "HTML大屏",
    "interaction_required": ["explode", "click", "labels"],
    "accuracy_requirement": "illustrative"
  },
  "domain": "mechanical-manufacturing",
  "data": {
    "source_type": "glb",
    "file": "sample-assembly.glb",
    "parts": [
      {"id": "shell", "assembly_order": 5},
      {"id": "rotor", "assembly_order": 2}
    ],
    "fact_status": "synthetic_example"
  },
  "representation": {
    "canonical_type_id": "exploded-view",
    "modifiers": ["three-dimensional", "x-ray-toggle", "staged-animation"],
    "geometry_validation": "required_if_claiming_actual_assembly"
  },
  "output": {
    "format": "html",
    "embed_mode": "component",
    "preferred_renderer": "threejs"
  }
}
```

字段含义：`domain`决定专业约束；`data`决定是否有正确的真实模型；`representation`的 `canonical_type_id`指向待建设的独立类型词典，不能误把材质/动画作为类型；`accuracy_requirement` 区分示意 / 设计核验 / 工程级。

## 2. 图形选型的不可跳过步骤

| 检查 | 要问的问题 | 失败时的处理 |
|---|---|---|
| Semantic Gate | 目的是什么：比较、构成、结构、路径、流转、因果、专业符号？ | 补语义建模，不能先选库 |
| Data Gate | 是统计表、网络边表、空间坐标、CAD/GLB、影像还是符号规范？ | 找合适输入；禁止编造不在数据中的部件 |
| Domain Gate | 是否有领域规范：IEC/ISO/USGS/BPMN/医学方向？ | 标为示意图，不能作权威工程图 |
| Graph Gate | 图型是否独立存在，还是别名、变体、相机或材质修饰器？ | canonical 类型及别名归并 |
| Renderer Gate | SVG/Canvas/Graph/WebGL 哪个足以准确实现？ | 简单问题优先低复杂度 |
| Interaction Gate | 需要哪个对象可选、过滤、展开、钻取和动画阶段？ | 无交互必要则不增加炫技动画 |
| QA Gate | 视觉、语义、数据、交互是否可复现与可访问？ | 有阻断错误不得标为已验证 |

## 3. 能力路由矩阵

| 语义目的 | 图形候选 | 渲染路径 | 首选Skill |
|---|---|---|---|
| 排名、时间、构成 | Bar/Line/Heatmap/... | ECharts/Vega/D3 | [data-visualization](agent-skills-and-renderers.md) |
| 复杂关系拓扑 | Network/Dependency/Process | ELK + D3/SVG | [node-link-and-diagram-layout](agent-skills-and-renderers.md) |
| 软件或系统架构 | UML/ER/C4/BPMN | Mermaid/Graphviz/bpmn-js | [uml-and-software-architecture](agent-skills-and-renderers.md) |
| 精确可编辑流程 | BPMN / Swimlane / Diagram | draw.io native / SVG | [drawio](agent-skills-and-renderers.md) |
| 结构解剖、爆炸图 | Exploded/Cutaway/Assembly | Three.js + GLB | [exploded-view](agent-skills-and-renderers.md) |
| 地图、区域空间 | Choropleth / 3D Tiles / terrain | MapLibre/deck.gl/Cesium | [geospatial](agent-skills-and-renderers.md) |
| 数值场和医学体 | Slice / Isosurface / Volume | VTK.js / specialized DICOM viewer | [scientific-visualization](agent-skills-and-renderers.md) |
| 技术符号图 | Electrical / Chemical / P&ID | 领域图元和明确符号来源 | 先规范核对，尚无已测试通用Skill |
| 博物馆/考古 | Harris Matrix / Stratigraphy | Graphviz/ELK + SVG | 通用图形Skill + 领域适配 |
| 语义叙事呈现 | Phased Reveal / Scrollytelling | CSS / JS / SVG | [scrollytelling](agent-skills-and-renderers.md) |

## 4. HTML组件交付约束

1. **视觉语义不被主题色改写**：节点/线、方向、坐标、单位、比例保持一致。
2. **无动效时仍能阅读**：提供 reduced-motion / 静态默认视图和可读标注。
3. **交互状态稳定**：选择、图层、拆解位置、镜头与标签映射同一对象ID。
4. **离线/联网须明确**：是否依赖CDN、地图瓦片、模型文件、真实数据接口。
5. **透明来源**：`L0`候选图型不能声称标准；`L1`只是出处列名，工程规范须至少`L2`。
6. **安全**：不输出未经授权的私人经营数据、商业敏感标识或第三方标准版权素材。
7. **结果验证**：Canvas/SVG截图、控制台、交互手势、移动端、空数据、缺失模型要测试。

## 5. 四组金样例建议

- **统计**：同一套5国WOS合成数据做排名图、偏差图和小多图，验收用户是否准确找到异常国家。
- **结构**：一套有真实尺寸定义的10部件示意装配，验证“聚合→3段爆炸→剖切→零件选择”，检查标签与零件位置同步。
- **拓扑**：20节点、30边、两个泳道、一个循环分支，验收ELK交叉数量、标签遮挡和边的语义。
- **地学/科学**：一个公开授权的体数据或规则化合成场，验证切片/等值面、体素数值映射、坐标方向与说明。

每个样例建立 `fixture.json`、`expected-semantics.json`、`render.html`、`qa.md`，完成之后才能标 `L4`。当前只是**计划中的验收样例定义**，并未声称已生成。

## 6. 来源与交叉索引

- [18学科专业扩展](../research/cross-domain-expansion-2026-11-22.md)
- [20项可核对的 Agent Skills](agent-skills-and-renderers.md)
- [ProcessIR流程与布线](process-ir-layout-routing.md)
- [五维设计语法](../foundations/five-dimension-design-grammar.md)
- [可视化测试Skill](https://www.skills.sh/openai/plugins/testing-data-visualizations)
