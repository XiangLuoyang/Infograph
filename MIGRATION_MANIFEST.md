# Migration manifest · Nebula → Infograph

**Date:** 2026-11-22  
**Origin:** `XiangLuoyang/Obsidian-Nebula` (private, preserved intact)  
**Destination:** `XiangLuoyang/Infograph` (public, curated extraction)  
**Method:** Copy and reorganization. No source files were deleted or moved.

## Integrity

- **17** research/methodology Markdown documents: text retained, Obsidian Wikilinks converted to relative Markdown paths where the destination was migrated; non-migrated internal link references flattened. Added public-extract disclaimers; these are **adaptations**, not byte-for-byte replicas.
- **15** standalone HTML prototype files and **12** SVG/PNG assets: **27/27 source Git blob SHA matches destination SHA** (byte-identical).
- One additional HTML containing brand and partner names was deliberately **not copied into the public repository**; the source remains in Nebula pending de-identification and authorization review.
- `catalog/visual_representation_atlas.json` and `catalog/visual_representation_atlas.html` came from a **2026-11-22 conversation-generated research artifact**, not from the source repository; `catalog/types.csv` and `catalog/families.csv` were generated from the same JSON.
- The original XLSX workbook and generated gallery preview PNG were **not migrated as binary files**; CSV substitutes for spreadsheet use.
- Third-party installed Draw.io Skills, their dependencies and licensing files are **not vendored** into this repo. Documentation that describes Draw.io workflows is included.

## Research documents

| Nebula source page | Infograph public path |
|---|---|
| `概念-AI数据看板设计美学-反AI-Slop.md` | [`docs/foundations/anti-ai-slop.md`](docs/foundations/anti-ai-slop.md) |
| `概念-可视化看板五维设计语言与布局语法.md` | [`docs/foundations/five-dimension-design-grammar.md`](docs/foundations/five-dimension-design-grammar.md) |
| `概念-看板风格演进与汇报版式.md` | [`docs/foundations/dashboard-layout-evolution.md`](docs/foundations/dashboard-layout-evolution.md) |
| `概念-流程图泳道图的视觉表达与复杂性边界.md` | [`docs/foundations/flowchart-swimlane-grammar.md`](docs/foundations/flowchart-swimlane-grammar.md) |
| `综合-企业经营治理HTML看板设计与决策叙事.md` | [`docs/research/enterprise-dashboard-narrative.md`](docs/research/enterprise-dashboard-narrative.md) |
| `综合-全领域可视化图表库覆盖审计与分类体系.md` | [`docs/research/full-spectrum-breadth-audit.md`](docs/research/full-spectrum-breadth-audit.md) |
| `综合-企业经营看板与流程可视化研究地图.md` | [`docs/research/research-map.md`](docs/research/research-map.md) |
| `综合-ATLAS东南亚经营图谱交互原型.md` | [`docs/research/atlas-sea-dashboard-case.md`](docs/research/atlas-sea-dashboard-case.md) |
| `综合-业务经营渠道结构与流程治理三类可视化范式.md` | [`docs/research/business-channel-process-visual-paradigms.md`](docs/research/business-channel-process-visual-paradigms.md) |
| `综合-渠道经营机制沙盘与跨模块推演设计.md` | [`docs/research/channel-business-mechanism-workbench.md`](docs/research/channel-business-mechanism-workbench.md) |
| `综合-东南亚3D地图六风格评估与融合方案.md` | [`docs/research/map-six-style-evaluation.md`](docs/research/map-six-style-evaluation.md) |
| `综合-东南亚3D地图本体六种渲染语言实验.md` | [`docs/research/map-rendering-languages.md`](docs/research/map-rendering-languages.md) |
| `综合-东南亚3D经营地图与机制推演双层空间原型.md` | [`docs/research/map-simulation-layering.md`](docs/research/map-simulation-layering.md) |
| `综合-东南亚3D经营地图交互与五风格实验.md` | [`docs/research/map-five-style-interactions.md`](docs/research/map-five-style-interactions.md) |
| `工具-ProcessIR流程图编译与连线验收.md` | [`docs/engineering/process-ir-layout-routing.md`](docs/engineering/process-ir-layout-routing.md) |
| `工具-企业经营治理HTML看板生成与验收.md` | [`docs/engineering/html-dashboard-generation-qa.md`](docs/engineering/html-dashboard-generation-qa.md) |
| `工具-drawio-workflow.md` | [`docs/engineering/drawio-workflow.md`](docs/engineering/drawio-workflow.md) |

## Exact-copy HTML and media assets

