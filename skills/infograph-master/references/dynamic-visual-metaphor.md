# Dynamic visual metaphor — mechanism-first design

Status: case-derived practice, provisionally validated through two iterative user workflows; not a controlled benchmark or general aesthetic guarantee. Extends DP01–DP05 rather than replacing them.

## Route
Use when the reader must understand an abstract mechanism or contradiction (competing demands, resource misallocation, flow bottleneck, feedback, risk propagation), and a physical analogy improves intuition beyond a conventional chart. Do not force a metaphor for exact comparisons, dense operational monitoring or unsupported causal claims. Pair metaphor with independent evidence; if the mechanism is uncertain, label it a hypothesis.

## Design sequence
1. Write the decision and one-sentence contradiction. Separate observed facts, plausible mechanism, consequences and proposed interventions.
2. Compare at least two distinct physical mechanisms for substantive work. Select by semantic fidelity, visual expressiveness, material coherence, controllability and evidence risk, not novelty.
3. Define an explicit mapping ledger: business object/relation -> visual object/relation -> state/change -> interpretation -> evidence status. Every salient object must have a semantic job. List where the analogy breaks; avoid implied quantitative magnitudes.
4. Compose a dominant focal scene with a stable identity; subordinate labels and charts. Select rendering by layer (SVG/CSS/Canvas/WebGL/raster), unify material, depth, typography, palette and lighting. Preserve readable text and inspect at target viewports.
5. Define an explicit state machine. Narrative progression and inspection are separate. Keep geometry/object identities stable where comparison matters; use reversible controls and readable static/reduced-motion alternatives. Animation encodes meaningful change only; avoid decorative particles, idle motion and false precision. Labels and status must remain understandable if motion is disabled.
6. Return to evidence: link the scene to actual comparisons and decision/action; do not substitute a physical analogy for validation of the cause or a model. Never use a proportional flow width, speed, force, gauge or scale as measured magnitude without data and a defined mapping.
7. Review against the accepted baseline, scene-wide coherence, semantic completeness, state transition correctness, interaction and responsive reading order; freeze approved strengths and disclose untested checks.

## Pattern families
| Family | Mechanism | Visual vocabulary | Appropriate tasks | Main hazard |
|---|---|---|---|---|
| Force / tension | Competing constraints act on one entity | Anchors, cables, tension, stable central object | Stakeholder conflict, resource competition, trade-offs | Implied measured force or unproven attribution |
| Circulation / bottleneck | Adequate total resource coexists with inaccessible or misallocated resource | Reservoir, distributor, branches, accumulation, throttling, return | Resource allocation, queues, inventory, cycle efficiency | Treating schematic flow as measured volumes or claiming proven causality |
| Balance / load | Distribution matters as much as total mass | Load, support, tilt, counterweights | Exposure concentration, portfolio balance | Implied calibrated weights |
| Propagation / feedback | Local disruption passes through connected dependencies | Linked stages, reversible state change, feedback path | Risk cascade, process effects | Confusing correlation or possibility with certainty |

First two have qualitative owner feedback; latter two are candidate analogies, not validated designs.

## Circulation reference state contract
- Stable IDs: reservoir, allocator, healthy branch, constrained branch, accumulation, return. Supply, allocation, availability and return are distinct concepts.
- Normal state: qualitative balanced allocation and return. Label as illustrative target, not observed history unless supported.
- Risk state: concentration/accumulation, constrained replenishment elsewhere, slower return. Distinguish observed metrics from mechanism hypothesis.
- On toggle, update scene, status and explanatory text together. A static view shows both states or a clearly labeled selected state with explanation.
- Optional evidence drilldown uses actual series/item records only; missing detail is not zero. Risk impact requires an explicit model and assumptions, not animation.
- Read the two case records: [REAL-001](../benchmark/real-cases/REAL-001/CASE.md), [REAL-002](../benchmark/real-cases/REAL-002/CASE.md).

## Acceptance evidence
Record mapping ledger, considered alternatives, state definitions, non-quantitative disclaimer, renderer rationale, target viewport and motion-off checks, narrative-to-evidence link, approved baseline and actual user feedback. For custom code, inspect rendered states and control behavior, not only source. Unknown/unrun tests remain unknown. No promotion to Golden without the repository's separate criteria.
