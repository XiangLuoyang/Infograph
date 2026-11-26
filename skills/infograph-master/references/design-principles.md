# Core design principles

Apply these decisions proportionately to every artifact; substantial work records each decision and evidence. Static or simple outputs may omit inapplicable features with a concrete rationale. Truth, accessibility, privacy and the reader's task outrank decorative fidelity. The principles originate in REAL-001 and remain provisional outside that case.

## DP01 — Hybrid rendering / fitness per layer
Choose the simplest medium capable of the required fidelity and task: native chart/HTML for data and text, SVG for precise relationships, raster for complex visual assets, 3D only for genuine spatial needs. Use image assets when they materially improve expression, not automatically. Preserve editable semantic labels, stable identities and inspectable data. Record asset provenance, layer roles, fallback and why chosen; a single renderer is valid when sufficient. See reference-reconstruction.md.

## DP02 — Material coherence / whole before parts
Specify a shared art direction across focal subject, surrounding components, typography, lines, palette, depth, lighting and surface detail. Assign visual weight by information hierarchy, not implementation convenience. Compare two distinct directions for substantial work; inspect the complete rendered composition AND changed layers. A photoreal centerpiece beside generic outlined boxes may regress overall quality. Use readable foreground/background and restrained semantic accent. A coherent flat language is valid.

## DP03 — Responsive composition / recompose for the task
Select target devices, viewport sizes, reading order and task priority before build. Preserve primary claim, essential evidence and controls within reach; scale or reflow only where adequate. For dense scenes use alternative layouts, grouping or progressive disclosure with explicit aggregation, maintaining semantic completeness. Verify actual viewport screenshots, overflow, clipping, control reach and task completion. Fixed print or projection output documents its single target.

## DP04 — Contextual focus / meaningful inspection
Choose interaction by reader task, not novelty. Where relationships are dense, separate narrative stage from inspection focus; stable IDs connect selected objects, detail and highlight; preserve context, reversibility, keyboard/touch and reduced motion. Do not dim essential text into unreadability, invent values or force motion. Static or direct-label visualization may be better. See contextual-focus.md.

## DP05 — Regression protection / preserve accepted strengths
For revisions, name the baseline, lock accepted elements and record intended changes; obtain approval or explicit rationale before changing a locked layer. Compare matched states and target viewports; inspect whole and per-layer regressions including readability. User-reported unreadable essential text or broken essential tasks block completion until verified repair; emulation does not prove actual host behavior. New projects record no prior baseline and establish a candidate without claiming approval. Keep actual feedback, failures, scope and unknowns. Do not infer full acceptance from positive general feedback.

## Evidence and enforcement
For substantial tasks record renderer strategy, coherence specification, viewport composition plan, task/interaction rationale and baseline disposition before final build; actual render coherence, target-device/task review and regression/legibility evidence before declaring review complete. A nonapplicable feature needs a rationale tied to the artifact; do not invent records. An unknown or untested required check remains not-run. See acceptance.md, execution-gates.md and critique-protocol.md. Declared evidence gates do not prove aesthetics.

Case evidence: benchmark/real-cases/REAL-001/PRINCIPLE-EVIDENCE.md. Positive feedback is directional, not controlled model/skill effect or proof of cross-domain generalization.
