# Execution architecture — P0 candidate

Origin: the real dashboard audit found a complete Node environment and 103 passing VMI assertions, but no production engine calls, incomplete references and unsubstantiated candidate comparisons. Treat this as a control-plane gap, not proof of weak engine creativity.

## P0: executable entry and receipts
Run from the full checkout or portable package using Node 22+. No new third-party dependencies. Use a fresh run directory whose parent exists.

```sh
node scripts/infograph.mjs preflight
node scripts/infograph.mjs start redesign dashboard.html ./run-001
node scripts/infograph.mjs run ./run-001 vmi-explore perspectives.json
node scripts/infograph.mjs run ./run-001 vmi-packet packet.json
node scripts/infograph.mjs verify-vmi ./run-001
```

For create/critique use an actual brief/source file rather than a dashboard. Author perspectives from real evidence using VMI GUIDE and open-discovery; input is an object with a perspectives array. Inspect exploration output before authoring concepts/reviews/scene/styles using the GUIDE and creative/scene references. Packet uses the same perspectives and the existing pipeline contract. The fixture in VMI benchmark/studio-packet.json is for testing only; never use its answers as production input. The CLI loads the canonical ontologies and calls existing engines, never generates concepts or reviews autonomously.

The run records actual source bytes hash, package/version/revision (where available), Node and engine hashes; each stage writes its input, output and execution receipt, or a blocked receipt on an execution error. A packet cannot execute without a replay-verified discovery stage with matching perspectives. Verification replays both stages and compares stored bytes; a result with no preview is still an execution, not design acceptance. No release authorization. Open discovery warnings require independent review. A failed/incomplete run is not a completed design; use a new run directory to retry (P0 limitation). Do not publish run directories with confidential source paths or authored data.

When shell execution is available, start substantive tasks through the CLI and run these VMI stages when the opportunity review justifies a metaphor. When the preflight is blocked or unavailable, disclose actual evidence (including unavailable shell); do not claim execution. Manual mode remains a documented fallback only, not equivalent evidence. Not-applicable metaphors do not need a VMI run; explain why in the opportunity review. P0 does not mechanically enforce task routing or delivery, and cannot stop a host from independently writing files. Local receipts are replayable integrity checks, not signed or tamper-proof attestations. Browser QA and final output/scene binding are separate.

## Roadmap
- P1: revision-bound state machine, integrate existing reconstruction prepare/plan/review and opportunity/quality-depth engines; explicit applicability and next actions.
- P2: progressive authoring templates and lower-friction adapters, discovery/critique iterations, preserve open-ended creativity.
- P3: artifact and screenshot hashes, independent review and integration checks; bind receipts to actual output, not just inputs.
- P4: host-level delivery integration, controlled fallback and adversarial bypass tests. Host-specific enforcement must be demonstrated, not assumed.

## P1a: production pre-build state machine
Use `start-workflow` instead of P0 `start` for substantial work. `status <run-dir>` computes next stage from replay-verified outputs; it is not a release gate. Redesign: reconstruction-prepare ({ir,runtime}), reconstruction-plan (existing authored reconstruction contract), production-plan. Create: production-plan. Critique: reconstruction-prepare, reconstruction-plan with critique scope; no build. production-plan receives {revision,purpose,opportunities,quality,execution}, with existing visual-opportunity, quality-depth and execution-gates input contracts, matching revision/purpose and substantial=true. Author actual evidence, never copy fixture answers. If one slice selects a mechanism, VMI stages are required and both authored inputs must include sliceId. No selected mechanism allows plain design. More than one selected slice, unresolved open-discovery warnings, failed structural audits, or incomplete stages block pre-build eligibility; retries require a new run. P1a does not yet integrate specialized quality-depth engines, final artifact reviews, source extraction, multi-scene VMI, or host delivery enforcement. Source IR hash is checked against actual bytes, but authored observations are not independently verified. Existing P0 commands remain diagnostic-only.
