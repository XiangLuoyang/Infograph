# Narrative Director P1 — compiler and state machine V0.1

Load when QD01 applies and an interactive authored narrative is justified. The existing repo:skills/narrative-design/SKILL.md remains authoritative for evidence, thesis and storyboard creation. This module compiles an authored storyboard plus scene cues; it does not discover a thesis, generate artwork, infer evidence or choose animations automatically.

## Authoring contract
Start with the existing narrative-design storyboard: audience, purpose, thesis, spine, evidence (id, source, definition, limitation), ordered acts (id, question, claim, before, after, visual_task, transition, interaction, evidence_ids). Add a separate scene contract rather than duplicating the storyboard:
- modePolicy: shared-context. The application owns the authoritative filters, scenario values and calculations.
- objects: unique stable id, label and role; use the same identity across stages and device layouts.
- cues: exactly one per act, matching id. visible and focus reference registered objects; focus is a visible subset. claimStatus is observation/hypothesis/assumption/scenario/decision/question. Include nextDecision, transitionReason, staticReading, scopeLabel, transitionKind (cut/reveal/focus/compare/state-change), holdMs (1–120s). A state-change also requires stateMeaning.
- Compare candidate cognitive arcs before authoring. Nonidentical before/after strings are necessary for this validator, not proof of reader learning. The user must never depend on autoplay to obtain a material caveat.

## API
```js
import {compileDirector,initialDirector,reduceDirector,directorView,staticDirectorOutline} from './narrative-director.mjs';
const plan = compileDirector(storyboard, scene);
let state = initialDirector(plan, 'context-v1', false);
function dispatch(action) {
  state = reduceDirector(plan, state, action);
  const view = directorView(plan, state);
  // Host: render view, reconcile timer and focus, bind evidence to authoritative model.
  return view;
}
```
Actions: next, previous, seek(actId), play, pause, tick(epoch), inspect(objectId), clear-inspection, mode(mode), context(revision), motion(reduced), reset. A timer must capture the emitted epoch and dispatch it unchanged; clear previous timers on every state change and schedule only when nextTimer exists. Stale ticks are ignored. No DOM/time dependencies in the reducer; host owns subscriptions, disposal, actual transitions and accessible controls. Playback stops at final act. Manual navigation, inspection, mode or context change pause playback. Reduced motion uses cut and manual navigation. Narrative visibility/focus is separate from inspection. Reset resets narrative position but not external filters.

## Host integration and safety
Use directorView for state/cues, staticDirectorOutline for accessible non-playback reading. Bind stable IDs to authored scene layers, not to arbitrary selectors; render with safe text APIs. The contextRevision is an opaque external token, not actual filter storage. Host must maintain a single external model; when scope changes, reconcile all authored claims/evidence against that model or keep narrative explicitly pinned to the stated scope. Do not show stale numeric claims as if recalculated. Recompile on material evidence changes, preserve act by ID only where valid, and invalidate old timers at the integration boundary. Compiler cannot verify claims, detect hidden data in a visual layer or validate actual shared-model binding. Render all material caveats and provide exact evidence access. Use QD02 for detailed motion choreography and contextual-focus.md for visual focus treatment.

## Validation
From engine: node test-narrative-director.mjs. Fifteen deterministic synthetic assertions were executed using the authored function bodies in the development host; repository Node runner and full CI are not yet run. Cases include invalid evidence links/focus, cognitive-change and state-change requirements, timer invalidation, inspection independence, mode/context roundtrip, reduced motion, final-act stop, static evidence/caveats. No actual browser adapter, host transition performance, visual quality, or independent reader comprehension tested. REAL-004 motivates the design, but the example is synthetic and not a reconstruction of the private accepted artifact. Use quality-depth review and ordinary narrative validation for real deliveries.
