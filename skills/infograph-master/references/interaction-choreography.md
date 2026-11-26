# Interaction Choreography P2 — semantic transition compiler V0.1

Route here for QD02 when transitions between authored object states convey a meaningful change or improve an inspection task. Use P1 narrative-director for act progression and contextual-focus.md for inspection. Do not use the choreography runtime to replace a chart's authoritative data, invent physical simulation, or force a story on a lookup tool.

## Authoring
1. Enumerate stable objects and channels. Give each channel a kind (number bounded by min/max, or enum with explicit values), meaning, unit and mapping (qualitative or calibrated). A calibrated channel requires evidenceId and a calibration statement. In V0.1 calibrated channels are discrete endpoint changes only; factual intermediate numbers are not generated. Geometry and motion speeds in qualitative scenes are not data.
2. Author complete endpoint states: id, reading, scope, claim status, evidenceIds and a values object with one entry per registered object.channel. No implicit defaults. State evidence must include calibrated-channel evidence.
3. Author directed transitions: id, from, to, trigger, semanticPayload, timingRationale, staticAlternative, evidenceIds and tracks. Each changed channel must have exactly one track. Explicit reverse transitions allow different staging; an absent edge means cut. Each track has id, channel, durationMs, delayMs, after (track IDs; wait for all to finish), easing (linear, ease-in-out, step-start, step-end). Parallel tracks share no dependency; sequencing is a DAG, not a claim of physical causation. Timing bounds: delay/duration each 0–10000 ms, total <=30000 ms. Use only meaningful changes; pure focus can remain static.
4. Map transitions to task triggers, including manual navigation, scenario switch, keyboard/touch and reduced-motion. Preserve scope, caveats and exact evidence throughout. Actual render must distinguish a transitional frame from a settled endpoint; do not display target business values as if intermediate physics verified them. Render transition semantics and final values clearly, not just visually moving objects.
5. Compare actual frames and controls. Validate physical geometry/material separately via QD03/QD04. This engine controls scalar/discrete channels; no fluid simulation, mesh, camera renderer, continuous idle dynamics, collision detection, gesture framework, or automatic art direction.

## API and host adapter
```js
import {
  compileChoreography, choreographyInitial, choreographyGo,
  choreographyFrame, choreographySettle, directorChoreographyRequest
} from './interaction-choreography.mjs';
const plan = compileChoreography(spec);
let state = choreographyInitial(plan, 'normal', 'context-1', false);
// Host provides a monotonic time source and owns requestAnimationFrame.
state = choreographyGo(plan, state, {to:'restricted', nowMs:100});
const frame = choreographyFrame(plan, state, 300);
// Bind frame.visualValues to registered visual layers, not source business data.
// Always render frame.semantic, and clearly mark frame.moving when true.
// Once elapsed duration has ended, settle using the same epoch.
state = choreographySettle(plan, state, {epoch:frame.epoch, nowMs:1100});
```
The host must cancel superseded frame requests, reject stale epochs, sample with a monotonic clock, and schedule only while moving. A reverse edge retargets from the currently sampled frame. If a new edge cannot account for transient channels outside its tracks, the entire scene cuts rather than inventing motion. Unauthored edges and context changes cut. Rapid same-target requests are no-ops unless explicitly cut or context/motion preference changes. Use explicit cut for pause-to-terminal policy; P1 playback pause is not automatically a freeze/resume for P2. Provide manual controls and static endpoints; reduced motion uses a cut, never blocks information.

For P1 integration, pass previous and next directorView and a stable act-to-state mapping to directorChoreographyRequest. Null means no scene transition (e.g. inspection-only). On a non-null request, pass it to choreographyGo along with the actual host reducedMotion preference; bind narrative and inspection independently. Mode/context changes cut. The adapter checks the mapping but not whether the claims of P1 and P2 match; author a common evidence/state ledger. ContextRevision is an opaque token. When scope changes, regenerate/revalidate endpoint claims and values from the shared authoritative model before displaying them or explicitly keep a pinned scope. Changing the token alone does not recalculate data.

## Verification and boundaries
Run node test-interaction-choreography.mjs from engine. Twenty-two synthetic assertions were executed with the authored function bodies in the development host: track sequencing/cycles, channel coverage/bounds, evidence and calibrated-value guards, visual vs semantic separation, intermediate samples, reverse interruption, stale/premature settle, exact endpoints, reduced motion, scope changes, P1 view-shaped request mapping, and safe cuts for incomplete interrupted retargets. The repository Node runner, actual P1 module integration, browser adapter, viewport tests, actual motion fidelity and full CI are not yet verified. REAL-004 is inspiration, not a benchmark proof. QD02 requires actual rendered review for real artifacts.
