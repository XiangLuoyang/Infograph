# Cross-model acceptance protocol — VMI authoring reliability candidate
Status: protocol only; no cross-model measurements yet. Freeze feature development after green engineering CI. Candidate must be identified by full Git SHA and verified package manifest. Historical run-013 at 57fe31d is diagnostic evidence, not a controlled baseline.

## Hypotheses and arms
H1: at equal model and budget, the candidate lowers authoring failures and improves completion without reducing evidence integrity or visual quality.
H2: gain is measurable for both models; weaker-model floor improves without lowering strong-model ceiling.
Use one identical agent host, exact provider model IDs, tool permissions, source bytes, instructions, viewport sizes, token/time caps and fresh independent sessions. Record settings, thinking level, context limits, provider token accounting and tool versions; do not equate model names or token counts across providers without caveats.
- A: GPT-6.2, no Infograph instructions or tools.
- B: same GPT-6.2, frozen Infograph candidate.
- C: DeepSeek (exact model ID recorded), no Infograph.
- D: same DeepSeek, frozen candidate.
Optional E/F: same respective models, old Infograph 57fe31d, same conditions to isolate the engineering revision. Run-013 does not substitute for E/F.
Randomize arm order, fresh context per run, at least 3 runs per arm per task; do not tune prompts or modify the skill during the study. First execute a one-run-per-arm smoke test, report it as pilot only.

## Tasks
T1: private run-013 original dashboard and original instruction, hashed byte-for-byte; owner supplies local artifacts. Never commit business data, prompts containing secrets, or failed run inputs to public repositories.
T2: non-sensitive dense lookup/report/dashboard requiring chart choice and responsive interaction but no forced metaphor.
T3: non-sensitive mechanism scene requiring meaningful qualitative representation, plain comparison and source mapping. Include a dynamic source-control case to test that fallbacks cannot silently drop interaction.
Each task has a frozen independent source/claim inventory and reference answer, explicit required functionality and two viewport tiers. Provide both skill and no-skill arms the same outcome criteria. Only the skill arms get skill tooling; evaluate all arms with the same independent external checks, not just internal gates.

## Run procedure and evidence
1. Save exact input SHA256, host/model ID/settings, arm ID, task ID, trial ID, frozen git revision and limits. Do not reuse outputs from another arm.
2. Capture wall-clock, model input/output/reasoning tokens if exposed, tool calls and per-stage timing, raw diagnostic messages, distinct failures, retries, fallback reasons, exit status, output HTML SHA256 and size. Unknown metrics remain null; timeouts and blocked runs remain in denominator.
3. For skill arms preserve receipts, verify-vmi, integration task, browser/semantic/critique results and handoff classification. Distinguish generated/compiled/assembled/runtime-observed/independently reviewed. For no-skill arms internal receipt metrics are not applicable, not zero.
4. Run the identical independent browser plan and data/claim checks against every produced artifact. Capture desktop/mobile views and interaction states. Blind artifact identity for at least two independent reviewers when feasible; record individual ratings and disagreements. No completion claim when no artifact exists.
5. Report fallback cases separately. A substitute is not a successful metaphor; assess whether the required evidence and functionality actually survive.
6. Preserve all runs, including failures. Do not select best-of-N unless predeclared and applied to all arms.

## Outcomes (pre-register before running)
Primary: end-to-end artifact completion within fixed budget, all essential source claims preserved and required interactions working. Report completion counts and proportions with sample sizes; distinguish usable draft, independent reviewed candidate, blocked and timed out.
Secondary: wall-clock and token consumption (per completed run and all attempts), unique error classes, retry count, visual capability activation backed by actual compiler/runtime evidence, and fallback frequency. Record engine execution separately from authoring/repair time.
Blind quality rubric, 0–4 each: source/semantic fidelity, narrative/decision clarity, information encoding, visual hierarchy/coherence, responsive legibility, interaction usefulness/accessibility, representation originality/fit. 0=missing or unusable; 1=major defects; 2=adequate with clear shortcomings; 3=strong; 4=excellent with concrete evidence. Critical semantic or interaction failure overrides aesthetic score. No artifact = missing quality score, not a zero-valued aesthetic judgment; report both completion and conditional quality.
Compare B-A and D-C per task and model; compare D-F/B-E only if old-version arms actually run. Use paired task/trial results where feasible. Do not infer causal improvement from the historical run-013 alone.
Acceptance proposal: all engineering CI passes, zero known critical semantic regressions, no silent fallbacks, and measurable completion or quality improvement under matched budgets. With small samples report uncertainty rather than claiming general superiority.

## Suggested per-run JSON fields
arm, taskId, trialId, sourceSha256, promptSha256, exactModelId, hostVersion, modelSettings, skillRevision, budget, wallMs, engineMs, tokensInput, tokensOutput, tokensReasoning, toolCalls, distinctErrors, retries, fallbacks, outputSha256, outputBytes, completionStatus, externalBrowserStatus, externalSemanticStatus, requiredInteractionStatus, reviewScores, reviewEvidenceRefs, handoffClassification, notes.
Keep real run records and screenshots local/private. This protocol contains no actual benchmark result.