| Original private-vault path | Public path | Git blob integrity |
|---|---|---|
| `附件/看板与流程-2.5D业务治理空间地图.svg` | [`assets/diagrams/2-5d-governance-map.svg`](assets/diagrams/2-5d-governance-map.svg) | verified |
| `附件/看板与流程-总线合线对比.svg` | [`assets/diagrams/bus-routing-comparison.svg`](assets/diagrams/bus-routing-comparison.svg) | verified |
| `知识库/综合/可视化示例/业务汇报-渠道结构-流程治理/三类企业汇报看板-视觉语法索引.svg` | [`assets/diagrams/business-paradigms.svg`](assets/diagrams/business-paradigms.svg) | verified |
| `附件/看板与流程-编译布局八步工作流.svg` | [`assets/diagrams/flow-compile-pipeline.svg`](assets/diagrams/flow-compile-pipeline.svg) | verified |
| `附件/看板与流程-流程图表现形态.svg` | [`assets/diagrams/flow-visual-vocabulary.svg`](assets/diagrams/flow-visual-vocabulary.svg) | verified |
| `知识库/综合/可视化示例/东南亚3D经营机制沙盘/经营地图与机制推演-双层空间语法.svg` | [`assets/diagrams/map-simulation-layers.svg`](assets/diagrams/map-simulation-layers.svg) | verified |
| `知识库/综合/可视化示例/东南亚3D地图/东南亚3D地图-五风格视觉索引.svg` | [`assets/diagrams/sea-five-style-overview.svg`](assets/diagrams/sea-five-style-overview.svg) | verified |
| `附件/东南亚3D地图-六风格与融合设计索引.svg` | [`assets/diagrams/sea-six-style-overview.svg`](assets/diagrams/sea-six-style-overview.svg) | verified |
| `附件/看板风格-P1杂志化-四高级图.png` | [`assets/style-studies/editorial-p1.png`](assets/style-studies/editorial-p1.png) | verified |
| `附件/看板风格-C方案-IBCS语义骨架.png` | [`assets/style-studies/ibcs-structure-c.png`](assets/style-studies/ibcs-structure-c.png) | verified |
| `附件/看板风格-B方案-OWID纯色板.png` | [`assets/style-studies/owid-palette-b.png`](assets/style-studies/owid-palette-b.png) | verified |
| `附件/看板风格-A版-汇报版式.png` | [`assets/style-studies/report-layout-a.png`](assets/style-studies/report-layout-a.png) | verified |
| `知识库/综合/可视化示例/东南亚3D经营机制沙盘/channel_atlas_simulation_v01.html` | [`examples/dashboards/channel_atlas_simulation_v01.html`](examples/dashboards/channel_atlas_simulation_v01.html) | verified |
| `知识库/综合/可视化示例/业务汇报-渠道结构-流程治理/enterprise_dashboard_triptych.html` | [`examples/dashboards/enterprise_dashboard_triptych.html`](examples/dashboards/enterprise_dashboard_triptych.html) | verified |
| `知识库/综合/可视化示例/区域渠道经营治理-三种设计范式演示.html` | [`examples/dashboards/region_channel_three_paradigms.html`](examples/dashboards/region_channel_three_paradigms.html) | verified |
| `知识库/综合/可视化示例/东南亚3D经营机制沙盘/sea_3d_business_atlas_v02.html` | [`examples/dashboards/sea_3d_business_atlas_v02.html`](examples/dashboards/sea_3d_business_atlas_v02.html) | verified |
| `知识库/综合/可视化示例/东南亚3D经营机制沙盘/sea_business_dashboard_atlas_v1.html` | [`examples/dashboards/sea_business_dashboard_atlas_v1.html`](examples/dashboards/sea_business_dashboard_atlas_v1.html) | verified |
| `知识库/综合/可视化示例/东南亚3D地图/sea_3d_design_gallery.html` | [`examples/geospatial/sea_3d_design_gallery.html`](examples/geospatial/sea_3d_design_gallery.html) | verified |
| `知识库/综合/可视化示例/东南亚3D地图/sea_3d_interactive_map.html` | [`examples/geospatial/sea_3d_interactive_map.html`](examples/geospatial/sea_3d_interactive_map.html) | verified |
| `知识库/综合/可视化示例/东南亚3D经营机制沙盘/sea_3d_six_map_material_renderings_v02.html` | [`examples/geospatial/sea_3d_six_map_material_renderings_v02.html`](examples/geospatial/sea_3d_six_map_material_renderings_v02.html) | verified |
| `知识库/综合/可视化示例/东南亚3D经营机制沙盘/sea_3d_six_style_interaction_lab.html` | [`examples/geospatial/sea_3d_six_style_interaction_lab.html`](examples/geospatial/sea_3d_six_style_interaction_lab.html) | verified |
| `知识库/综合/可视化示例/东南亚3D地图/sea_3d_style_01_abyss.html` | [`examples/geospatial/sea_3d_style_01_abyss.html`](examples/geospatial/sea_3d_style_01_abyss.html) | verified |
| `知识库/综合/可视化示例/东南亚3D地图/sea_3d_style_02_editorial.html` | [`examples/geospatial/sea_3d_style_02_editorial.html`](examples/geospatial/sea_3d_style_02_editorial.html) | verified |
| `知识库/综合/可视化示例/东南亚3D地图/sea_3d_style_03_terrain.html` | [`examples/geospatial/sea_3d_style_03_terrain.html`](examples/geospatial/sea_3d_style_03_terrain.html) | verified |
| `知识库/综合/可视化示例/东南亚3D地图/sea_3d_style_04_prism.html` | [`examples/geospatial/sea_3d_style_04_prism.html`](examples/geospatial/sea_3d_style_04_prism.html) | verified |
| `知识库/综合/可视化示例/东南亚3D地图/sea_3d_style_05_command.html` | [`examples/geospatial/sea_3d_style_05_command.html`](examples/geospatial/sea_3d_style_05_command.html) | verified |
| `知识库/综合/可视化示例/东南亚3D地图/sea_true_3d_map.html` | [`examples/geospatial/sea_true_3d_map.html`](examples/geospatial/sea_true_3d_map.html) | verified |

## Unmigrated / review queue

- Brand-containing 3D map rendering prototype — intentionally withheld from this **public** repository pending anonymization.
- Original `.xlsx` research workbook — CSV data available, original workbook remains a conversation artifact.
- Original Atlas preview PNG — not in this repository; 4 dashboard style study PNG assets were migrated separately.
- Additional general Nebula Draw.io diagrams that document unrelated private projects are **out of scope**. The public `docs/engineering/drawio-workflow.md` captures the reusable methodology.

**Evidence limit:** verified integrity applies to the 27 exact copied files and the Git-visible existence of document adaptations, not browser runtime testing of all examples after migration.
