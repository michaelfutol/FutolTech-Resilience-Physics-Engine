# Worklog

## [2026-09-05] - Deterministic Genesis Simulation Event Ledger
- Re-read `ROADMAP.md`, `STATUS_REPORT.md`, `TASKS.md`, `NEXT_STEPS.md`, `WORKLOG.md`, confirmed active branch `lum-rpe-takeover`, and verified pre-batch head `123dd185b0ae4c1730c4fc99bacfc094ab81c5f8` had successful RPE CI run 120 before changing code.
- Implemented a pure deterministic ordered Genesis simulation-event ledger in `src/lib/genesis/simulationEventLedger.ts`.
- The ledger preserves existing analytical events first, then appends rigid-body release gate, debris-dynamics gate, simulation activation, and optional collision-enter records as separate `rpe_simulation` stages.
- Collision records are rejected before simulation activation. A collision-enter record deliberately carries only event identity/provenance; it does not infer impact force, energy, damage, friction, restitution, material response, CFD/solver authority, or physical-test evidence.
- Added regression tests for ordered sequence/evidence layers, collision-before-activation rejection, and reviewable blocked activation state. Numerical values are synthetic test fixtures only.
- Found a CI coverage omission: `tests/genesis-release-to-simulation.test.ts` existed but was not listed in the explicit `npm test` command. Added that integration test plus the new event-ledger test to the executed suite.
- Updated `STATUS_REPORT.md`, `TASKS.md`, and `NEXT_STEPS.md` so the canonical repository records the implemented ledger and the exact remaining live Rapier wiring gate.
- No hidden collision target, contact property, aerodynamic load, launch impulse, or post-release wind model was introduced merely to create visible motion or collisions.

## [2026-09-05] - Genesis Explicit Rapier Activation Wiring
- Re-read `ROADMAP.md`, `STATUS_REPORT.md`, `TASKS.md`, `NEXT_STEPS.md`, `WORKLOG.md`, confirmed active branch `lum-rpe-takeover`, and verified pre-batch head `374f8bcdd632449f9e0353daef692c0b3c125747` had successful RPE CI run 118 before changing code.
- Wired the already-tested rigid-body release gate and debris-dynamics gate into the actual Genesis Panel 001 viewport path.
- Added explicit UI inputs for panel mass, gravity vector, initial linear velocity, and initial angular velocity. Every field starts blank; blank or partial vectors remain missing rather than receiving an engineering/physics default.
- Explicit zero linear/angular velocity vectors remain valid only when all vector components are entered explicitly.
- Added gated Rapier activation: the panel remains attached/static until the analytical connection state produces `release_ready` and the dynamics gate produces `simulation_ready`.
- Rapier receives only the supplied panel mass, gravity vector, initial linear velocity, and initial angular velocity. Analytical panel force is not converted into a launch impulse, launch velocity, continuing wind force, aerodynamic torque, damping value, or other hidden motion input.
- Kept evidence boundaries visible: wind/connection threshold calculation remains `rpe_analytical`; detached rigid-body motion is `rpe_simulation`; neither is promoted to manual/code, engineering-solver, CFD, or future physical-test evidence.
- Added an integration regression test that composes analytical threshold → rigid-body release gate → debris-dynamics gate, verifies missing mass/gravity remain blocking states, and verifies explicitly supplied zero initial velocities are accepted. All numerical values in this test are synthetic arithmetic fixtures only and are not adopted engineering properties.
- Updated `STATUS_REPORT.md`, `TASKS.md`, and `NEXT_STEPS.md` so the repository records the new gate state and exact next task.
- Post-batch CI is required to pass before advancing to collision/debris event logging; no failed check may be skipped.

## [2026-09-05] - Explicit Debris Dynamics Gate + Canonical State Reconciliation
- Re-read `ROADMAP.md`, `STATUS_REPORT.md`, `TASKS.md`, `NEXT_STEPS.md`, `WORKLOG.md`, confirmed active branch `lum-rpe-takeover`, and checked the latest branch/CI state before coding.
- Found that canonical code/commit history had advanced beyond the written status documents: dependency remediation had already completed, Next.js and matching `eslint-config-next` were on 16.3.4, a clean dependency-audit gate had been recorded, `@react-three/rapier@2.2.0` had been installed, Panel 001/A-B comparison work had landed, and the rigid-body release eligibility gate was already implemented/tested.
- Confirmed pre-batch branch head `c65d5b7c38442cdc307c7a34a8e4489349204e64` passed RPE CI run 117.
- Added an explicit Genesis debris-dynamics input/result contract. Gravity vector, initial linear velocity, and initial angular velocity are nullable and provenance-bearing; no hidden motion-driving value is introduced.
- Added `assessGenesisDebrisDynamicsGate`: debris simulation cannot bypass a non-ready analytical release gate and remains blocked until all three rigid-body initial-condition vectors are explicitly supplied.
- Explicit zero vectors are accepted because zero is a stated input; missing vectors remain missing and block simulation.
- Added regression tests for unresolved release, missing gravity, missing linear velocity, missing angular velocity, explicit zero-vector readiness, and rejection of non-finite vector values. Synthetic test numbers remain fixtures only and are not adopted as engineering properties.
- Updated `STATUS_REPORT.md`, `TASKS.md`, and `NEXT_STEPS.md` to reconcile documentation with canonical branch truth and preserve the next Rapier gate.
- Post-release wind force/impulse remains intentionally undefined. No panel force is converted into debris impulse without a separately declared loading/time/aerodynamic model.

