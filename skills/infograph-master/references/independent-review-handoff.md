# Independent review handoff — P0 candidate

The browser matrix is functional evidence, not aesthetic approval. The author must never change reviewerKind to simulate independence. A separate model/session or human may author a review; identity and separation are operator declarations, not authenticated by this engine.

## Route
1. After browser review execute `critique-task <run-dir>`. Preserve the actual blank template, output SHA-256, report SHA-256, revision, screenshot IDs and screenshot hashes.
2. If the producing session cannot see screenshots, do not submit visual observations. If it can see them, self-review is useful for repairs but cannot qualify for a reviewed candidate.
3. The operator selects a separate authorized image-capable reviewer (human or model). Supply the exact artifact, browser report, all screenshots, critique task template, applicable business source/metric definitions and scope. Keep confidential files local or use a specifically authorized reviewer destination. Do not upload to a public repository. No provider or network calls are automatic.
4. Reviewer actually opens each capture and compares the rendered artifact and source. Populate captureReviews with the provided IDs/hashes and concrete observations, populate each rubric check with specific evidence references, severity and repair where applicable. Check hierarchy, composition, art direction and material coherence from actual pixels; check labels, scale, units, periods, missingness, data/behavior parity and semantic mapping against actual source. If a check cannot be observed, leave not-run. Do not infer visual observations from code. Declare independent-human or independent-model only when the operator establishes a genuinely separate reviewer.
5. Return the complete review JSON without altering bindings; the producer/operator uses `critique-submit` and `critique-status`. Submission is immutable. If a self-review is already submitted, current CLI requires an artifact retry and fresh browser captures before submitting another review; do not overwrite receipts. Use a separate reviewer before first submission where possible.
6. Known findings require repair; rerun the appropriate design or artifact stage and re-review current captures. Missing reviewer or incomplete finding-free review can use explicit unverified-draft handoff after user agreement; never label it reviewed.

## Reviewer assignment
Identify what the reader should notice first; assess whether relative visual weight follows business priority. Inspect layout as a whole and at target viewports, not just overflow. Assess an actual coherent art direction rather than palette alone; compare materials, contrast, typography and graphic treatments. For a mechanism scene compare each visual state and relationship to the underlying model, including whether it implies a nonexistent causal or quantitative relationship. Record specific defects even if browser checks passed.

## Limitations
This is an operator-mediated protocol, not automatic reviewer dispatch, a new model API, cryptographic identity verification, semantic computation or independent acceptance. No new dependencies. The existing local verifier checks receipt consistency and exact artifact bytes; the host owns any transmission and approval.
