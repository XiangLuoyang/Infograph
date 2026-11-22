> **Public research extract · 2026-11-22.** All business metrics in referenced demos are illustrative. Links to non-migrated private Obsidian pages are plain text.

---
title: ATLAS 东南亚经营图谱交互原型 V1
created: 2026-11-18
updated: 2026-11-18
type: synthesis
status: active
narrative: analytical
schema_version: 4
tags: [东南亚, 渠道经营, HTML看板, Dashboard, ATLAS, 地图, 交互原型, 视觉设计]
summary: ATLAS东南亚区域经营展示HTML原型V1的入口、五维视觉设计取舍、交互路径、合成数据边界及下一轮验收方向。
---
# ATLAS 东南亚经营图谱交互原型 · V1

> [!abstract]
> 一份以**经营结论优先 + 东南亚地理空间主视觉 + 国家经营诊断 + 横向比较 + 情景模拟**为叙事结构的单文件交互HTML。它用于验证 [概念-可视化看板五维设计语言与布局语法](../foundations/five-dimension-design-grammar.md) 中的五维组合设计方法，**不是生产级经营系统，也不包含真实公司业务数据**。

## 一、在电脑端查看

- **完整交互HTML**：[sea_business_dashboard_atlas_v1.html](../../examples/dashboards/sea_business_dashboard_atlas_v1.html)
- **文件相对目录**：`知识库/综合/可视化示例/东南亚3D经营机制沙盘/sea_business_dashboard_atlas_v1.html`
- **远端分支**：`XiangLuoyang/Obsidian-Nebula` / `main`
- **建议打开方式**：电脑同步/拉取 Nebula 后，在文件管理器中找到该 HTML，使用 Chrome / Edge 打开；Obsidian 若只显示源码，可右键选择在默认应用中打开或直接在浏览器打开文件。

原型为**自包含单文件**，不需要额外下载第三方 JS/CSS 或调用外部在线地图服务。当前版本内含用于演示的合成数据。

## 二、设计立场

核心阅读路径：**先看经营判断 → 找到国家 → 进入指标诊断 → 横向核验 → 探索调整方案**。不是把所有指标做成等权重卡片，而是用视觉层级保留主要叙事、把详细分析通过交互逐步展开。

| 五维设计语言 | ATLAS V1的设计选择 | 作用 |
|:---|:---|:---|
| Color | 骨白、深绿、灰绿、赭红 | 克制的汇报色调，强调色服务经营风险与重点 |
| Layout | Editorial + Spatial 混合；地图主视觉、信息卡与下方证据 | 地理空间负责“哪里”，图表负责“多少、为何” |
| Material | 哑光浅底、立体地块、分层浮动信息卡 | 区分地理对象、选中状态与说明信息 |
| Chart | 排名条形图、趋势图、库存WOS参照、渠道结构等 | 用不同编码回答比较、变化与结构问题 |
| Interaction | 国家选择/地图旋转缩放/模式切换/情景参数 | 保留国家上下文，按需展现更多信息 |

原则：**3D地图不承担精确数值比较的任务**；立体高度和选中强调属于视觉状态，不应直接理解为销售额大小。数字比较使用带单位的常规图表。

## 三、计划验证的交互

- 经营态势：地图与国家经营信息；聚焦国家后更新侧栏。
- 渠道诊断：通过视图切换查看渠道结构与经营差异。
- 情景推演：通过参数交互观察示例模型预测WOS的方向变化。
- 基础交互：地图旋转、缩放与视角重置；数据导出等入口。

> [!caution] 实现边界
> 原型的演示数据、风险阈值、情景计算属于**合成/示意**，不代表任何国家或代理商真实经营事实；不应被用作正式补货、资金或利润决策。它尚未形成真实的 Margin→ARS→Sell-out→WOS 联动计算，没有完成代理商→门店的生产级钻取，也不能替代GIS精度的地理应用。以上功能状态以HTML实际运行和回归测试为准。

## 四、下一轮设计实验

1. **同数据双版对照**：Editor/Spatial ATLAS 与 Matrix KPI cockpit 对比5秒主结论识别、30秒异常发现、图表读数与审美。
2. **地图材质深化**：进一步比较哑光地形、杂志制图、玻璃与技术线框的可读性；明确“地图材质”和“网页背景”不是同一维度。
3. **国家钻取状态机**：区域→国家→渠道→代理商→门店，并校验任何筛选后指标完全一致。
4. **机制模拟**：分离真实数据、推导公式与用户假设，避免动画暗示未经证实的因果。
5. **画质与功能门禁**：桌面1440/1920投屏与移动端截图、无数据状态、键鼠与 reduced-motion 验证。

## 五、关联知识

- [概念-可视化看板五维设计语言与布局语法](../foundations/five-dimension-design-grammar.md) — 本原型的设计方法来源。
- [综合-企业经营看板与流程可视化研究地图](research-map.md) — 同主题资产与研究总导航。
- [综合-企业经营治理HTML看板设计与决策叙事](enterprise-dashboard-narrative.md) — 管理汇报和经营驾驶舱的叙事边界。
- [工具-企业经营治理HTML看板生成与验收](../engineering/html-dashboard-generation-qa.md) — 可执行的看板生成与测试约束。
- [综合-东南亚3D地图本体六种渲染语言实验](map-rendering-languages.md) — 材质、轮廓与交互语言的既有实验。
- [综合-渠道经营机制沙盘与跨模块推演设计](channel-business-mechanism-workbench.md) — 机制联动目标，不等同当前V1实现。

> [!note]- 更新记录
> - 2026-11-18：保存本轮 ATLAS V1 单文件HTML原型与设计说明。原型的合成数据、交互与模拟边界明确标注。
