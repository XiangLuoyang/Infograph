# Agent Skills and Renderer Landscape · verified shortlist

> [!IMPORTANT]
> 本文是 **2026-11-22 可访问性与功能说明核查**，不等于安装执行、质量实测或安全审计。**Skill 是给AI Agent的工作流说明/工具组合，渲染库才负责浏览器实际绘图**。优先引入少量已验证能力，不把“skill页面存在”当作“工业成熟、能直接部署”。

## 一、选型优先级

| 场景 | 优先组合 | 核心原因 |
|---|---|---|
| 通用信息图、组织图、层次图 | diagram-design + visualization-strategy-and-critique | 自包含HTML+SVG、语义与美学 |
| 需要可编辑流程图、泳道图 | drawio + node-link-and-diagram-layout | 规范形状、布线与可维护源文件 |
| 统计、动态数据编码 | data-visualization + d3-data-visualization + statistical-and-uncertainty | 防止图表误导，支持定制 |
| 爆炸图、剖切、组件结构 | threejs-scene + exploded-view + threejs-data-visualization | 将场景几何与解构交互分离 |
| 地图与三维GIS | geospatial-and-cartographic + threejs-data-visualization | 地理精度、投影和GPU适配 |
| 结构图/软件架构 | uml-and-software-architecture + node-link-and-diagram-layout | 符号规则与自动布线 |
| 科研医学 | scientific-visualization + domain renderer | 科学意义、出处与数据处理可复现 |
| 所有交付 | testing-data-visualizations + accessibility-and-inclusive-visualization | 语义/交互/可读性验收 |

## 二、检索核验过的 Agent Skills

“成熟度”是 Infograph 的**采用建议**，不是作者官方承诺或安全保证。公开安装数量为技能目录在核对时显示的快照，随时间变化。某些 Skill 明确依赖外部包或本地工具。

