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

## Phase 3c
5660338 passed engine, browser, distribution and benchmark smoke CI. Added bounded sampled LDR studio environment texture, roughness-dependent sampling, directional ground-plane mesh projection with stencil union and controlled render variants. New CI pending. No full HDRI/IBL, shadow map, self-shadow, soft shadows or aesthetic verification; next prioritize visual review and reusable art directions over expanding a custom general-purpose engine.

## Phase 3d
Added executable industrial/cinematic/architectural parameter bundles and neutral same-content gallery, preserving object IDs, link semantics and scene order. Added matched screenshot tests and human review protocol. Phase 3c engine/distribution passed; browser was still running during initial inspection. No user approval or full REAL-001 rerun.

Phase 3c browser QA at 03774bb failed the final warm/cool pixel-difference assertion (earlier environment/shadow assertions completed). Strengthened ambient studio-map hue distinction without lowering the threshold; diagnostic counts added to failure output. Revalidation pending.

## Phase 4
948db42 passed all four CI workflows, including lighting and art direction browser tests. Added reference pair review engine, image-hash-bound annotations/observations, region and relationship diagnostics, scoped repairs and an injected-defect browser fixture. New CI pending. Original REAL-001 concept and HTML have not yet been compared; no aesthetic improvement claim. Next execute actual case, not more renderer expansion.

## Phase 5a: real-case replay
A private, reference-informed freeform hybrid variant was generated and locally tested. See [V4-REPLAY.md](V4-REPLAY.md). Actual functional checks passed; human aesthetics and full native-engine replay pending. The original and rendered private artifacts are intentionally not in the public repository.

## Phase 5a user feedback
The actual user approved the focal asset improvement, found layout and interaction unchanged/mediocre, and reported regression in cable/label styling plus white-on-white text. See [V4-USER-REVIEW.md](V4-USER-REVIEW.md). Case remains partial pass; aesthetic and legibility gates not passed. Local mobile layout diagnosis and theme sampling recorded; exact white-on-white cause not reproduced. Prioritize V5 case repair over new engine work.

## Phase 5b: V5 targeted visual repair
See [V5-REPAIR.md](V5-REPAIR.md). Approved focal asset held fixed; peripheral chains, callouts, mobile composition and contextual selection redesigned. Local functional and sampled contrast checks passed; user-reported actual host legibility and aesthetic acceptance remain open. No native renderer comparison.

## Phase 5c: V6 contextual focus
See [V6-FOCUS.md](V6-FOCUS.md). V5 visual assets held fixed; desktop/mobile group and individual inspection added, with stage state kept separate from focus. Local layout, interaction and sampled active text checks passed. User approval and actual host remain pending.

## Core principle consolidation
Owner reported V6 much improved after viewing. Record positive feedback and candidate baseline without promoting to Golden Case. DP01–DP05 moved into main Skill execution and acceptance. See [PRINCIPLE-EVIDENCE.md](PRINCIPLE-EVIDENCE.md). Generalization remains untested.
