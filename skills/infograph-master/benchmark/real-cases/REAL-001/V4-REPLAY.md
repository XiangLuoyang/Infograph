# Phase 5a — private REAL-001 reference-hybrid replay

Status: **functional checks passed; aesthetic review pending; not a controlled benchmark**.

The user authorized another real-case iteration. The private original concept and earlier HTML were locally available. The current Skill entry and reference reconstruction route were read from af4d419; direct container Git checkout/download was unavailable. Therefore the replay is a reference-informed freeform hybrid adaptation of the historical HTML, not a run of the full native renderer or the new reference-pair CLI. No private original images, HTML, business names, or review hashes are uploaded here.

## Design choice and limitations
Use a clipped, local focal-object raster asset from the concept, independently editable vector connections and labels, and the existing state controller. This preserves the source's surface and lighting appearance but does not provide dynamic 3D relighting, arbitrary camera motion or physical force simulation. The embedded focal asset contains original markings; independently editable labels retain the semantic meaning. Peripheral shapes and cables remain simplified. Landscape adaptation and portrait source have different framing; no unsupported IoU or pixel-fidelity result is asserted. The new native WebGL pipeline has only neutral fixture evidence, not a comparable full real-case artifact.

## Observed local functional checks
- Chromium 144.0.7559.96; offline standalone HTML.
- 1440×900 and 1920×1080: no document overflow. 390×844: no horizontal overflow, vertical reading layout with readable grouped text fallback.
- Six states: visible connection counts 0, 6, 9, 14, 14, 14. One authorized focus highlight. Five qualitative evaluation criteria.
- Playback/pause, reset, keyboard forward, no page errors in tested paths.
- 224 animated endpoint samples; maximum path-to-transformed-port residual 0.0000604 SVG user units. This is coordinate alignment, not physical accuracy or visual judgment.
- No HTTP(S) external requests in tested offline session.
- Private evidence archive preserves earlier and new screenshots, HTML, concept, logs, and actual local SHA-256 hashes.

## Review and next gate
Human aesthetic approval not obtained. Source-to-candidate material appearance qualitatively closer because the focal asset reuses reference pixels; this is not evidence that the renderer synthesizes more realistic geometry. Independent reference fidelity, complete accessibility and controlled A/B comparisons remain unrun. Retain Partial Pass status. Next: obtain user feedback on actual artifact; if needed compare a native-rendered variant and a reference-hybrid variant using the same semantic content and time budget. Do not expand engine solely to increase coverage. Phase 4 IoU floating-point precision failure was addressed by clamping to [0,1] in 500fb68; rerun CI status must be checked separately.
