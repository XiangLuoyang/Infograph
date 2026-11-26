# Batch execution, DNA adaptation and cross-page review (L3.3)

This is the execution path for complex existing dashboards. Do not keep expanding plans without implementing the selected changes. Use actual local files and versioned checkpoints; no confidential source or captures may be published.

## Batch loop
From skill root, author system plan and ledger per system-level-refactoring.md. Use actual sha256: digest as sourceRef; every slice has an initial ledger record, retained only with evidence. Store original and each candidate separately. The CLI writes new checkpoint files (never overwrites), validates actual input/candidate bytes and binds to plan fingerprint.
```sh
node engine/system-batch-cli.mjs init plan.json ledger.json original.html state0.json
node engine/system-batch-cli.mjs begin plan.json state0.json original.html 3 state1.json
```
Read active batch: selected slice IDs, affected neighbors (same page, shared asset, direct dependent), required checks. Agent implements only these planned slices into candidate.html, including necessary shared changes within authorized scope. Review actual candidate data/function/style per selected slice and affected neighbors; check navigation and shared state. Author result.json with batchId, inputRef, outputRef, planFingerprint, artifactRef, checks [{key,status,outputRef,ref}]. Use real candidate SHA and refs. No passing evidence placeholders. If a required check is genuinely inapplicable, record bounded equivalent evidence explaining why; never mark not-run pass.
```sh
node engine/system-batch-cli.mjs finish plan.json state1.json original.html candidate.html result.json state2.json
node engine/system-batch-cli.mjs resume plan.json state2.json candidate.html
```
Only accepted batches advance currentRef and mark implemented. Failed/incomplete candidate remains separate; repair it or reject from last accepted bytes (reject plan state current reason new-state). Continue begin/finish until no planned changes remain; do not stop after first easy batch unless user scope or actual budget requires. Persist current artifact and checkpoint; never claim background execution. Final integration requires whole-dashboard review in system ledger; batch pass is not final pass. No automatic patch generation, process concurrency, actual test authentication, or distributed locking. CLI targets one standalone HTML byte stream, not multi-file atomic project edits; for projects use Git/worktree and manually bind equivalent revisions. Do not branch from stale checkpoints or overwrite other workers. State transitions are declared, not autonomous agent execution.

## Adapt before implementing
Use engine/design-dna-adapter.mjs compileDNAAdapter(contract,decision) to emit scoped CSS tokens and explicit role selectors for a slice. Mark container data-ig-slice and descendants data-ig-role with the corresponding role IDs. Use original shared variables/components where appropriate instead of duplicating. Adapter only accepts bounded explicit computed properties/values, refuses unsupported/injection-like values and reports manual roles. Use exact canonical targets or authorized exceptions. CSS variables are scoped to marked containers; nested slice selectors may interact, so avoid nesting or review cascade. Inspect computed styles after build; do not assume the CSS applies, or change chart semantics to fit a palette. Material, chart, layout and motion conventions not represented by tokens still require design work.

## Cross-page review
Only for trusted standalone HTML with explicit permission and isolated runtime as in runtime-intent-recovery.md. Use same viewport/state IDs and matched navigation actions on original and final candidate; make scenarios for every relevant page and state. Capture viewport only (not whole long pages); add separate scroll/manual evidence for below-fold content. Run:
```sh
node engine/capture-review-cli.mjs --trusted original.html probes.json before-captures > before.json
node engine/capture-review-cli.mjs --trusted candidate.html probes.json after-captures > after.json
```
For each viewport create reports in fresh directories. pairs.json contains [{before:{report:"before.json",dir:"before-captures"},after:{report:"after.json",dir:"after-captures"}}]. Run node engine/cross-page-review-cli.mjs pairs.json review.html. This produces a local, self-contained before/after screenshot contact sheet. Matched viewport and artifact versions required; verifies screenshot hashes; missing or limited states visible as not verified. Review side by side at full resolution for coherence, hierarchy, density, readability, material, chart semantics and transitions; screenshots do not prove interaction or causality. No pixel similarity objective for intentional redesign. Do not upload real dashboard captures as CI artifacts. Only synthetic fixtures may be public.

## Stop criteria
Deliver updated integrated artifact, coverage (planned/implemented/retained/deferred/unfinished), final review and next checkpoint if incomplete. Actual user tasks and independent visual review remain separate from code test pass. Do not require changes to effective slices. If host lacks tools, execute manual batches and maintain compact table; mark unavailable checks honestly.
