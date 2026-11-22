# 18专业领域 → Agent Skills 路由与能力缺口

> 核查日期：2026-11-22。**“找到了通用Skill”≠“这个领域已有成熟专用Skill”**；本表仅证实Skill的可访问页面与声明能力，不代表逐类运行测试、标准合规或准确工程设计。领域列表来自[扩展研究](../research/cross-domain-expansion-2026-11-22.md)。

| 专业领域 | 专业覆盖判断 | 可复用Skill与地址 | 尚缺能力 |
|---|---|---|---|
| 电气电子与工业控制 | 无成熟专用Skill经本轮验证 | [drawio](https://www.skills.sh/jgraph/drawio-mcp/drawio) | IEC原理图与符号需领域校验；Draw.io仅辅助布局，不能自动保证工程电气正确性 |
| 通信与射频 | 无成熟专用Skill经本轮验证 | [d3-data-visualization](https://www.skills.sh/openai/plugins/d3-data-visualization) | 史密斯圆图/射频方向图需要正确数学变换和专业算法 |
| 化学与化工 | 专业规范须外部验证 | [scientific-visualization](https://www.skills.sh/k-dense-ai/scientific-agent-skills/scientific-visualization) | ISO10628与IUPAC约定不能仅由统计绘图Skill完成 |
| 地质与地球物理 | 通用Skill可辅助 | [geospatial-and-cartographic-visualization](https://www.skills.sh/openai/plugins/geospatial-and-cartographic-visualization) | 地层、测井与地震剖面需行业数据格式和符号校验 |
| 天文与天体物理 | 通用Skill可辅助 | [scientific-visualization](https://www.skills.sh/k-dense-ai/scientific-agent-skills/scientific-visualization) | H-R图坐标方向、光变曲线与FITS数据需天文专用约束 |
| 网络安全与威胁建模 | 通用Skill可辅助 | [uml-and-software-architecture-visualization](https://www.skills.sh/openai/plugins/uml-and-software-architecture-visualization) | ATT&CK技术矩阵和攻击路径的本体语义需MITRE数据适配 |
| 铁路与交通工程 | 无成熟专用Skill经本轮验证 | [d3-data-visualization](https://www.skills.sh/openai/plugins/d3-data-visualization) | 运行图时距坐标与时刻表约束需专用校验 |
| 考古与遗产记录 | 通用Skill可辅助 | [node-link-and-diagram-layout](https://www.skills.sh/openai/plugins/node-link-and-diagram-layout) | Harris矩阵的地层先后关系不能凭自动布局推断 |
| 用户体验与服务设计 | 通用图解Skill可用 | [diagram-design](https://www.skills.sh/cathrynlavery/diagram-design/diagram-design) | 服务蓝图等需保留frontstage/backstage和touchpoint语义 |
| 机械制造与工业设计 | 专用Skill可试点，成熟度待证 | [exploded-view](https://www.skills.sh/moh4696/open-3d-skills/exploded-view) | 提供拆解交互与剖切，真实尺寸/装配顺序仍须GLB/CAD验证 |
| 基因组学与生物信息学 | 通用Skill可辅助 | [scientific-visualization](https://www.skills.sh/k-dense-ai/scientific-agent-skills/scientific-visualization) | 基因组轨道/染色体可视化需专门数据模型和坐标语义 |
| 临床医学与生命科学 | 通用科研Skill可用 | [scientific-visualization](https://www.skills.sh/k-dense-ai/scientific-agent-skills/scientific-visualization) | 医学图像方向、DICOM数据权限和推断边界应额外审核 |
| 音乐与音频工程 | 无成熟专用Skill经本轮验证 | [d3-data-visualization](https://www.skills.sh/openai/plugins/d3-data-visualization) | 乐谱格式、谱号与节拍需music21/VexFlow类专业引擎 |
| 体育运动可视化 | 通用Skill可辅助 | [d3-data-visualization](https://www.skills.sh/openai/plugins/d3-data-visualization) | 球场坐标、投篮区域、轨迹事件需专用变换与定义 |
| 科学计算与多维场 | 通用3D与科研Skill组合 | [threejs-data-visualization](https://www.skills.sh/openai/plugins/threejs-data-visualization) | 体渲染建议VTK.js/Three.js；对数值场、采样与传递函数需专门QA |
| 城市规划与三维地理空间 | 通用地图Skill可用 | [geospatial-and-cartographic-visualization](https://www.skills.sh/openai/plugins/geospatial-and-cartographic-visualization) | OGC/3DTiles和真实地图数据不能被程序化纹理替代 |
| 生态与环境科学 | 通用科研+地理Skill | [scientific-visualization](https://www.skills.sh/k-dense-ai/scientific-agent-skills/scientific-visualization) | 物候、物种丰度、环境统计需学科定义与数据完整性 |
| 语言学与语音学 | 通用图解Skill可辅助 | [diagram-design](https://www.skills.sh/cathrynlavery/diagram-design/diagram-design) | 句法树/IPA元音图等语法和音标精度需专业规范 |

## 选型行动规则

- **通用且相对成熟的基座**：图解首选 [diagram-design](https://www.skills.sh/cathrynlavery/diagram-design/diagram-design)，可编辑工程流程优先 [jgraph/drawio](https://www.skills.sh/jgraph/drawio-mcp/drawio)。
- **专业/科学图形**：先读标准或领域教材；[scientific-visualization](https://www.skills.sh/k-dense-ai/scientific-agent-skills/scientific-visualization)只解决科研图表纪律，不自动保证任何专科语义。
- **爆炸图**：[exploded-view](https://www.skills.sh/moh4696/open-3d-skills/exploded-view)适合结构拆解交互，但依赖正确部件几何；它是新兴专项Skill，不能等同长期成熟的工业CAD工具。
- **复杂交互**：根据渲染路径选 [D3](https://www.skills.sh/openai/plugins/d3-data-visualization)、[Three.js](https://www.skills.sh/openai/plugins/threejs-data-visualization)、[ELK布局](https://www.skills.sh/openai/plugins/node-link-and-diagram-layout)，完成后用[测试Skill](https://www.skills.sh/openai/plugins/testing-data-visualizations)验收。
- **明确缺口**：电气、射频、化工标准图、铁路运行图、考古、音乐等专业类型目前未发现已验证的成熟端到端HTML专用Skill。应优先评估专业数据模型和渲染器，而非随意安装同名小众Skill。

## 数据源
[机器可读domain-skill-routing.json](../../catalog/extensions/domain-skill-routing.json) · [全部20个Skills目录](agent-skills-and-renderers.md)
