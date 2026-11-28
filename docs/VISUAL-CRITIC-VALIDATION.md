# Visual Critic qualification — P1.1

Status: proposed experimental protocol; no provider qualified and no release authorization.

Use the existing reviewer-run and independent-review-handoff contract. Do not add another review engine. Operator chooses a genuinely separate image-capable session and authorizes the exact destination. Start with synthetic data only.

## Qualification
Prepare paired rendered screenshots with identical data and task, randomized anonymous IDs, desktop and mobile. Keep the defect answer key outside reviewer inputs. Include clean controls and subtle defects, not only obvious failures.

| Case family | Deliberate defect |
|---|---|
| Hierarchy | Secondary metric dominates primary conclusion |
| Composition | Crowded focal area, label collision, poor balance |
| Art direction | Inconsistent material, typography or palette |
| Metaphor | Recognizable but semantically misleading physical relation |
| Information encoding | Unnecessary table/bar repetition or misleading scale |
| Interaction | Before/after states contradict declared behavior |

For interaction, supply actual state captures and observed interaction evidence; static screenshots alone cannot establish animation quality. Include source definitions for semantic checks. Never ask reviewer to infer unavailable facts.

## Measurements
Record defect recall, precision, clean-control false positives, localization accuracy, severity agreement and repair usefulness against an independently prepared key. Separately record preference agreement with human reviewers for subjective aesthetics. Suggested pilot: at least two paired cases per family, two viewport sizes, two independent reviewer passes; report denominators and disagreements. Proposed qualification targets: recall >= 80%, precision >= 80%, clean-control false positive rate <= 20%; these are provisional, not empirically calibrated. Critical semantic defects must not be missed in the pilot. A small pilot cannot establish production reliability.

## Production adapter
Use operator-owned executable/config outside public repository, exact screenshot bytes, canonical review JSON and existing receipt verification. Credentials remain in operator environment. No automatic external upload, provider selection or credential discovery. A failed or incomplete review never passes. Do not claim independence based solely on a reviewerKind field.

## P1.2
Compare same model, same source, same brief and matched resource budget with/without Infograph. Randomize presentation, blind reviewers to condition, record actual time/tokens when available, and preserve failed attempts. Evaluate visual quality separately from engineering correctness and semantic parity. No cherry-picking. Use synthetic material first; real business data requires explicit authorized handling.

## Exit
Publish actual case results, reviewer identity declaration, limitations and repair outcomes before claiming qualification. No provider integration or experiment execution is implied by this document.
