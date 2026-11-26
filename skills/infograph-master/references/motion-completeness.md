# Motion Completeness P4 — physical-motion opportunity and fidelity V0.1

Use for QD04 whenever a rich scene contains physically salient objects. This route extends P2 finite choreography and P3 concept layers; it does not require every object to move, nor substitute physical realism for semantic validity.

## Workflow
1. Inspect the actual concept and story states. Inventory every visible layer and its physical object, including fixed structures, moving rigid parts, articulated joints, deformable surfaces, liquids, gases, optical effects and semantic overlays. A physical object can span several layers. Record source observation, semantic role, stable ID, essentiality and static alternative. Classification is authored by the agent or human, not detected from image pixels.
2. Compare candidate behaviors against reader task and object identity. For each profile behavior declare required, optional or static and explain why. An explicit none disposition for an entirely static object is allowed; for an essential non-static physical class, justify it. Candidate lists are starting points, not exhaustive physics. Business-driven motion must be bound to the business state; illustrative motion conveys a qualitative mechanism; ambient motion is optional and must not distract. No unsupported physical quantity or causal inference.
3. Assign implementations to actual P3 dynamic layer IDs. For each implementation declare renderer, geometry rule, occlusion, reduced-motion policy, mapping and driver. Verify the P3 mapping when present. A finite business-state transition binds a real changing P2 channel, unique within this V0.1 inventory; if several layers share a driver, combine the physical object or adapt the renderer outside the checker. Calibrated motion requires evidence, and P2 must preserve factual endpoints. Illustrative loops declare active P2 state IDs, period, normalized amplitude, pause stop and reduced-motion static. No business-driven autonomous loop. Do not equate oscillator output to volume, force, flow speed or financial values.
4. Compile before rendering and resolve all blocking issues; review optional/unassessed behaviors rather than silently claiming complete coverage. Build work orders from the resulting inventory. Preserve original perspective, pivot, thickness, anchor attachment, material, containment and reflected light as appropriate. An actual masked texture, isolated raster or 3D part is the renderer's responsibility; a plan is not a rendered animation.
5. Inspect moving frames and static fallbacks at matched states, including interruption, pause and reduced motion, at target viewports. Verify object-specific physical fidelity and surrounding UI legibility. Bind review records to source concept SHA, motion revision and output SHA. Actual human assessment remains distinct.

## Profile examples
- Static structure: stability, identity; do not animate structural supports gratuitously.
- Rigid: translation/rotation; retain planar pivot, thickness, perspective and lighting. Avoid scaling a wheel to fake rotation.
- Articulated: joint motion, attachment, limits and collision checks. No collision solver is supplied.
- Deformable: bend/stretch/oscillation; preserve endpoints, material and domain.
- Liquid: surface wave, texture flow, level change, bubbles. Consider each separately; no fill-level change without a justified model. Keep movement within container and preserve reflective glass layers.
- Gas: advection, dispersion, density; respect domain, continuity and opacity.
- Optical: reflection/emission/refraction; preserve geometry-light alignment and occlusion.
- Semantic overlay: reveal/focus/discrete value change; preserve essential evidence and legibility.

## API
From engine:
```js
import {compileMotionCompleteness,buildMotionWorkOrders,sampleIllustrativeMotion,reviewMotionCompleteness} from './motion-completeness.mjs';
const plan = compileMotionCompleteness(authoredMotionSpec, conceptPlan, choreographyPlan);
const orders = buildMotionWorkOrders(plan);
// Host: bind actual P2 state and a monotonic elapsed time to the renderer.
const frame = sampleIllustrativeMotion(plan,{stateId:'normal',elapsedMs:500,paused:false,reducedMotion:false});
```
The loop sampler produces normalized sine offsets for illustrative cycles only. It does not compute real fluid, gas, rigid-body or optical dynamics. Host chooses the visible deformation, schedules frames, handles visibility/teardown and derives pause and reduced-motion state; a stop returns neutral static offset, not frozen animation progress. State gate is explicit. Host owns actual elapsed time and may restart the loop at phase zero on state changes. P2 controls finite transitions; avoid independent writers of the same visual property. Review with reviewMotionCompleteness(plan,{outputSha,records}). Required review keys are emitted by compiler. Missing/stale records prevent declared completion. The checker cannot verify a claimed image inspection, renderer capability or material quality.

## Evidence and tests
Run node test-motion-completeness.mjs. Initial 17 synthetic assertions executed against authored function bodies in development host; subsequent behavior assessment, cross-layer mapping and work-order tests added but not executed in repository runner. Example JSON uses synthetic P2/P3-shaped plans, not actual assets or compiled modules. No browser rendering, actual physics, segmentation, comprehensive class-specific renderer, real-case reproduction, full CI or independent visual acceptance has been verified. No automatic release authorization. REAL-004 informs the motion opportunity review; do not publish private source artwork.
