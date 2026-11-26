# Existing dashboard redesign — execution entry (P0.5)

Use this workflow first when a user gives an existing dashboard, report, HTML or partial design and asks to optimize it, even if they only say "make it better." It supersedes cosmetic-first review, not explicit narrow scope. Do not make a deliverable solely a critique unless requested. Do not ask the user to reconstruct the original brief unless a blocking unknown cannot be resolved. Do not treat this guide as an automatic designer.

For multi-page, multi-slice or shared-state dashboards, first follow `references/system-level-refactoring.md`. The short path below applies within each planned slice or page; global scope, design language and completion are controlled by the system plan and ledger. Do not substitute one slice's review for the whole dashboard.

## The short path (for every agent host)
1. **Read, not repaint.** Inspect actual source/render/states; identify what each module is for, data grain/units/formulas, key relationships, reader task and essential functions. Write a compact evidence map and design-independent brief: audience, readerTask, decision, constraints, unknowns. Separate observed facts from inferred needs and alternative interpretations.
2. **Find the gap.** Diagnose from L5 (purpose), L4 (information architecture), L3 (representation/interaction) down to L2/L1. Look for meaningful relationships between modules; specify concrete task friction, not generic visual opinions. If no higher-level issue, retain the effective design.
3. **Reset.** Imagine the original charts/layout did not exist. Compare actual alternatives: refine / restructure / reinvent. Specify information architecture, focal evidence, representation, interaction, reader path, cost and evidence risk. A change of theme is not a structural alternative. Select the least change that achieves the task, not automatically the most radical.
4. **Recompose.** Load only applicable capabilities (narrative, representation, visual metaphor, focus, specialist domain, art direction). For significant structural change sketch the new scene/storyboard with real labels, then implement the selected direction in HTML or requested medium. Preserve original baseline; preserve or equivalently replace data/functional assets; no invented facts or quantitative mechanisms.
5. **Compare and deliver.** Compare source/revised facts and behavior at matched states; show what changed beyond visual polish, concrete task impact, evidence limits and actual artifact. Run actual rendering/interaction checks when available; mark unknowns not-run. Do not claim better comprehension without reader evidence. If the host cannot run tools, still perform these steps on accessible evidence, label limitations, and deliver the best safe artifact within scope.

## One staged CLI for tool-enabled hosts
Use from the skill root, with Node and the existing Playwright dependency where applicable. Keep all case files local/private. Do not run untrusted HTML; static parse is default. Read the actual detailed references for complex tasks:
- references/reverse-design-reconstruction.md
- references/artifact-semantic-ir.md
- references/runtime-intent-recovery.md
- references/design-opportunity-exploration.md

Prepare:
```sh
node engine/artifact-inspector-cli.mjs original.html > original.ir.json
node engine/reconstruction-orchestrator-cli.mjs prepare original.ir.json > prepared.json
```
Optional trusted runtime report: collect with the existing runtime inspector only if explicitly authorized and isolated; pass as second prepare argument. Prepared output includes actual bounded IR and candidate hypotheses. Review it, don't assume candidate words are the task.

Plan: author authored.json with inputFingerprint (copied from prepared), brief, packet (see engine/reconstruction.example.json, sourceRef must be actual IR hash, extend with relationships), intentLinks, assetEvidence (assetId, observationIds, runtimeRefs, optional manualEvidenceRef for source/render evidence not in IR), and exploration (see engine/design-exploration.example.json). All essential assets must be bound. Inferred intents must link to actual observations, or disclose inability to satisfy this CLI and use the bounded manual path. Select the same mode in both contracts and include selected route refs in packet.routes. Use actual evidence, not example placeholders.
```sh
node engine/reconstruction-orchestrator-cli.mjs plan prepared.json authored.json > plan.json
```
Repair errors before declaring build eligibility. critiqueReady means critique only. Load requiredReferences. Do not wait for code tools when unavailable, and do not fabricate passing records.

Review: generate revised IR with the same inspector. after.json is {ir: revised IR, runtime: optional revised runtime report}. Author review.json with planFingerprint (from plan), outputRef (revised IR hash), aliases, dispositions (one per changed static observation with matching before/after/status, decision, ref, reason), requiredProbes (stable IDs for runtime comparison), records (review records from reconstruction contract). Verify actual data and behavior independently; exact textual equality is not semantics. Static representation changes are expected; explain them, do not require pixel similarity. A retain/no-op decision should be reported as such, not a reconstructed artifact.
```sh
node engine/reconstruction-orchestrator-cli.mjs review prepared.json authored.json after.json review.json > review-result.json
```
Nonzero exit means incomplete plan/review, not a reason to discard the work; disclose remaining defects. The CLI computes fingerprints for version binding and composes existing audits; it does not author intent, discover every relationship, generate HTML or independently authenticate declared evidence. It cannot certify completeness of a screenshot-only source or private runtime. No automatic release.

## Deliverable expectation
For a substantial redesign, give actual revised artifact + concise original intent reconstruction + 2–3 specific high-impact structural changes + preservation/limitations. If selected scope is refine, explain why structural change offers no justified benefit. For the user who says "only looks tidier," evaluate whether the underlying information/reader task changed, not how many CSS changes were made. If tools cannot read the source, say so; do not pretend inspection. The objective is effective expression, not mandatory novelty.
