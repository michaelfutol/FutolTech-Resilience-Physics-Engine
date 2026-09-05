# Worklog

## [2026-09-05] - Phase 4 Staged-House Viewer Browser Gate Closed
- Re-read `ROADMAP.md`, `STATUS_REPORT.md`, `TASKS.md`, `NEXT_STEPS.md`, and `WORKLOG.md`, confirmed active branch `lum-rpe-takeover`, and checked canonical CI before advancing.
- Encountered and preserved an intermediate strict-TypeScript failure at Phase 4 orientation commit `c089e0e4423a2853a50b41066e1320fd1fbbe437`; later tests/build were skipped by CI as designed rather than waived.
- Confirmed corrective orientation commit `383c4125b002d44244845166c7697ab79d82158e` restored the contract/test alignment and RPE CI run `33939039707` passed.
- Reconciled canonical branch progress that had already landed the staged Small House viewer (`998d026056999232523eca7b7cd24808303ae2ab`) and deterministic Phase 4 Chromium acceptance script (`cdbf3623c457a6b646d6250bd6e71252600668fe`).
- Verified the viewer is driven from validated `SmallHouseWindSpecimenInput` stage materialization, preserves `N/A / no_physical_specimen` for the empty envelope, instantiates only declared stage objects, exposes identity/provenance/orientation/unknown properties, and explicitly states `VISIBLE ≠ ADEQUATE`.
- Verified connection topology is listed without fabricating physical joint coordinates or connection-line geometry.
- Found the remaining acceptance gap: the Phase 4 Chromium script existed but the production browser workflow still executed only Genesis.
- Commit `135a874d40982e293fd0763e43531d0bf0b0b71e` wired `scripts/phase4-house-browser-acceptance.mjs` into the same read-only production-browser workflow as Genesis, using the existing isolated pinned `playwright@1.62.1` harness and uploading both JSON/screenshot evidence sets.
- RPE CI run `33939397709` passed install, lint, strict TypeScript, automated tests, and production build.
- Genesis Browser Acceptance run `33939397798` passed both Genesis and Phase 4 browser gates. Artifact `browser-acceptance-135a874d40982e293fd0763e43531d0bf0b0b71e`, artifact ID `9961290314`, contains the resulting browser evidence.
- No material property, mass, stiffness, strength, capacity, support reaction, displacement, code-compliance result, solver result, CFD result, or physical-test evidence was introduced by this viewer/QA batch.
- Exact next gated task: define/test a primary-support mechanics readiness/input contract that references a validated `primary_support` by stable ID, preserves its declared geometry/orientation/provenance, requires explicit caller-supplied restraint/support assumptions, and leaves unknown material/mass/stiffness/strength/capacity unresolved. Do not calculate support response or whole-house wind performance in that readiness batch.

