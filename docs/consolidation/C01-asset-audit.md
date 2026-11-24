# C01 Asset audit
Baseline: e4e3f62413ec8d848d68207a438f13a5638d9506

336 tracked files; 29 directories; recursive tree not truncated. Inventory records paths, blob SHAs and sizes. Six studio files inspected for static relative imports; 0 missing import targets. This is a path inventory, not a full source/dependency or runtime audit. Test filenames are not evidence of passing tests. Exact duplicate blobs are not necessarily redundant. No maturity promotion based on file presence. Next: C02 ontology audit; C03 actual test execution and dependency review; C04 browser acceptance. License paths: [].

## Groups
- .github: 3
- MIGRATION_MANIFEST.md: 1
- QUALITY_AUDIT.md: 1
- README.md: 1
- assets: 13
- catalog: 13
- docs: 26
- examples: 19
- index.html: 1
- skills/infograph-master/README.md: 1
- skills/infograph-master/SKILL.md: 1
- skills/infograph-master/benchmark: 6
- skills/infograph-master/engine: 55
- skills/infograph-master/references: 5
- skills/infograph-master/visual-intelligence: 181
- skills: 7
- tests: 2

## Studio import scan
- skills/infograph-master/visual-intelligence/color-studio.html: ./color.mjs, ./semantic-color.mjs, ./color-art.mjs, ./color-decision.mjs
- skills/infograph-master/visual-intelligence/composition-studio.html: ./parametric-composition.mjs, ./information-composition.mjs, ./attention-plan.mjs
- skills/infograph-master/visual-intelligence/material-studio.html: no static relative imports detected
- skills/infograph-master/visual-intelligence/motion-studio.html: no static relative imports detected
- skills/infograph-master/visual-intelligence/representation-studio.html: ./representation-index.json, ./representation-selector.mjs, ./specialist-adapter.mjs
- skills/infograph-master/visual-intelligence/typography-studio.html: no static relative imports detected

## Priority risks
- Separate embedded snapshots and live imports need synchronization checks.
- Test coverage and workflow results not established by inventory.
- No complete cross-module dependency graph yet.
- Verify licensing before distribution.
