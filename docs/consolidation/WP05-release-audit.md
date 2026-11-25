# WP05 release audit — initial inventory

Status: open; no release authorization.

Repository tree inspection returned 553 entries, not truncated. No root LICENSE, NOTICE, package manifest or lockfile was identified. This is a point-in-time inventory, not a full source license scan.

| Asset / dependency | Evidence | Disposition |
|---|---|---|
| Original migrated SVG/PNG | assets/README.md and migration manifest claim original user-owned source and unchanged hashes | Verify ownership and redistribution scope; do not infer from filename |
| Migrated HTML gallery | examples/README.md claims byte-identical prototypes and synthetic data | Inspect external URLs, embedded code, fonts, maps and privacy |
| Golden Six | README describes original SVG code and historical CI | Verify source references and any third-party assets |
| External skill links | README says third-party installed skills not bundled | Check links versus actual copied content |
| Playwright 1.51.1 | browser workflow install | Resolve package license, transitive dependencies and browser notices |
| pngjs 7.0.0 | browser workflow install | Resolve package license and notices |
| esbuild 0.25.5 | browser workflow install | Resolve package and platform binary licenses |
| GitHub Actions and Ubuntu browser dependencies | workflow references | Record build/test environment separately from distributed runtime |
| Root project license | absent | Owner decision required; no license selected by this audit |

Next: inspect actual source references and workflow dependencies, produce distribution-specific inventory and notices, validate packaging and documentation. Do not conflate build/test dependencies with bundled code. Existing migration claims are not independent rights verification.

Historical Browser QA run 45568956367 succeeded with batch regression enabled; actual Studio baseline approval and independent visual review remain outstanding. All formal release gates remain unpromoted pending same-revision evidence. No legal conclusion or redistribution permission is asserted.
