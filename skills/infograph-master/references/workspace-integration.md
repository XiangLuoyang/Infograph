# P6 — integrated quality-depth workspace V0.1

This is the convergence checkpoint for REAL-004. Do not add another module merely to increase capability count. For substantive authored interactive work, follow QD01–QD06 and the specific P1–P5 routes. Use the integrated adapter only when the task genuinely requires all five modules; ordinary monitoring, lookup, static reports, simple charts and custom renderers use applicable routes only. Never force a metaphor or animated workspace.

## Single compilation and runtime
Use engine/workspace-integration.mjs with workspace-integration.example.json as a synthetic contract example. compileWorkspace(spec) invokes the actual P1–P5 compilers and checks:
- stable P1/P3 semantic identity; P1 and P2 evidence IDs/source/limitation, exact endpoint claim, scope and epistemic status agree;
- explicit act-to-state and act-to-scene mapping; each visible P1 object has a corresponding visible non-label P3 layer;
- P2 changed channels map through P4 jobs onto semantically corresponding P3 layers;
- separate registered director/explorer routes and their P5 slices; current layout tier from width and height;
- all compilation issues remain visible. planningReady is declared input readiness, not permission to release.

V0.1 intentionally supports pinned evidence context only. A scope change requires recompilation and source verification; the integrated adapter rejects a new context revision rather than silently changing the story's meaning. The host owns actual data calculations, inspection evidence, scope display, semantic-to-DOM binding, accessible navigation, rendering and clock. P1 action drives P2 request; inspection/pause/reset/reduced-motion cuts to the selected endpoint. Viewport changes preserve the active act. P4 illustrative loops only active while director playback runs and the authored state allows them. Finite motion is sampled independently from illustrative motion. Explorer route in the sample is a data-lookup page, not a generic free exploration implementation. No automatic scene generation, renderer, asset production, DOM injection or browser automation is supplied by this adapter.

```js
import {compileWorkspace,initialWorkspace,dispatchWorkspace,workspaceFrame,auditWorkspace} from './workspace-integration.mjs';
const plan=compileWorkspace(spec);
let state=initialWorkspace(plan,{width:1440,height:900,reducedMotion:false});
state=dispatchWorkspace(plan,state,{type:'next'},100);
const frame=workspaceFrame(plan,state,300);
// Host renders frame.layout, frame.scene, frame.narrative, frame.motion,
// and frame.illustrative, using actual assets and authoritative data.
```
Use a monotonic clock, cancel obsolete host timers/frames, and dispatch P1 timer epochs unchanged. Host must stop scheduling when no animation is active and handle teardown. The runtime is intentionally renderer-neutral; the actual artifact is separate.

## Unified audit
auditWorkspace binds workspace revision and artifact SHA-256. It calls the QD structural auditor and the P3/P4/P5 review functions. For this full integrated route, all five applicability flags must be true (substantial, multiRoute, mixedModes, semanticInteraction, richScene). Pass quality.workspaceRevision matching the workspace; QD numeric revision must match its own records, each applicable design record also carries workspaceRevision, and each applicable review record carries exact outputSha. Pass actual conceptRecords, motionRecords, spatialObservations; they retain their own source and layout revision contracts. Missing/stale/failed evidence blocks declared complete. Structural audit cannot independently verify actual assets, browser behavior, reviewer authority, physical fidelity, aesthetic quality or user approval. releaseAuthorized is always false.

## Regression
From engine:
```sh
node test-quality-depth-suite.mjs
```
This runs the seven separate Node test files, including P1–P5 integration. On the development host, re-read remote sources and fixture files; executed the actual function/test bodies with JS import and fixture-read adaptation (not native Node process execution): QD 9, P1 15, P2 22, P3 19 including reference compiler integration, P4 20, P5 21, P6 16, total 122 passing assertions. No full repository CI or native Node suite result is claimed. The isolated container could not resolve github.com, so the remote modules could not be cloned there for native execution/browser adapter QA.

The accepted REAL-004 artifact was separately rechecked locally with Chromium across 1440x900, 1280x800 and 390x844, 12 page/slice combinations each. All 36 visible, no document horizontal overflow or JS page errors; desktop document height stable. At 1280x800, three work views have 28, 50 and 30 CSS pixels of local content overflow. Mobile natural document scrolling remains. This is baseline regression only; the accepted HTML predates the integrated adapter, so it does not validate new engine rendering or end-to-end data bindings. Source artwork, captures and commercial content not published. No motion/actual-device test is implied by that layout run.

## Held-out case protocol
Before claiming improved first-pass quality, freeze current commit and task brief, choose new synthetic or explicitly authorized real tasks covering (1) narrative mechanism, (2) scenario exploration, (3) multi-page monitoring/lookup, (4) a non-industrial metaphor when semantically justified. Compare prior pinned skill vs current skill, same model/settings/data/tool/time budgets and fresh contexts. Keep first outputs without repairs; separate initial-quality results from revision effort. Review blind when feasible: evidence correctness and function parity are hard gates; independently assess cognitive progression, useful interaction, visual expressiveness/material, motion completeness, global spatial consistency and actual device reach. Record actionable defects, required revisions, time and evidence. No averaged score masks a material defect. Compare with accepted REAL-004 only where tasks are comparable; do not reuse its private assets. User approval is case-specific; no general superiority claim until appropriate trials. Do not expand architecture until actual failure evidence identifies a need.
