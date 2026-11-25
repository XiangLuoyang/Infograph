# C02 ontology audit
630 ontology and index records; no duplicate IDs or normalized English/Chinese names (NFKC, lowercase, punctuation/space removed), no missing/orphan index IDs or name mismatches. 63 overlays, three key shapes, 28 routes across 25 forms. All ontology records unreviewed. 119 distinct literal input labels. Object schema versus array dataset mismatch. Proposed array wrapper and three candidate aliases; no runtime change. Seven targeted semantic issues below; not exhaustive.
- VIZ-0087: duplicate lexical requirement paired values / paired-values
- VIZ-0142: geography route duplicates coordinates/crs and omits flow requirements
- VIZ-0091: association route omits color encoding and matrix semantics
- VIZ-0161: generic node-link channels do not describe matrix cells
- VIZ-0244: cutting plane / section-plane lexical alias; solid geometry stricter than geometry
- VIZ-0317: hypothesis vs causal evidence must be distinguished
- VIZ-0588: small multiples is composition pattern, not exclusively temporal
Do not merge broader geometry with solid geometry or evidence with hypotheses. Next C03: validate schema using real validator, test route changes and execute code. No external source review or full semantic deduplication.

## Applied correction (supersedes earlier proposal-only wording)
Index updated in 6ff9ee23f8e00ecd6dbff36f3ea52faa7516a233; array schema added in ce2738d46499fcb7ac9fd1e8dd57f5dd42586504. Flow-map requirements deduplicated and completed, matrix and heatmap channels corrected. Five readback structural checks passed. Existing audit JSON retained as pre-patch evidence. No runtime or schema validator executed. Aliases remain unresolved.