## [2026-09-05] - Genesis Null House / Fast Smoke + Dependency Gate Classification
- Re-read `ROADMAP.md`, `STATUS_REPORT.md`, `TASKS.md`, `NEXT_STEPS.md`, `WORKLOG.md`, confirmed active branch `lum-rpe-takeover`, and confirmed branch head `edab3d686351b519f8fe7d9d04dfff0c5fb1e236` had successful RPE CI run 86 before coding.
- Classified a concrete direct dependency blocker: `next@16.2.10` is within multiple July 2026 advisory ranges; public advisories identify 16.2.11 as the minimum fixed release for the reviewed issues. Recorded the gate in `docs/DEPENDENCY_ADVISORY_CLASSIFICATION.md`.
- Did not use `npm audit fix --force`, did not hand-edit lockfile integrity data, and did not install Rapier in that batch.
- Added a self-contained Genesis Null House mode to `Viewport3D` using only existing React Three Fiber / Drei dependencies.
- Null House renders as a semi-transparent wireframe envelope only; no walls, roof, frame, mass, stiffness, connections, or structural capacity are assigned.
- Exposed the typed Null House result contract in the viewport: `N/A / no_physical_specimen`, evidence layer `rpe_simulation`.
- Added Fast Smoke as browser-drawn streamlines explicitly labeled `NON-CFD`.
- Fast Smoke requires user-entered wind speed and direction; both fields start blank so no hidden wind input is adopted.
- The current speed input is visualization metadata only; it does not generate pressure, force, PASS/FAIL, solver output, CFD output, or physical-test evidence.
- Existing conceptual scripted viewport remains available as a separate mode so prior Phase 1 playback is not silently reclassified as mechanics.

## [2026-09-04] - Genesis Analytical Wind Foundation
- Re-read the locked roadmap, status, tasks, next steps, worklog, active branch, and latest CI before coding.
- Added versioned Genesis evidence/input/result types separating manual/code, solver, RPE analytical, RPE simulation, and physical-test layers.
- Added pure kph→m/s conversion and simplified analytical dynamic-pressure calculation `q = 0.5ρV²`.
- Added pure panel action `F = qAC` with exposed area and pressure coefficient supplied explicitly by the caller.
- Added deterministic connection demand/capacity assessment; missing capacity remains `null` and returns `unverified` rather than PASS.
- Locked Null House structural result type to `N/A / no_physical_specimen`.
- Added automated tests using synthetic arithmetic fixtures only; no test number is adopted as a real material, site, code, or connection property.
- Rapier was intentionally not installed in that batch. Dependency-advisory classification remained a gate at that time.
- Manual Phase 2 browser acceptance remained outstanding and was not falsely marked complete.

## [2026-09-04] - Phase 2 Costing, Prototype, and CI Repair Checkpoint
- Completed automated catalog-validation execution in CI.
- Implemented deterministic assembly/specimen costing with explicit currency and engineering-quantity rounding so floating-point residue does not leak into reconciled totals.
- Added automated tests for material waste application, A0 itemized reconciliation, deterministic costing, missing rates, incompatible currency, local unit-rate overrides, and quantity/takeoff overrides.
- Separated wall backing and outer cladding into distinct specimen/cost layers; the A0 benchmark now includes both instead of silently omitting sawali cladding.
- Implemented immutable A0 → temporary draft → diff → explicit Create Candidate → A1 core and automated immutability/reset tests.
- Wired Product/Assembly-driven prototype selectors, traceable A0-vs-draft cost comparison, local unit-rate overrides, and visible `[Unverified]` status into the right-side UI.
- Added quantity/takeoff override support to the costing core. Quantity overrides preserve library quantity, effective quantity, waste basis and source note, and are intentionally treated as procurement/cost context rather than structural specimen ancestry.
- Added validation that rejects invalid/duplicate quantity overrides and quantity overrides for assemblies not selected by the specimen.
- Kept user price and quantity context separate from structural candidate identity; cost-context changes do not rewrite A0 or change candidate ancestry.
- Detected and repaired a CI failure caused by a stale pre-refactor hook reference rather than skipping the failed check.
- Synchronized project control documents so remaining work is explicit rather than stale.

## [2026-09-04] - Finite RPE v1.0 Roadmap Locked
- Replaced the open-ended roadmap with a finite 12-phase build plan and explicit RPE v1.0 completion gates.
- Locked the core doctrine: `CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY`.
- Defined the first real mechanics milestone as the Genesis Test Chamber: Null House, smoke/wind visualization, one-panel wind loading, breakable connection, and detached debris.
- Defined the Dignity housing family as Studio Core, 1BR, 2BR, and 3BR maximum standard model.
- Added BIM/IFC import, OpenSees/CalculiX structural coupling, OpenFOAM CFD coupling, multi-hazard layers, and permanent engineering benchmark families as gated later phases.
- Defined RPE v1.0 release/freeze criteria and explicitly deferred nonessential v2.0 features so the build has a real finish line.

## Earlier work
Historical Phase 0/1/1.5 implementation and UI-refinement entries remain preserved in Git history. No engineering evidence from those scripted visual stages is promoted to calculated physics by this checkpoint.
