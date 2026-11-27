# VMI surface rendering V0.1 — bounded vector production

Use only after the selected concept passes existing semantic review. This is an optional actual SVG rendering route, not a replacement for VMI analogy search or rich concept-art/raster/3D specialist production.

## Structure
```sh
node scripts/infograph.mjs vmi-geometry
node scripts/infograph.mjs vmi-geometry rotor
```
Three normalized illustrative component templates (rotor, reservoir, valve) return actual existing primitive-compatible shapes, suggested decorative material assignments and optional moving-part/pivot hints. Inspect whether the physical object really matches the reviewed ontology/source anchor and target node; copy/adapt shapes into that object, keep the stable object ID and semantic bindings. Never substitute a visually similar but physically wrong device. The reservoir's static decorative fill and tick marks do not represent any data or calibrated level; remove them if they could imply measured capacity or add explicit qualitative annotation. A generic template is not an engineering drawing, real asset, physical simulation or universal geometry generator.

## Scene material and state contract
The existing VMI packet scene optionally carries:
```json
{"surfaceRendering":{"version":1,"rationale":"task-led material choice and scope","parts":[{"objectId":"b","shapeIndex":1,"material":"brushed-metal","encoding":"decorative-only","ref":"actual selected geometry evidence"}],"motions":[{"objectId":"s","shapeIndex":4,"kind":"rotation","encoding":"qualitative","pivot":[50,50],"angles":{"normal":0,"relief":-70},"ref":"verified qualitative transition evidence"}]}}
```
Material recipes: brushed-metal, matte-enamel, glass, rubber, liquid. Each targets an existing filled primitive, with unique object/shape identity. Gradients use the scene's current solid style tokens (ink, highlight, original fill role); the original stroke and geometry are preserved. Separate desktop/mobile gradient IDs avoid collisions inside the standalone preview. Use coherent light direction; avoid using decorative gradients on quantitative marks. Glass/liquid are opacity/tonal cues, not physical optical simulation. Keep essential labels live and on readable opaque surfaces.

Rotation is an explicit qualitative state pose, not a calibrated angle, load, speed, valve opening percentage or fluid simulation. All state angles are supplied and bounded; changes must agree with the reviewed concept transitions/changedObjects. Keep part geometry within its object in every pose; use actual browser and visual review to detect clipping/occlusion. The renderer applies the initial pose without JS, updates the actual SVG part on state change, interpolates CSS transform over the existing style motion duration and honors reduced motion. Existing static textual state comparison remains available. Do not invent a continuous motion mapping, add arbitrary physical connections, or imply a causal relationship absent from the verified semantic mappings.

Use the canonical vmi-packet route to compile and render the scene, compare variants, and inspect actual screenshots and state changes. The resulting HTML is a real standalone preview, not automatically embedded into the final dashboard. Integrating it into the production artifact requires preserving the scene CSS, identifiers, interactions, semantics, readable desktop/mobile composition and evidence; re-run actual artifact QA. Multiple scenes in one page require explicit SVG ID namespacing. Match the scene palette/font/material with the selected dashboard art direction through authored style tokens; no automatic conversion is claimed.

## Limitations
This first increment improves surface depth and reusable illustrative construction for existing SVG primitives. No realistic PBR, 3D mesh/lighting, generated images, generic physical topology, numeric liquid-level animation, real flow simulation, calibrated motion, automatic scene asset integration or independent aesthetics. Escalate complex physical geometry to the existing concept-art/reference pipeline rather than pretending a vector approximation is sufficient. Test fixtures are synthetic and must never be presented as real business evidence.
