---
name: narrative-design
description: Design evidence-grounded narrative dashboards, executive reports and interactive business explanations before implementing their visual interface.
---
# Narrative Design V1.0
## Operating contract
Use for authored business narratives; for monitoring or exploratory dashboards, prioritize user tasks and do not manufacture a thesis. Never invent evidence, causal attribution, targets or user-test results. Distinguish observations, hypotheses, forecasts and decisions. Preserve contradictory evidence and source access.
## Workflow
1. G1 Evidence: inventory sources, grain, period, units, definitions, missingness and reconciliations. Stop on material unresolved errors; mark missing inputs.
2. G2 Thesis: generate three candidate questions or claims, compare relevance, support and actionability. Select one or retain an open question. Record rejected alternatives.
3. G3 Spine: choose a primary spine and archetype from references/atlas.md. Assign every chapter a role; remove redundant content without hiding material exceptions.
4. G4 Naked narrative: write a short executive summary and full prose argument. Link each material claim to evidence IDs; include counterevidence and uncertainty. Do not proceed if the argument fails.
5. G5 Storyboard: specify audience, time budget, cognitive before/after, chapter question, evidence, visual task, transition and interaction. Use templates/storyboard.json and schema. Essential information must be visible without interaction.
6. G6 Visual translation: choose encodings by task, not novelty; maintain units, scale, accessibility, stable object identity and responsive layout. Choose patterns from references/patterns.md only where justified.
7. G7 Implementation: use a shared data model for charts, tables and text. Test calculations, controls, keyboard navigation, reduced motion, narrow screens and missing data. Never present synthetic data as actual.
8. G8 Validation: run tests/protocol.md. Record actual results separately from predictions. No claim of superiority without comparative evidence.
## Required deliverables
Evidence map, thesis alternatives, naked narrative, storyboard JSON, implementation, validation log. For small tasks these may be concise sections rather than separate files. For executive reports default to conclusion first, then evidence, mechanism, options and explicit decision request; omit unsupported stages. For exploratory tools use a task-first path instead.
## Decision rules
Use a persistent scene only when object continuity matters. Use interaction only when it improves navigation, understanding, verification or decision-making. Provide a static fallback. Models must expose assumptions, valid ranges and limitations; do not infer behavioral effects from accounting identities. Preserve access to full evidence. A decision request must identify authority, options, constraints, owner and review trigger, or mark unknown.
