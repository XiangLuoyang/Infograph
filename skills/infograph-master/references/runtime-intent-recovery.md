# Runtime evidence & intent recovery (P0.3)

## Trusted runtime
Default remains inert static inspection. Only run inspected, explicitly authorized, trusted standalone HTML in an isolated disposable environment with no credentials or sensitive mounts; the browser runner is not a security sandbox. No live production site, no unknown scripts, no submit/export/delete actions. Offline context blocks network requests, service workers and downloads; a blocked dependency or page error makes the state limited. External CDN/network-dependent dashboards need separately approved testing, not invented values. Each named scenario starts from a fresh context. No arbitrary evaluation/fill actions are accepted from the plan.

Create a plan like engine/runtime-probes.example.json: stable probe IDs across old/new, author-selected CSS selectors for text/table/control/chart, named click/select scenarios, optional visible readiness selector. No blind clicking. Run from skill root with Playwright installed:
`node engine/artifact-runtime-cli.mjs --trusted existing.html plan.json > runtime.json`
The --trusted flag must reflect actual authorization, not an automatic opt-in. Compare matched scenarios using `node engine/runtime-diff-cli.mjs old.json new.json required-probes.json`. Each required ID must be observed in all named states. Hidden/missing/ambiguous/unsupported/partial observations are not-run. Exact match is not semantic equivalence; different layout may need authored normalized observations. Current adapters read configured primitive Chart.js and ECharts series/labels only when exposed globally; unsupported complex points, custom/canvas/WebGL, formulas, datasets and rendered marks are not verified. Visible DOM geometry is not tested for aesthetic quality. Asynchronous state requires an explicit readiness condition; no general quiescence guarantee.

## Intent recovery assistant
Run `node engine/intent-candidates-cli.mjs original.ir.json [runtime.json]`. Lexical signals generate candidate task hypotheses with source refs, alternatives, validation questions, relevant capability references and design-reset prompts. They are not a business ontology, inferred ground truth, confidence probability, or final recommendation. Signals are incomplete, English/Chinese only, and false positives are possible. Runtime state refs are separate evidence, not automatically assigned causal effects.

Model must review the full actual artifact and candidates, then write a design-independent brief:
- What decision or recurring task does the reader need to accomplish? Which observations support it? What credible competing task exists?
- Which business entities, metrics, units, time grain, evidence and functions must remain? What is unknown or ambiguous?
- What is the central relationship or contradiction, if any? Distinguish facts from hypotheses and needed validation. Never invent causal mechanism.
- If the current visual form disappeared, what three materially different designs would support that task? For each name information architecture, representation, interaction, relevant skill references and measurable reader task.
- Which design best addresses observed L3–L5 issues, and which original assets must be preserved? If only polish is justified, document why.

Use buildIntentGraph and the reconstruction contract; candidate routes are advisory and do not override explicit task/scope. The model should reject bad candidates, add missing hypotheses and use alternative evidence. For high-level changes, do not merely repeat candidate wording: specify a concrete proposed scene or information architecture tied to actual objects and metrics. No model adherence, automatic intent accuracy, human comprehension or real-artifact superiority is certified.
