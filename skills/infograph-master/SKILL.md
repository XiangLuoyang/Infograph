---
name: infograph-master
description: Design and implement complete evidence-grounded business dashboards and full-spectrum visual representations, including narrative, color, typography, layout, material, chart selection, diagrams, maps, motion, interaction and engineering QA.
---
# Infograph Master V1.0
Use this as the single entry point. Resolve paths relative to the Infograph repository root, two levels above this skill directory. Keep the repository available; do not copy this file alone. Read references/router.md and references/visual-design.md for every dashboard; load other references as routed. Do not merely mention the references: apply their rules and record design choices.
## Workflow
1. Brief: audience, task, decision, mode (executive report, monitoring, investigation, exploration, professional illustration), time budget, data permissions, delivery constraints. Ask only for blocking inputs; mark unknowns.
2. Evidence: reconcile units, grain, period, denominators, sources, missingness; distinguish facts, inference, assumptions and unknowns.
3. Narrative: for authored reports execute skills/narrative-design/SKILL.md G1–G5 and its references. For monitoring/exploration use task-first information architecture, not a forced thesis.
4. Art direction: propose two or three meaningfully different compositions and visual languages; choose one based on audience and task. Produce design tokens for color, typography, spacing, material, borders, shadows and motion. Default to restrained editorial style for executive reporting, not generic card grids.
5. Representation: map each scene or user task to data relationship, domain, chart/diagram type, encoding, renderer, and rationale. Consult catalog and routing contract when ordinary charts are insufficient.
6. Layout: design reading order, dominant visual, evidence proximity, density, responsive reflow and navigation. Keep key claims and caveats visible without hover.
7. Interaction: specify states, transitions, shared object IDs, keyboard and touch behavior, reset and reduced-motion fallback. Use animation to explain, not decorate.
8. Build: one shared data model; no fake controls; offline-first when requested. Implement actual HTML or requested output, not just a design proposal.
9. QA: apply references/acceptance.md; render and inspect desktop/projector/mobile when tools permit. Fix blockers; report untested items explicitly.
## Deliverables
Brief, evidence map, thesis/storyboard or task map, visual specification (tokens + layout + chart rationale + state map), working artifact, validation log. Compact tasks can combine these. Do not stop after planning unless requested.
## Precedence
Truth, privacy, domain accuracy and accessibility override style. User explicit constraints override default aesthetics. Do not upload private data or install external skills without authorization. Existing catalog entries are research leads, not guaranteed implementations. No superiority claims without testing.

## V1.1 engineering assets (opt-in)
When requested to use V1.1, read engine/USAGE.md relative to this skill, select actual IDs from engine/styles.json and layouts.json, use materials.css and motion.css where appropriate, and consult contrast-audit.json. Accent pairs below 4.5:1 must not be used for normal text; check actual material/background combinations. Screen chart candidates with engine.py route and verify semantics independently. Write design IR following engine/design.example.json; run the structural validator and unit tests if Python is available. Record outputs and failures. Preview assets using engine/gallery.html. V1.0 workflow remains available without this increment. Do not treat gallery grid presets as a layout compiler or claim browser/user testing that did not occur.

### V1.1 compiler increment
For V1.1, run `python compiler.py design.json` from engine after IR validation (use actual design file path). Apply scene bindings and responsive spans with compiler.css, tag rendered blocks with data-ig-block, and run visual-check.js diagnostics at target viewports. Review warnings, do not hide defects with overlay exclusions. Run both unit test modules. Report CI and browser status only when observed. Compiler is a heuristic plan generator; preserve narrative and domain semantics through manual review.

### V1.1 visual expression increment
Read engine/art-direction-guide.md and art-directions.json. Compare at least two directions on composition, type, material and motion, not only palette. Use typography-composition.css when appropriate. Optional charts.js supplies simple nonnegative bar and ordered line SVG primitives; inspect labels, units, density, axes and accessibility, and use a specialist renderer when needed. These are candidates, not browser-validated golden designs.

### Candidate gallery
Consult engine/golden/manifest.json and relevant HTML examples for composition and evidence presentation. These are synthetic candidates, not certified golden works. Do not copy their claims or data into real reports. Material preferences are not fully implemented; architectural example is not a map; chart primitives are limited. Compare actual screenshots and validate before promoting any example.

### Browser QA and promotion
For gallery candidates follow engine/golden/PROMOTION.md. Run browser-qa.mjs with Playwright from engine, or inspect the browser QA workflow artifacts. Review report.json and screenshots; do not equate screenshot capture with regression testing. Do not claim a pass without observed results.

### Relationship composition and motion
Read engine/composition-motion.md, composition-patterns.json and motion-grammar.json. Choose by information relationship before visual style; preserve reading order and evidence proximity. Use composition-patterns.css and scene-controller.mjs where appropriate. Reorder, flow and camera are specifications only, not implemented animations. Do not imply a spatial relation or causal mechanism without evidence. Verify navigation, reduced motion and focus in browser before claiming pass.

### Specialist engines
Read engine/specialist-engines.md. Use material-catalog.json and material-extended.css for candidate surface recipes, chart-transforms.mjs for additive waterfall, histogram and attainment data, spatial-transforms.mjs for abstract isometric projection and supplied exploded-part positions. These are transforms, not full renderers. Never use Cartesian isometric projection as geographic projection or infer engineering geometry. Run test-transforms.mjs and inspect actual rendered output.

### Experimental unified Design IR 2.0
Read engine/design-v2.md and design-v2.example.json. Use design-v2.mjs with the five catalogs to validate and compile candidate layout and chart plans. Keep V1 compatible. No automatic HTML rendering, semantic truth validation, geographic projection or verified animation is implied. Run test-design-v2.mjs and report observed results only.

### Experimental Design Runtime
Read engine/runtime.md. For supported static ranking and lookup designs use render-cli.mjs with Design IR 2.0 and separate block data. Reject unsupported tasks, transitions and spatial objects; use freeform or specialist renderers instead. Material is not applied. Inspect actual HTML and browser output before claiming quality. Never infer business conclusions from renderer success.

### Hybrid planning prototype
Read engine/hybrid.md. Use planHybrid after compileDesign to identify native and custom slots. A custom slot is not permission to bypass data validation; resolve invalid data first. No automatic custom code execution, shared-state UI integration or repair execution is implemented. Preserve evidence IDs and review all custom code. Run test-hybrid.mjs and report actual results.