## [2026-09-05] - Deterministic Aerodynamic Force-Window Scheduler + Browser QA Repair
- Re-read `ROADMAP.md`, `STATUS_REPORT.md`, `TASKS.md`, `NEXT_STEPS.md`, and `WORKLOG.md`, confirmed active branch `lum-rpe-takeover`, and verified pre-batch canonical head `77f0f650f454ca787b45c83addad241446223696` had successful RPE CI before changing code.
- Reconciled documentation against canonical code truth before implementing anything: the provenance-bearing post-release aerodynamic analytical contract and the separate non-executing aerodynamic force-application gate had already landed and were tested. Live Rapier aerodynamic application was still absent.
- Added `src/lib/genesis/aerodynamicForceWindow.ts`, a pure `rpe_simulation` scheduling layer for one future physics step. It does not mutate Rapier or advance simulation time.
- The scheduler validates finite/nonnegative timing and force inputs, reports before-window/full-step/partial-terminal-step/complete states, and applies no force outside the caller-declared interval.
- If the declared interval ends part-way through a coarse physics step, the scheduler scales the effective force by `activeDuration / physicsStep` so integrating over that step preserves only `F × activeDuration`; the implementation does not silently extend the load duration.
- Added `tests/genesis-aerodynamic-force-window.test.ts` with synthetic arithmetic fixtures only and added the suite to the actual `npm test` command. Tests cover full step, partial terminal step, total declared impulse preservation, completed interval, invalid/non-finite inputs, and evidence-boundary fields.
- No adopted material, code, site, aerodynamic coefficient, contact, impact, solver, CFD, or physical-test property was introduced by the scheduler tests.
- Implementation commit `5e611c8c55830282bcba9f43fd93f30be24dfc73` passed RPE CI run `33936435420`: dependency installation, lint, strict TypeScript, automated tests, and production build all succeeded.
- The existing live browser workflow then exposed a real QA regression caused by the newer aerodynamic UI adding another verification control. Genesis Browser Acceptance run `33936435595` failed because the old broad selector found two `Verification state` controls. The failure was not waived.
- First repair commit `363c7beb94330d0279b088c3522bea9d60d7be72` switched to an exact accessible label. Normal RPE CI run `33936534121` passed, but Genesis Browser Acceptance run `33936534126` failed because the visually nested target `<select>` had no accessible label association and the selector found zero controls. That second failure was also retained and not waived.
- Final repair commit `4bad29c6d44fd7f08abcead1298dc1c61f89bdc6` scopes from the unique collision-target `Source note` control to the adjacent target verification select. Physics inputs and acceptance criteria were unchanged.
- RPE CI run `33936665268` passed dependency install, lint, strict TypeScript, automated tests, and production build.
- Genesis Browser Acceptance run `33936665296` passed the real production Next.js / headless Chromium gate. Evidence artifact `genesis-browser-acceptance-4bad29c6d44fd7f08abcead1298dc1c61f89bdc6`, artifact ID `9960419250`, contains the JSON record and screenshot.
- The successful browser workflow installed isolated pinned `playwright@1.62.1`; its `npm audit --audit-level=high` reported zero vulnerabilities. This closes the earlier temporary Playwright 1.55.0 high-advisory cleanup item without changing the canonical application dependency graph.
- Exact next mechanics gate: wire explicit user opt-in + the already-tested aerodynamic result/application plan + fixed-step scheduler into released Panel 001; apply only scheduler-returned center-of-mass force inside the declared interval and record it as `rpe_simulation` evidence. Do not add aerodynamic torque, hidden coefficients, pre-release impulse conversion, contact mechanics, or material properties.

## [2026-09-05] - Genesis Live Browser Collision Gate Passed
- Continued from the canonical `lum-rpe-takeover` branch and the locked scientific-orchestration skill.
- Confirmed the connected Vercel account still has no RPE project. A direct connector deployment attempt could not be completed because the exposed deployment action did not provide the required file payload contract, so no Vercel deployment was fabricated.
- Added `scripts/genesis-browser-acceptance.mjs` and `.github/workflows/genesis-browser-acceptance.yml` to run the actual production Next.js app in headless Chromium and exercise the live Rapier path rather than relying on the synthetic unit fixture.
- First browser run `33935001119` correctly failed before physics acceptance because the Playwright selector could not resolve the `Verification state` select. The application built/started cleanly and recorded no page/console errors; the failure was kept as a real test-plumbing defect rather than waived.
- Repaired only the selector logic in commit `510dc5c3b9892f40e82428e8aea64e3d2251b75b`; the synthetic physics/geometry inputs and acceptance criteria were not weakened.
- Normal RPE CI run `33935187251` passed dependency install, lint, strict TypeScript, automated tests, and production build on that commit.
- Genesis Browser Acceptance run `33935187278` then passed in the real production build under headless Chromium.
- Browser evidence recorded: analytical threshold exceeded; `release_ready`; `simulation_ready`; Rapier active; declared target visible; genuine `collision_enter` observed; `otherObjectId=synthetic-browser-target-001` matched the declared target; evidence-boundary disclaimer present; changing explicit target center input cleared the prior collision observation; no console errors; no page errors.
- Evidence artifact: `genesis-browser-acceptance-510dc5c3b9892f40e82428e8aea64e3d2251b75b`, artifact ID `9959936762`, containing the JSON record and screenshot.
- This gate validates the software event/wiring behavior for the synthetic QA fixture only. It does not validate impact force/energy, damage, friction/restitution, material response, post-release aerodynamics, code compliance, structural solver results, CFD, or physical-test behavior.
- Canonical `npm ci` remained at zero vulnerabilities. The browser workflow's isolated no-save `playwright@1.55.0` install reported one high advisory; that temporary harness is now an explicit security-cleanup task and is not conflated with the clean committed application dependency graph.
- Exact next mechanics gate: define/test a provenance-bearing post-release aerodynamic loading/time contract before applying any continuing wind force or aerodynamic torque to the released panel. Pre-release panel force must never be silently converted to impulse.

