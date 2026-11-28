# Art Direction Production V0.1 — engineering candidate

Art direction is a coordinated visual contract, not a color theme or a substitute for narrative and semantics. This increment compiles a bounded subset of existing art-directions.json and styles.json into scoped CSS, chart tokens and comparable visual specimens.

## Brief and comparison
Use the actual reader task, theme, evidence and density. Input JSON:
```json
{"purpose":"report","theme":"Capacity constraints","readerTask":"Explain the bottleneck and compare evidence","density":"normal","evidenceRef":"actual brief reference"}
```
Purpose: explain, report, monitor, explore, lookup. Density: dense, normal, presentation. Optional families list (3–5 distinct IDs, including analytical baseline): editorial, technical, analytical, architectural, swiss. Default shortlist is purpose-led; theme text is retained, not semantically interpreted by a model. Compare with actual content and select explicitly. The five families reuse existing direction and style presets; these are not exhaustive design systems.

```sh
node scripts/infograph.mjs art-direction-propose input.json
node scripts/infograph.mjs art-direction-preview input.json alternatives.html
node scripts/infograph.mjs art-direction-css input.json editorial "actual task-specific rationale" selected.css
```

Candidate output includes purpose fit, tradeoff, canvas/surface/text/muted/accent/status colors, control border, on-accent color, type roles, spacing, frame, material field, chart tokens and opaque contrast comparisons. The CSS uses explicit scope [data-ig-art="selected-id"]. The preview uses the same synthetic chart, values, headline and warning across directions; it tests style application, not the user's business content. It is not a production dashboard or a claim of taste superiority.

## Production integration
For a bounded direction, add artDirection:{brief,selectedId,selectionReason} to production-plan; brief purpose must match plan purpose. Canonical output records candidate comparison, selected contract and exact CSS. Load the output, embed its selected CSS and use data-ig-art on the workspace ancestor; use ig-art-title, ig-art-heading, ig-art-note, ig-art-metric, ig-art-panel, ig-art-scene, ig-art-material-field, ig-art-chart, ig-art-control and ig-art-primary classes where appropriate. Set data-ig-status to positive/negative/warning with explicit text or shape. Chart marks, axes and grid can consume --ig-mark/--ig-axis/--ig-grid inside ig-art-chart. The host still implements actual geometry, controls, semantics, chart encodings and responsive composition. Keep essential data on opaque evidence panels; material fields are decorative context, not text backgrounds. Do not apply gradients or depth to quantitative mark length/area in a misleading way.

CSS is renderer-neutral for HTML/SVG, not a physically based material shader. Reuse tokens for custom raster/3D assets and independently inspect the composite. Actual font availability, CJK wrapping, contrast of composed images/overlays, status discrimination, focus, hover and disabled states, visual hierarchy and material coherence need browser and independent visual review. Opaque token ratios are checked against AA normal-text 4.5:1 or control-border 3:1; decorative lines and chart grid are not claimed to meet nontext criteria. Status hues are contextual candidates; do not rely on color alone. No CVD simulation, font bundling, arbitrary art direction generation or automatic visual approval.

Custom and preserved-baseline styles remain supported; document the distinct alternatives and rationale instead of forcing the preset. The production-plan field is optional in this increment, not a hard universal gate. A recorded CSS contract does not prove final artifact application. Tests cover deterministic compilation, invalid inputs, export and receipt replay; browser test checks applied specimen computed styles across desktop/mobile, not aesthetic quality. Never pass synthetic specimen data as live business evidence.
