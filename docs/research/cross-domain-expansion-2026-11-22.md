# 全领域视觉表达扩展审计 · 2026-11-22

> [!IMPORTANT]
> **广度没有达标，本轮是增量扩展，不是补齐了所有图型。** V0.1 的 630 项中已有某些专业图型，但不能覆盖对应学科的绘制规约。本轮以**18个专业领域**反向检索，整理出155个图型名称：与V0.1按英文名称归一化完全匹配21项，未直接匹配134项。所谓“新增”只是命名去重结果，尚需语义同义与变体核验。L1仅12项有直接列名线索，其余143项是L0候选。

## 一、扩展结果与方法

| 指标 | 本轮 |
|---|---:|
| V0.1 基线英文名称 | 630 |
| V0.2 反向扫描的专业领域 | 18 |
| 扩展专业图型名称 | 155 |
| 直接匹配V0.1命名 | 21 |
| 新增未直接匹配名称 | **134** |
| 扩展清单直接名称证据 L1 | **12** |
| 扩展清单领域线索 L0 | **143** |
| 命名合计（不等于独立图型） | **764 = 630+134** |
| 实际独立图型总数 | **未知，未完成同义/变体审计** |
| 广度验收 | **不通过** |

扩展数据：[`discipline-seeds-2026-11-22.json`](../../catalog/extensions/discipline-seeds-2026-11-22.json) / [CSV](../../catalog/extensions/discipline-seeds-2026-11-22.csv)。

## 二、18领域交叉审计矩阵

> P0：此前已发现明显专业图形漏项，优先精读；P1：适合尽快扩展；P2：继续补学科资料。优先级只反映**研究顺序**，不代表市场价值或使用频率。

