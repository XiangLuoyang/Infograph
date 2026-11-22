# Infograph · Migration integrity and publication audit

**Audit date:** 2026-11-22  
**Source:** `XiangLuoyang/Obsidian-Nebula` (private)  
**Destination:** `XiangLuoyang/Infograph` (public)

## Verified in this audit

| Check | Result | Boundary |
|---|---|---|
| Source and destination repository trees | Read successfully | Source preserved; destination is separately curated |
| Exact-copy assets | **27/27 source Git blob hashes match** | 15 HTML, 8 SVG, 4 PNG |
| Research and methods | **17 adapted Markdown pages** | Text adaptations, not identical source files |
| Markdown navigation | **No broken relative paths or unresolved Obsidian Wikilinks found** | Checked repository Markdown files against tracked paths |
| Catalog counts | **630 named entries, 24 families, 185 directly named, 445 pending item-level verification** | `catalog/visual_representation_atlas.json` is the canonical research data |
| Unified offline gallery | **15/15 original HTML demo paths resolve** | [Open gallery](index.html); newly authored navigation layer |
| Public release screening | No targeted names of private colleagues, customers, email addresses or known partner identifiers found in selected public notes | Automated string scan is **not** proof that content is approved for public distribution |

## What is not yet proven

- **Browser runtime and mobile QA:** The demos were migrated and Git SHA verified; they have not all been re-run in a controlled browser environment after migration. Relative asset resolution was statically checked.
- **Scientific and engineering breadth:** The V0.1 taxonomy is a research index, not an exhaustive professional diagram language.
- **Legal reuse rights:** There is no blanket license. Bibliographic references and third-party inspired styles do not transfer rights to external assets or upstream Skills.
- **Information security review:** Sensitive-name screening is a first pass, not formal authorization for public disclosure.

## Deliberately held back

- One earlier, large map-material prototype in Nebula that includes possible branded identifiers; public-safe V02 and six-style experiments are available instead.
- Original XLSX and generated preview PNG from the conversation: CSV, HTML and JSON research representations are available in `catalog/`; four original style-study PNG images were migrated separately.
- Third-party installed Skills and unrelated private diagram files.

## Next implementation gates

1. Independently inspect each HTML demo (desktop + mobile), inspect browser console, verify model/document interactions and no unexpected external dependencies.
2. Define a canonical type schema, aliases, relations, examples, source authority and per-type verification gates.
3. Convert frequently used graphic families (flow, exploded, cutaway, graph, map, scientific field) into reusable tested components.
4. Repeat open-source/license and publication safety audit before adding new binary images, real datasets, or external model assets.

**Interpretation:** Copy integrity and static navigation checks passed. Cross-domain completeness, production readiness, visual runtime QA and public data clearance remain open.

## 2026-11-22 Second-round research addendum

- Added `catalog/extensions/discipline-seeds-2026-11-22.json` and CSV: 18 domains, 155 named seeds; 21 exact-match baseline entries and 134 not exact-matching the baseline. Only 12 source-name observations; 143 domain-level candidates.
- Added a searchable offline professional-domain index and 20 linked Agent Skills. Neither the types nor the skill implementations have undergone complete independent runtime testing.
- Added cross-domain research matrix and semantic-first HTML routing design contract; neither is a certified graphic standard.
- Original copied artifacts remain unchanged, preserving the 27/27 baseline hash-match finding.
