# Business Semantic QA V0.1 — engineering candidate

Business truth is separate from visual quality and browser operability. Preserving original data bytes does not establish original formula correctness. Do not silently modify source definitions; flag material contradictions and obtain scope authorization to correct them.

## Actual artifact workflow
After binding HTML run `semantic-task <run-dir>`. Review every inventory slice, source metric definitions, actual computations, visible labels and selected mechanism states. Author independent expected evidence from authorized source data/definitions, then observed evidence from actual runtime or source execution and rendered text/geometry. Use normalized units and explicit source/observation refs. Do not copy expected values to observed fields, guess missing data, execute untrusted scripts or upload private evidence to a public repo.

Use `semantic-submit <run-dir> <input.json>` and `semantic-status <run-dir>`. Records bind source, artifact and design revision; submission is immutable and replayable. A known failure blocks both candidate and draft handoff. A candidate needs declared semantic checks pass, as well as browser and independent critique requirements. Missing or incomplete checks permit only an otherwise eligible, explicitly agreed draft. Retry artifact for changed output or earlier design stage for design errors; engine changes require a fresh run. No release authorization.

## Packet
Use the generated version/revision/hash fields. Three coverage entries exactly: calculation, expression, mechanism. Status applicable, not-applicable, or not-run; nonempty reason and ref required. Applicable categories need checks; use not-run if evidence missing. Not-applicable needs a genuine rationale (e.g., no mechanisms selected); a declaration is not independent verification. Every check requires unique id, kind, claim, sourceRef, observationRef.

| kind | fields beyond common fields | rule |
|---|---|---|
| period-growth | mode yoy or previous-period; current/baseline arrays of {month: YYYY-MM, value: number or null}; observedValue number or null; tolerance optional | exact 12-month or equal previous-period alignment; contiguous periods; missing/zero denominator yields null, not numeric growth; check numeric value |
| budget-cap | budget; commitments [{id,cost}]; tolerance optional | nonnegative actual commitments must not exceed available budget; use realized costs, not clipped spend or merely requested costs |
| value-parity | unit; expectedValue; observedValue; tolerance optional | equality within explicit absolute tolerance, same units |
| count-parity | unit; expectedValue; observedValue | nonnegative integer counts must match exactly |
| relation-fidelity | modelRelations and visualRelations arrays of {from,predicate,to} | every implied visual relation must exist in the actual model; normalize IDs and predicates consistently |

For budget scenarios test zero, below need, exact need, above need. If benefits require funded activities, inspect whether activities and costs scale together; unfunded benefits may be valid only with an evidenced zero-cost mechanism. The budget-cap rule alone cannot discover omitted costs or establish causal validity. For missing comparisons check that actual labels and drivers do not imply genuine zero or new business; value parity alone cannot resolve prose. Relation fidelity checks unsupported relations, not all omitted model relationships, aesthetics, physics or causality.

## Boundaries
V0.1 is a deterministic engine over authored evidence, not automatic metric extraction, general mathematical proof, runtime instrumentation, exhaustive per-slice coverage, independent reviewer authentication or semantic interpretation of arbitrary pixels. Coverage/ref declarations remain inspectable claims. Use existing critique rubric for unsupported qualitative assertions, accessibility, and all unimplemented check types. Never claim factual completeness merely because checks pass. Use synthetic fixtures only for regression, not live production answers.