## [2026-09-05] - Canonical RPE Scientific Orchestration Skill Locked
- Converted the preferred RPE plugin stack into a durable repository skill at `skills/rpe-scientific-orchestration/SKILL.md` so the workflow no longer depends on chat memory alone.
- Locked the preferred lifecycle/responsibility order as **GitHub → OpenAI Developers → Supabase → Vercel → Data Analytics → PostHog → Figma → Codex Security**.
- Defined the stack as a routing/lifecycle doctrine rather than a requirement to invoke every plugin for every task; unavailable layers must be left pending rather than fabricated.
- Locked GitHub as the durable source-of-truth layer; OpenAI Developers as the agent/API layer; Supabase as structured experiment/application data; Vercel as deployment/reproducible preview; Data Analytics as scientific analysis; PostHog as product telemetry; Figma as maintained systems-model/diagram infrastructure; and Codex Security as the security review gate.
- Explicitly separated PostHog product telemetry from engineering/scientific validation evidence.
- Explicitly promoted Figma beyond UI polish to maintained architecture, state, sequence, ERD, timeline, system, experiment-flow, and data-lineage diagrams.
- Explicitly promoted Data Analytics as a core scientific layer for test datasets, sensitivity studies, material experiments, calibration, comparisons, validation, uncertainty, charts, and experiment reports.
- Preserved the permanent RPE doctrine **CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY** and required disagreement between evidence layers to remain visible and investigated.
- Updated `AGENT.md`, `AGENTS.md`, `STATUS_REPORT.md`, `TASKS.md`, and `NEXT_STEPS.md` to reference and enforce the new skill. Also reconciled `AGENT.md` with the current installed Rapier state.
- No engineering property, simulation result, dataset, validation claim, or scientific evidence was introduced by this documentation/orchestration batch.

## [2026-09-05] - Genesis Browser-Acceptance Fixture Gate
- Re-read `ROADMAP.md`, `STATUS_REPORT.md`, `TASKS.md`, `NEXT_STEPS.md`, and `WORKLOG.md`, confirmed active branch `lum-rpe-takeover`, and verified pre-batch head `81b8a5e3d36ab1d99c230bba073c14115c5921bb` had successful RPE CI run 134 before changing repository state.
- The connected Vercel project list did not contain an RPE deployment, so the required live browser collision acceptance could not be truthfully executed from a deployed canonical build in this run. The gate remains open.
- Added `tests/genesis-browser-acceptance-fixture.test.ts` with one explicitly synthetic QA input set chosen only to reach deterministic connection exceedance, `release_ready`, `simulation_ready`, and a valid explicit box-target contract.
- The fixture deliberately stops before collision evidence. It contains no assertion that geometry guarantees a collision; only a genuine live Rapier `onCollisionEnter` callback may establish that `rpe_simulation` observation.
- Added `docs/GENESIS_BROWSER_ACCEPTANCE.md` with the exact synthetic input set, live acceptance observations, stale-context reset procedure, and evidence-boundary checks.
- Added the new regression suite to the explicit `npm test` command.
- No adopted material, code, site, aerodynamic, friction, restitution, impact-force/energy, damage, solver, CFD, or physical-test property was introduced. All fixture values are labeled synthetic QA only.
- Exact next gate: run the documented procedure against a real browser build of the canonical branch, accept only a genuine panel↔declared-target callback with exact target identity, then change one explicit input and confirm the old collision observation does not survive into the changed context.

