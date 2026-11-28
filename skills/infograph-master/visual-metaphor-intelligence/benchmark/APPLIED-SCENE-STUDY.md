# Applied scene grammar study — local dashboard prototype

Status: locally rendered authored prototype; no production candidate approval. This note deliberately contains no dashboard source, customer names, or business data.

## Reusable findings
- Recover the actual calculation before choosing an illustration. If the model has one scalar constraint shared by several outcomes, draw one central constraint and independently labelled outcomes. Do not imply separate resource flows, independent allocations, physical conservation, or motion unsupported by the model.
- A Hero Scene can combine a dimensional metaphor with live HTML output rows, rather than forcing every semantic node into a physical object. The figure may illustrate a scalar already owned by the host; the authoritative values and outcome formulas remain outside the artwork.
- Reuse the host design tokens, compact hierarchy, consistent material and depth; retain inspection controls and static explanation. Avoid repeated headers and large empty SVG viewports. Essential labels and values must remain legible at narrow embedded widths.
- Test host rerenders, all original controls, sensitivity selection, filters and route out/back; inspect both responsive copies, actual iframe fit, state and error behavior. Compare the existing baseline and candidate under the same width and data state. A passed unit test does not establish visual quality or business-model validity.

## Evidence boundary
The local authored prototype preserved the previous host scripts except a display note. The previous 154 runtime regression assertions and six new instrument-angle checks passed in Chromium at desktop/mobile widths. Matched default-state embedded-scene captures show reduced vertical height and a cohesive focal assembly. Mobile internal figure labels remain small; live HTML carries essential values. Capture used taller viewports of the same widths to avoid off-screen iframe compositing; runtime tests used the original viewport sizes. Existing calculation limitations were not fixed. The prototype used a prior experimental host bridge and hand-authored SVG, not a freshly compiled canonical VMI packet or autonomous Agent design. No full repository CI, independent visual/semantic review, or release authorization.

## Next validation
Use the current production branch and run the real authoring workflow on the local source, without supplying the prototype as the answer. Compare its independently produced scene against the baseline and this reference under matched conditions, including original host interactions. Record which stages and renderers actually executed. If canonical compilation cannot represent the selected grammar, report that gap; do not copy the prototype into a canonical slot or fabricate compiler evidence. Only then decide whether a reusable hybrid scene adapter is warranted.
