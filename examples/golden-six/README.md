# Golden Six · 可运行跨领域图型金样例

**Live source:** [index.html](index.html) · [SVG renderer](infograph-gold.js)

本目录是 Infograph 从“收录图型名称”转向“具备基本专业语义与 HTML 可运行样例”的首批试验，包含 6 种独立图形语言：

| ID | 图型 | 核心表达 | 交互 |
|---|---|---|---|
| `exploded` | 装配爆炸视图 | 组件装配身份、分层及位移 | 0-100%拆解 / 点击部件 |
| `circuit` | 电路原理图 | 源、元件与三条电气网表 | 点击元件 |
| `stratigraphy` | 地层柱状图 | 深度、厚度和岩性 | 点击岩层 |
| `hr` | H–R赫罗图 | 温度反向、光度对数轴 | 点击星点 |
| `attack` | ATT&CK战术矩阵（精选） | 战术列与技术卡片 | 点击技术 |
| `rail` | 列车时距图 | 时间、沿线距离、轨迹 | 点击车次 |

从本文件夹双击 `index.html` 即可浏览，六种图型不依赖CDN；演示提供SVG导出。所有数据和机械形状均为**合成**。图型定义来源、专业边界和现有测试说明：

- [定义及证据档案](../../docs/research/golden-six-evidence.md)
- [嵌入式 API](../../docs/engineering/golden-six-api.md)
- [图型登记 JSON](../../catalog/verified/golden-six.json)
- [Node smoke tests](../../tests/golden-six.test.mjs) 和 [Chromium browser tests](../../tests/golden-six.browser.mjs)

自动化验收：[Chromium / Node QA 成功运行 #45039975281](https://github.com/XiangLuoyang/Infograph/actions/runs/45039975281)，含六张SVG渲染截图，CI产物保留期有限。

**校验原则**：源头文档核验 ≠ 视觉绘制精确性 ≠ 专业领域标准合规。这里暂不声明 CAD/EDA/科学实测/铁路调度级的工程正确性。

**MITRE 声明：** ATT&CK® 为 The MITRE Corporation 的注册商标；© 2026 The MITRE Corporation，示范不代表 MITRE 关联、赞助或认可。见 [官方使用条款](https://attack.mitre.org/resources/terms-of-use/)。
