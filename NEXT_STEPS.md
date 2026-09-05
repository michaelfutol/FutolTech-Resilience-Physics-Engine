# Next Steps

The finite RPE v1.0 roadmap remains locked in `ROADMAP.md`. GitHub is the implementation source of truth.

The canonical scientific/plugin-routing skill is now `skills/rpe-scientific-orchestration/SKILL.md` with preferred lifecycle:

**GitHub → OpenAI Developers → Supabase → Vercel → Data Analytics → PostHog → Figma → Codex Security**

Use the relevant layers for every substantial RPE task while preserving their evidence boundaries. Figma is the maintained visual architecture/model layer; Data Analytics is the scientific analysis layer; PostHog product telemetry is not engineering validation evidence.

## Current checkpoint

The canonical branch is active in Phase 3 Genesis. Null House, NON-CFD Fast Smoke, Panel 001 analytical wind action, equivalent connection assessment, A/B comparison, rigid-body release gating, explicit debris initial-condition gating, gated Rapier activation, deterministic ordered simulation-event ledger, the live Rapier evidence callback path, and explicit collision-target integration are implemented.

A synthetic browser-QA fixture is now executable in CI and documented in `docs/GENESIS_BROWSER_ACCEPTANCE.md`. Its numbers are test-only inputs chosen to exercise the wiring. The automated fixture proves only connection exceedance, `release_ready`, `simulation_ready`, and a valid declared target contract. It deliberately stops before collision evidence because only a genuine live Rapier callback may establish a collision-enter observation.

No RPE deployment was available in the connected Vercel project list during this checkpoint, so live browser acceptance was not falsely marked complete.

## Immediate execution order

1. **Provide/run a real browser build:** deploy or otherwise run the canonical `lum-rpe-takeover` head in a browser-capable environment.
2. **Live collision browser acceptance:** execute `docs/GENESIS_BROWSER_ACCEPTANCE.md` and verify a genuine Rapier panel↔target collision records exactly `synthetic-browser-target-001` from the real callback.
3. **Context-reset browser acceptance:** after that collision, change one explicit panel, dynamics, or target input and verify the prior collision observation is absent from the changed run context.
4. **Evidence-boundary review:** confirm the UI does not present Rapier contact response as impact force, impact energy, damage, material response, manual/code evidence, structural-solver evidence, CFD evidence, or physical-test evidence.
5. **No invented contact mechanics:** do not add friction, restitution, constitutive response, impact-force/energy, or damage calculations unless separately declared, justified, and provenance-bearing.
6. **No invented post-release wind model:** define a separate time/load/aerodynamic contract before applying continuing wind force or aerodynamic torque to debris.
7. **Phase 2 browser acceptance:** independently verify the remaining Phase 2 manual UI acceptance path and record the Phase 2 exit SHA only after it actually passes.
8. **Later simulation comparison:** add synchronized A/B simulation/replay only after the single-panel live collision record is browser-verified and reviewable.
9. **Maintain the systems model:** when architecture/data/state relationships materially change, update the corresponding Figma architecture/state/sequence/ERD/system diagram and reference it from GitHub documentation rather than leaving the architecture only in conversation.
10. **Scientific-analysis handoff:** as material/test datasets become available, route sensitivity, calibration, validation, uncertainty, comparisons, charts, and experiment reports through the Data Analytics layer with traceable source data and explicit evidence labels.

## Evidence boundary

Manual/code calculations, engineering solver results, RPE analytical calculations, RPE simulation, browser visualization, Data Analytics outputs, PostHog product telemetry, maintained Figma system models, Blender/Unreal presentation, and future physical-test evidence are separate layers. No layer may silently manufacture another layer's authority.
