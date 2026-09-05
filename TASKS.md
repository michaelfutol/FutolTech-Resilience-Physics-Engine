# Tasks

## Permanent gates
- [x] Lock finite RPE v1.0 roadmap.
- [x] Preserve `CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY`.
- [x] Keep manual/code, solver, RPE analytical, RPE simulation, browser QA/visualization, and future physical-test evidence distinct.
- [x] Require explicit provenance/verification state for Genesis engineering/simulation inputs where the contract requires them.
- [x] Never invent missing material, code, aerodynamic, contact, or engineering properties.

## Phase 2
- [x] Deterministic catalog validation/costing/candidate derivation/persistence foundation.
- [x] Automated regression coverage and CI.
- [ ] Complete final manual Phase 2 browser visual acceptance and record the exit checkpoint.

## Dependency / QA toolchain
- [x] Remediate canonical Next.js dependency gate and regenerate lockfile through package-manager automation.
- [x] Install and gate `@react-three/rapier@2.2.0`.
- [x] Isolate browser acceptance tooling from committed application dependencies.
- [x] Upgrade isolated browser harness to pinned Playwright 1.62.1 and verify `npm audit --audit-level=high` reports zero vulnerabilities.

## Phase 3 — Genesis analytical and simulation foundation — EXIT GATE COMPLETE
- [x] Null House `N/A / no_physical_specimen` contract.
- [x] Fast Smoke explicitly NON-CFD.
- [x] Explicit analytical wind/panel path `q = 0.5ρV²` → `F = qAC`.
- [x] Connection demand/capacity assessment with unknown capacity remaining unverified.
- [x] A/B analytical comparison.
- [x] Rigid-body release gate.
- [x] Debris-dynamics gate with explicit mass/gravity/initial velocities.
- [x] Rapier activation only when release + dynamics gates are ready.
- [x] Deterministic ordered analytical→simulation event ledger.
- [x] Live Rapier collision callback evidence bridge.
- [x] Explicit provenance-bearing collision-target contract and runtime identity matching.
- [x] Real Chromium synthetic collision-path acceptance and stale-context reset.

## Phase 3 — Post-release aerodynamics — COMPLETE FOR CURRENT COM-FORCE SCOPE
- [x] Define/test explicit post-release aerodynamic analytical contract with interval, density, relative air velocity, projected area, drag coefficient, body identity, and provenance.
- [x] Keep pre-release panel action distinct; do not convert it into post-release impulse.
- [x] Define/test explicit opt-in aerodynamic force-application plan gated by ready dynamics + ready aerodynamic result + matching body ID.
- [x] Keep force application at center of mass and aerodynamic torque explicitly unmodeled.
- [x] Add deterministic per-physics-step force-window scheduler.
- [x] Preserve the declared load interval on a partial terminal physics step by scaling effective force rather than silently extending duration.
- [x] Add scheduler regression coverage to the actual `npm test` command.
- [x] Wire explicit aerodynamic application opt-in/provenance into Genesis UI/live run context.
- [x] Apply only scheduler-returned center-of-mass force to the released Rapier body during the declared interval.
- [x] Record full-step/partial/completed force-application state as `rpe_simulation` evidence without promoting it to solver/CFD/physical-test authority.
- [x] Browser-test declared application behavior and stale-context reset after relevant aerodynamic/run input changes.
- [x] Confirm real Chromium live-force acceptance run `33938570653` with zero console/page errors and evidence artifact ID `9961013065`.
- [x] Confirm RPE CI run `33938665291` and clean-helper CI run `33938717530` green.
- [ ] Define aerodynamic torque only in a future separately justified contract; do not infer it from current drag force.

## Phase 4 — Small House Wind System — ACTIVE
- [x] Define versioned small-house wind topology/staging types.
- [x] Lock progressive stage order to the roadmap: empty envelope → primary supports → floor/ring frame → walls → roof → connections → bracing → anchorage → storm protection.
- [x] Preserve stable object identity across envelope, structural components, and connections.
- [x] Preserve unknown material identity, mass, and connection capacity as explicit `null`.
- [x] Require explicit finite component orientation rather than assuming rotation.
- [x] Validate positive geometry, supported verification state, component-kind/stage consistency, connection references, and endpoint activation order.
- [x] Add deterministic stage materialization without source mutation.
- [x] Preserve `N/A / no_physical_specimen` for the empty-envelope stage and avoid a performance claim for geometry-only physical stages.
- [x] Add Phase 4 system-contract regression suite to canonical `npm test`.
- [x] Confirm Phase 4 foundation CI run `33938835927` green.
- [x] Add a staged small-house test-chamber viewer driven only by the validated specimen contract.
- [x] Show stage/object identity, provenance, explicit orientation, and unknown material/mass/capacity in the UI without inferring structural adequacy.
- [x] Keep connection topology visible without inventing physical joint coordinates/connector geometry.
- [x] Add browser acceptance for deterministic stage progression, `N/A` empty-envelope semantics, orientation visibility, unknown engineering properties, and stale higher-stage identity clearing.
- [x] Wire Phase 4 browser acceptance into the read-only production-browser workflow alongside Genesis.
- [x] Confirm RPE CI run `33939397709` and browser run `33939397798` green; artifact ID `9961290314`.
- [ ] Define the first explicit primary-support mechanics readiness/input contract.
- [ ] Add a calculated primary-support mechanics path only after the readiness contract is reviewable and its required engineering quantities are explicitly supplied/sourced.
- [ ] Add floor/ring frame only after the primary-support gate is reviewable.
- [ ] Progress walls → roof → connections → bracing → anchorage → storm protection one gated layer at a time.
- [ ] Add controlled A/B house comparison that proves geometry is held constant while exactly one declared structural variable changes.
- [ ] Reach Phase 4 exit: same house geometry runs controlled A/B tests with only one structural variable changed.

## Failed-check record retained
- [x] Keep Genesis Browser Acceptance run `33936435595` failure visible: old selector matched two verification controls after aerodynamic UI expansion.
- [x] Keep Genesis Browser Acceptance run `33936534126` failure visible: first repair used an inaccessible exact-label selector and found zero target selects.
- [x] Keep RPE CI run `33938570631` failure visible: collision activation error text was unintentionally generalized; 92/94 tests passed and the two legacy assertions correctly caught the compatibility regression.
- [x] Keep Phase 4 orientation intermediate RPE CI failure at commit `c089e0e4423a2853a50b41066e1320fd1fbbe437` visible; strict TypeScript failed and later tests/build were skipped rather than waived.
- [x] Confirm corrective orientation commit `383c4125b002d44244845166c7697ab79d82158e` passed RPE CI run `33939039707`.

## Later mechanics gates — not to be invented early
- [ ] Contact-property contract, only if justified and explicitly sourced/supplied.
- [ ] Impact mechanics contract, only after required physical quantities/evidence are defined.
- [ ] Damage/failure model tied to solver/test/calibration evidence.
- [ ] Physical-test data ingestion and calibration loop.
- [ ] Controlled simplification only after calculate/solve/simulate/test/calibrate evidence supports it.
