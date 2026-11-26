# REAL-001 — Multi-stakeholder tension

Status: **Partial pass**. Date: 2026-11-26 (Asia/Tokyo). Source: iterative real-user design conversation, anonymized. This public record intentionally omits original brand, market identifiers, internal presentation thesis, original artwork and unredacted HTML. A separate local archive retains those materials. No quantitative business data was supplied.

## Evidence and iteration history

| Stage | Treatment / artifact | Observed or reported result |
|---|---|---|
| V1 | Direct HTML, no skill | Center-and-links layout; group reveal; illustrative score bars. No quantitative evidence for scores; they were not suitable for business inference. |
| V2 | Repository-guided freeform HTML; skill source revision 2599282af3b2a94b395c8adb0c8fa1c51c0588f5, entry document headed V1.1 | Qualitative relationship graph; progressive disclosure; no invented scores; reported browser checks. User found the left-side visual insufficiently expressive. |
| Concept | Image-model explorations: editorial, industrial/cinematic, then mechanical tension, operating cockpit, resource board | Mechanical tension selected for reconstruction; no controlled comparison of art directions. |
| V3 | Reference-guided SVG/CSS/JS reconstruction with feedback; not a full compiler/runtime execution | Independent programmatic scene; cable anchors, tracked connections, center displacement/tilt, staged reveal, qualitative balance, linked selection. User positively assessed reproduction and choice of interactions; overall aesthetics below expectations. |

V3 was reported by the assistant to work at desktop/projection/mobile sizes and to support playback, pause, reset and highlighting. Raw browser logs and independent reproduction were not preserved in this public record. Treat those checks as historical assistant reports, not newly verified tests. Actual presentation performance, independent reviewers, contrast/reduced-motion audit, and runtime/compiler execution remain unverified.

## Human feedback (anonymized paraphrase)

The real user assessed this iteration as a good improvement: reproduction of the infographic and selection of interactive effects were good; aesthetic quality still fell short of their requirements. This is direct qualitative user feedback, not a numerical rating or blinded review.

## Assessment

- Concept-to-code reproduction: preliminary positive user evidence.
- Semantic interaction and animation choice: preliminary positive user evidence.
- Aesthetic quality: unmet user expectation.
- Material/lighting fidelity: visible gap; no quantitative rating.
- Actual presentation and broader generalization: not tested.
- Skill-specific causal effect: indeterminate. V3 also had concept images, extra feedback and more iterations; V1/V2/V3 are not controlled arms.

## Engineering implications

1. Separate visual intent, semantic scene graph, geometry/material/lighting and motion/state mapping.
2. Introduce reference-image decomposition with explicit provenance and mapping of source object to render object.
3. Choose renderer per layer (SVG/CSS, Canvas, WebGL, raster asset); validate semantic accuracy before visual polish.
4. Preserve stable object IDs; connect cables to actual moving anchors; motion must convey narrative progression, not measured force.
5. Evaluate appearance and reference fidelity independently of interaction correctness. Do not mark this case golden until real user approval of aesthetics and independent functional checks.

Use [fixture.json](fixture.json) and [REGRESSION.md](REGRESSION.md) for a future repeatable sanitized test. Original assets are not published; the sanitized fixture is a derivative, not an exact reconstruction of the private brief.

## Later V4–V6 feedback
See [PRINCIPLE-EVIDENCE.md](PRINCIPLE-EVIDENCE.md). V4 focal image was praised but peripheral styling regressed and the user reported unreadable text. V5/V6 targeted repairs; V6 received positive general owner feedback after viewing. Retain Partial Pass and freeze V6 as candidate baseline, not Golden Case. No controlled skill-effect or full host acceptance claim.
