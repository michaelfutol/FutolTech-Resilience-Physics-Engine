# Worklog

## [2026-09-05] - Genesis Live Simulation Evidence Bridge
- Re-read `ROADMAP.md`, `STATUS_REPORT.md`, `TASKS.md`, `NEXT_STEPS.md`, `WORKLOG.md`, confirmed active branch `lum-rpe-takeover`, and verified pre-batch head `c5cbe59e2055d49ddcd89630f25c2cce08d7b873` had successful RPE CI run 125 before changing code.
- Added `src/lib/genesis/liveSimulationEvidence.ts`, a pure immutable adapter for the forthcoming live Rapier callback path. It creates a snapshot from analytical evidence plus the existing release/dynamics gates and appends collision-enter observations only through the deterministic ordered event-ledger contract.
- The bridge cannot record a collision when simulation activation is blocked; it preserves the existing rule that collision-enter is an `rpe_simulation` observation only.
- Added `src/components/GenesisEventLedgerPanel.tsx`, a reusable UI component that exposes event sequence, event type, evidence layer, status, values, source notes, and the limitation that collision-enter alone does not establish force, energy, damage, contact properties, solver/CFD authority, or physical-test evidence.
- Added regression tests for active simulation snapshot creation, immutable collision append, blocked activation enforcement, and required collision identity/provenance. All numerical values are synthetic fixtures only.
- Added the new regression suite to the explicit `npm test` command.
- Implementation checkpoint `d9a5f3f3f92a30dd85e4aa62577ed2102f6188ed` passed RPE CI run 126: dependency install, lint, strict TypeScript, automated tests, and production build all succeeded.
- Did not add a hidden collision target, friction, restitution, impact force/energy calculation, arbitrary launch condition, or post-release aerodynamic forcing.
- Exact next gate is actual `Viewport3D` wiring: initialize the live evidence snapshot when existing release/dynamics gates are ready, append only real Rapier `onCollisionEnter` callbacks, and mount the reusable evidence panel.

## [2026-09-05] - Deterministic Genesis Simulation Event Ledger
- Implemented a pure deterministic ordered Genesis simulation-event ledger in `src/lib/genesis/simulationEventLedger.ts`.
- The ledger preserves existing analytical events first, then appends rigid-body release gate, debris-dynamics gate, simulation activation, and optional collision-enter records as separate `rpe_simulation` stages.
- Collision records are rejected before simulation activation and deliberately do not infer impact force, energy, damage, friction, restitution, material response, CFD/solver authority, or physical-test evidence.
- Added regression tests for ordered sequence/evidence layers, collision-before-activation rejection, and reviewable blocked activation state.
- Corrected CI coverage so `tests/genesis-release-to-simulation.test.ts` and the simulation-event-ledger test are executed.

## [2026-09-05] - Genesis Explicit Rapier Activation Wiring
- Wired the existing rigid-body release gate and debris-dynamics gate into Genesis Panel 001.
- Added explicit UI inputs for panel mass, gravity vector, initial linear velocity, and initial angular velocity; blank/partial values remain missing.
- Rapier activates only when both gates are ready and consumes only explicitly supplied mass/gravity/initial velocities.
- Analytical panel force is not converted into a launch impulse, continuing wind force, aerodynamic torque, damping value, or other hidden input.
- Added release-to-simulation integration regression coverage.

## [2026-09-05] - Explicit Debris Dynamics Gate + Canonical State Reconciliation
- Reconciled canonical code with project documentation after dependency remediation, Rapier installation, Panel 001/A-B comparison work, and rigid-body release gating had advanced.
- Added explicit nullable/provenance-bearing gravity, initial linear velocity, and initial angular velocity inputs.
- Added `assessGenesisDebrisDynamicsGate`; zero vectors are valid only when explicitly supplied, while missing vectors block simulation.
- Added regression tests for missing and explicit-zero cases plus non-finite input rejection.
- Kept post-release wind force/impulse intentionally undefined.

## [2026-09-05] - Genesis Null House / Fast Smoke + Dependency Gate Classification
- Classified the direct Next.js advisory gate and recorded it in `docs/DEPENDENCY_ADVISORY_CLASSIFICATION.md` without using force fixes or hand-editing lockfile integrity data.
- Added the Genesis Null House semi-transparent envelope with `N/A / no_physical_specimen` result semantics.
- Added Fast Smoke browser streamlines explicitly labeled NON-CFD and disabled until explicit speed/direction input is supplied.
- Preserved the older conceptual scripted viewport as a separate mode.

## [2026-09-04] - Genesis Analytical Wind Foundation
- Added versioned Genesis evidence/input/result types separating manual/code, solver, RPE analytical, RPE simulation, and physical-test layers.
- Added kph→m/s conversion, simplified dynamic pressure `q = 0.5ρV²`, panel action `F = qAC`, deterministic connection demand/capacity assessment, and Null House `N/A` result contract.
- Tests use synthetic arithmetic fixtures only; no fixture value is adopted as a real engineering property.

## [2026-09-04] - Phase 2 Costing, Prototype, and CI Repair Checkpoint
- Completed automated catalog validation, deterministic assembly/specimen costing, quantity/rate overrides, immutable A0→draft→A1 candidate derivation, persistence, UI migration, and CI coverage.
- Kept procurement/cost context separate from structural specimen ancestry and repaired a CI failure caused by a stale hook reference rather than skipping it.

## [2026-09-04] - Finite RPE v1.0 Roadmap Locked
- Replaced the open-ended roadmap with a finite 12-phase build plan and explicit RPE v1.0 completion gates.
- Locked the doctrine `CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY` and defined Genesis as the first real mechanics milestone.

## Earlier work
Historical Phase 0/1/1.5 implementation and UI-refinement entries remain preserved in Git history. No engineering evidence from those scripted visual stages is promoted to calculated physics by this checkpoint.
