# VMI compact authoring (opt-in)
The constructor removes repeated mechanical fields, not design judgment. Use the existing packet task and verified exploration; author concepts, P3 reviews, source evidence and selection normally. Keep actual captions, explanations, state highlights, semantic bindings, physical forms, color palette and activation rationales. Never copy a benchmark or invent evidence.

## Workflow
1. Obtain `task <run-dir> vmi-packet`. Keep locked upstream fields or omit them where hydration supports it.
2. For a one-layer essential SVG scene with 2–6 objects and suitable automatic layout, replace `scene` (or leave it null) with `sceneDraft`. Author title, subtitle, staticSummary, objects (id, caption, detail, shapes and/or geometry as permitted by the original compiler), states, initialState and layout. Layout accepts focalObject (actual object ID), intent, ref, optional minSize and focalScale. Do not author desktop/mobile boxes, layer IDs, symbolic waypoints, or physical waypoints. Optional physicalTopology, surfaceRendering and dynamicBindings retain their full original contracts.
3. Optionally replace styles (or leave it an empty array) with styleDrafts: same authored fields except baselineRef, derived from selectedConcept.designDNARef. No automatic palette selection or contrast correction occurs.
4. Optionally replace activation with activationDraft, omitting version only. Author plainComparison, sourceInteraction and all six capability decisions exactly as required by the original gate. Remove the unused activation scaffold; the constructor rejects competing inputs. Do not declare use just because a feature is available. If the automatic composition route is chosen, record the real composition decision and evidence.
5. Run `node scripts/infograph.mjs vmi-author draft.json packet.json`. The output must be a new JSON file; this command never overwrites, compiles, grants eligibility, or issues execution receipts. A packet may mix canonical and draft sections, but never provide competing definitions for one section. Batch form is {scenes:[...]} with each scene's own draft or canonical sections.
6. Run `node scripts/infograph.mjs run <run-dir> vmi-packet packet.json` and inspect the actual results. Preserve draft and constructed input in the private audit trail. Use the existing canonical path for bespoke multi-layer scenes, manual geometry, unsupported shapes, or unsuitable automatic composition. Original compiler and activation gates apply without exception.

## Constructed fields
- Scene conceptId and revision come from the uniquely selected authored concept.
- A single main essential SVG layer and object layer references are generated; no semantic mappings or objects are invented.
- Composition version and auto mode are generated from explicitly authored layout intent; actual geometry is still determined by the existing compiler.
- Style baselineRef and activation version are bound mechanically.
- Conflicting sections, unknown compact fields and inconsistent object IDs/focal object are rejected.
- Constructor output is not proof of semantic fidelity, valid styles, actual fit or aesthetic quality. The canonical compiler and subsequent reviews decide those.
