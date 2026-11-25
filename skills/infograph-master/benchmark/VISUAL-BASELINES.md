# Visual baseline operation

Run browser QA on the pinned Linux CI environment. Download the successful run artifact and retain its source revision and reports. Candidate PNGs and sidecars are generated for 28 Studio scenarios. Do not register screenshots from failed runs.

From the engine directory, install the pinned dependencies used by browser QA. Create an initial registry containing {"version":1,"entries":[]}.

Review every candidate at native size against its task and interaction state. Record reviewer, reason, ISO timestamp and captures (array of complete approved candidate sidecar objects, including caseId, captureMode, revision, screenshotHash and environment/state fingerprints). Identical PNGs across different cases or modes are permitted; each capture must be separately approved. The former screenshotHashes-only format is rejected. Approval is a human workflow record, not authenticated authorization.

Register into a new empty directory:
```sh
node visual-batch.mjs register empty.json qa-output baseline-v1 approval.json
```

Compare a later successful run:
```sh
node visual-batch.mjs compare baseline-v1/registry.json qa-output comparison-v2
```

Inspect summary.json and difference masks. Missing or incompatible evidence is not a pass. A deliberate design change requires review and explicit registration into a new directory using the prior registry. Retain old directories and CI provenance. Never auto-approve from CI or overwrite baseline files.

Current limitations: Linux font inventory only; scenario and control-state fingerprints are not exhaustive internal state snapshots; exact screenshot equality is not aesthetic quality. No production baseline is approved by this document. The CLI is not transactional; discard incomplete output directories after failures. CI exercises synthetic registry fixtures, not a production baseline gate.
