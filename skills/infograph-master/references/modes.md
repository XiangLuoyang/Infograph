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
