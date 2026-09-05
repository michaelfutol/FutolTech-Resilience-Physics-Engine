---
name: rpe-scientific-orchestration
description: Canonical plugin-routing and scientific-workflow skill for the Resilience Physics Engine. Use for RPE architecture, experiment design, implementation, data persistence, deployment, analytics, observability, diagrams, validation, and security review.
---

# RPE Scientific Orchestration Skill

## Purpose

This skill locks the preferred plugin and tool orchestration for the **Resilience Physics Engine (RPE)** so the project does not depend on chat memory alone.

The canonical stack is:

**GitHub → OpenAI Developers → Supabase → Vercel → Data Analytics → PostHog → Figma → Codex Security**

This order is the preferred project lifecycle and responsibility chain. It is **not** a requirement to invoke every plugin for every task. Use only the layers materially relevant to the work, but preserve the ownership and evidence boundaries below.

## Canonical responsibilities

### 1. GitHub — source of truth

Use GitHub first for:
- repository state and branch inspection;
- code, tests, schemas, fixtures, and versioned experiment definitions;
- issues, pull requests, milestone records, and decision history;
- status, worklog, tasks, and next-step documentation;
- durable links to data schemas, reports, diagrams, and validation evidence.

No RPE feature or experiment is considered durably implemented if it exists only in chat, an ephemeral local environment, or an uncommitted prototype.

### 2. OpenAI Developers — agent and AI application layer

Use OpenAI Developers when RPE needs:
- agent workflows;
- OpenAI API or Agents SDK integration;
- structured tool calling;
- model-driven experiment assistance;
- evaluation or AI-behavior instrumentation;
- AI features that must be implemented as reproducible product behavior rather than ad-hoc chat reasoning.

Keep AI-derived interpretations distinct from engineering calculations, solver outputs, simulation results, and physical-test evidence.

### 3. Supabase — experiment and application data layer

Use Supabase for persistent structured data such as:
- experiment definitions and run metadata;
- test specimens and material records;
- provenance and verification state;
- calibration datasets;
- result records and comparison lineage;
- user/project data, permissions, and collaboration state when needed.

Scientific data must retain source, units, version, assumptions, timestamps, and verification state. Do not silently overwrite source/library values with user overrides.

### 4. Vercel — deployment and reproducible preview layer

Use Vercel for:
- preview deployments tied to branches or pull requests;
- production deployment of validated RPE application states;
- environment configuration needed by the web application;
- reproducible review URLs for experiments, interfaces, and architecture milestones.

A deployment is evidence that software runs, not evidence that the engineering model is validated.

### 5. Data Analytics — scientific analysis layer

Data Analytics is a core scientific workflow layer, especially for:
- test datasets;
- sensitivity studies;
- material experiments;
- calibration;
- comparisons;
- validation;
- uncertainty analysis;
- charts and engineering visualizations;
- experiment reports.

Use explicit units, labels, assumptions, sample counts, missing-data treatment, and uncertainty where applicable. Distinguish measured, calculated, solver-derived, simulated, estimated, and inferred values.

Do not tune or filter data merely to make an RPE hypothesis look successful. Disagreement between manual calculation, solver, simulation, and physical evidence must remain visible and be investigated.

### 6. PostHog — product observability layer

Use PostHog for product and workflow telemetry such as:
- feature usage;
- experiment-workflow drop-off;
- interface friction;
- performance and adoption behavior;
- product A/B tests when appropriate.

**PostHog telemetry is not scientific validation data.** Product analytics must never be presented as evidence that a material, connection, structural system, or hazard model is physically correct.

### 7. Figma — maintained visual systems model

Figma is not limited to UI polish. For RPE it is the maintained visual-model layer for complex architecture and experiment workflows.

Use Figma, when materially useful, to create and maintain:
- architecture diagrams;
- state diagrams;
- sequence diagrams;
- entity-relationship diagrams (ERDs);
- timelines;
- system diagrams;
- experiment-flow diagrams;
- evidence-layer and data-lineage diagrams.

Important RPE architecture should not live only in conversation. When a subsystem becomes complicated enough that relationships, states, data flow, or experiment lineage are difficult to explain reliably in prose, create or update a maintained visual model and reference it from GitHub documentation.

A Figma diagram must reflect the implemented or explicitly proposed architecture. Do not draw fictional completeness.

### 8. Codex Security — security review gate

Use Codex Security as the final review layer for security-sensitive or release-significant work, including:
- dependency risk;
- secrets and environment handling;
- authentication and authorization boundaries;
- Supabase policies and data access;
- upload/import surfaces;
- API/tool exposure;
- unsafe execution paths;
- release-blocking security findings.

Security review does not replace engineering validation, and engineering validation does not replace security review.

## Preferred RPE workflow

For a substantial RPE feature or experiment, follow this lifecycle where applicable:

**DEFINE → IMPLEMENT → PERSIST → DEPLOY → ANALYZE → OBSERVE → MODEL VISUALLY → SECURITY REVIEW**

Mapped to the preferred stack:

**GitHub → OpenAI Developers → Supabase → Vercel → Data Analytics → PostHog → Figma → Codex Security**

The lifecycle may loop. For example, analytics or physical-test findings may send the project back to GitHub for a model revision, Supabase schema change, or new calibration run.

## Scientific evidence doctrine

Preserve these as distinct evidence layers:
- manual/code calculation;
- conventional engineering solver;
- RPE analytical calculation;
- RPE real-time simulation;
- laboratory or field physical test;
- calibrated model;
- product telemetry.

Never collapse these into one undifferentiated confidence claim.

RPE follows:

**CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY**

If layers disagree, record and investigate the disagreement. Do not hide it, average it away without justification, or select only the favorable result.

## Minimum durable outputs for a major experiment milestone

A mature RPE experiment milestone should have, as applicable:
- GitHub branch/commit or PR;
- versioned experiment/test definition;
- explicit inputs, units, assumptions, and provenance;
- persistent data schema or dataset reference;
- reproducible deployment or runnable test state;
- analysis notebook/report or equivalent analytical output;
- charts with traceable source data;
- validation/calibration status and uncertainty notes;
- maintained architecture/state/data-flow diagram when complexity warrants it;
- security review notes for affected attack surfaces;
- updates to `STATUS_REPORT.md`, `WORKLOG.md`, `TASKS.md`, and `NEXT_STEPS.md`.

## Hard boundaries

1. Never fabricate a material property, capacity, test result, dataset, uncertainty band, or validation result to complete a demo.
2. Unknown values remain null/unverified until supported by a credible source, calculation basis, supplier certificate, calibration, or test.
3. Product telemetry and user behavior are not engineering evidence.
4. A visually convincing simulation is not proof of physical accuracy.
5. A deployed feature is not automatically a validated feature.
6. Figma diagrams must stay synchronized with meaningful architecture changes; stale diagrams must be marked stale or updated.
7. All scientific comparisons must preserve enough metadata to reconstruct what changed and what stayed fixed.
8. Security findings that materially affect data integrity, experiment provenance, authentication, or execution safety can block release.

## Routing rule for agents

When an RPE task is substantial, first determine which of the eight layers are materially involved. State or record the evidence boundary, then use the corresponding tools in the canonical lifecycle order unless a dependency requires otherwise.

When a required plugin is unavailable in the current execution environment, do not invent its output. Continue with the available layers, record the missing layer as pending, and preserve the handoff information needed to complete it later.
