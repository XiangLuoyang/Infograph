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
