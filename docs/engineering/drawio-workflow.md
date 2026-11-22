> **Public research extract · 2026-11-22.** Examples are synthetic/conceptual. Internal Obsidian links not present in this selection have been flattened.

---
title: Draw.io Workflow
created: 2026-10-18
updated: 2026-10-18
type: tool
status: active
narrative: analytical
tags: [Nebula, Drawio, 可视化, Workflow]
summary: Nebula 中流程图、架构图和关系图的 Draw.io YAML-first 生成与验证流程。
---

# Draw.io Workflow

> [!abstract]
> 本页承接原 SCHEMA 中的 Draw.io 执行细节。Schema 只规定“图必须可追溯、可验证”，本页规定具体 YAML-first pipeline。

## 适用范围

以下图形默认使用 Draw.io：
- 流程图；
- 架构图；
- 关系图；
- 复杂状态机；
- 需要长期维护的结构图。

简单目录树、单行箭头和轻量文字关系不强制转换。

## YAML-first Pipeline

1. 明确图类型、主题、布局、节点语义；
2. 编写 YAML spec；
3. 用 drawio-skills CLI 生成 `.drawio`；
4. 导出 PNG；
5. 在 Markdown 中嵌入 PNG；
6. 保留 YAML spec 作为未来编辑源。

推荐目录：

```text
.drawio-tmp/{name}/{name}.yaml
附件/{name}.drawio
附件/{name}.png
```

## CLI 示例

```bash
node .agents/skills/drawio/scripts/cli.js spec.yaml 附件/{name}.drawio --validate
node .agents/skills/drawio/scripts/cli.js spec.yaml 附件/{name}.png --validate --use-desktop
```

环境要求：
- `DRAWIO_CMD` 指向 draw.io Desktop；
- drawio-skills 位于 `.agents/skills/drawio/`。

## Spec 基础字段

| 字段 | 用途 |
|---|---|
| meta.theme | tech-blue / minimal / business / dark 等 |
| meta.layout | horizontal / vertical / hierarchical |
| meta.canvas | 画布尺寸 |
| meta.routing | 连线路由，默认 orthogonal |
| meta.title | 图表标题 |
| nodes[].type | service / decision / terminal / cloud / text |
| nodes[].position | 节点坐标 |
| edges[].type | primary / data / optional |
| edges[].label | 连接关系说明 |

具体设计系统与主题以 drawio-skills 自带 references 为准，避免在 Nebula 重复维护第三方工具细节。

## ASCII 转换触发

应转换：
- `┌ ┐ └ ┘` 等箱线流程；
- 多行箭头组成的流程；
- ```text` 代码块中的复杂架构图。

保留：
- `├── folder/` 目录树；
- 单行 `A → B`；
- 不值得维护成图的轻量说明。

## 命名

推荐：
- `附件/{源文件简称}-{主题}.drawio`
- `附件/{源文件简称}-{主题}.png`

YAML spec 放：
- `.drawio-tmp/{name}/{name}.yaml`

## 编辑已有图

1. 优先修改 YAML spec；
2. 重新生成 drawio 与 PNG；
3. 验证 CLI 无 error；
4. 确认 Markdown 引用仍有效。

## Verification

完成后检查：
- [ ] YAML spec 存在；
- [ ] .drawio 存在；
- [ ] PNG 存在；
- [ ] Markdown 引用可解析；
- [ ] CLI validate 无 error；
- [ ] 没有重复残留旧 ASCII 图。

## 相关

- SCHEMA
- 工具-page-guide
- 工具-vault-lint
