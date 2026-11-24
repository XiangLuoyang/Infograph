# Engineering asset routes and limitations
Paths below relative to skill directory, not this references folder. Load only relevant subsections. The former cumulative instructions are retained here for compatibility; the Master execution workflow and mode routing govern selection.

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
