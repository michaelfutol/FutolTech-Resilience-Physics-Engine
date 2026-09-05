# Next Steps

The finite RPE v1.0 roadmap remains locked in `ROADMAP.md`. GitHub is the implementation source of truth.

The canonical scientific/plugin-routing skill is `skills/rpe-scientific-orchestration/SKILL.md` with preferred lifecycle:

**GitHub → OpenAI Developers → Supabase → Vercel → Data Analytics → PostHog → Figma → Codex Security**

Use relevant layers for substantial RPE tasks while preserving evidence boundaries. Figma is the maintained visual architecture/model layer; Data Analytics is the scientific analysis layer; PostHog product telemetry is not engineering validation evidence.

## Current checkpoint

The canonical branch is active in Phase 3 Genesis. Null House, NON-CFD Fast Smoke, Panel 001 analytical wind action, equivalent connection assessment, A/B analytical comparison, rigid-body release gating, explicit debris initial-condition gating, gated Rapier activation, deterministic ordered simulation-event ledger, the live Rapier evidence callback path, and explicit collision-target integration are implemented.

The single-panel live browser gate is now reproducible and passed:

- tested commit: `510dc5c3b9892f40e82428e8aea64e3d2251b75b`;
- normal RPE CI run `33935187251`: passed;
- Genesis Browser Acceptance run `33935187278`: passed in a production Next.js build under headless Chromium;
- artifact ID `9959936762` contains the JSON evidence record and screenshot;
- genuine Rapier `collision_enter` was observed for declared target `synthetic-browser-target-001`;
- changing explicit target center input cleared the prior collision observation from the changed context;
- no browser console/page errors were recorded.

This proves the current event/wiring path for a synthetic QA fixture only. It does not establish impact mechanics, damage, aerodynamic truth, code compliance, solver/CFD authority, or physical-test validation.

Vercel is still not linked to an RPE project in the connected account. The successful headless-browser production-build gate is valid for software acceptance, but Vercel deployment remains a separate lifecycle task.

## Immediate execution order

1. **Define post-release aerodynamic input contract:** explicit time variable/step or exposure interval, relative airflow inputs, projected area/orientation basis, aerodynamic coefficient source/provenance, and verification state. Missing inputs must block the calculation.
2. **Keep force and impulse distinct:** continuing aerodynamic force may be calculated only from the declared post-release state. Never silently reuse the pre-release panel force as an instantaneous impulse. Any impulse requires an explicit integration interval/history.
3. **Pure calculation/tests first:** implement the post-release aerodynamic calculation as deterministic pure functions with dimensional checks and regression tests before coupling it to Rapier.
4. **Only then couple to Rapier:** apply force/torque over explicitly modeled time; record it as `rpe_simulation` evidence, not CFD or physical-test evidence.
5. **Preserve aerodynamic uncertainty:** coefficients/density/orientation assumptions remain caller-supplied/provenance-bearing until code/literature/CFD/test evidence supports them.
6. **Browser-harness security cleanup:** classify and upgrade the isolated Playwright harness that currently reports one high advisory during temporary install; canonical application dependencies remain clean.
7. **Phase 2 browser acceptance:** independently verify the remaining Phase 2 manual UI path and record the Phase 2 exit SHA only after it actually passes.
8. **Later synchronized comparison:** add A/B simulation/replay only after the single-panel post-release force model is reviewable and tested.
9. **Vercel lifecycle:** create/link a canonical RPE Vercel project when the connector/deployment path permits, then use it for persistent preview/review rather than replacing GitHub/browser CI as evidence.
10. **Maintain systems model:** when architecture/data/state relationships materially change, update the corresponding Figma architecture/state/sequence/ERD/system diagram and reference it from GitHub documentation.
11. **Scientific-analysis handoff:** as material/test datasets become available, route sensitivity, calibration, validation, uncertainty, comparisons, charts, and experiment reports through Data Analytics with traceable source data and explicit evidence labels.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser visualization, Data Analytics outputs, PostHog product telemetry, maintained Figma system models, Blender/Unreal presentation, and future physical-test evidence are separate layers. No layer may silently manufacture another layer's authority.
