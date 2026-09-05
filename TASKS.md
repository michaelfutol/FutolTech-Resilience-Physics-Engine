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

## Genesis analytical and simulation foundation
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

## Post-release aerodynamics
- [x] Define/test explicit post-release aerodynamic analytical contract with interval, density, relative air velocity, projected area, drag coefficient, body identity, and provenance.
- [x] Keep pre-release panel action distinct; do not convert it into post-release impulse.
- [x] Define/test explicit opt-in aerodynamic force-application plan gated by ready dynamics + ready aerodynamic result + matching body ID.
- [x] Keep force application at center of mass and aerodynamic torque explicitly unmodeled.
- [x] Add deterministic per-physics-step force-window scheduler.
- [x] Preserve the declared load interval on a partial terminal physics step by scaling effective force rather than silently extending duration.
- [x] Add scheduler regression coverage to the actual `npm test` command.
- [ ] Wire explicit aerodynamic application opt-in/provenance into Genesis UI/live run context.
- [ ] Apply only scheduler-returned center-of-mass force to the released Rapier body during the declared interval.
- [ ] Record force-application start/active/partial/complete state as `rpe_simulation` evidence without promoting it to solver/CFD/physical-test authority.
- [ ] Browser-test declared start/stop behavior and stale-context reset after any relevant aerodynamic/run input change.
- [ ] Define aerodynamic torque only in a future separately justified contract; do not infer it from current drag force.

## Failed-check record retained
- [x] Keep Genesis Browser Acceptance run `33936435595` failure visible: old selector matched two verification controls after aerodynamic UI expansion.
- [x] Keep Genesis Browser Acceptance run `33936534126` failure visible: first repair used an inaccessible exact-label selector and found zero target selects.
- [x] Repair browser selector by scoping from collision-target `Source note` to its sibling verification select without weakening acceptance criteria.
- [x] Confirm RPE CI run `33936665268` green and Genesis Browser Acceptance run `33936665296` green on repair commit `4bad29c6d44fd7f08abcead1298dc1c61f89bdc6`.

## Later Genesis gates — not to be invented early
- [ ] Contact-property contract, only if justified and explicitly sourced/supplied.
- [ ] Impact mechanics contract, only after required physical quantities/evidence are defined.
- [ ] Damage/failure model tied to solver/test/calibration evidence.
- [ ] Physical-test data ingestion and calibration loop.
- [ ] Controlled simplification only after calculate/solve/simulate/test/calibrate evidence supports it.
