# Visual Representation Atlas · V0.1

A **research catalog, not a verified 630-component renderer**. The goal is a cross-disciplinary library for HTML visualization, including charts, diagrams, maps, technical/engineering views and scientific displays.

## Open-world discipline registry

- [107-domain coverage map / 覆盖研究地图](domain-coverage-map-v0.2.json) and [CSV](domain-coverage-map-v0.2.csv): **18 seeded, 12 old-baseline-partial, 77 unaudited** across 10 clusters. This is a provisional planning map, not proof of exhaustive disciplinary coverage.
- [Coverage explanation](../docs/research/open-domain-coverage-map.md).

## Professional-domain extension (second round)

- [Searchable offline expansion HTML](extensions/index.html) — 18 domains, 155 names, status and evidence filters.
- [Extension JSON + CSV](extensions/README.md) — 21 names matched old catalog, 134 new candidates by normalized English name only; **semantic uniqueness remains unverified**.
- [Cross-domain research matrix](../docs/research/cross-domain-expansion-2026-11-22.md), [Agent Skills matrix](../docs/engineering/agent-skills-and-renderers.md), and [per-domain skill routing](../docs/engineering/domain-to-skill-routing.md).
- The tentative **764 names** (630+134) are **not** 764 confirmed independent visual grammars, and neither taxonomy nor web components are complete.

## Available artifacts

- [Searchable offline HTML index](visual_representation_atlas.html): open locally in a browser; filters and labels are a directory, not rendered examples of every type.
- [Full JSON catalog](visual_representation_atlas.json): **630** named candidates in **24** families, with source-category attribution.
- [All 630 types (CSV)](types.csv) and [24 families (CSV)](families.csv): Excel-friendly UTF-8 BOM exports from the JSON source.
- [Broad-domain coverage audit](../docs/research/full-spectrum-breadth-audit.md): what is missing and why current breadth is *not yet accepted*.

## Evidence and coverage boundary

| Metric | Status |
|---|---|
| Distinct named catalog entries | 630 |
| Current top-level families | 24 |
| Entries directly named in consulted source directory | 185 |
| Entries with only family/category-level source, needing individual checks | 445 |
| Full domain coverage | **NOT PASSED** |
| All types implemented/tested in HTML | **NO** |

The original older README text reported 619/184/435, inconsistent with the final JSON 630/185/445; this repository uses the **validated JSON as the single source for counts**. Each row's `verification` field must not be interpreted as full scientific or HTML implementation validation.

## Planned maturity gates

- **L0** candidate name;
- **L1** trustworthy source directly uses the name;
- **L2** definition, semantics and drawing conventions reviewed;
- **L3** concrete visual example and suitability reviewed;
- **L4** reproducible HTML implementation with semantic, interaction and visual QA.

A type may also require real 3D geometry or GIS assets; generating a visually similar image is not always equivalent to a geometrically correct representation.