## [2026-09-05] - Genesis Explicit Collision-Target Scene Wiring
- Re-read `ROADMAP.md`, `STATUS_REPORT.md`, `TASKS.md`, `NEXT_STEPS.md`, `WORKLOG.md`, confirmed active branch `lum-rpe-takeover`, and verified pre-batch head `dc9e5a5cc990de569bc51e971e50ac5fb3674b1c` had successful RPE CI run 132 before changing code.
- Wired blank-by-default Genesis collision-target inputs into `Viewport3D`: explicit target object ID, center XYZ, box dimensions XYZ, source note, and verification state.
- No target exists until the complete input set passes the existing typed/runtime collision-target validator. Invalid/partial inputs remain absent rather than producing fallback geometry.
- Added a visible validated target. During active Panel 001 simulation, that same declared target is instantiated as a fixed Rapier rigid body in the same `Physics` world as the released panel. No hidden floor or obstacle was added.
- Added narrow runtime target metadata helpers in `src/lib/genesis/collisionTarget.ts`. Collision evidence accepts the declared `objectId` only when callback user data matches the currently validated target; unrelated/mismatched/absent metadata resolves to `null` rather than receiving a manufactured identity.
- Extended collision-target regression tests to cover runtime identity creation/resolution and mismatch rejection. The existing explicit `npm test` command already executes this suite.
- Expanded the live evidence context key to include every explicit target field, so changed target inputs invalidate prior collision observations just like changed panel/dynamics inputs.
- No material, mass, stiffness, friction, restitution, impact force/energy, damage, post-release aerodynamic force, solver result, CFD result, or physical-test evidence was introduced for the collision target.
- Implementation checkpoint `78ccb43123c29aedff83b2e6145be96cbbd25c53` passed RPE CI run 133: dependency install, lint, strict TypeScript, automated tests, and production build all succeeded.
- Exact next gate: browser-verify a genuine panel↔declared-target Rapier collision records the declared target ID, then change one explicit run/target input and confirm the old collision observation does not survive into the changed context. This remains unclosed until actually verified in-browser.

## [2026-09-05] - Genesis Collision-Target Contract Gate
- Re-read `ROADMAP.md`, `STATUS_REPORT.md`, `TASKS.md`, `NEXT_STEPS.md`, `WORKLOG.md`, confirmed active branch `lum-rpe-takeover`, and verified pre-batch head `f2808fad10f77db24ca59b00a28a588b58e18b7e` had successful RPE CI run 130 before changing code.
- Added `src/types/genesisCollisionTarget.ts` with a narrow explicit box-target contract: schema version, object identity, center coordinates, box dimensions, source note, and verification state only.
- Added `src/lib/genesis/collisionTarget.ts` runtime validation requiring non-empty identity/provenance, finite center coordinates, positive finite dimensions, supported schema, supported shape, and valid verification state.
- The target contract is explicitly `rpe_simulation` input/evidence context only and does not infer material, mass, stiffness, friction, restitution, capacity, impact force/energy, damage, or other contact/engineering properties from geometry.
- Added `tests/genesis-collision-target.test.ts` covering explicit-value preservation, missing identity/provenance rejection, non-finite center rejection, non-positive dimensions, unsupported runtime schema/shape, and absence of hidden contact/property fields.
- Added the collision-target regression suite to the explicit `npm test` command.
- Implementation checkpoint `bc24311d9decfe580074c49581e565d52e7e02fb` passed RPE CI run 131: dependency install, lint, strict TypeScript, automated tests, and production build all succeeded.
- No visible/physical collision target was instantiated in this batch. Exact next gate: wire caller-entered target ID/center/dimensions/source/verification into `Viewport3D`, validate before rendering, place the validated fixed target in the same Rapier world as released Panel 001, then browser-verify a genuine collision and stale-context reset.

