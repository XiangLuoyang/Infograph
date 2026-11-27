# Execution architecture RC — held-out host trial
Status: engineering candidate. Not a release, not an OpenClaw integration claim. No benchmark answers may be supplied to the producing agent. Use the same frozen original HTML and data in each arm; keep confidential inputs and run evidence local.

## Installation checks
Pin the RC commit after CI review. Use a clean full checkout or portable root with all three skill entries. Confirm HEAD/package manifest, actual preflight and Node version. For browser QA use the existing optional Playwright and Chromium installation route only with operator authorization. Verify the host actually discovers the Master entry. Do not change permissions, hooks or install dependencies automatically.

## Experiment
A: retain the original failed output as historical baseline; preferably obtain a fresh same-model control using the prior commit and same prompt, source, resource limits and runtime. B: run the RC with the same task and source. Do not expose reference answers or evaluation scores to B. If control cannot be run, label comparison historical and avoid causal effectiveness claims. Record model/version, context, tool availability, prompt, elapsed active time, available token usage, engine invocations, retries and blockers. At least three representative tasks before generalizing: complex redesign (the failed channel dashboard), report/create, monitoring/lookup negative-control where metaphor may not help. Do not force VMI. Use real sources with permission and preserve data/units, formulas and controls.

## Evidence
Collect actual run directory, artifact HTML, browser plan and captures, critique and handoff. Independent reviewer inspects screenshots and interaction results before seeing arm identity, where feasible. Record task coverage, data/behavior parity, semantic fidelity, narrative progression, composition, hierarchy, art direction/material, chart diversity with relation fit, metaphor advantage over plain evidence, meaningful interaction/motion, responsiveness and reader usability. Rate each dimension 0–5 with specific evidence; report per-dimension deltas, do not collapse to one arbitrary score. Any material factual, formula, accessibility, essential-control or clipping regression blocks acceptance. An engine invocation is process evidence, not a quality score.

## Host bypass validation (operator-controlled, separate test)
1. Try handing off raw HTML without a workflow.
2. Try a stale or altered file, skipped critique, observed browser failure and absent browser.
3. Try a legitimate reviewed candidate, and an explicitly agreed labeled unavailable-browser draft.
4. Record exact attempted sending tool, verifier output, actual allowed/denied result and exact byte hash. Test locally or in a designated non-production channel; no unauthorized external sends.
5. If no host-owned interception exists, mark direct-send enforcement NOT RUN/NOT ENFORCED. A CLI refusal does not prove the host refuses direct sends. Operator must independently control sender and protect evidence/verifier before claiming enforcement.

## Stop rule
After engineering CI and package relocation pass, freeze the candidate for real trial. Fix concrete blockers only. Do not claim design uplift, full host enforcement or public release until corresponding evidence exists. Review rights/distribution separately.


## V1.3.1 frozen trial candidate
Pin 2532430ebd6d198d93f01242a592ae19719f48cf (all four CI workflows passed). This pin is for testing, not release. Keep the historical V3 artifact and its audit separate from the producing agent. For the first run, use the original task prompt without adding instructions to force VMI or advanced rendering. A second, explicitly guided run may diagnose activation failures but must be labeled separately.
Collect the production-plan opportunity/activation reviews, specialist receipts, VMI explore and packet receipts if applicable, actual HTML, browser captures, critique and handoff. If referencePreview is used, collect its routes, production ledger, asset hashes and limitations. Record missing evidence as missing, not pass. Inspect data units, period labels, ROI definition, clipping inside SVG viewBox, mobile horizontal overflow, contrast, semantic labels and actual controls. Compare with the historical artifact only after generation. Keep business data local; do not commit it or private screenshots.
Stop on material regression; fix concrete defects and rerun with a new pinned commit. Do not infer autonomous activation from a guided run or aesthetic improvement from CI.
