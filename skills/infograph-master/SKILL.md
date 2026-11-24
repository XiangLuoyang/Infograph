---
name: infograph-master
description: Design and implement complete evidence-grounded business dashboards and full-spectrum visual representations, including narrative, color, typography, layout, material, chart selection, diagrams, maps, motion, interaction and engineering QA.
---
# Infograph Master V1.0
Use this as the single entry point. Resolve paths relative to the Infograph repository root, two levels above this skill directory. Keep the repository available; do not copy this file alone. Read references/router.md and references/visual-design.md for every dashboard; load other references as routed. Do not merely mention the references: apply their rules and record design choices.
## Workflow
1. Brief: audience, task, decision, mode (executive report, monitoring, investigation, exploration, professional illustration), time budget, data permissions, delivery constraints. Ask only for blocking inputs; mark unknowns.
2. Evidence: reconcile units, grain, period, denominators, sources, missingness; distinguish facts, inference, assumptions and unknowns.
3. Narrative: for authored reports execute skills/narrative-design/SKILL.md G1–G5 and its references. For monitoring/exploration use task-first information architecture, not a forced thesis.
4. Art direction: propose two or three meaningfully different compositions and visual languages; choose one based on audience and task. Produce design tokens for color, typography, spacing, material, borders, shadows and motion. Default to restrained editorial style for executive reporting, not generic card grids.
5. Representation: map each scene or user task to data relationship, domain, chart/diagram type, encoding, renderer, and rationale. Consult catalog and routing contract when ordinary charts are insufficient.
6. Layout: design reading order, dominant visual, evidence proximity, density, responsive reflow and navigation. Keep key claims and caveats visible without hover.
7. Interaction: specify states, transitions, shared object IDs, keyboard and touch behavior, reset and reduced-motion fallback. Use animation to explain, not decorate.
8. Build: one shared data model; no fake controls; offline-first when requested. Implement actual HTML or requested output, not just a design proposal.
9. QA: apply references/acceptance.md; render and inspect desktop/projector/mobile when tools permit. Fix blockers; report untested items explicitly.
## Deliverables
Brief, evidence map, thesis/storyboard or task map, visual specification (tokens + layout + chart rationale + state map), working artifact, validation log. Compact tasks can combine these. Do not stop after planning unless requested.
## Precedence
Truth, privacy, domain accuracy and accessibility override style. User explicit constraints override default aesthetics. Do not upload private data or install external skills without authorization. Existing catalog entries are research leads, not guaranteed implementations. No superiority claims without testing.
