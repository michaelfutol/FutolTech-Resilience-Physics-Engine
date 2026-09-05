# Tasks

## Permanent gates
- [x] Lock finite RPE v1.0 roadmap.
- [x] Preserve `CALCULATE → SOLVE → SIMULATE → TEST → CALIBRATE → THEN SIMPLIFY`.
- [x] Keep manual/code, solver, RPE analytical, RPE simulation, browser QA/visualization, and future physical-test evidence distinct.
- [x] Require explicit provenance/verification state for engineering/simulation inputs where the contract requires them.
- [x] Never invent missing material, code, aerodynamic, contact, or engineering properties.

## Phase 2
- [x] Deterministic catalog validation/costing/candidate derivation/persistence foundation.
- [x] Automated regression coverage and CI.
- [ ] Complete final manual Phase 2 browser visual acceptance and record the exit checkpoint.

## Dependency / QA toolchain
- [x] Remediate canonical Next.js dependency gate and regenerate lockfile through package-manager automation.
- [x] Install and gate `@react-three/rapier@2.2.0`.
- [x] Isolate browser acceptance tooling from committed application dependencies.
- [x] Upgrade isolated browser harness to pinned Playwright 1.62.1 and keep its audit gate separate from application dependency evidence.

## Phase 3 — Genesis analytical and simulation foundation — EXIT GATE COMPLETE
- [x] Null House `N/A / no_physical_specimen` contract.
- [x] Fast Smoke explicitly NON-CFD.
- [x] Explicit analytical wind/panel path `q = 0.5ρV²` → `F = qAC`.
- [x] Connection demand/capacity assessment with unknown capacity remaining unverified.
- [x] A/B analytical comparison.
- [x] Rigid-body release and debris-dynamics gates.
- [x] Rapier activation only from explicit ready inputs.
- [x] Ordered analytical→simulation event ledger.
- [x] Explicit collision-target contract and genuine Chromium collision evidence.
- [x] Explicit post-release aerodynamic analytical contract.
- [x] Explicit opt-in center-of-mass aerodynamic force application with fixed-step scheduler.
- [x] Partial terminal force step preserves only the declared active-duration impulse.
- [x] Real Chromium force-application and stale-context acceptance.
- [ ] Define aerodynamic torque only in a future separately justified contract; do not infer it from current drag force.

## Phase 4 — Small House Wind System — ACTIVE
### Staged specimen / viewer
- [x] Define versioned small-house wind topology/staging types.
- [x] Lock stage order: empty envelope → primary supports → floor/ring frame → walls → roof → connections → bracing → anchorage → storm protection.
- [x] Preserve stable object identity across envelope, structural components, and connections.
- [x] Preserve unknown material identity, mass, and connection capacity as explicit `null`.
- [x] Require explicit finite component orientation rather than assuming rotation.
- [x] Validate positive geometry, component-kind/stage consistency, connection references, and endpoint activation order.
- [x] Add deterministic immutable stage materialization.
- [x] Preserve `N/A / no_physical_specimen` for empty envelope and avoid performance claims for geometry-only stages.
- [x] Add staged Small House viewer driven by validated specimen data.
- [x] Show identity, provenance, explicit orientation, and unknown material/mass/capacity without inferring adequacy.
- [x] Keep connection topology visible without inventing physical joint coordinates/connector geometry.
- [x] Browser-test ordered stage progression, `N/A` semantics, orientation, unknown properties, and stale-stage clearing.

### Primary-support gate — CURRENTLY COMPLETE FOR ISOLATED FORMULA SCOPE
- [x] Define explicit primary-support mechanics readiness/input contract referencing a validated staged component by stable ID.
- [x] Preserve support center/size/rotation/material/mass/provenance from the staged specimen rather than duplicating geometry.
- [x] Require explicit local longitudinal axis and all 12 end-restraint DOF states; no restraint defaults.
- [x] Keep unknown E, area, principal moments, strength, material, and mass explicit rather than deriving them from rendered geometry.
- [x] Prove a rendered rectangular box does not silently become section area or second moment.
- [x] Browser-test readiness inputs, unknown-property display, and stage-removal invalidation.
- [x] Add first calculated primary-support mechanics path: isolated linear-elastic Euler–Bernoulli fixed–free tip-load benchmark.
- [x] Require explicit E, selected principal I, signed tip load, and provenance before the benchmark runs.
- [x] Calculate only transparent formula response `V=|P|`, `M=|P|L`, `δ=PL³/(3EI)`.
- [x] Keep strength/capacity `NOT_EVALUATED`; no PASS/FAIL, P-Δ, shear deformation, connection slip, solver, CFD, or whole-house load-path claim.
- [x] Unit-test the hand-check fixture and browser-test the synthetic Phase 4 fixture result.
- [x] Confirm normal CI run `33941910807` and browser run `33941910817` green; browser artifact ID `9962116271`.

### Next topology layer
- [ ] Define floor/ring-frame member readiness contract referencing staged `floor_ring_frame_member` IDs without inventing material/stiffness or joint coordinates.
- [ ] Require explicit member longitudinal axis and endpoint-role semantics; preserve actual joint coordinates as unknown until separately declared.
- [ ] Keep global frame response unavailable until physical connection/joint geometry and mechanics assumptions are explicitly introduced at the appropriate connection gate.
- [ ] Progress walls → roof → connections → bracing → anchorage → storm protection one gated layer at a time.
- [ ] Add controlled A/B house comparison proving geometry is held constant while exactly one declared structural variable changes.
- [ ] Reach Phase 4 exit: same house geometry runs controlled A/B tests with only one structural variable changed.

## Failed-check record retained
- [x] Keep Genesis Browser Acceptance run `33936435595` failure visible: old selector matched two verification controls after aerodynamic UI expansion.
- [x] Keep Genesis Browser Acceptance run `33936534126` failure visible: first repair used an inaccessible exact-label selector and found zero target selects.
- [x] Keep RPE CI run `33938570631` failure visible: collision activation error text was unintentionally generalized; legacy assertions caught it.
- [x] Keep Phase 4 orientation intermediate RPE CI failure at commit `c089e0e4423a2853a50b41066e1320fd1fbbe437` visible; later tests/build were skipped rather than waived.

## Later mechanics gates — not to be invented early
- [ ] Contact-property contract, only if justified and explicitly sourced/supplied.
- [ ] Impact mechanics contract, only after required physical quantities/evidence are defined.
- [ ] Damage/failure model tied to solver/test/calibration evidence.
- [ ] Physical-test data ingestion and calibration loop.
- [ ] Controlled simplification only after calculate/solve/simulate/test/calibrate evidence supports it.
