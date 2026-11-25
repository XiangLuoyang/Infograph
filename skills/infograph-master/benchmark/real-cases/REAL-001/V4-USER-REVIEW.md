# REAL-001 V4 — actual user review

Status: **partial pass; revision required; user-reported legibility blocker**. Qualitative feedback from the real case owner after viewing V4, anonymized English paraphrase. No numeric scores assigned.

| Dimension | Relative to V3 | Evidence |
|---|---|---|
| Focal entity | Improved substantially; accepted direction | User praised the much finer rendering and appearance of the central object. |
| Layout | No meaningful improvement | User found layout still mediocre; viewing on mobile may contribute. |
| Interaction | No meaningful improvement | User found interactions similar to last version. |
| Cables | Regressed | User explicitly found cable appearance worse. |
| Peripheral label boxes | Regressed | User explicitly found color choices and design less refined. |
| Readability | Blocking user-reported defect | User observed white text on white background. Exact host, screen state and cause unverified. |

## Follow-up local investigation
At 390x844 in Chromium, V4 page height was 1572 CSS px; diagram height 192 px; controls began at y=1355.06 px. Thus a no-horizontal-overflow pass did not imply usable mobile interaction: controls were below the fold and the visual was miniature. Rechecked standard light/dark and forced-colors light/dark emulation; inspected the SVG node text/plate, mobile list item and active navigation computed foreground/background. No white-on-white pair reproduced among those sampled elements. Not a complete contrast audit; actual mobile host behavior remains unknown. Do not dismiss the report or attribute it to the client without evidence.

## Revision requirements
- Freeze the accepted focal image unless a specific defect is found. Preserve it separately from the rendering of the surrounding objects.
- Coordinate peripheral design with focal asset: steel-toned braided or stranded cable geometry, credible connectors, subtle source-category markers instead of bright full-length categorical coloring, restrained typographic callouts rather than generic outlined UI boxes. Compare actual renders, not only parameters.
- Recompose rather than reskin: desktop presentation and mobile reading/interaction are distinct compositions. On mobile keep current-stage meaning and essential controls available without long scroll; avoid shrinking all fourteen labels into a single miniature and repeating them as an obligatory second full list. Preserve semantic completeness through progressive disclosure.
- Enforce foreground/background pairing on actual rendered elements, including SVG fills, active/hover/focus states, disabled controls, overlays and theme changes. Check mobile host when available, standard light/dark and forced-colors; record unverified backgrounds (gradients/images/transparency) for visual inspection. A reported unreadable label blocks acceptance even when generic CI passes; no unsupported claim of reproduction or repair.
- Review whole composition AND each changed layer against V3/V4. Retain accepted strengths, explicitly identify regressions and do not trade a stronger focal image for worse peripheral art direction.
- Evaluate meaningful interaction through tasks (advance stage, identify group, connect to outcome), control accessibility and actual screen space, not merely click handlers or coordinate alignment.

No V5 artifact produced in this feedback-recording step. Next real iteration should prioritize peripheral visual language, mobile composition and contrast before further rendering-engine expansion. Native renderer remains a separate controlled comparison, not a proven cause of V4 improvement.
