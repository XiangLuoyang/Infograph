> **Public research extract · 2026-11-22.** Examples are synthetic/conceptual. Internal Obsidian links not present in this selection have been flattened.

---
title: 企业经营治理 HTML 看板生成与验收 Playbook
created: 2026-10-31
updated: 2026-11-18
type: tool
status: active
narrative: analytical
schema_version: 4
tags: [AI, Prompt, Dashboard, HTML, 经营分析, 企业治理, 设计系统, 质量门禁]
summary: 适用于咨询式简报、经营战情室、科研证据页与治理工作台的 AI HTML 看板标准输入、生成 Prompt、验收门禁和交付定义。
---

# 🛠️ 企业经营治理 HTML 看板生成与验收

> [!abstract]
> **先定决策问题与证据口径，再定叙事与图形，最后生成 HTML。** 本 Playbook 是开发时可直接复用的任务简报、Prompt 与验收清单。详细设计依据见 [综合-企业经营治理HTML看板设计与决策叙事](../research/enterprise-dashboard-narrative.md)。

## 一、启动前的任务简报（先填空，不猜测）

| 字段 | 应填写的内容 |
|:---|:---|
| Decision / 拍板问题 | 领导需要判断或决定什么？ |
| Audience / 读者 | 高管、市场经营 Owner、渠道治理、分析师、值守人员？ |
| Mode / 看板模式 | Executive Brief / Cockpit / Workbench / Investigation |
| Time / 观察周期 | 时间区间、粒度、刷新频率 |
| Grain / 数据颗粒度 | Market × Channel × SKU × Week 等 |
| Baseline / 比较基准 | 预算、同比、环比、目标阈值、同行基准 |
| Evidence / 数据来源 | 字段说明、来源系统、更新时间、缺失值处理 |
| Action / 后续动作 | 需要何人、何时、在什么权限内做何事 |
| Sensitivity / 数据级别 | 是否需要脱敏、是否允许外部处理 |
| Delivery / 技术约束 | 单 HTML、React、离线、投屏、移动端等 |

> [!caution]
> **缺字段就以待确认标记；不能编造真实业务数据。** 若只提供非敏感示例，则全程明确“合成数据 / MOCK DATA”，避免被误用于管理决策。

## 二、可直接复制的 Master Prompt

~~~text
角色：
你是一位战略咨询分析师、财经数据编辑、
科学可视化研究员和资深企业前端设计师。
目标是用 HTML 制作可信、可解释、能推动业务行动的
经营分析与组织治理界面，而不只是“漂亮的图表”。

输入：
- 业务决策问题：{{decision}}
- 目标读者：{{audience}}
- 模式：{{mode}}
- 数据及口径：{{data_contract}}
- 业务背景：{{business_context}}
- 关键约束与可用技术：{{constraints}}
- 期望执行动作：{{requested_actions}}

分析规则：
1. 分别列出 Fact（已证实事实）、Inference（推断）、
   Assumption（假设）、Unknown（未知）。
2. 不得制造数字、虚构显著性、臆断因果或责任。
3. 核查每个指标的分母、时间、单位、币种、来源。
4. 若存在多个解释，至少提出一个可证伪的替代假设。
5. 含有模型或场景预测时明确区分实际值与预测值。
6. 用统一方法验证各国、渠道、SKU 指标可比性。

叙事骨架：
Context（预期）→ Signal（偏差）→ Diagnosis（机制）
→ Impact（影响）→ Decision（拍板）→ Control（闭环）

每个主要图表要回答一个问题。
主标题必须有明确判断，但不得超出证据支持。
管理层在首屏即可看到核心结论及需要拍板的事项。
分析层保留完整证据与数据口径。

视觉方向：
优先采用咨询公司清晰的结构层次、
The Economist / FT 的编辑式图表表达、
Nature 式观察—假设—证据纪律、
IBM Carbon 的企业可用性原则。
仅在战役/实时监控场景引入双十一式视觉中心，
禁用无业务价值的 3D 地球、持续粒子动画、
浮夸渐变、重复发光描边和无解释的排名装饰。
默认采用克制的浅色 Editorial Design System。

交互要求：
至少支持关键维度筛选和视图更新；
可下钻时标识可点击元素；
重要结论不可仅存在于 Hover 状态；
保留加载中、无数据、缺失字段、异常值状态；
提供来源和可复核数据；可按需求导出 CSV。
所有交互必须真正生效，不允许演示性假按钮。

工程要求：
区分 data / transform / components / interaction 四层；
合成数据要显式标注并集中管理，不得混入真实数据；
响应式适配 1440 桌面和 1920 投屏，
移动端重排布局；提供可读数字与单位；
默认避免未经授权的网络依赖或第三方上传。
代码应在目标浏览器直接运行。
如公司安全规则另有要求，以其为准。

执行顺序：
A. 先输出问题定义、指标字典、故事线和页面线框；
B. 再给出图表选择理由和视觉 Token；
C. 然后实现完整的 HTML/CSS/JS；
D. 最后逐项进行数学对账、交互测试、视觉检查、
   可访问性检查、权限与敏感信息检查；
E. 输出已验证事项、限制、尚待确认的问题。

验收失败时，不要用“已完成”概括；明确指出失败项。
~~~

## 三、选择图表的硬规则

