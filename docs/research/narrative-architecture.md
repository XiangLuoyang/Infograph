# Narrative Architecture / 叙事架构
2026-11-25 · Research baseline V0.1

## Motivation
AI lowers implementation and visual styling barriers. Differentiation increasingly depends on organizing complex information into a coherent cognitive path. This is a working hypothesis, not a measured competitive result. Reporting dashboards differ from exploratory BI: the former guide understanding, the latter enable discovery.

## Principles
- Design audience, decision, thesis and evidence before rendering.
- Dual structure: a logical argument tree beneath a sequential narrative path. Evidence may overturn the thesis.
- Preserve continuity of meaning across changes in chart, scale and perspective.
- Essential information visible by default; supplementary evidence available through drill-down.
- Avoid selective evidence, unsupported causal claims and artificial conflict.
- Use conclusion-first delivery for time-constrained executives; narrative depth remains optional.

## Research foundations
- Segel & Heer (2010), Narrative Visualization: Telling Stories with Data. Author/reader control; martini glass, interactive slideshow, drill-down. https://vis.stanford.edu/files/2010-Narrative-InfoVis.pdf
- Hullman & Diakopoulos (2011), Visualization Rhetoric: Framing Effects in Narrative Visualization. https://doi.org/10.1109/TVCG.2011.255
- Munzner (2009), A Nested Model for Visualization Design and Validation. https://doi.org/10.1109/TVCG.2009.111
- Mayer, Multimedia Learning: coherence, signaling, segmenting, spatial and temporal contiguity. Transfer from educational research to business reporting requires validation.
- Zacks et al., event segmentation and film comprehension: changes in goals and actions shape perceived event boundaries.
- Barbara Minto, Pyramid Principle and SCQA: hierarchical argumentation.
- Neil Cohn (2013), Visual Narrative Structure: hierarchical visual narrative grammar.
These are research leads and conceptual foundations; this repository entry does not claim a fresh bibliographic audit or experimental validation.

## Narrative Atlas (proposed taxonomy)
| Family | Archetype | Sequence |
|---|---|---|
| Time | Chronology | past → present → future |
| Time | Transformation | initial state → change → new state |
| Time | Milestone | stage → stage → stage |
| Argument | Pyramid | conclusion → arguments → evidence |
| Argument | SCQA | situation → complication → question → answer |
| Argument | Investigation | anomaly → clues → tests → judgment |
| Analysis | Decomposition | whole → components → key factors |
| Analysis | Comparison | baseline → differences → explanation |
| Analysis | Causal chain | outcome → candidate causes → mechanism |
| Analysis | System loop | input → transformation → output → feedback |
| Strategy | Gap analysis | target → actual → gap → path |
| Strategy | Scenario | current → possible futures → responses |
| Strategy | Trade-off | options → constraints → choice |
| Strategy | Opportunity | market → unmet need → opportunity → investment |
| Exploration | Spatial journey | global → region → country → site |
| Exploration | Entity journey | object lifecycle across system |

These 16 archetypes are provisional and composable, not a validated exhaustive taxonomy.

## Narrative Grammar
Atoms: Orient (context), Assert (claim), Evidence (support/test), Compare (difference), Contrast (unexpected difference), Question (open inquiry), Explain (mechanism), Qualify (conditions/uncertainty), Synthesize (integration), Resolve (action), Bridge (continuity), Recap (restore context).
Composition: thesis → acts → scenes → atoms. Each scene specifies audience knowledge before/after, question, claim, evidence, visual, and transition. Argument dependencies are separate from presentation order.

## Transition Atlas
Zoom-in/out (scale), temporal (time), causal investigation (candidate mechanisms), contrast (difference), perspective (stakeholder viewpoint), flow (process continuation), callback (return to initial question), decision (analysis to action).
Visual implementation: shared-object continuity, semantic zoom, stable encodings, morphing only when correspondence is meaningful, scroll or chapter navigation. Provide reduced-motion and static fallback.

## Storyboard specification
```yaml
narrative:
  audience: regional decision makers
  purpose: allocate resources
  thesis: balance growth potential and channel health
  archetypes: [comparison, gap_analysis]
  delivery: conclusion_first
acts:
  - id: overview
    question: What is the current situation?
    cognitive_goal: establish context
    evidence: [sales, target]
    visual: geographic_overview
  - id: quality
    question: How does operating quality differ?
    evidence: [sellout, inventory, margin]
    transition: contrast
    visual: comparison_matrix
  - id: constraints
    question: What constraints explain the differences?
    evidence: [channel_structure, cost]
    transition: causal_investigation
  - id: decision
    question: How should resources be allocated?
    transition: decision
interaction:
  main_path: guided
  evidence_drilldown: true
  essential_information: always_visible
validation:
  evidence_traceable: true
  alternative_explanations: required
  unsupported_causal_claims: prohibited
```

## Architecture V2 proposal
Communication → Narrative → Storyboard ↔ Information & Evidence → Layout → Visual → Material & Color → Interaction → rendering and QA. Iterate upstream when evidence contradicts the thesis. Integrate with existing domain-specific visual routing rather than replace it.

## Generic synthetic example
Follow one product through manufacturer, import, distributor warehouse, retail, consumer and cash return. Attach supply policy, landed costs, inventory, margin, retail coverage, sell-through and cash flow to the relevant stage. This is a generic illustration, not company data.

## Benchmark
Provisional weights: thesis clarity 20, progression 15, evidence 20, cognitive fluency 15, selection 10, visual-narrative alignment 10, decision closure 10. Rate each 0–5 and compute weighted score. Evidence integrity is a hard gate regardless of score.
Tests: 30-second thesis recall; titles-only coherence; chapter reorder (only where order matters); unaided conclusion/evidence recall. Compare comprehension accuracy, completion time, recall, decision accuracy and confidence calibration. Hold data, visual quality and audience constant; randomize presentation order or assign participants to versions.

## Case and tool leads
- NYT Snow Fall: https://www.nytimes.com/projects/2012/snow-fall/
- The Pudding: https://pudding.cool/
- Our World in Data: https://ourworldindata.org/
- Mike Bostock: https://bost.ocks.org/mike/
- FT Chart Doctor: https://github.com/Financial-Times/chart-doctor
- Scrollama: https://github.com/russellsamora/scrollama
- D3: https://github.com/d3/d3
- GSAP: https://github.com/greensock/GSAP
- reveal.js: https://github.com/hakimel/reveal.js
- ai2html: https://github.com/newsdev/ai2html

## Next research gates
1. Reverse-engineer 10–20 works scene by scene: thesis, cognitive state, evidence, transitions, interaction.
2. Build four matched synthetic dashboards: information-first, argument-first, story-first, entity journey.
3. Run comparative comprehension tests; revise taxonomy, grammar and scoring weights.
4. Formalize machine-readable spec and agent skill only after validation.
No case-level audit, browser regression, or controlled experiment has yet been completed. No private business data or personal workplace details included.