| Skill | 仓库/安装入口 | 能力 | 主要输出 | 采用建议 | 注意事项 |
|---|---|---|---|---|---|
| [diagram-design](https://www.skills.sh/cathrynlavery/diagram-design/diagram-design) | [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) | 通用结构与知识图解；45种HTML+SVG图型 | HTML+SVG / stand-alone | 高 | 公开目录显示31.4K installs；官方说明可自定义设计令牌 |
| [drawio](https://www.skills.sh/jgraph/drawio-mcp/drawio) | [jgraph/drawio-mcp](https://github.com/jgraph/drawio-mcp) | 流程、架构、电气符号草图、可编辑工程图 | draw.io native + export SVG | 高 | Draw.io 生态出品；可编辑格式、Mermaid/XML、ELK；目录显示3.6K installs |
| [scientific-visualization](https://www.skills.sh/k-dense-ai/scientific-agent-skills/scientific-visualization) | [k-dense-ai/scientific-agent-skills](https://github.com/k-dense-ai/scientific-agent-skills) | 科学图、可重复数据变换、期刊图形审查 | 科研绘图 / 可审计输出 | 较高 | 团队维护科学技能库；目录显示2.7K installs，不等于所有科学场HTML可用 |
| [data-visualization](https://www.skills.sh/openai/plugins/data-visualization) | [openai/plugins](https://github.com/openai/plugins) | 常规与综合统计图表选型 | Canvas/SVG/D3/ECharts等 | 参考规范 | 发布者提供的工作流规范；不等于现成图表库 |
| [visualization-strategy-and-critique](https://www.skills.sh/openai/plugins/visualization-strategy-and-critique) | [openai/plugins](https://github.com/openai/plugins) | 信息目的、证据结构、图型策略与设计评审 | 设计方法论 | 参考规范 | 指导任务与呈现关系；不是renderer |
| [d3-data-visualization](https://www.skills.sh/openai/plugins/d3-data-visualization) | [openai/plugins](https://github.com/openai/plugins) | 定制SVG图形、缩放/brush/复杂交互 | D3.js / SVG | 参考规范 | 适合高级交互图，不覆盖工程规范绘图 |
| [statistical-and-uncertainty-visualization](https://www.skills.sh/openai/plugins/statistical-and-uncertainty-visualization) | [openai/plugins](https://github.com/openai/plugins) | 分布、区间、采样、统计不确定性表达 | 统计图 | 参考规范 | 保留误差、不确定性及样本边界 |
| [node-link-and-diagram-layout](https://www.skills.sh/openai/plugins/node-link-and-diagram-layout) | [openai/plugins](https://github.com/openai/plugins) | 布局、连线、交叉减少、路径规划 | ELK/Dagre/Graphviz等 | 参考规范 | 适用关系图与流程网；不是单独的可视化引擎 |
| [uml-and-software-architecture-visualization](https://www.skills.sh/openai/plugins/uml-and-software-architecture-visualization) | [openai/plugins](https://github.com/openai/plugins) | UML、ER、C4、依赖关系与状态行为 | Graphviz/Mermaid/ELK等 | 参考规范 | 注重语义正确性而非只做漂亮连线 |
| [geospatial-and-cartographic-visualization](https://www.skills.sh/openai/plugins/geospatial-and-cartographic-visualization) | [openai/plugins](https://github.com/openai/plugins) | 地理投影、专题地图、空间属性与交互 | MapLibre/deck.gl等 | 参考规范 | 地理层级正确性优于装饰性3D |
| [threejs-data-visualization](https://www.skills.sh/openai/plugins/threejs-data-visualization) | [openai/plugins](https://github.com/openai/plugins) | 三维场、点云、空间轨迹、WebGL性能 | Three.js/WebGL | 参考规范 | 强调3D必须承载语义；移动GPU成本需评估 |
| [threejs-scene](https://www.skills.sh/moh4696/open-3d-skills/threejs-scene) | [moh4696/open-3d-skills](https://github.com/moh4696/open-3d-skills) | 代码构建三维场景，真实比例与渲染 | Three.js | 试点 | 与exploded-view同生态；较新项目 |
| [exploded-view](https://www.skills.sh/moh4696/open-3d-skills/exploded-view) | [moh4696/open-3d-skills](https://github.com/moh4696/open-3d-skills) | 零件拆解/X-Ray/剖切/拾取/引线标注 | Three.js + GLB or generated mesh | 试点 | 2026-10-31首次见于目录，约445 installs；需模型几何数据；并非CAD正确性保障 |
| [explodedview](https://www.skills.sh/charikshith/skills/explodedview) | [charikshith/skills](https://github.com/charikshith/skills) | 单页自包含3D产品拆解叙事 | Three.js primitives HTML | 实验 | 约10 installs；偏展示产品而非精确实体，不能称成熟工业CAD技能 |
| [scrollytelling-and-parallax-data-visualization](https://www.skills.sh/openai/plugins/scrollytelling-and-parallax-data-visualization) | [openai/plugins](https://github.com/openai/plugins) | 滚动叙事、分步揭示、转场动画 | HTML/CSS/JS | 参考规范 | 用于展示逻辑，不是独立图型本体 |
| [accessibility-and-inclusive-visualization](https://www.skills.sh/openai/plugins/accessibility-and-inclusive-visualization) | [openai/plugins](https://github.com/openai/plugins) | 键盘、色觉辅助、文本等价表达 | 可访问性QA | 参考规范 | 关键结论不应仅由颜色/hover承载 |
| [testing-data-visualizations](https://www.skills.sh/openai/plugins/testing-data-visualizations) | [openai/plugins](https://github.com/openai/plugins) | 分析准确性、交互回归、截图快照测试 | Playwright/fixture strategy | 参考规范 | 结构/数据/视觉分开验收；未证明当前Infograph已运行QA |
| [canvas2d-data-visualization](https://www.skills.sh/openai/plugins/canvas2d-data-visualization) | [openai/plugins](https://github.com/openai/plugins) | 高密度二维图、快速栅格渲染和动画 | Canvas2D | 参考规范 | 适合无需DOM逐元素操作且GPU非必需的场景 |
| [bpmn-workflow](https://www.skills.sh/wellapp-ai/well/bpmn-workflow) | [wellapp-ai/well](https://github.com/wellapp-ai/well) | 从功能规格转换BPMN及测试场景 | BPMN 2.0 | 实验 | 有专业BPMN目标，但未核实浏览器运行与生产级校验 |
| [camunda-dmn](https://www.skills.sh/camunda/skills/camunda-dmn) | [camunda/skills](https://github.com/camunda/skills) | 决策需求图DRD与决策表 | DMN | 领域专用 | 官方厂商技能，适合标准决策建模；非HTML可视化通用引擎 |

## 三、Skill 与专业引擎不能混为一谈

| 目标表达 | 推荐代码/渲染生态 | 来源 | 工程边界 |
|---|---|---|---|
| 常规量化图、时间与比较 | ECharts, D3, Vega-Lite, Plotly | [ECharts](https://echarts.apache.org/) · [D3](https://d3js.org/) | 图型选型与数值精度仍须测试 |
| 关系、网络和知识图 | Cytoscape.js, ELK, Graphviz, D3 | [Cytoscape](https://js.cytoscape.org/) · [ELK](https://eclipse.dev/elk/) | 复杂拓扑先检查语义，再布局 |
| BPMN / 决策模型 | bpmn-js / dmn-js | [bpmn-js](https://bpmn.io/toolkit/bpmn-js/) · [dmn-js](https://bpmn.io/toolkit/dmn-js/) | 业务规则必须符合相应标准 |
| 工业结构与爆炸视图 | Three.js + GLB/glTF or CAD conversion | [Three.js](https://threejs.org/) | 无正确模型则只可做示意视图 |
| 地理 / 3D地形 | MapLibre, deck.gl, CesiumJS | [MapLibre](https://maplibre.org/) · [deck.gl](https://deck.gl/) · [Cesium](https://cesium.com/platform/cesiumjs/) | 真实GIS精度必须有真实数据 |
| 科学体数据 | VTK.js / vtk / ParaView | [VTK.js](https://kitware.github.io/vtk-js/) · [ParaView](https://www.paraview.org/) | 浏览器能力、数据体积/格式、标量传递函数 |
| 分子与蛋白质 | Mol* / NGL | [Mol*](https://molstar.org/) · [NGL](https://nglviewer.org/) | 生物模型正确性取决于真实结构数据 |
| 医学 DICOM 影像 | Cornerstone3D | [Cornerstone](https://www.cornerstonejs.org/) | 影像数据权限、体位方向与医学用途边界 |
| 电路与工业符号 | KiCad及授权符号库、专用SVG符号集 | [KiCad](https://www.kicad.org/) | 禁止将示意电路冒充安全可用的工程设计 |

## 四、关键验收口径

1. **存在性**：skill URL 对应真实的 SKILL.md；记下来源仓库与依赖，不复制第三方代码到本库。
2. **适配性**：能否按用户的HTML场景生成**可嵌入组件**，还是只能输出完整独立页面？
3. **语义性**：部件坐标、连接拓扑、数值、投影和专业符号是否正确？
4. **执行性**：在具体运行环境安装依赖并测试，含无外部网络/移动端情况。
5. **安全与许可**：仅记录链接；引用官方标准需遵循授权，尤其IEC/ISO等符号素材不可未经许可批量复制。

### 采用建议（非安装）

目前建议基座先采用：**diagram-design + drawio + D3 + node-link-and-diagram-layout + threejs-data-visualization + testing-data-visualizations**。需要爆炸图时增配 `exploded-view`，但应先做一台分组几何/GLB样例及自动化交互验收。科研场景再增 `scientific-visualization`。

**公开证据、非性能评测**：上述技能的存在和用法均核对了各自的 skills.sh 页面；真正产品成熟度必须按本库的测试集判断。
