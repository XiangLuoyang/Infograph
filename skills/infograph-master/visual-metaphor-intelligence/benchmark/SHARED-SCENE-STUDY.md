# Scene-level art direction study — L3

Status: authored synthetic D prototype, rendered and browser-checked; not a new automatic renderer or a reviewed candidate.

## Compared routes
A/B/C remain the canonical component-based studies described in COMPOSITION-STUDY.md. D explores the same synthetic buffer/reaction-wheel concept as a single focal assembly in a consistent illustrative space, with HTML notes and numbered symbolic annotations for the other semantic roles. It is authored SVG/CSS/HTML; no true shared-world WebGL, raster generation, physics, numeric bindings, canonical compilation or independent visual acceptance is claimed. The original per-object inspection interaction is replaced with visible notes, not preserved as an identical UI; the two qualitative states and two style choices remain. This is not a controlled single-variable comparison with A/B/C.

## Reproduce D
```sh
node scripts/extract-vmi-shared-scene.mjs shared-scene.html
```
The exact prototype bytes are stored as gzip+base64 in shared-scene-study.json because the development connector cannot directly upload a local file. Extraction checks original SHA-256. The local Chromium test exercised desktop 1440x1000 and mobile 390x844, editorial and industrial, normal and relief: 8 cases, 64/64 assertions for style, state, state text, object count (4 SVG IDs), edge count (3), horizontal overflow, page errors, visible scene. The counts are bounded checks, not 64 independent scenarios or proof of source fidelity. Visual inspection of desktop editorial normal and mobile industrial relief showed legible notes and a coherent focal assembly. Mobile embedded SVG labels are small; the HTML notes carry essential content. The shared scene changes highlight colors, not actual angular momentum or quantitative motion. No independent review or matched A/B/C Chromium captures were completed in this session.

## Production guidance to test before engineering
1. Decide scene grammar: isolated nodes when lookup/flow relations dominate; single focal object with live annotations when the mechanism has one recognizable physical center; shared physical assembly only when actual physical relations support it; otherwise use a plain diagram or juxtaposition.
2. Choose one camera convention, depth hierarchy, light direction, material family, and text zone. Keep business text, controls, and quantities live, not baked into the illustration. Decorative perspective cannot change semantic mapping or suggest new physical connections.
3. Compare a restrained vector study and a richer reference/hybrid route when warranted. Reuse existing concept-art-pipeline, reference-reconstruction, and motion-completeness contracts; no new renderer until demonstrated need.
4. Preserve stable semantic IDs and relation evidence; represent abstract roles through annotation, not fake physical components. Check native states, responsive legibility and independent business equivalence.
5. Compare actual A/B/C/D screenshots with matched source, style, viewport and state. Record explanation accuracy and preference separately. A beautiful scene with a misleading analogy loses. Treat the D study as a hypothesis for production routing, not a release standard.