| 任务 | 推荐 | 拒绝/谨慎 |
|:---|:---|:---|
| 构成差异 | 堆叠、百分比条、Marimekko | 类别过多的饼图 |
| 对比排名 | 水平条、Bullet | 不清楚排序的雷达图 |
| 变化趋势 | 折线、Small Multiples | 非业务必要的 3D 面 |
| 增长归因 | Waterfall、可加总分解 | 直接加总不同分母的同比率 |
| 关系/效率 | Scatter、象限 | 缺单位或随意定义轴界 |
| 价值流/交易 | Sankey / Alluvial | 不守恒的流向图 |
| 库存龄级 | Heatmap、分布直方图 | 只显示一个均值 |
| 风险不确定性 | 置信区间/情景区间 | 伪造概率或没有推导的“红色评分” |

## 四、最小数据契约

一个经营字段的推荐元数据：

| 键 | 示例 |
|:---|:---|
| metric_id | retail_wos |
| display_name | 零售库存周数 |
| definition | 平均零售库存 / 每周终端动销量（须明确计算周期） |
| unit | week |
| grain | market × sku × period |
| source_system | 经销存 / PSI / PRM 等，由项目真实填写 |
| refresh_timestamp | YYYY-MM-DD HH:mm+08 |
| missing_policy | NA，不得默认为 0 |
| owner | 实际字段 Owner |
| sensitivity | internal / restricted 等公司自定义等级 |

必须明确：Sell-in、Sell-out、库存快照之间的时点对齐规则；跨币种统一的 FX 日期；WOS 的分母若为零如何处理；利润类字段是否含税、运费、返点、补贴；累计数据如何避免与单期数据重复计算。

## 五、三层验收门禁

### A. 证据门禁（阻断级）

- [ ] 图表数值与原始数据对得上；计算公式可复现。
- [ ] 时间、单位、基准、分母、币种、缺失策略有说明。
- [ ] 没有虚构数据、来源、实验显著性或责任归属。
- [ ] 模拟场景与真实业务状态清楚分隔。
- [ ] 敏感字段符合公司数据授权与隐私规范。

### B. 设计门禁（质量级）

- [ ] 首屏可在 30 秒内回答：什么异常、证据是什么、决定什么？
- [ ] 主图表的视觉编码与想表达的问题一致。
- [ ] 颜色含义一致，不只是红负绿正。
- [ ] 存在必要的直接标注、来源和比较基准。
- [ ] 桌面/投屏可读，移动端不发生重叠或数据被截断。
- [ ] 不依赖大量装饰、刻意动画制造“专业感”。

### C. 功能门禁（阻断级）

- [ ] 国家/渠道/时间筛选后，各处关联数字一致。
- [ ] Tooltip/按钮/表格点击都有实际响应。
- [ ] 导出 CSV 数据与当前筛选条件一致。
- [ ] 空数据、缺失数据、极值、无网络和错误输入得到处理。
- [ ] 有明示数据更新时间；不是实时的数据不标记为实时。
- [ ] 交付包能在目标环境打开，浏览器无严重运行异常。

## 六、后续能力建设

**L1 — Brief：** 一屏讲清楚问题。  
**L2 — Explore：** 能筛选和联动。  
**L3 — Diagnose：** 有证据与情景模拟。  
**L4 — Govern：** 有 Decision Owner、Action Owner、权限、审计和验证闭环。

不应把 L4 描述成纯前端 HTML 就能做到的事情；必须有真实的数据接口、权限管理与组织流程对接。

### 新增：五维设计语法输入与视觉验收（2026-11-18）

生成前，在原有 Decision / Audience / Mode / Data Contract 之外明确：

| 设计语法字段 | 应输出的决策与理由 |
|:---|:---|
| Information Intent | 本页核心认知任务：排名、偏差、趋势、结构、流向、层级或地理空间 |
| Layout Grammar | 选择 Matrix / Editorial / Hierarchical / Flow / Spatial 中的主布局，并说明信息关系为何映射到该构图 |
| Chart Grammar | 数据关系→视觉编码→图型选择，给出拒绝更炫图型的理由 |
| Interaction Grammar | 用户任务→状态转换→联动→动效；关键结论在默认静态态也可见 |
| Material Grammar | 为地理底层、信息卡、导航或警示分别选择质感；不得用纹理干扰读数 |
| Color Grammar | 定义语义色、基准色、强调色、序数/发散色及对比度 |
| Validation Plan | 同一数据的候选布局、截图、任务测试、缺陷清单与修改记录 |

**验收补充**：检查视觉层级是否真实服务信息意图；材质是否有功能意义；动画是否维持对象恒常性及上下文，且支持 reduced motion；布局在投屏和桌面尺寸上阅读顺序是否一致。注意这些是**可执行的设计检查与研究建议**，不是未经实测的心理学定律。

设计依据与五类布局候选见 [概念-可视化看板五维设计语言与布局语法](../foundations/five-dimension-design-grammar.md)。

## 七、相关

- [工具-ProcessIR流程图编译与连线验收](process-ir-layout-routing.md) — 复杂流程的编译布局、路由与QA。
- [概念-流程图泳道图的视觉表达与复杂性边界](../foundations/flowchart-swimlane-grammar.md) — 图型选择及语义边界。

- [综合-企业经营治理HTML看板设计与决策叙事](../research/enterprise-dashboard-narrative.md) — 方法论与参考案例。
- [概念-可视化看板五维设计语言与布局语法](../foundations/five-dimension-design-grammar.md) — 五维设计语言与布局信息关系映射。
- [概念-AI数据看板设计美学-反AI-Slop](../foundations/anti-ai-slop.md) — AI UI 同质化研究。
- 概念-business-analysis-framework — 经营分析原则。
- 概念-企业运营治理框架-治理对象-治理域-决策权 — 治理对象与决策权。

> [!note]- 更新记录
> - 2026-10-31：创建供 AI/Agent 复用的看板生成与验收 Playbook。
> - 2026-11-18：补充基于信息意图的五维设计语法输入契约与验证条目。
