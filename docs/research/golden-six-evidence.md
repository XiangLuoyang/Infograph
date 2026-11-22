# Golden Six · 6个跨领域图型的定义核验与图形规范

> [!abstract] 本阶段有实际输出：六个原生SVG、可选中部件/元素、爆炸进度控制、SVG导出和可执行语义测试。它们仍然是**研究型示例**，不是CAD、EDA、GIS、天文观测、安全产品或铁路调度软件。专业图型中的定义、数据结构、标度方向、层序等基本语义已通过来源核对，领域完整标准合规尚未验收。

- [打开离线六图型演示](../../examples/golden-six/index.html)
- [查看SVG渲染器源码](../../examples/golden-six/infograph-gold.js)
- [查看机器可读图型证据登记](../../catalog/verified/golden-six.json)
- [查看组件API和QA协议](../engineering/golden-six-api.md)
- 研究日期：2026-11-22。所有示例数字与几何形状均为原始合成素材。

## 一、六个 Gold Samples 的专业语义

| 图型 | 当前实现 | 不能错的语义 | 定义来源 | 本次质量边界 |
|---|---|---|---|---|
| **装配爆炸图** | 四个模拟机械部件、拆解0–100%、零件选择和引线 | 部件ID/相对顺序不丢失；拆解仅是视图中的变换 | [Autodesk exploded views](https://help.autodesk.com/cloudhelp/2025/ENU/Inventor-Help/files/GUID-2569BBA6-816B-4656-9AC9-ABB9E1DC43C0.htm) | SVG构造的轴测示意，非真实CAD/GLB几何，未验证实际装配公差 |
| **电路原理图** | 5V源、电阻、电容的三节点串联RC示意 | 用端子和网表定义连通，不由屏幕坐标决定电气关系 | [KiCad Eeschema](https://docs.kicad.org/8.0/en/eeschema/eeschema.html) | 不具有 ERC 或SPICE 校验；基础图元不代表 IEC 标准符号图集授权 |
| **地层柱状图** | 0–14m比例层位、五类原始合成岩性图案 | 深度向下增，厚度按比例，层段连续且不交叉 | [Idaho State University](https://www.isu.edu/digitalatlas/geology/) / [USGS geology standard](https://ngmdb.usgs.gov/fgdc_gds/geolsymstd.php) | 非真实测井数据；没有直接复制FGDC受保护图案或宣称标准符号合规 |
| **赫罗图 H–R** | 六颗合成星点、温度反向、光度对数轴 | x轴是有效温度且向右降低；y轴光度以太阳单位采用log刻度 | [OpenStax Astronomy](https://openstax.org/books/astronomy/pages/18-4-the-h-r-diagram) / [Georgia State](https://hyperphysics.phy-astr.gsu.edu/hbase/Astro/herrus.html) | 演示数据不是观测数据，不能据此推断真实恒星演化 |
| **ATT&CK 战术矩阵** | 5个精选战术列和对应5个技术卡片 | 战术是攻击行为目的，技术按战术归属；不是普通热力图 | [MITRE Enterprise Matrix](https://attack.mitre.org/matrices/enterprise/) / [Enterprise tactics](https://attack.mitre.org/tactics/enterprise/) | 当前Enterprise共有15个战术；本图只5个精选列，未同步完整战术库、版本变更或组织真实控制覆盖 |
| **列车时距图** | 四个合成车站、三条车次运行轨迹 | 横轴时间、纵轴沿线公里数；轨迹按时刻单调递增 | [JICA Train Operation Diagrams](https://openjicareport.jica.go.jp/pdf/12251708_01.pdf) / [NITI Railway report](https://www.niti.gov.in/sites/default/files/2019-01/Report%20on%20A%20concept%20note%20for%20railway%20timetabling%20to%20rationalize%20and%20improve%20capacity%20utilization_0.pdf) | 示范车次不是实际铁路时刻表，未验证闭塞、会让、安全间隔 |

## 二、分离“来源正确性”“渲染正确性”和“专业合规性”

| 证据轴 | 这批图型达到什么程度 |
|---|---|
| 专业出处 | 每类有学科/工具官方或专业组织资料，原始URL写入JSON |
| 语义逻辑 | 编写14条纯JS不变量测试，覆盖部件ID、网表、层序、刻度、战术ID、运行图时间方向 |
| 浏览器图形 | 原生、无外部依赖的SVG组件，跨6种类型的统一交互API；Chromium CI用于运行和留存截图 |
| 专业图纸认证 | **没有**完成工业、建筑、电气、地理、铁路、网络安全规范级合规验收 |
| 来源素材许可 | 所有形状、颜色、图层等为原始生成；不把第三方受限符号素材或完整标准图集复制到本仓库 |

本轮在 `catalog/verified/golden-six.json` 独立记录 `definition_sources`、`constraints`、`implementation_claim` 和 `domain_conformance`，避免把一个二元的「verified: true」混同以上维度。

### 注意：MITRE 品牌与版权标识

ATT&CK® is a registered trademark of The MITRE Corporation. **© 2026 The MITRE Corporation.** 本项目仅引用精选战术/技术的名称和ID，不包含MITRE官方品牌图像、完整数据集或产品背书。请遵守 [MITRE ATT&CK Terms of Use](https://attack.mitre.org/resources/terms-of-use/)；不存在与MITRE的关联、赞助或认可。

本项目所有SVG布局为重新编写的原创教学示例，不复制Autodesk、USGS、OpenStax、MITRE或JICA的现成图像。

## 三、验收与后续欠账

**当前已执行：** JS模块语法解析通过；在研究会话里调用6个渲染器，并运行内建14条语义检查，14/14通过。仓库同时提供 `node tests/golden-six.test.mjs` 和 `tests/golden-six.browser.mjs`，CI已在最终代码提交 `f744811` 上通过：参见 [GitHub Actions 45040682399](https://github.com/XiangLuoyang/Infograph/actions/runs/45040682399)；Chromium含六种SVG渲染、点击、电容命中区、爆炸滑块和移动端视口烟测。与专业合规审查仍是两回事。

**修复经验：** 本轮 Chromium QA 实际发现并修复了点击命中区不足、旧渲染器监听器泄漏、爆炸图0%装配状态、坐标轴标题/脚注重叠等问题；单靠数值断言无法覆盖这些缺陷。

**待继续：** 每个专业图型必须再补真实数据适配器与标准规则校验；当前仍是**纯示意SVG**，不能以”能点击、能导出SVG“替代真实专业绘图。

建议下一组扩展：独立 **Cutaway/Section**（不同于爆炸图）、**Harris Matrix**、**P&ID**、**Astronomical Light Curve**、**clinical survival curve** 和 **Scientific Volume/Slice**，并把原始 `630` 命名库与 `134` 个新增候选统一做 canonical ID / alias 审计后再更新总数。

## 四、Skill与工程实现对应

- 结构与爆炸图：[exploded-view](https://www.skills.sh/moh4696/open-3d-skills/exploded-view) + [Three.js data visualization](https://www.skills.sh/openai/plugins/threejs-data-visualization)；本轮示例为低依赖SVG验证版，不是3D引擎替代。
- 电路与图解：[drawio](https://www.skills.sh/jgraph/drawio-mcp/drawio)；工程正确性需KiCad领域检查。
- 地学/科研：[geospatial-and-cartographic-visualization](https://www.skills.sh/openai/plugins/geospatial-and-cartographic-visualization)、[scientific-visualization](https://www.skills.sh/k-dense-ai/scientific-agent-skills/scientific-visualization)。
- 拓扑/矩阵与移动体验：[node-link-and-diagram-layout](https://www.skills.sh/openai/plugins/node-link-and-diagram-layout)、[testing-data-visualizations](https://www.skills.sh/openai/plugins/testing-data-visualizations)。

本轮只登记这些已有Skill的链接，没有将第三方Skill代码直接复制或安装进Infograph。
