# Progressive loading
Paths relative to skill directory; repo: means repository root.
| Mode | Trigger | Read |
|---|---|---|
| Express | single simple chart | references/visual-design.md relevant chart section; acceptance relevant checks |
| Standard | dashboard | references/router.md; references/visual-design.md; references/acceptance.md |
| Narrative | authored report | Standard plus repo:skills/narrative-design/SKILL.md and routed references |
| Specialist | map, engineering, spatial, complex diagram | references/router.md; relevant domain documents; engine/specialist-engines.md |
| Studio | distinctive custom composition | Standard or Narrative plus engine/art-direction-guide.md; engine/composition-motion.md; relevant gallery |
| Runtime | repeatable supported static output | engine/design-v2.md; engine/runtime.md; engine/hybrid.md; engine/integration-audit.md |
Modes compose, not mutually exclusive. Use engineering assets only when they help. Read references/engineering-assets.md for exact asset routes and limits. Never load the entire catalog by default. For substantial authored reports use narrative G1–G5 before rendering. For dashboards default restrained editorial unless user directs otherwise. Express does not waive evidence or acceptance checks.

For Standard, Narrative or Studio tasks needing custom palettes, optionally read visual-intelligence/color-foundations.md and use color.mjs or palettes.json. Keep atmosphere separate from data encoding; check actual backgrounds. V1.2 is incremental, not a replacement for V1.1.

For categorical or signed data read visual-intelligence/semantic-color.md and use semantic-color.mjs where useful. Simulated distance is heuristic; preserve labels/shapes and stable category IDs. Do not use distinct hues for simple ranking unless category identity matters.

For Studio or custom atmosphere, read visual-intelligence/color-art.md and use color-art.mjs/art-palettes.json. Harmony and area ratios are heuristics; preserve brand hex, audit role contrast and actual compositing; keep semantic palettes independent.

For substantive color decisions consult visual-intelligence/color-cases.json and color-decision.mjs: declare scale domain/center, reserve signals, preserve semantic roles; inspect adjacency and legends. Router is advisory.

For Studio color refinement or narrative scene palettes consult visual-intelligence/color-cross-domain.md and color-cross-domain.json. Compare in context, use grayscale hierarchy first, preserve semantic identities across scenes; these are advisory patterns, not validated aesthetic metrics.

For interactive palette rehearsal use visual-intelligence/color-studio.html via local HTTP; see color-studio.md. Exported color contract is advisory and not yet automatically consumed by Design IR. Browser QA pending.

For custom typography consult visual-intelligence/typography-foundations.md and typography.mjs. Establish semantic roles, numeric alignment and language-specific reading measures; verify actual fonts and wrapping. Candidate tokens are not accessibility certification.

For font pairing consult visual-intelligence/typeface-pairing.md, typeface-pairs.json and typeface-pairing.mjs. Verify installed faces, glyph coverage and license; candidate stacks are not measured pairings.

For mixed-language dashboards consult visual-intelligence/multilingual.md and multilingual.mjs/css. Preserve language runs and quantities; inspect actual wrapping, fallback glyphs and narrow widths.

For financial tables and KPI typography consult visual-intelligence/numeric-typography.md and numeric-typography.mjs/css. Preserve raw values, explicit scale/unit/precision and null; verify actual numeric alignment and locale formatting.

For text spacing and reading rhythm consult visual-intelligence/typographic-rhythm.md and typographic-rhythm.mjs. Use semantic gaps, candidate grid and reading measure; verify actual baselines, zoom and wrapping.

For typographic art direction consult visual-intelligence/typography-cases.json and typography-cases.md; choose transferable mechanisms rather than copying artwork. Cases are provisional research patterns.

For expressive typography consult visual-intelligence/type-image.md, type-image-patterns.json and type-image-gallery.html; preserve plain essential text and explicit quantitative scales.

Typography Studio: visual-intelligence/typography-studio.html and typography-studio.md integrate candidate typography contracts; use exported JSON as design input, not certification.

Composition foundations: consult visual-intelligence/composition-fundamentals.md and composition-audit.mjs. Geometric proxies are diagnostic only; preserve semantic reading order and review actual perception.

Spatial grammar: visual-intelligence/spatial-grammar.md, spatial-grammar.json and spatial-grammar.mjs map declared relationships to advisory spatial primitives; preserve evidence and reading order.

Composition archetypes: consult visual-intelligence/composition-archetypes.md and JSON/MJS companions for 30 candidate patterns; compare alternatives by semantic fit, not alphabetical tie order.

Attention choreography: consult visual-intelligence/attention-choreography.md and attention-plan.mjs for intended reading paths; keep essential evidence visible and navigation voluntary.

Cross-domain composition studies: visual-intelligence/composition-cases.md and composition-cases.json. Use compositional modifiers alongside archetypes; source observations and transfer hypotheses are distinct.

Information-driven composition: consult visual-intelligence/information-composition.md and information-composition.mjs; declare evidence-linked relations and goal before choosing archetypes; retain secondary relations and unplaced nodes for review.

Parametric composition: visual-intelligence/parametric-composition.md and .mjs implement recursive rectangular allocation; review infeasible bounds and actual text fit separately.

Composition Studio: visual-intelligence/composition-studio.html and composition-studio.md provide an integration prototype; serve over HTTP. Candidate selection and geometry template are independent.

