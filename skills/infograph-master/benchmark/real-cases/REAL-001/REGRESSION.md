# REAL-001 regression protocol (proposed; not executed)

Use fixture.json. Compare three independently scoped arms: A direct brief without skill; B same brief plus pinned Infograph bundle; C same brief plus pinned bundle and identical neutral reference image. To isolate reference effects, optionally include A+reference as a fourth arm. Do not compare C to A as a pure skill effect. Hold model snapshot, reasoning settings, tools, time/iteration budget and renderer availability constant within comparisons. Fresh contexts, randomized order, blinded human review; do not supply this case history or previous outputs. Preserve all failures.

## Acceptance checks

- Semantic: exactly 14 unique constraints partitioned 6/3/5, five objectives, no invented numbers or quantitative forces; no unsupported attribution.
- Representation: one visually dominant operating entity; distinguish source groups; legible anchors; explain metaphor limits.
- Interaction: step/next/back, playback pause/resume, reset, linked qualitative highlight, keyboard/touch support; stable identity; cable endpoints follow moving object; no forced delay for manual use; reduced-motion fallback.
- Visual: inspect initial, all-forces, balance and market-highlight scenes at 1440×900 and 1920×1080; mobile 390px reading order; no obscured labels; review typography, proportions, geometry, lighting and material coherence separately.
- Reference fidelity: only applicable to reference arms; assess layout/object mapping, shape, material, lighting and relative visual hierarchy separately; no claim of pixel-perfect fidelity.
- Engineering: offline/dependency declarations; console errors, reset determinism, screenshot capture and artifact hashes; report unrun checks explicitly.

## Human review

Obtain independent ratings (proposed 1–5 anchored scale: 1 unusable, 3 adequate, 5 excellent) for semantic clarity, aesthetic quality, reference fidelity (where applicable), and interaction relevance. Record actual reader comments and task completion separately from model self-review. No scores exist for the historical case. Predefine a promotion threshold with the case owner before running; do not retrofit a threshold from results. A future run is not automatically an improvement because it uses a newer skill.

Record exact commit, bundle hash, prompt and reference hash, model/settings, tool access, run costs, iteration count, screenshots, pass/fail/not-run with evidence, and reviewer feedback. No formal experiment has been run.
