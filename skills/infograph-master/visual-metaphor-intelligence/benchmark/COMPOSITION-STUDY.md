# Controlled composition study — L3 candidate

Status: synthetic canonical compilation completed; browser captures and independent visual review not completed.

From repository root on this branch:

```sh
node scripts/benchmark-vmi-composition.mjs ./composition-study
node scripts/capture-vmi-composition.mjs
```

The first command writes three exact canonical HTML previews, a combined comparison and a SHA-256 report. Use a new output directory. The second uses an installed Playwright/Chromium and writes 24 matched screenshots (3 variants × 2 viewports × 2 styles × 2 states). IG_COMPOSITION_CAPTURE_DIR overrides its output directory. No external service or private data is required.

## Controlled comparison

The same repository studio packet, ontology, semantic objects, mapped relationships, qualitative states and two style tokens are retained. A is the original packet; B replaces the reaction-wheel drawing with the existing rotor template and adds eight decorative material bindings; C retains B's geometry/materials and uses automatic composition. B changes geometry and materials together; C isolates layout, not individual material effects. The rotor is a manually justified template, not an automatically matched rich geometry anchor. No new physical relation, quantity, pipe, or motion is inferred.

Actual isolated JavaScript execution of fetched canonical modules and buildComparison passed 15 assertions; all three compiled with no issues and two style plans; semantic parity passed. C selected row-grid2 from 16 feasible structural candidates. The generated comparison HTML is included beside studio-packet.json. It is a synthetic benchmark artifact, not a production result. No full Node/Chromium run, screenshot judgment, or independent acceptance is claimed. The generated layout is structurally feasible, not necessarily visually superior.

## Review the captures before changing the renderer

Compare focal hierarchy, reading path and explanatory coherence; source-object identity and relation legibility; consistent material, lighting and depth; label readability, mobile composition and actual state transitions. Record comparative observations and counterexamples, not a feature-count score. If B/C still look like disconnected icon tiles, compare an authored shared-scene illustration (or reference reconstruction with appropriate assets) against the canonical alternatives. Keep source and semantics constant. Do not add more templates or automatic layout rules without evidence of the bottleneck. A structural pass must not substitute for an aesthetic pass.
