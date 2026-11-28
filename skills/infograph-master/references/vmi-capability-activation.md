# VMI capability activation — production candidate gate

This is an authored applicability audit with compiler-backed consistency checks, not a feature-count target or an automatic design director. The production `vmi-packet` task supplies the blank activation scaffold for each selected scene. Standalone workbench packets retain their existing contract.

For each scene:
- Compare the reviewed plain representation with the proposed mechanism. Record `plainComparison:{ref,advantage,tradeoff}`, based on actual reader task and alternatives. The selected compiled concept must have a plain alternative.
- Record `sourceInteraction:{status,ref,reason}`. Use `none` when no relevant source interaction exists; `preserve` when a source mechanism must retain host-driven numeric behavior (requires compiled dynamic bindings); `alternative` only for a justified custom interaction route. The last option is an authoring disposition, not proof of implementation; test it separately and do not silently drop behavior.
- Provide exactly six `decisions`: `geometry,materials,topology,composition,dynamic,art`. Each has `mode:use|omit|custom,ref,reason,alternative`. Use the actual scene/source/reader-task evidence, compare plausible existing routes, and explain tradeoffs; do not repeat generic claims.

| Capability | Canonical compiled evidence |
|---|---|
| geometry | geometryManifest |
| materials | surfaceRendering.parts |
| topology | compiled physical topology |
| composition | compositionManifest.selectedId |
| dynamic | dynamic.spec.bindings |
| art | selected upstream ART and CSS, inherited at assembly |

Use means the relevant compiler output must actually exist; omit/custom means it must not be claimed as compiled. Custom routes need separate artifact verification. No generic pipe or liquid encodings solely to increase feature use. Material or geometry counts do not prove aesthetic quality.

Activation is replayed with the packet and bound upstream production plan. Missing or contradictory declarations become packet issues and block production build eligibility. It does not independently validate evidence references, know whether a rationale is truthful, measure comprehension, or guarantee the author selected the best form. Continue through normal integration, browser, semantic and independent visual review. Existing production packet inputs need migration and rerun; no release authorization is implied.