| 专业领域 | 优先 | 本轮名称 | 新名 | 既有名 | L1 | 值得补的图型 | 参考来源 |
|---|---:|---:|---:|---:|---:|---|---|
| 电气电子与工业控制 | P0 | 10 | 10 | 0 | 0 | 电路原理图、接线图、单线图、三线图 | [领域证据](https://webstore.iec.ch/en/publication/2723) |
| 通信与射频 | P1 | 8 | 8 | 0 | 1 | 史密斯圆图、眼图、调制星座图、链路预算图 | [领域证据](https://technav.ieee.org/topic/rf-design/) |
| 化学与化工 | P0 | 10 | 10 | 0 | 0 | 化学反应机理图、化学反应式图、分子结构式图、化工流程系统图 | [领域证据](https://www.iso.org/standard/51840.html) |
| 地质与地球物理 | P0 | 10 | 10 | 0 | 1 | 地层柱状图、地质剖面图、测井曲线图、钻孔柱状图 | [领域证据](https://www.isu.edu/digitalatlas/geology/) |
| 天文与天体物理 | P0 | 9 | 9 | 0 | 1 | 赫罗图、光变曲线、色星等图、星图 | [领域证据](https://science.nasa.gov/asset/hubble/constructing-the-hertzsprung-russell-diagram-for-globular-star-cluster/) |
| 网络安全与威胁建模 | P0 | 9 | 9 | 0 | 1 | ATT&CK战术矩阵、攻击树、攻击图、攻击路径图 | [领域证据](https://attack.mitre.org/matrices/) |
| 铁路与交通工程 | P0 | 9 | 9 | 0 | 0 | 时距图、列车运行图、列车时刻运行线图、速度里程曲线 | [领域证据](https://jernbaneteknologi.no/en/chapters/08-railway-operation-and-capacity/) |
| 考古与遗产记录 | P1 | 7 | 7 | 0 | 1 | 哈里斯地层矩阵、发掘剖面图、遗址平面图、器物序列编年图 | [领域证据](https://www.archaeologists.net/work/toolkits/ag2gp/strat-overview) |
| 用户体验与服务设计 | P1 | 9 | 2 | 7 | 2 | 线框流程图、任务分析图 | [领域证据](https://www.nngroup.com/articles/ux-maps-glossary/) |
| 机械制造与工业设计 | P0 | 10 | 7 | 3 | 1 | 剖切展示图、几何公差示意图、焊接符号图、移动路径意大利面图 | [领域证据](https://www.autodesk.com/learn/ondemand/curated/inventor-drawing-creation/1AMIxFp3WPWTGzYNm8kZme) |
| 基因组学与生物信息学 | P1 | 8 | 5 | 3 | 0 | 核型图、染色体构象接触图、染色体示意图、双系统发育树对比图 | [领域证据](https://www.ebi.ac.uk/training/online/courses/ensembl-data-platform/accessing-navigating-ensembl/visualising-data-on-the-genome-browser-app/) |
| 临床医学与生命科学 | P1 | 9 | 7 | 2 | 2 | 剂量反应曲线、心电图条带、脑电导联图、医学影像多平面重建 | [领域证据](https://pmc.ncbi.nlm.nih.gov/articles/PMC5017943/) |
| 音乐与音频工程 | P2 | 8 | 5 | 3 | 1 | 五线谱、吉他六线谱、谐波频谱图、五度圈图 | [领域证据](https://music21.org/music21docs/usersGuide/usersGuide_22_graphing.html) |
| 体育运动可视化 | P1 | 8 | 8 | 0 | 0 | 投篮分布图、传球网络图、球场控制面图、预期进球时间线 | [领域证据](https://jr.nba.com/how-to-read-a-shot-chart/) |
| 科学计算与多维场 | P0 | 9 | 7 | 2 | 1 | 等值面提取视图、矢量场箭头图、粒子路径线图、计算网格质量图 | [领域证据](https://docs.paraview.org/en/latest/UsersGuide/displayingData.html) |
| 城市规划与三维地理空间 | P1 | 8 | 7 | 1 | 0 | 城市分区规划图、等时圈可达性地图、点云可视化、建筑日照阴影分析图 | [领域证据](https://www.ogc.org/standards/3DTiles/) |
| 生态与环境科学 | P2 | 8 | 8 | 0 | 0 | 物候历、物种累积曲线、物种排序丰度曲线、生态食物网 | [领域证据](https://www.globe.gov/web/european-phenology-campaign/overview/download-materials) |
| 语言学与语音学 | P2 | 6 | 6 | 0 | 0 | 句法分析树、依存句法树、元音空间图、行间语素注释图 | [领域证据](https://www.linguisticsociety.org/) |

## 三、为什么不能把学科与图形形态直接混成一张分类表

建议将 Visual Representation 拆为六个可组合对象：

```text
Domain / 学科与规范
  └─ RepresentationType / 专业图形类型
       ├─ SemanticModel / 数据对象与关系约束
       ├─ VisualGrammar / 图型结构与编码
       ├─ ViewModifier / 2D、3D、轴测、剖切、材质、动画
       ├─ Renderer / HTML、SVG、Canvas、WebGL、领域渲染器
       └─ Evidence / 原始标准、样例、QA及局限
```

例如：**工业爆炸图** = Assembly 语义 + 部件位置关系 + explode 变换 + Three.js + 真实GLB/CAD资产；它的“X-Ray效果”和“轴测视角”不是独立图型。

**ATT&CK矩阵** = 战术x技术的专业语义 + 矩阵式结构；不等于一般“热力图”。**Harris矩阵** = 地层层位前后关系的专业语义 + 拓扑图，不等于简单甘特图。**H-R图** = 恒星颜色/温度与光度的专业坐标约定，不等于任意散点图。标准的绘图语义不可仅靠换配色获得。

## 四、核验等级：源头不同，证据不同

| Level | 可声明什么 | 不可声明什么 |
|---|---|---|
| L0 | 有可信专业领域来源，图型命名待核实 | 图型名称已独立存在 |
| L1 | 专业来源直接列出或采用该名 | 数学语义、全部绘制规则已经核对 |
| L2 | 定义、标准和编码规则有完整出处 | HTML组件已可运行 |
| L3 | 来源可信的实际图例及适用条件已检查 | 可生成交互组件并通过验收 |
| L4 | 同时有可复现 HTML 实现、测试与可访问性记录 | 所有行业/屏幕都适用 |

- 本轮 JSON/CSV 每项有 `domain`, `source_url`, `evidence_level`, `status` 和 `recommended_html_route`。
- L0 也**不是**证明其独立性成立；要继续核对是否是通用图型的语境别名。
- 即使出现标准符号（如IEC 60617），**符号库内容也不因引用标准页面而自动拥有再分发权利**。
- 表格“未直接匹配”的统计没有做 fuzzy synonym，因而不应被宣传为新增134个**独立**图形原理。

## 五、仍未完全覆盖的专业领域

后续还应系统盘点法学判例引用网络、公共政策/立法路径、社会网络与民族志、教育诊断、军事战术态势、航海气象、核工程、生物化学结构、物流仓储、医学影像专科、工业质量控制、历史档案和交互式时间艺术。当前只是开放学科地图的一次扫描。

## 六、实施排序：避免先写一个包罗万象的Skill

1. **P0** 用原始规范/领域图库逐一提取标准名称与定义，尤其电气电子、化工、地学、天文、交通、安全、机械、科研。
2. 建立 `canonical_type_id` / alias / domain / source / version，解决一张图多个名字和同名异义。
3. 样图先使用**自己原创的合成示例**，避免无授权搬运专业图像或标准符号表。
4. 在HTML中做可复用通用内核：SVG/D3、Canvas、Graph/ELK、Three.js四条技术路线；专业领域只叠加语义和数据适配器。
5. 用固定测试用例核对准确性、对齐、缩放、键盘操作、空数据、移动端GPU负载；错误不可由“看起来很漂亮”掩盖。

## 七、有关 Agent Skills

最新经过页面核验的地址、适用范围、成熟度差异和具体引擎，见 [Agent Skills and Renderer Landscape](../engineering/agent-skills-and-renderers.md)。**Skill是执行方法，不是图型全集，也不是精确三维模型的替代品。**

与旧研究的衔接：[全领域广度初版审计](full-spectrum-breadth-audit.md)、[五维设计语言](../foundations/five-dimension-design-grammar.md)。