Material Intelligence foundations: visual-intelligence/material-foundations.md and material-profile.mjs distinguish physical properties, visual cues and contextual associations; audit text over textures and transmission.

Material Atlas: visual-intelligence/material-atlas.md, material-atlas.json and material-descriptor.mjs separate reference substance, finish, geometry, rendering and normalized descriptors; candidate taxonomy only.

Lighting and depth: visual-intelligence/lighting-depth.md, lighting-plan.mjs and lighting-presets.json provide shared light direction and elevation CSS shadow tokens; temperature metadata only, not physical rendering.

Paper and print: visual-intelligence/paper-print.md, paper-atlas.json and print-plan.mjs provide decorative opaque paper CSS; printing and finishing metadata only.

Industrial materials: visual-intelligence/industrial-materials.md, industrial-materials.json and industrial-plan.mjs provide opaque CSS surface and assembly approximations; optics and chamfer geometry not implemented.

Material composition: visual-intelligence/material-composition.md, material-cases.json and material-composition.mjs define semantic surface roles and declared fallback checks, not physical compatibility or actual contrast.

Material rendering: visual-intelligence/material-renderer.mjs and material-renderer.md implement opaque CSS and seeded SVG texture assets; Canvas/WebGL fallback only, optical/3D unmet.

Material Studio: visual-intelligence/material-studio.html and material-studio.md integrate three material modules in a standalone preview; browser validation pending.

Motion foundations: visual-intelligence/motion-foundations.md, motion-roles.json and motion-plan.mjs define semantic motion roles, identity and declared evidence/fallback constraints. No animation runtime yet.

Temporal intelligence: visual-intelligence/temporal-engine.mjs, motion-materials.json and temporal-intelligence.md provide easing evaluation and dependency scheduling; no playback or physical spring solver.

Cinematic intelligence: visual-intelligence/cinematic-plan.mjs and cinematic-grammar.json validate semantic shot sequences and shared anchors; no camera runtime.

Spatial motion: visual-intelligence/spatial-motion.mjs and spatial-motion-lab.html implement basic FLIP and shared identity matching; browser verification pending.

Progressive disclosure: visual-intelligence/disclosure-plan.mjs and progressive-disclosure.md validate declared information prerequisites, essential visibility and reachability; no runtime yet.

Interaction grammar: visual-intelligence/interaction-state.mjs provides in-memory semantic state transitions, undo and reset; link, trace, simulation and DOM integration pending.

Exploratory analysis: visual-intelligence/exploratory-analysis.mjs provides shared filtered projections, conditional inventory scenarios and sensitivity sweeps; UI and state integration pending.

Motion case studies: visual-intelligence/motion-cases.md and motion-selection.mjs provide source-backed candidate patterns and advisory selection gates.

Motion engine: visual-intelligence/motion-engine.mjs integrates five modules for flat market projections, disclosure, scenario and revision-tagged geometry; DOM runtime pending.

Motion Studio: visual-intelligence/motion-studio.html bundles the integrated engine for a synthetic market interaction demo; browser QA pending.

Representation foundations: visual-intelligence/representation-foundations.md, representation-rules.json and representation-selection.mjs provide preliminary relation/task/channel mappings and declared-input gates. Existing catalog audit pending.

Representation ontology: visual-intelligence/representation-ontology.json migrates all 630 legacy records as unreviewed; representation-audit.json records structural counts; representation-ontology.schema.json is a preliminary schema. Do not treat empty semantic fields or legacy renderer hints as verified capabilities.

Statistical representation: visual-intelligence/statistical-enrichment.json provides eight candidate ID-linked overlays; statistical-transforms.mjs supports five numerical operations. Review limits in statistical-intelligence.md.

Geospatial: visual-intelligence/geospatial-intelligence.md, geospatial-enrichment.json and geospatial-transforms.mjs; candidate overlays and point/metric utilities, no geographic renderer.

Engineering: visual-intelligence/engineering-intelligence.md, engineering-enrichment.json, engineering-transforms.mjs and engineering.example.json. Candidate semantics and coordinate utilities only, not CAD.

Network: visual-intelligence/network-intelligence.md, network-enrichment.json, network-transforms.mjs and network.example.json. DAG rank, single-edge grid routing and traceable aggregation only.

Scientific: visual-intelligence/scientific-intelligence.md, scientific-enrichment.json, scientific-transforms.mjs and scientific.example.json. Grid interpolation, axis maximum projection and fixed-step RK4; no clinical or physical validation.

Business: visual-intelligence/business-intelligence.md, business-enrichment.json, business-transforms.mjs and business.example.json. Arithmetic bridge, drawdown, contribution margin and weighted decision; not causal attribution or investment advice.

Concept: visual-intelligence/concept-intelligence.md, concept-enrichment.json, concept-transforms.mjs and concept.example.json. Typed concept links, metaphor boundaries and pictogram counts; not evidence verification.

Selection: visual-intelligence/representation-selector.md, representation-index.json, representation-selector.mjs. Only explicit routes qualify; unrouted records require review. Declared inputs are not validated data.

Rendering: visual-intelligence/specialist-adapter.md and specialist-adapter.mjs. Three narrow native SVG adapters; unsupported forms must not be silently substituted.
