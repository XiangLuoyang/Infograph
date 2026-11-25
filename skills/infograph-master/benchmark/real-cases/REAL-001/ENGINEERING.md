# REAL-001 engineering follow-up

| Workstream | Phase 1 delivered | Next empirical milestone |
|---|---|---|
| Visual Decomposition | Authored manifest, source provenance, stable objects/ports, scene validation | Independently annotate permitted neutral references and compare object/relationship coverage |
| Aesthetic Fidelity | Per-object review dimensions and mandatory evidence | Blinded paired human review; separate aesthetic judgment from geometric similarity |
| Hybrid Rendering | Capability-aware object renderer routing and dynamic anchor coordinates | Execute layer adapter with text + vector + image/3D assets, shared state and keyboard fallback |
| Material & Lighting | Bind existing surface and light heuristics, explicit unmet PBR capabilities | Implement/verify actual WebGL lighting, material and geometry in browser; compare reference captures |
| Reference-based QA | Review ledger and blocked missing evidence, existing screenshot comparison guidance | Capture matched scene states, inspect visual differences and functional/accessibility checks |

No formal REAL-001 rerun yet; no promotion to golden case. Keep private original assets outside public repository. Do not expand taxonomy before testing a running hybrid prototype.

## Phase 2 implementation
Added standalone layered renderer and neutral 14-link fixture, offline embedded raster, deterministic labels, geometric links, shared scene state and static fallback. CI captures three viewport sizes and tests actual anchor alignment, playback, pause, reduced motion and reset. No private input, PBR or real reference fidelity claim. Five objectives and business narrative are not part of this engineering-only fixture; a full REAL-001 rerun remains pending.

## Phase 3 implementation
Phase 2 first browser run failed: SVG `.hidden` property did not apply the hidden attribute; fix uses `toggleAttribute` and retains prior regression. Added restricted native WebGL mechanical mesh, direct-light metallic shading, orthographic view, procedural reflection and context-loss fallback, with separate unit and browser tests. This is not a general model loader, physical simulation or full PBR pipeline. CI and human review pending at submission.

## Phase 3b
Prior revision 8f71b50 passed browser QA, engine checks and distribution audit. Added bounded configurable box/cylinder assemblies, orthographic camera shared between CPU and GPU, authored 3D ports projected into SVG coordinates with 2D fallback on context loss, and neutral 26-part fixture. New CI pending; no aesthetic claim. Remaining: real environment maps, cast shadows, arbitrary geometry and actual reference-based comparison.