## [2026-09-05] - Genesis Live Rapier Evidence Wiring
- Re-read `ROADMAP.md`, `STATUS_REPORT.md`, `TASKS.md`, `NEXT_STEPS.md`, `WORKLOG.md`, confirmed active branch `lum-rpe-takeover`, and verified pre-batch head `172b9c014f55acf62471756f3913a816ddc504c7` had successful RPE CI run 127 before changing code.
- Wired the existing `createGenesisLiveSimulationEvidence` / `recordGenesisRapierCollisionEnter` bridge into the actual Genesis Panel 001 Rapier path.
- `RigidBody.onCollisionEnter` now records only a genuine Rapier callback; no collision is synthesized when Rapier reports none.
- Mounted `GenesisEventLedgerPanel` in the Genesis UI so analytical events, release gate, dynamics gate, simulation activation, and any real collision-enter observation share one ordered reviewable ledger while retaining their evidence-layer labels.
- Kept `otherObjectId: null` when there is no explicitly modeled/caller-supplied RPE object identity instead of manufacturing an identity.
- No collision target, floor, obstacle, friction, restitution, impact mechanics, arbitrary launch condition, or post-release aerodynamic forcing was added merely to generate an event.
- Initial implementation commit `97a9a07c755c7d9f8a1ed700143e124c49708d0e` failed RPE CI run 128 at lint (`react-hooks/set-state-in-effect`) because the first wiring initialized live evidence synchronously inside a React effect. TypeScript/tests/build were skipped by CI as designed; the failure was not ignored.
- Repair commit `808b55747359aa73011c8b18c6e62e218f08f749` replaced effect-driven evidence initialization with a derived immutable base snapshot plus state only for genuine collision observations. Collision state is keyed to the current explicit Genesis input context so stale observations do not carry across changed inputs.
- RPE CI run 129 passed dependency install, lint, strict TypeScript, automated tests, and production build.
- Exact next gate: define an explicit provenance-bearing collision-target identity/geometry contract, add one visible caller-declared target, then perform browser acceptance of a genuine Rapier collision callback and input-context reset. Contact mechanics and post-release aerodynamics remain undefined.

## [2026-09-05] - Genesis Live Simulation Evidence Bridge
- Re-read `ROADMAP.md`, `STATUS_REPORT.md`, `TASKS.md`, `NEXT_STEPS.md`, `WORKLOG.md`, confirmed active branch `lum-rpe-takeover`, and verified pre-batch head `c5cbe59e2055d49ddcd89630f25c2cce08d7b873` had successful RPE CI run 125 before changing code.
- Added `src/lib/genesis/liveSimulationEvidence.ts`, a pure immutable adapter for the forthcoming live Rapier callback path. It creates a snapshot from analytical evidence plus the existing release/dynamics gates and appends collision-enter observations only through the deterministic ordered event-ledger contract.
- The bridge cannot record a collision when simulation activation is blocked; it preserves the existing rule that collision-enter is an `rpe_simulation` observation only.
- Added `src/components/GenesisEventLedgerPanel.tsx`, a reusable UI component that exposes event sequence, event type, evidence layer, status, values, source notes, and the limitation that collision-enter alone does not establish force, energy, damage, contact properties, solver/CFD authority, or physical-test evidence.
- Added regression tests for active simulation snapshot creation, immutable collision append, blocked activation enforcement, and required collision identity/provenance. All numerical values are synthetic fixtures only.
- Added the new regression suite to the explicit `npm test` command.
- Implementation checkpoint `d9a5f3f3f92a30dd85e4aa62577ed2102f6188ed` passed RPE CI run 126: dependency install, lint, strict TypeScript, automated tests, and production build all succeeded.
- Did not add a hidden collision target, friction, restitution, impact force/energy calculation, arbitrary launch condition, or post-release aerodynamic forcing.
- Exact next gate was actual `Viewport3D` wiring: initialize the live evidence snapshot when existing release/dynamics gates are ready, append only real Rapier `onCollisionEnter` callbacks, and mount the reusable evidence panel.

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
